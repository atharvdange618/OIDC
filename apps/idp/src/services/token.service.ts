import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { RefreshTokenInput, TokenInput } from "../validation/token.validation";
import { prisma } from "../lib/prisma";
import { BadRequestError, UnauthorizedError } from "../errors/AppError";
import { verifyPkce } from "../lib/pkce";
import { signJwt } from "../lib/jwt";
import { getActiveClient } from "../lib/oauthClient";
import { authService } from "./auth.service";

export class TokenService {
  async exchange(input: TokenInput) {
    const client = await getActiveClient(input.client_id);
    if (!client) throw new UnauthorizedError("Invalid client");

    const secretValid = await bcrypt.compare(
      input.client_secret,
      client.clientSecretHash,
    );
    if (!secretValid) throw new UnauthorizedError("Invalid client credentials");

    const authCode = await prisma.authCode.findUnique({
      where: {
        code: input.code,
      },
      include: {
        user: true,
      },
    });
    if (!authCode) throw new BadRequestError("Invalid authorization code");

    if (authCode.expiresAt < new Date())
      throw new BadRequestError("Authorization code has expired");

    if (authCode.redirectUri !== input.redirect_uri)
      throw new BadRequestError("redirect_uri mismatch");

    if (authCode.clientId !== input.client_id)
      throw new UnauthorizedError("Client mismatch");

    const pkceValid = verifyPkce(input.code_verifier, authCode.codeChallenge);

    if (!pkceValid) throw new BadRequestError("PKCE verification failed");

    return prisma.$transaction(async (tx) => {
      const updated = await tx.authCode.updateMany({
        where: { code: input.code, usedAt: null },
        data: { usedAt: new Date() },
      });

      if (updated.count === 0) {
        await authService.revokeTokensForLogout(
          authCode.userId,
          input.client_id,
        );
        throw new BadRequestError(
          "Authorization code already used - all tokens revoked",
        );
      }

      const user = authCode.user;

      // ab id_token claims build karenge
      const idTokenPayload: Record<string, unknown> = {
        sub: user.id,
        aud: input.client_id,
      };

      if (authCode.nonce) {
        idTokenPayload.nonce = authCode.nonce;
      }

      // ab jo scopes grant kiye hain uske hisab se claims include karna
      if (authCode.scopes.includes("email")) {
        idTokenPayload.email = user.email;
        idTokenPayload.email_verified = user.emailVerifiedAt !== null;
      }

      if (authCode.scopes.includes("profile")) {
        idTokenPayload.given_name = user.firstName;
        idTokenPayload.family_name = user.lastName;
        if (user.profileImageUrl) {
          idTokenPayload.picture = user.profileImageUrl;
        }
      }

      // id_token and access_token sign kardo mere bhai
      const idToken = await signJwt(idTokenPayload, "1h");

      const accessTokenPayload = {
        sub: user.id,
        aud: input.client_id,
        scope: authCode.scopes.join(" "),
      };
      const accessToken = await signJwt(accessTokenPayload, "15m");
      const refreshToken = await this.createRefreshToken(
        user.id,
        input.client_id,
        authCode.scopes,
        tx,
      );

      return {
        access_token: accessToken,
        id_token: idToken,
        refresh_token: refreshToken.token,
        token_type: "Bearer",
        expires_in: 900,
      };
    });
  }

  async refresh(input: RefreshTokenInput) {
    const client = await getActiveClient(input.client_id);
    if (!client) throw new UnauthorizedError("Invalid client");

    const secretValid = await bcrypt.compare(
      input.client_secret,
      client.clientSecretHash,
    );
    if (!secretValid) throw new UnauthorizedError("Invalid client credentials");

    const stored = await prisma.refreshToken.findUnique({
      where: { token: input.refresh_token },
      include: { user: true },
    });

    if (!stored) throw new BadRequestError("Invalid refresh token");

    if (stored.clientId !== input.client_id)
      throw new UnauthorizedError(
        "Refresh token does not belong to this client",
      );

    if (stored.expiresAt < new Date())
      throw new BadRequestError("Refresh token has expired");

    if (stored.revokedAt !== null)
      throw new BadRequestError("Refresh token has been revoked");

    return prisma.$transaction(async (tx) => {
      const updated = await tx.refreshToken.updateMany({
        where: { token: input.refresh_token, usedAt: null },
        data: { usedAt: new Date() },
      });

      if (updated.count === 0) {
        await authService.revokeTokensForLogout(stored.userId, input.client_id);
        throw new BadRequestError(
          "Refresh token reuse detected - all tokens revoked",
        );
      }

      const user = stored.user;

      const accessToken = await signJwt(
        {
          sub: user.id,
          aud: input.client_id,
          scope: stored.scopes.join(" "),
        },
        "15m",
      );

      const newRefreshToken = await this.createRefreshToken(
        user.id,
        input.client_id,
        stored.scopes,
        tx,
      );

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken.token,
        scope: newRefreshToken.scopes.join(" "),
        token_type: "Bearer",
        expires_in: 900,
      };
    });
  }

  private async createRefreshToken(
    userId: string,
    clientId: string,
    scopes: string[],
    tx?: any,
  ) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const db = tx || prisma;
    return db.refreshToken.create({
      data: { token, userId, clientId, scopes, expiresAt },
    });
  }
}

export const tokenService = new TokenService();

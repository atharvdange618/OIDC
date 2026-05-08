import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { RefreshTokenInput, TokenInput } from "../validation/token.validation";
import { prisma } from "../lib/prisma";
import { BadRequestError, UnauthorizedError } from "../errors/AppError";
import { ErrorCodes } from "../errors/ErrorCodes";
import { verifyPkce } from "../lib/pkce";
import { signJwt } from "../lib/jwt";
import { getActiveClient } from "../lib/oauthClient";
import { authService } from "./auth.service";
import { logger, truncateToken } from "../lib/logger";

const log = logger.child({ module: "token.service" });

export class TokenService {
  async exchange(input: TokenInput) {
    const client = await getActiveClient(input.client_id);
    if (!client)
      throw new UnauthorizedError("Invalid client", ErrorCodes.INVALID_CLIENT);

    const secretValid = await bcrypt.compare(
      input.client_secret,
      client.clientSecretHash,
    );
    if (!secretValid) {
      log.warn(
        { clientId: input.client_id, security: true },
        "Token exchange rejected - invalid client secret",
      );
      throw new UnauthorizedError(
        "Invalid client credentials",
        ErrorCodes.INVALID_CLIENT_CREDENTIALS,
      );
    }

    const authCode = await prisma.authCode.findUnique({
      where: {
        code: input.code,
      },
      include: {
        user: true,
      },
    });
    if (!authCode)
      throw new BadRequestError(
        "Invalid authorization code",
        ErrorCodes.INVALID_GRANT,
      );

    if (authCode.expiresAt < new Date())
      throw new BadRequestError(
        "Authorization code has expired",
        ErrorCodes.INVALID_GRANT,
      );

    if (authCode.redirectUri !== input.redirect_uri)
      throw new BadRequestError(
        "redirect_uri mismatch",
        ErrorCodes.INVALID_REDIRECT_URI,
      );

    if (authCode.clientId !== input.client_id)
      throw new UnauthorizedError(
        "Client mismatch",
        ErrorCodes.CREDENTIALS_MISMATCH,
      );

    const pkceValid = verifyPkce(input.code_verifier, authCode.codeChallenge);

    if (!pkceValid)
      throw new BadRequestError(
        "PKCE verification failed",
        ErrorCodes.PKCE_FAILED,
      );

    return prisma.$transaction(async (tx) => {
      const updated = await tx.authCode.updateMany({
        where: { code: input.code, usedAt: null },
        data: { usedAt: new Date() },
      });

      if (updated.count === 0) {
        log.error(
          {
            clientId: input.client_id,
            userId: authCode.userId,
            codePrefix: truncateToken(input.code),
            security: true,
          },
          "Auth code reuse detected - all tokens revoked",
        );
        await authService.revokeTokensForLogout(
          authCode.userId,
          input.client_id,
        );
        throw new BadRequestError(
          "Authorization code already used - all tokens revoked",
          ErrorCodes.TOKEN_REUSE_DETECTED,
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

      log.info(
        {
          userId: user.id,
          clientId: input.client_id,
          scope: authCode.scopes.join(" "),
          accessTokenPrefix: truncateToken(accessToken),
        },
        "Tokens issued via authorization code exchange",
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
    if (!client)
      throw new UnauthorizedError("Invalid client", ErrorCodes.INVALID_CLIENT);

    const secretValid = await bcrypt.compare(
      input.client_secret,
      client.clientSecretHash,
    );
    if (!secretValid) {
      log.warn(
        { clientId: input.client_id, security: true },
        "Token refresh rejected - invalid client secret",
      );
      throw new UnauthorizedError(
        "Invalid client credentials",
        ErrorCodes.INVALID_CLIENT_CREDENTIALS,
      );
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: input.refresh_token },
      include: { user: true },
    });

    if (!stored)
      throw new BadRequestError(
        "Invalid refresh token",
        ErrorCodes.INVALID_GRANT,
      );

    if (stored.clientId !== input.client_id)
      throw new UnauthorizedError(
        "Refresh token does not belong to this client",
        ErrorCodes.CREDENTIALS_MISMATCH,
      );

    if (stored.expiresAt < new Date())
      throw new BadRequestError(
        "Refresh token has expired",
        ErrorCodes.INVALID_GRANT,
      );

    if (stored.revokedAt !== null)
      throw new BadRequestError(
        "Refresh token has been revoked",
        ErrorCodes.INVALID_GRANT,
      );

    return prisma.$transaction(async (tx) => {
      const updated = await tx.refreshToken.updateMany({
        where: { token: input.refresh_token, usedAt: null },
        data: { usedAt: new Date() },
      });

      if (updated.count === 0) {
        log.error(
          {
            clientId: input.client_id,
            userId: stored.userId,
            security: true,
          },
          "Refresh token reuse detected - all tokens revoked",
        );
        await authService.revokeTokensForLogout(stored.userId, input.client_id);
        throw new BadRequestError(
          "Refresh token reuse detected - all tokens revoked",
          ErrorCodes.TOKEN_REUSE_DETECTED,
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

      log.info(
        {
          userId: user.id,
          clientId: input.client_id,
          scope: stored.scopes.join(" "),
          accessTokenPrefix: truncateToken(accessToken),
        },
        "Access token issued via refresh token",
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

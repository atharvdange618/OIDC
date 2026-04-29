import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../lib/jwt";
import { getActiveClient } from "../lib/oauthClient";
import { UnauthorizedError } from "../errors/AppError";
import type { IntrospectInput } from "../validation/introspect.validation";

export class IntrospectService {
  async introspect(input: IntrospectInput) {
    const client = await getActiveClient(input.client_id);
    if (!client) throw new UnauthorizedError("Invalid client");

    const secretValid = await bcrypt.compare(
      input.client_secret,
      client.clientSecretHash,
    );
    if (!secretValid) throw new UnauthorizedError("Invalid client credentials");

    const { token, token_type_hint } = input;

    if (token_type_hint === "refresh_token") {
      const result = await this.checkRefreshToken(token);
      if (result !== null) return result;
    }

    try {
      const payload = await verifyJwt(token);
      const rawAud = payload.aud;
      const aud = Array.isArray(rawAud) ? rawAud[0] : (rawAud as string);

      return {
        active: true,
        sub: payload.sub,
        aud,
        client_id: aud,
        scope: payload.scope,
        iss: payload.iss,
        iat: payload.iat,
        exp: payload.exp,
        token_type: "Bearer",
      };
    } catch {
      // Expired or invalid JWT, fall through
    }

    if (token_type_hint !== "access_token" && token_type_hint !== "id_token") {
      const result = await this.checkRefreshToken(token);
      if (result !== null) return result;
    }

    return { active: false };
  }

  private async checkRefreshToken(token: string) {
    const rt = await prisma.refreshToken.findUnique({ where: { token } });
    if (!rt) return null;

    const isActive = !rt.revokedAt && !rt.usedAt && rt.expiresAt > new Date();
    if (!isActive) return { active: false };

    return {
      active: true,
      sub: rt.userId,
      scope: rt.scopes.join(" "),
      client_id: rt.clientId,
      iat: Math.floor(rt.createdAt.getTime() / 1000),
      exp: Math.floor(rt.expiresAt.getTime() / 1000),
      token_type: "refresh_token",
    };
  }
}

export const introspectService = new IntrospectService();

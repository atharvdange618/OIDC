import bcrypt from "bcrypt";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../errors/AppError";
import { prisma } from "../lib/prisma";
import {
  EndSessionInput,
  LoginInput,
  RegisterInput,
} from "../validation/auth.validation";
import { verifyJwt } from "../lib/jwt";
import { getActiveClient } from "../lib/oauthClient";

export class AuthService {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existing)
      throw new ConflictError(
        "Registration failed. Please check your details or try logging in.",
      );

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async validateEndSession(
    input: EndSessionInput,
  ): Promise<{ clientId?: string; userId?: string }> {
    let clientId: string | undefined;
    let userId: string | undefined;

    if (input.id_token_hint) {
      try {
        const payload = await verifyJwt(input.id_token_hint, {
          allowExpired: true,
        });
        const rawAud = payload.aud;
        clientId = Array.isArray(rawAud) ? rawAud[0] : (rawAud as string);
        userId = payload.sub as string;
      } catch {
        throw new BadRequestError("Invalid id_token_hint");
      }
    }

    // client_id can be used as an alternative way to identify the RP when
    // id_token_hint is not provided. If both are given, they must agree.
    if (input.client_id) {
      if (clientId && clientId !== input.client_id) {
        throw new BadRequestError(
          "client_id does not match the audience in id_token_hint",
        );
      }
      clientId = input.client_id;
    }

    if (input.post_logout_redirect_uri) {
      if (!clientId) {
        throw new BadRequestError(
          "id_token_hint or client_id is required when post_logout_redirect_uri is provided",
        );
      }

      const client = await getActiveClient(clientId);
      if (!client) throw new BadRequestError("Client not found or inactive");

      const registeredUris = client.postLogoutRedirectUris;

      if (!registeredUris.includes(input.post_logout_redirect_uri)) {
        throw new BadRequestError(
          "post_logout_redirect_uri is not registered for this client",
        );
      }
    }

    return { clientId, userId };
  }

  /**
   * Revokes all active refresh tokens on logout.
   * - If both userId and clientId are known → scoped revocation for that RP.
   * - If only userId is known (no id_token_hint / client_id) → global revocation
   *   across all clients (full IdP-side logout).
   */
  async revokeTokensForLogout(
    userId: string,
    clientId?: string,
  ): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        ...(clientId ? { clientId } : {}),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}

export const authService = new AuthService();

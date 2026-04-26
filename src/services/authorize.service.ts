import { randomBytes } from "crypto";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../errors/AppError";
import type { AuthorizeInput } from "../validation/authorize.validation";
import { prisma } from "../lib/prisma";
import { getActiveClient } from "../lib/oauthClient";

export class AuthorizeService {
  async authorize(input: AuthorizeInput, userId: string) {
    const client = await getActiveClient(input.client_id);
    if (!client) throw new NotFoundError("Client not found");

    const registeredUris = client.redirectUris as string[];

    if (!registeredUris.includes(input.redirect_uri))
      throw new BadRequestError(
        "redirect_uri does not match any registered URI",
      );

    const requestedScopes = input.scope.split(" ");
    const hasOpenid = requestedScopes.includes("openid");
    if (!hasOpenid) throw new BadRequestError('scope must include "openid"');

    const invalidScopes = requestedScopes.filter(
      (s) => !client.allowedScopes.includes(s),
    );
    if (invalidScopes.length > 0)
      throw new BadRequestError(
        `Client is not allowed to request scopes: ${invalidScopes.join(", ")}`,
      );

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.isActive)
      throw new UnauthorizedError("User not found or inactive");

    const code = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.authCode.create({
      data: {
        code,
        clientId: input.client_id,
        userId,
        redirectUri: input.redirect_uri,
        scopes: requestedScopes,
        expiresAt,
        codeChallenge: input.code_challenge,
        codeChallengeMethod: input.code_challenge_method,
      },
    });

    return { code, state: input.state, redirectUri: input.redirect_uri };
  }
}

export const authorizeService = new AuthorizeService();

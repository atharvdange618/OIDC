import { Request, Response } from "express";
import { authorizeSchema } from "../validation/authorize.validation";
import { authorizeService } from "../services/authorize.service";
import { BadRequestError } from "../errors/AppError";
import { ISSUER } from "../config/keys";
import { prisma } from "../lib/prisma";
import { getActiveClient } from "../lib/oauthClient";
import { RequestWithValidatedQuery } from "../middleware/validate";

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  openid: "Verify your identity",
  profile: "Access your name and profile picture",
  email: "Access your email address",
  phone: "Access your phone number",
  address: "Access your physical address",
};

export class AuthorizeController {
  async authorize(req: Request, res: Response) {
    const query =
      (req as RequestWithValidatedQuery).validatedQuery ?? req.query;
    const input = authorizeSchema.parse(query);

    const client = await getActiveClient(input.client_id);
    if (!client) throw new BadRequestError("Invalid client");

    const registeredUris = client.redirectUris as string[];
    if (!registeredUris.includes(input.redirect_uri)) {
      throw new BadRequestError(
        "redirect_uri does not match any registered URI",
      );
    }

    const requestedScopes = input.scope.split(" ");
    if (!requestedScopes.includes("openid")) {
      throw new BadRequestError('scope must include "openid"');
    }

    const invalidScopes = requestedScopes.filter(
      (s) => !client.allowedScopes.includes(s),
    );
    if (invalidScopes.length > 0) {
      throw new BadRequestError(
        `Client is not allowed to request scopes: ${invalidScopes.join(", ")}`,
      );
    }

    if (!req.session.userId) {
      const params = new URLSearchParams({ ...input });
      const authRoute =
        input.prompt === "create" ? "/auth/register" : "/auth/login";
      res.redirect(`${authRoute}?${params.toString()}`);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { email: true },
    });

    if (!user) {
      req.session.destroy(() => {});
      const params = new URLSearchParams({ ...input });
      const authRoute =
        input.prompt === "create" ? "/auth/register" : "/auth/login";
      res.redirect(`${authRoute}?${params.toString()}`);
      return;
    }

    res.render("consent", {
      issuer: ISSUER,
      clientName: client.name,
      clientLogoUrl: client.logoUrl ?? null,
      client_id: input.client_id,
      redirect_uri: input.redirect_uri,
      scope: requestedScopes,
      scopeString: input.scope,
      state: input.state,
      code_challenge: input.code_challenge,
      code_challenge_method: input.code_challenge_method,
      nonce: input.nonce ?? null,
      userEmail: user.email,
      scopes: requestedScopes.map((s) => SCOPE_DESCRIPTIONS[s] ?? s),
    });
  }

  async approve(req: Request, res: Response) {
    if (!req.session.userId) throw new BadRequestError("No active session");

    const input = authorizeSchema.parse(req.body);
    const { code, state, redirectUri } = await authorizeService.authorize(
      input,
      req.session.userId,
    );

    res.redirect(`${redirectUri}?code=${code}&state=${state}`);
  }

  async deny(req: Request, res: Response) {
    const { redirect_uri, state } = req.body;
    res.redirect(`${redirect_uri}?error=access_denied&state=${state}`);
  }
}

export const authorizeController = new AuthorizeController();

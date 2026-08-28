import { Request, Response } from "express";
import { AuthorizeInput } from "../validation/authorize.validation";
import {
  authorizeService,
  validateAuthorizeParams,
} from "../services/authorize.service";
import { BadRequestError } from "../errors/AppError";
import { ErrorCodes } from "../errors/ErrorCodes";
import { ISSUER } from "../config/keys";
import { prisma } from "../lib/prisma";
import { RequestWithValidatedQuery } from "../middleware/validate";
import { consentService } from "../services/consent.service";
import { logger, truncateToken } from "../lib/logger";

const log = logger.child({ module: "authorize.controller" });

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  openid: "Verify your identity",
  profile: "Access your name and profile picture",
  email: "Access your email address",
  phone: "Access your phone number",
  address: "Access your physical address",
};

export class AuthorizeController {
  async authorize(req: Request, res: Response) {
    const input = (req as RequestWithValidatedQuery)
      .validatedQuery as AuthorizeInput;

    const { client, requestedScopes } = await validateAuthorizeParams(input);

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

    const canSkipConsent = await consentService.shouldSkipConsent({
      userId: req.session.userId,
      clientId: input.client_id,
      requestedScopes,
    });

    if (canSkipConsent) {
      const { code, state, redirectUri } = await authorizeService.authorize(
        input,
        req.session.userId,
      );
      log.info(
        {
          userId: req.session.userId,
          clientId: input.client_id,
          scope: input.scope,
          codePrefix: truncateToken(code),
          consentSkipped: true,
        },
        "Auth code issued (consent skipped)",
      );
      res.redirect(`${redirectUri}?code=${code}&state=${state}`);
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
    if (!req.session.userId) throw new BadRequestError("No active session", ErrorCodes.SESSION_EXPIRED);

    const input = req.body as AuthorizeInput;
    const { code, state, redirectUri } = await authorizeService.authorize(
      input,
      req.session.userId,
    );

    await consentService.upsertConsent({
      userId: req.session.userId,
      clientId: input.client_id,
      requestedScopes: input.scope.split(" "),
    });

    log.info(
      {
        userId: req.session.userId,
        clientId: input.client_id,
        scope: input.scope,
        codePrefix: truncateToken(code),
      },
      "Consent granted - auth code issued",
    );

    res.redirect(`${redirectUri}?code=${code}&state=${state}`);
  }

  async deny(req: Request, res: Response) {
    const { redirect_uri, state, client_id } = req.body;
    log.warn(
      {
        userId: req.session?.userId,
        clientId: client_id,
      },
      "User denied consent",
    );
    res.redirect(`${redirect_uri}?error=access_denied&state=${state}`);
  }
}

export const authorizeController = new AuthorizeController();

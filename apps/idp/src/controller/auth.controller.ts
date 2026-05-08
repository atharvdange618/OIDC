import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import {
  RegisterInput,
  LoginInput,
  EndSessionInput,
} from "../validation/auth.validation";
import { ISSUER } from "../config/keys";
import { getActiveClient } from "../lib/oauthClient";
import { RequestWithValidatedQuery } from "../middleware/validate";
import { logger, maskEmail, hashSessionId } from "../lib/logger";
import { sendSuccess } from "../lib/response";

const log = logger.child({ module: "auth.controller" });

export class AuthController {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body as RegisterInput);
    sendSuccess(res, { user }, 201);
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput);
    sendSuccess(res, result);
  }

  // get
  async loginPage(req: Request, res: Response) {
    const query = ((req as RequestWithValidatedQuery).validatedQuery ??
      req.query) as Record<string, string>;
    const {
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method,
    } = query;

    const client = await getActiveClient(client_id);
    if (!client) {
      res.status(400).send("Invalid Client");
      return;
    }
    const clientName = client.name;
    const clientLogo = client.logoUrl;

    res.render("login", {
      issuer: ISSUER,
      clientName,
      clientLogo,
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method,
      error: null,
    });
  }

  // post
  async loginForm(req: Request, res: Response) {
    const {
      email,
      password,
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method,
    } = req.body;

    const client = await getActiveClient(client_id);
    if (!client) {
      res.status(400).send("Invalid Client");
      return;
    }
    const clientName = client.name;
    const clientLogo = client.logoUrl;

    try {
      const result = await authService.login({
        email,
        password,
      });

      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      req.session.userId = result.userId;

      log.info(
        {
          userId: result.userId,
          email: maskEmail(email),
          clientId: client_id,
          sessionId: hashSessionId(req.session.id),
          ip: req.ip,
        },
        "User login successful",
      );

      const params = new URLSearchParams({
        client_id,
        redirect_uri,
        scope,
        state,
        code_challenge,
        code_challenge_method,
        response_type: "code",
      });

      res.redirect(`/authorize?${params.toString()}`);
    } catch (error) {
      log.warn(
        {
          email: maskEmail(email),
          clientId: client_id,
          ip: req.ip,
          reason: "invalid_credentials",
        },
        "Login attempt failed",
      );
      res.render("login", {
        issuer: ISSUER,
        clientName,
        clientLogo,
        client_id,
        redirect_uri,
        scope,
        state,
        code_challenge,
        code_challenge_method,
        error: "Invalid email or password",
      });
    }
  }

  // get
  async registerPage(req: Request, res: Response) {
    const query = ((req as RequestWithValidatedQuery).validatedQuery ??
      req.query) as Record<string, string>;
    const {
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method,
    } = query;

    const client = await getActiveClient(client_id);
    if (!client) {
      res.status(400).send("Invalid client");
      return;
    }
    const clientName = client.name;
    const clientLogo = client.logoUrl;

    res.render("register", {
      issuer: ISSUER,
      clientName,
      clientLogo,
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method,
      error: null,
    });
  }

  // post
  async registerForm(req: Request, res: Response) {
    const {
      email,
      password,
      firstName,
      lastName,
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method,
    } = req.body;

    const client = await getActiveClient(client_id);
    if (!client) {
      res.status(400).send("Invalid client");
      return;
    }
    const clientName = client.name;
    const clientLogo = client.logoUrl;

    try {
      const user = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      req.session.userId = user.id;

      log.info(
        {
          userId: user.id,
          email: maskEmail(email),
          clientId: client_id,
          ip: req.ip,
        },
        "User registered successfully",
      );

      const params = new URLSearchParams({
        client_id,
        redirect_uri,
        scope,
        state,
        code_challenge,
        code_challenge_method,
        response_type: "code",
      });
      res.redirect(`/authorize?${params.toString()}`);
    } catch (err: any) {
      log.warn(
        {
          email: maskEmail(email),
          clientId: client_id,
          ip: req.ip,
          reason: err.message,
        },
        "User registration failed",
      );
      res.render("register", {
        issuer: ISSUER,
        clientName,
        clientLogo,
        client_id,
        redirect_uri,
        scope,
        state,
        code_challenge,
        code_challenge_method,
        error: err.message ?? "Registration failed",
      });
    }
  }

  // post and get both
  async logout(req: Request, res: Response) {
    const params = ((req as RequestWithValidatedQuery).validatedQuery ??
      req.body) as EndSessionInput;

    const { clientId, userId: tokenUserId } =
      await authService.validateEndSession(params);

    // prefer the userId extracted from id_token_hint; fall back to the
    // active IdP session so we can still revoke tokens even when no hint
    // was provided.
    const userId = tokenUserId ?? req.session.userId;

    if (userId) {
      await authService.revokeTokensForLogout(userId, clientId);
    }

    log.info(
      {
        userId,
        clientId,
        sessionId: req.session.id ? hashSessionId(req.session.id) : undefined,
      },
      "User logout initiated",
    );

    req.session.destroy((err) => {
      if (err) {
        log.error(
          { err, userId },
          "Session destroy failed during end_session - cookie cleared",
        );
        // force-clear the cookie so the browser doesn't keep sending a
        // dead session ID even if the store delete failed.
        res.clearCookie("connect.sid");
      }

      if (params.post_logout_redirect_uri) {
        const url = new URL(params.post_logout_redirect_uri);
        if (params.state) url.searchParams.set("state", params.state);
        res.redirect(url.toString());
        return;
      }

      res.render("logout", { issuer: ISSUER });
    });
  }
}

export const authController = new AuthController();

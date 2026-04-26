import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { RegisterInput, LoginInput } from "../validation/auth.validation";
import { ISSUER } from "../config/keys";
import { getActiveClient } from "../lib/oauthClient";
import { RequestWithValidatedQuery } from "../middleware/validate";

export class AuthController {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body as RegisterInput);
    res.status(201).json({ user });
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput);
    res.json(result);
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

    res.render("login", {
      issuer: ISSUER,
      clientName: client.name,
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

    try {
      const result = await authService.login({
        email,
        password,
      });

      req.session.userId = result.userId;

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
      res.render("login", {
        issuer: ISSUER,
        clientName: client.name,
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

    res.render("register", {
      issuer: ISSUER,
      clientName: client.name,
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

    try {
      const user = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });
      req.session.userId = user.id;

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
      res.render("register", {
        issuer: ISSUER,
        clientName: client.name,
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

  // post
  async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
        return;
      }
      res.json({ ok: true });
    });
  }
}

export const authController = new AuthController();

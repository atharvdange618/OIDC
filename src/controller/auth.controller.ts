import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { RegisterInput, LoginInput } from "../validation/auth.validation";

export class AuthController {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body as RegisterInput);
    res.status(201).json({ user });
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput);
    res.json(result);
  }
}

export const authController = new AuthController();

import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export class DashboardController {
  loginPage(req: Request, res: Response) {
    if ((req.session as any).userId) {
      return res.redirect("/dashboard/developer");
    }
    res.render("dev-login", { error: null });
  }

  async loginForm(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const result = await authService.login({ email, password });
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      (req.session as any).userId = result.userId;
      res.redirect("/dashboard/developer");
    } catch (error: any) {
      res.render("dev-login", { error: "Invalid email or password" });
    }
  }

  registerPage(req: Request, res: Response) {
    if ((req.session as any).userId) {
      return res.redirect("/dashboard/developer");
    }
    res.render("dev-register", { error: null });
  }

  async registerForm(req: Request, res: Response) {
    const { email, password, firstName, lastName } = req.body;

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
      (req.session as any).userId = user.id;
      res.redirect("/dashboard/developer");
    } catch (error: any) {
      res.render("dev-register", {
        error: error.message || "Registration failed",
      });
    }
  }

  logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error during dev logout:", err);
      }
      res.clearCookie("connect.sid");
      res.redirect("/dashboard/login");
    });
  }
}

export const dashboardController = new DashboardController();

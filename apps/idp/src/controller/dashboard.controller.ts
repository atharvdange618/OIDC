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
      (req.session as any).userId = result.userId;
      res.redirect("/dashboard/developer");
    } catch (error: any) {
      res.render("dev-login", { error: "Invalid email or password" });
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

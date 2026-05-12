import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { sendSuccess, sendError } from "../lib/response";
import { ErrorCodes } from "../errors/ErrorCodes";

const log = logger.child({ module: "dashboard.controller" });

export class DashboardController {
  loginPage(req: Request, res: Response) {
    if (req.session.userId) {
      return res.redirect("/dashboard/developer");
    }
    res.render("dev-login", { error: null });
  }

  async loginForm(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      req.session.userId = result.userId;

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.redirect("/dashboard/developer");
    } catch (error: any) {
      res.render("dev-login", { error: "Invalid email or password" });
    }
  }

  registerPage(req: Request, res: Response) {
    if (req.session.userId) {
      return res.redirect("/dashboard/developer");
    }
    res.render("dev-register", { error: null });
  }

  async registerForm(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;

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

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.redirect("/dashboard/developer");
    } catch (error: any) {
      res.render("dev-register", {
        error: error.message || "Registration failed",
      });
    }
  }

  async developerDashboard(req: Request, res: Response) {
    const developerId = req.session.userId!;

    const user = await prisma.user.findUnique({
      where: { id: developerId },
    });

    const clients = await prisma.oAuthClient.findMany({
      where: { developerId },
      orderBy: { createdAt: "desc" },
    });

    res.render("dashboard", {
      user,
      clients,
    });
  }

  async editClientPage(req: Request, res: Response) {
    const developerId = req.session.userId!;
    const clientId = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id: developerId },
    });

    const client = await prisma.oAuthClient.findFirst({
      where: { id: clientId, developerId },
    });

    if (!client) {
      return res.status(404).send("Client not found");
    }

    res.render("edit-client", { user, client });
  }

  async accountPage(req: Request, res: Response) {
    const userId = req.session.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("account", { user });
  }

  async updateAccount(req: Request, res: Response) {
    const userId = req.session.userId!;

    try {
      const data = req.body;
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.firstName !== undefined && { firstName: data.firstName }),
          ...(data.lastName !== undefined && { lastName: data.lastName }),
          ...(data.phoneNumber !== undefined && {
            phoneNumber: data.phoneNumber || null,
          }),
          ...(data.dateOfBirth !== undefined && {
            dateOfBirth: data.dateOfBirth || null,
          }),
          ...(data.gender !== undefined && { gender: data.gender || null }),
          ...(data.profileImageUrl !== undefined && {
            profileImageUrl: data.profileImageUrl || null,
          }),
          ...(data.address !== undefined && { address: data.address || null }),
        },
      });

      sendSuccess(res, {
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      log.error({ err: error, userId }, "Error updating profile");
      sendError(
        res,
        ErrorCodes.PROFILE_UPDATE_FAILED,
        "Failed to update profile",
        500,
      );
    }
  }

  logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        log.error({ err }, "Session destroy error during dev logout");
      }
      res.clearCookie("connect.sid");
      res.redirect("/dashboard/login");
    });
  }
}

export const dashboardController = new DashboardController();

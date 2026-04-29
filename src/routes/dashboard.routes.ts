import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { dashboardController } from "../controller/dashboard.controller";
import { loginLimiter } from "../middleware/rateLimiter";
import { requireIdpLogin } from "../middleware/requireAuth";

const router = Router();

router.get("/login", dashboardController.loginPage);
router.post("/login", loginLimiter, dashboardController.loginForm);
router.get("/logout", dashboardController.logout);
router.post("/logout", dashboardController.logout);

router.get(
  "/developer",
  requireIdpLogin,
  async (req: Request, res: Response) => {
    const developerId = (req.session as any).userId;

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
  },
);

export default router;

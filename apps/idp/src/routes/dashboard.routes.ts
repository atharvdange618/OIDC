import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { dashboardController } from "../controller/dashboard.controller";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter";
import { requireIdpLogin } from "../middleware/requireAuth";

const router = Router();

router.get("/login", dashboardController.loginPage);
router.post("/login", loginLimiter, dashboardController.loginForm);

router.get("/register", dashboardController.registerPage);
router.post("/register", registerLimiter, dashboardController.registerForm);
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

router.get(
  "/developer/client/:id",
  requireIdpLogin,
  async (req: Request, res: Response) => {
    const developerId = (req.session as any).userId;
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
  },
);

router.get("/account", requireIdpLogin, async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).send("User not found");
  }

  res.render("account", { user });
});

router.put("/account", requireIdpLogin, async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  const {
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
    gender,
    profileImageUrl,
    address,
  } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phoneNumber !== undefined && { phoneNumber: phoneNumber || null }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth || null }),
        ...(gender !== undefined && { gender: gender || null }),
        ...(profileImageUrl !== undefined && {
          profileImageUrl: profileImageUrl || null,
        }),
        ...(address !== undefined && { address: address || null }),
      },
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;

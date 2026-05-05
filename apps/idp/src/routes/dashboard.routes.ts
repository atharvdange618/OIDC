import { Router } from "express";
import { dashboardController } from "../controller/dashboard.controller";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter";
import { requireIdpLogin } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import {
  devLoginSchema,
  devRegisterSchema,
  updateAccountSchema,
} from "../validation/dashboard.validation";

const router = Router();

router.get("/login", dashboardController.loginPage);
router.post(
  "/login",
  loginLimiter,
  validate(devLoginSchema),
  dashboardController.loginForm,
);

router.get("/register", dashboardController.registerPage);
router.post(
  "/register",
  registerLimiter,
  validate(devRegisterSchema),
  dashboardController.registerForm,
);

router.get("/logout", dashboardController.logout);
router.post("/logout", dashboardController.logout);

router.get(
  "/developer",
  requireIdpLogin,
  dashboardController.developerDashboard,
);

router.get(
  "/developer/client/:id",
  requireIdpLogin,
  dashboardController.editClientPage,
);

router.get("/account", requireIdpLogin, dashboardController.accountPage);

router.put(
  "/account",
  requireIdpLogin,
  validate(updateAccountSchema),
  dashboardController.updateAccount,
);

export default router;

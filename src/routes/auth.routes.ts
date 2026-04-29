import { Router } from "express";
import { authController } from "../controller/auth.controller";
import { validate, validateQuery } from "../middleware/validate";
import {
  loginSchema,
  registerSchema,
  loginFormSchema,
  registerFormSchema,
  oidcParamsSchema,
} from "../validation/auth.validation";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter";

const router = Router();

// UI routes (OIDC consent flow)
router.get("/login", validateQuery(oidcParamsSchema), authController.loginPage);
router.post(
  "/login",
  loginLimiter,
  validate(loginFormSchema),
  authController.loginForm,
);
router.get(
  "/register",
  validateQuery(oidcParamsSchema),
  authController.registerPage,
);
router.post(
  "/register",
  validate(registerFormSchema),
  authController.registerForm,
);

router.post("/logout", authController.logout);

// API routes
router.post(
  "/api/register",
  registerLimiter,
  validate(registerSchema),
  authController.register,
);
router.post(
  "/api/login",
  loginLimiter,
  validate(loginSchema),
  authController.login,
);
export default router;

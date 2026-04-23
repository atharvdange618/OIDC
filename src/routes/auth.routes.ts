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

const router = Router();

// UI routes (OIDC consent flow)
router.get("/login", validateQuery(oidcParamsSchema), authController.loginPage);
router.post("/login", validate(loginFormSchema), authController.loginForm);
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

// API routes
router.post("/api/register", validate(registerSchema), authController.register);
router.post("/api/login", validate(loginSchema), authController.login);
export default router;

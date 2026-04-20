import { Router } from "express";
import { authController } from "../controller/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validation/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

export default router;

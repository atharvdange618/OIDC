import { Router } from "express";
import { clientsController } from "../controller/clients.controller";
import { validate } from "../middleware/validate";
import { registerClientSchema } from "../validation/clients.validation";
import { requireIdpLogin } from "../middleware/requireAuth";

const router = Router();

router.post(
  "/register",
  requireIdpLogin,
  validate(registerClientSchema),
  clientsController.register,
);

export default router;

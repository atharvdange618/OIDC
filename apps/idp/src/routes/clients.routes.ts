import { Router } from "express";
import { clientsController } from "../controller/clients.controller";
import { validate } from "../middleware/validate";
import {
  registerClientSchema,
  updateClientSchema,
} from "../validation/clients.validation";
import { requireIdpLogin } from "../middleware/requireAuth";

const router = Router();

router.post(
  "/register",
  requireIdpLogin,
  validate(registerClientSchema),
  clientsController.register,
);

router.put(
  "/:clientId",
  requireIdpLogin,
  validate(updateClientSchema),
  clientsController.update,
);

export default router;

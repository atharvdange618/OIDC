import { Router } from "express";
import { clientsController } from "../controller/clients.controller";
import { validate } from "../middleware/validate";
import { registerClientSchema } from "../validation/clients.validation";

const router = Router();

router.post(
  "/register",
  validate(registerClientSchema),
  clientsController.register,
);

export default router;

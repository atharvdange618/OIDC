import { Router } from "express";
import { authorizeController } from "../controller/authorize.controller";
import { validate, validateQuery } from "../middleware/validate";
import {
  authorizeSchema,
  denySchema,
} from "../validation/authorize.validation";

const router = Router();

router.get("/", validateQuery(authorizeSchema), authorizeController.authorize);
router.post("/approve", validate(authorizeSchema), authorizeController.approve);
router.post("/deny", validate(denySchema), authorizeController.deny);

export default router;

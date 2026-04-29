import { Router } from "express";
import { tokenController } from "../controller/token.controller";
import { introspectSchema } from "../validation/introspect.validation";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/", tokenController.exchange);
router.post(
  "/introspect",
  validate(introspectSchema),
  tokenController.introspect,
);

export default router;

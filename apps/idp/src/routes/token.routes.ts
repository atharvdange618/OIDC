import { Router } from "express";
import { tokenController } from "../controller/token.controller";
import { introspectSchema } from "../validation/introspect.validation";
import { tokenRequestSchema } from "../validation/token.validation";
import { validate } from "../middleware/validate";
import { tokenLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/",
  tokenLimiter,
  validate(tokenRequestSchema),
  tokenController.exchange,
);
router.post(
  "/introspect",
  tokenLimiter,
  validate(introspectSchema),
  tokenController.introspect,
);

export default router;

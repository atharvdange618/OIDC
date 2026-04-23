import { Router } from "express";
import { authorizeController } from "../controller/authorize.controller";

const router = Router();

router.get("/", authorizeController.authorize);
router.post("/approve", authorizeController.approve);
router.post("/deny", authorizeController.deny);

export default router;

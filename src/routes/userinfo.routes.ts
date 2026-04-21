import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { userinfoController } from "../controller/userinfo.controller";

const router = Router();

router.get("/", requireAuth, userinfoController.getInfo);

export default router;

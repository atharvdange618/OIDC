import { Router } from "express";
import { tokenController } from "../controller/token.controller";

const router = Router();

router.post("/", tokenController.exchange);

export default router;

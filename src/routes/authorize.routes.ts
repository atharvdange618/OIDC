import { Router } from "express";
import { authorizeController } from "../controller/authorize.controller";

const router = Router();

router.get("/", authorizeController.authorize);

export default router;

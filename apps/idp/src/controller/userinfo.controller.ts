import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/requireAuth";
import { userinfoService } from "../services/userinfo.service";

export class UserinfoController {
  async getInfo(req: AuthenticatedRequest, res: Response) {
    const { sub, scope } = req.auth!;
    const claims = await userinfoService.getInfo(sub, scope);
    res.json(claims);
  }
}

export const userinfoController = new UserinfoController();

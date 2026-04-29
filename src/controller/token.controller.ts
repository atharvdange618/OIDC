import { Request, Response } from "express";
import {
  refreshTokenSchema,
  tokenSchema,
} from "../validation/token.validation";
import { tokenService } from "../services/token.service";
import { BadRequestError } from "../errors/AppError";
import { IntrospectInput } from "../validation/introspect.validation";
import { introspectService } from "../services/introspect.service";

export class TokenController {
  async exchange(req: Request, res: Response) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");

    const { grant_type } = req.body;

    if (grant_type === "authorization_code") {
      const input = tokenSchema.parse(req.body);
      const tokens = await tokenService.exchange(input);
      res.json(tokens);
      return;
    }

    if (grant_type === "refresh_token") {
      const input = refreshTokenSchema.parse(req.body);
      const tokens = await tokenService.refresh(input);
      res.json(tokens);
      return;
    }

    throw new BadRequestError("Unsupported grant_type");
  }

  async introspect(req: Request, res: Response) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");

    const result = await introspectService.introspect(
      req.body as IntrospectInput,
    );
    res.json(result);
  }
}

export const tokenController = new TokenController();

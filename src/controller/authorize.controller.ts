import { Request, Response } from "express";
import { authorizeSchema } from "../validation/authorize.validation";
import { authorizeService } from "../services/authorize.service";
import { BadRequestError } from "../errors/AppError";

export class AuthorizeController {
  async authorize(req: Request, res: Response) {
    const input = authorizeSchema.parse(req.query);

    // in a real IdP this comes from the session after the user logs in
    // on the IdP's login page. as this is a POC we accept it as a query param.
    const userId = req.query.user_id as string;
    if (!userId) throw new BadRequestError("user_id is required");

    const { code, state, redirectUri } = await authorizeService.authorize(
      input,
      userId,
    );

    res.redirect(`${redirectUri}?code=${code}&state=${state}`);
  }
}

export const authorizeController = new AuthorizeController();

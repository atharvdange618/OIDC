import { NextFunction, Request, Response } from "express";
import { AppError, UnauthorizedError } from "../errors/AppError";
import { verifyJwt } from "../lib/jwt";
import { getActiveClient } from "../lib/oauthClient";

export interface AuthenticatedRequest extends Request {
  auth?: {
    sub: string;
    aud: string;
    scope: string;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    throw new UnauthorizedError("Missing or invalid Authorization header");

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyJwt(token);

    const rawAud = payload.aud;
    const aud = Array.isArray(rawAud) ? rawAud[0] : (rawAud as string);

    if (!aud) throw new UnauthorizedError("Token missing audience claim");

    const client = await getActiveClient(aud);
    if (!client)
      throw new UnauthorizedError(
        "Token audience is not a valid active client",
      );

    req.auth = {
      sub: payload.sub as string,
      aud,
      scope: payload.scope as string,
    };

    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new UnauthorizedError("Invalid or expired token");
  }
};

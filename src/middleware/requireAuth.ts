import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/AppError";
import { verifyJwt } from "../lib/jwt";

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

    req.auth = {
      sub: payload.sub as string,
      aud: Array.isArray(payload.aud)
        ? payload.aud[0]
        : (payload.aud as string),
      scope: payload.scope as string,
    };

    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
};

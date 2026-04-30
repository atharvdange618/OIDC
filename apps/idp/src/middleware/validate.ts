import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export type RequestWithValidatedQuery = Request & { validatedQuery?: unknown };

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };

export const validateQuery =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    (req as RequestWithValidatedQuery).validatedQuery = schema.parse(req.query);
    next();
  };

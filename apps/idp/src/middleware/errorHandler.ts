import { Response, Request, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  logger.error(
    {
      err,
      method: req.method,
      url: req.url,
      requestId: res.getHeader("X-Request-Id"),
    },
    "Unhandled error",
  );
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  });
};

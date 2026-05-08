import { Response, Request, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/ErrorCodes";
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
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: "Invalid request data",
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
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
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: "Something went wrong",
    },
  });
};

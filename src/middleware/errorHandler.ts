import { Response, Request, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: err.flatten(),
    });
    return;
  }

  // Our custom errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  // Unknown errors
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  });
};

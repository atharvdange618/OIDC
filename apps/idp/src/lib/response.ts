import { type Response } from "express";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
): void {
  const body: ApiSuccessResponse<T> = { success: true, data };
  res.status(statusCode).json(body);
}

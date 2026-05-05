import pinoHttp from "pino-http";
import { logger, hashSessionId } from "../lib/logger";
import type { Request } from "express";

export const requestLogger = pinoHttp({
  logger,

  genReqId: (req, res) => {
    const id = crypto.randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },

  customProps: (req: Request) => ({
    sessionId: req.session?.id ? hashSessionId(req.session.id) : undefined,
  }),

  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
      userAgent: req.headers["user-agent"],
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  autoLogging: {
    ignore: (req) =>
      req.url === "/health" || req.url?.startsWith("/.well-known"),
  },

  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  customSuccessMessage: (req, res, responseTime) =>
    `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`,

  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
});

import pino from "pino";
import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { env } from "../config/env";

const isDev = env.NODE_ENV !== "production";
const LOG_LEVEL = env.LOG_LEVEL ?? (isDev ? "debug" : "info");

// pino builds both transports eagerly, so the rotating-file sink needs this
// directory to exist even in dev.
const LOGS_DIR = path.join(process.cwd(), "logs");
fs.mkdirSync(LOGS_DIR, { recursive: true });

/**
 * Production transport: two rotating file sinks.
 *  - logs/idp.log       → info and above, daily rotation, 14-day retention
 *  - logs/idp.error.log → error and above, daily rotation, 30-day retention
 */
const productionTransport = pino.transport({
  targets: [
    {
      target: "pino-roll",
      options: {
        file: path.join(LOGS_DIR, "idp.log"),
        frequency: "daily",
        size: "50m",
        limit: { count: 14 },
        dateFormat: "yyyy-MM-dd",
        compress: "gzip",
      },
      level: "info",
    },
    {
      target: "pino-roll",
      options: {
        file: path.join(LOGS_DIR, "idp.error.log"),
        frequency: "daily",
        size: "10m",
        limit: { count: 30 },
        dateFormat: "yyyy-MM-dd",
        compress: "gzip",
      },
      level: "error",
    },
  ],
});

/**
 * Dev transport: pino-pretty for human-readable colorized output.
 */
const devTransport = pino.transport({
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "HH:MM:ss",
    ignore: "pid,hostname",
    messageFormat: "[{module}] {msg}",
  },
});

export const logger = pino(
  {
    level: LOG_LEVEL,
    base: {
      env: env.NODE_ENV,
      version: process.env.npm_package_version,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers['set-cookie']",
        "*.password",
        "*.client_secret",
        "*.secret",
      ],
      censor: "[REDACTED]",
    },
  },
  isDev ? devTransport : productionTransport,
);

/**
 * Mask a PII email address.
 * "atharv@example.com" → "a*****@example.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "[invalid-email]";
  return `${local[0]}${"*".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

/**
 * Safely truncate a token/code to the first N chars for log correlation
 * without exposing the full value.
 */
export function truncateToken(token: string, chars = 8): string {
  return `${token.slice(0, chars)}...`;
}

/**
 * Hash a session ID for log correlation without exposing the raw session.
 */
export function hashSessionId(sessionId: string): string {
  return createHash("sha256").update(sessionId).digest("hex").slice(0, 8);
}

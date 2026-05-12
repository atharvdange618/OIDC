import { prisma } from "./prisma";
import { env } from "../config/env";
import { logger } from "./logger";

const CACHE_TTL = 60_000;
let allowedOrigins: Set<string> = new Set();
let lastFetched = 0;

function extractOrigin(uri: string): string | null {
  try {
    return new URL(uri).origin;
  } catch {
    return null;
  }
}

async function refreshOrigins(): Promise<void> {
  try {
    const clients = await prisma.oAuthClient.findMany({
      where: { isActive: true },
      select: { redirectUris: true },
    });

    const origins = new Set<string>();

    for (const client of clients) {
      for (const uri of client.redirectUris as string[]) {
        const origin = extractOrigin(uri);
        if (origin) origins.add(origin);
      }
    }

    if (env.CORS_EXTRA_ORIGINS) {
      for (const raw of env.CORS_EXTRA_ORIGINS.split(",")) {
        const trimmed = raw.trim();
        if (trimmed) {
          const origin = extractOrigin(trimmed);
          if (origin) origins.add(origin);
        }
      }
    }

    allowedOrigins = origins;
    lastFetched = Date.now();
    logger.info({ originCount: origins.size }, "CORS origins refreshed");
  } catch (err) {
    logger.warn({ err }, "Failed to refresh CORS origins, using stale cache");
  }
}

export async function initCorsOrigins(): Promise<void> {
  await refreshOrigins();
}

export function corsOriginCallback(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  if (!origin) return callback(null, true);

  if (allowedOrigins.has(origin)) return callback(null, true);

  if (Date.now() - lastFetched > CACHE_TTL) {
    refreshOrigins().then(() => callback(null, allowedOrigins.has(origin)));
  } else {
    callback(null, false);
  }
}

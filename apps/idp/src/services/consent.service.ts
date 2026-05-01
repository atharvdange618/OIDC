import { prisma } from "../lib/prisma";

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;

  const dayOfMonth = d.getDate();
  d.setDate(1);
  d.setMonth(targetMonth);

  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dayOfMonth, lastDay));

  return d;
}

function uniqueUnion(a: string[], b: string[]) {
  return Array.from(new Set([...a, ...b]));
}

export class ConsentService {
  async shouldSkipConsent(params: {
    userId: string;
    clientId: string;
    requestedScopes: string[];
    now?: Date;
  }) {
    const now = params.now ?? new Date();

    const consent = await prisma.userConsent.findUnique({
      where: {
        userId_clientId: {
          userId: params.userId,
          clientId: params.clientId,
        },
      },
      select: {
        scopes: true,
        expiresAt: true,
      },
    });

    if (!consent) return false;
    if (consent.expiresAt < now) return false;

    const hasAllScopes = params.requestedScopes.every((s) =>
      consent.scopes.includes(s),
    );
    if (!hasAllScopes) return false;

    return true;
  }

  async upsertConsent(params: {
    userId: string;
    clientId: string;
    requestedScopes: string[];
    now?: Date;
  }) {
    const now = params.now ?? new Date();
    const expiresAt = addMonths(now, 6);

    const existing = await prisma.userConsent.findUnique({
      where: {
        userId_clientId: {
          userId: params.userId,
          clientId: params.clientId,
        },
      },
      select: {
        scopes: true,
      },
    });

    const scopes = uniqueUnion(existing?.scopes ?? [], params.requestedScopes);

    return prisma.userConsent.upsert({
      where: {
        userId_clientId: { userId: params.userId, clientId: params.clientId },
      },
      create: {
        userId: params.userId,
        clientId: params.clientId,
        scopes,
        grantedAt: now,
        expiresAt,
      },
      update: {
        scopes,
        grantedAt: now,
        expiresAt,
      },
    });
  }
}

export const consentService = new ConsentService();

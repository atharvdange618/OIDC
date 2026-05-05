import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import {
  RegisterClientInput,
  UpdateClientInput,
} from "../validation/clients.validation";
import { ConflictError, NotFoundError } from "../errors/AppError";

export class ClientsService {
  async register(data: RegisterClientInput, developerId?: string) {
    const clientSecret = randomBytes(32).toString("hex");
    const clientSecretHash = await bcrypt.hash(clientSecret, 12);

    try {
      const client = await prisma.oAuthClient.create({
        data: {
          name: data.name,
          clientSecretHash,
          redirectUris: data.redirectUris,
          allowedScopes: data.allowedScopes,
          appUrl: data.appUrl,
          logoUrl: data.logoUrl,
          developerId,
          postLogoutRedirectUris: data.postLogoutRedirectUris ?? [],
        },
        select: {
          id: true,
          clientId: true,
          name: true,
          redirectUris: true,
          allowedScopes: true,
          postLogoutRedirectUris: true,
          appUrl: true,
          logoUrl: true,
          developerId: true,
          createdAt: true,
        },
      });

      return {
        ...client,
        clientSecret,
      };
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        throw new ConflictError(
          "Client ID collision - please try again",
          "CLIENT_ID_CONFLICT",
        );
      }
      throw err;
    }
  }

  async update(id: string, developerId: string, data: UpdateClientInput) {
    const client = await prisma.oAuthClient.findFirst({
      where: { id, developerId },
    });

    if (!client) {
      throw new NotFoundError("Client not found or unauthorized");
    }

    return prisma.oAuthClient.update({
      where: { id: client.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.redirectUris && { redirectUris: data.redirectUris }),
        ...(data.allowedScopes && { allowedScopes: data.allowedScopes }),
        ...(data.appUrl !== undefined && { appUrl: data.appUrl || null }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl || null }),
        ...(data.postLogoutRedirectUris && {
          postLogoutRedirectUris: data.postLogoutRedirectUris,
        }),
      },
    });
  }
}

export const clientsService = new ClientsService();

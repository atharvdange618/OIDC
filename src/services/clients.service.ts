import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { RegisterClientInput } from "../validation/clients.validation";
import { ConflictError } from "../errors/AppError";

export class ClientsService {
  async register(data: RegisterClientInput) {
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
}

export const clientsService = new ClientsService();

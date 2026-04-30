import { prisma } from "./prisma";

export async function getActiveClient(clientId: string) {
  return prisma.oAuthClient.findFirst({
    where: {
      clientId,
      isActive: true,
    },
  });
}

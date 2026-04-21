import { NotFoundError } from "../errors/AppError";
import { prisma } from "../lib/prisma";

export class UserinfoService {
  async getInfo(userId: string, scope: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) throw new NotFoundError("User not found");

    const scopes = scope.split(" ");

    const claims: Record<string, unknown> = {
      sub: user.id,
    };

    if (scopes.includes("email")) {
      claims.email = user.email;
      claims.email_verified = user.emailVerifiedAt !== null;
    }

    if (scopes.includes("profile")) {
      claims.given_name = user.firstName;
      claims.family_name = user.lastName;
      if (user.profileImageUrl) {
        claims.picture = user.profileImageUrl;
      }
    }

    return claims;
  }
}

export const userinfoService = new UserinfoService();

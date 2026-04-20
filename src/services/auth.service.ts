import bcrypt from "bcrypt";
import { ConflictError, UnauthorizedError } from "../errors/AppError";
import { prisma } from "../lib/prisma";
import { LoginInput, RegisterInput } from "../validation/auth.validation";

export class AuthService {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existing)
      throw new ConflictError(
        "Registration failed. Please check your details or try logging in.",
      );

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}

export const authService = new AuthService();

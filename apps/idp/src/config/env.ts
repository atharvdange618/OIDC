import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
  ISSUER: z.string().url("ISSUER must be a valid URL"),
  KEY_ID: z.string().min(1).default("key-1"),
  CORS_EXTRA_ORIGINS: z.string().optional(),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables - server cannot start:\n");
  const errors = parsed.error.flatten().fieldErrors;
  for (const [field, messages] of Object.entries(errors)) {
    console.error(`  ${field}: ${messages?.join(", ")}`);
  }
  process.exit(1);
}

export const env = parsed.data;

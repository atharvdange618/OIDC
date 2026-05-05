import { z } from "zod";

export const tokenSchema = z.object({
  grant_type: z.literal("authorization_code"),
  code: z.string().min(1).trim(),
  redirect_uri: z.string().url().trim(),
  client_id: z.string().min(1).trim(),
  client_secret: z.string().min(1).trim(),
  code_verifier: z.string().min(43).max(128).trim(),
});

export type TokenInput = z.infer<typeof tokenSchema>;

export const refreshTokenSchema = z.object({
  grant_type: z.literal("refresh_token"),
  refresh_token: z.string().min(1).trim(),
  client_id: z.string().min(1).trim(),
  client_secret: z.string().min(1).trim(),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const tokenRequestSchema = z.discriminatedUnion("grant_type", [
  tokenSchema,
  refreshTokenSchema,
]);

export type TokenRequestInput = z.infer<typeof tokenRequestSchema>;

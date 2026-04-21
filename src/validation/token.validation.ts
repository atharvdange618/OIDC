import { z } from "zod";

export const tokenSchema = z.object({
  grant_type: z.literal("authorization_code"),
  code: z.string().min(1),
  redirect_uri: z.string().url(),
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  code_verifier: z.string().min(43).max(128),
});

export type TokenInput = z.infer<typeof tokenSchema>;

export const refreshTokenSchema = z.object({
  grant_type: z.literal("refresh_token"),
  refresh_token: z.string().min(1),
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

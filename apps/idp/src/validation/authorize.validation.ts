import { z } from "zod";

export const authorizeSchema = z.object({
  client_id: z.string().min(1).trim(),
  redirect_uri: z.string().url().trim(),
  response_type: z.literal("code"),
  scope: z.string().min(1).trim(),
  state: z.string().min(1).trim(),
  code_challenge: z.string().min(43).max(128).trim(),
  code_challenge_method: z.literal("S256"),
  nonce: z.string().trim().optional(),
  prompt: z.string().trim().optional(),
});

export const denySchema = z.object({
  client_id: z.string().min(1).trim(),
  redirect_uri: z.string().url().trim(),
  state: z.string().min(1).trim(),
});

export type AuthorizeInput = z.infer<typeof authorizeSchema>;
export type DenyInput = z.infer<typeof denySchema>;

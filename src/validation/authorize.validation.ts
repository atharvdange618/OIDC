import { z } from "zod";

export const authorizeSchema = z.object({
  client_id: z.string().min(1),
  redirect_uri: z.string().url(),
  response_type: z.literal("code"),
  scope: z.string().min(1),
  state: z.string().min(1),
  code_challenge: z.string().min(43).max(128),
  code_challenge_method: z.literal("S256"),
  nonce: z.string().optional(),
});

export type AuthorizeInput = z.infer<typeof authorizeSchema>;

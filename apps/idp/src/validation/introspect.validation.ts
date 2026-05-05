import { z } from "zod";

export const introspectSchema = z.object({
  token: z.string().min(1).trim(),
  token_type_hint: z
    .enum(["access_token", "refresh_token", "id_token"])
    .optional(),
  client_id: z.string().min(1).trim(),
  client_secret: z.string().min(1).trim(),
});

export type IntrospectInput = z.infer<typeof introspectSchema>;

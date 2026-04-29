import { z } from "zod";

export const introspectSchema = z.object({
  token: z.string().min(1),
  token_type_hint: z
    .enum(["access_token", "refresh_token", "id_token"])
    .optional(),
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
});

export type IntrospectInput = z.infer<typeof introspectSchema>;

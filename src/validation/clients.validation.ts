import { z } from "zod";

const SUPPORTED_SCOPES = ["openid", "profile", "email"] as const;

export const registerClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),

  redirectUris: z
    .array(z.string().url("Each redirect URI must be a valid URL"))
    .min(1, "At least one redirect URI is required"),

  allowedScopes: z
    .array(z.enum(SUPPORTED_SCOPES))
    .min(1, "At least one scope is required")
    .refine((scopes) => scopes.includes("openid"), {
      message: 'Scope "openid" is required',
    }),

  appUrl: z.string().url("appUrl must be a valid URL").optional(),

  postLogoutRedirectUris: z
    .array(z.string().url("Each post-logout redirect URI must be a valid URL"))
    .optional(),
});

export type RegisterClientInput = z.infer<typeof registerClientSchema>;

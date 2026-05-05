import { z } from "zod";

const SUPPORTED_SCOPES = [
  "openid",
  "profile",
  "email",
  "phone",
  "address",
] as const;

export const registerClientSchema = z.object({
  name: z.string().min(1, "Client name is required").trim(),

  redirectUris: z
    .array(z.string().url("Each redirect URI must be a valid URL").trim())
    .min(1, "At least one redirect URI is required"),

  allowedScopes: z
    .array(z.enum(SUPPORTED_SCOPES))
    .min(1, "At least one scope is required")
    .refine((scopes) => scopes.includes("openid"), {
      message: 'Scope "openid" is required',
    }),

  appUrl: z.string().url("appUrl must be a valid URL").trim().optional(),

  logoUrl: z.string().url("logoUrl must be a valid URL").trim().optional(),

  postLogoutRedirectUris: z
    .array(
      z
        .string()
        .url("Each post-logout redirect URI must be a valid URL")
        .trim(),
    )
    .optional(),
});

export type RegisterClientInput = z.infer<typeof registerClientSchema>;

export const updateClientSchema = z.object({
  name: z.string().min(1, "Client name is required").trim().optional(),

  redirectUris: z
    .array(z.string().url("Each redirect URI must be a valid URL").trim())
    .min(1, "At least one redirect URI is required")
    .optional(),

  allowedScopes: z
    .array(z.enum(SUPPORTED_SCOPES))
    .min(1, "At least one scope is required")
    .refine((scopes) => scopes.includes("openid"), {
      message: 'Scope "openid" is required',
    })
    .optional(),

  appUrl: z
    .string()
    .url("appUrl must be a valid URL")
    .trim()
    .optional()
    .or(z.literal("")),

  logoUrl: z
    .string()
    .url("logoUrl must be a valid URL")
    .trim()
    .optional()
    .or(z.literal("")),

  postLogoutRedirectUris: z
    .array(
      z
        .string()
        .url("Each post-logout redirect URI must be a valid URL")
        .trim(),
    )
    .optional(),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

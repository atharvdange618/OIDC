import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1).trim(),
  lastName: z.string().min(1).trim(),
  phoneNumber: z.string().trim().optional(),
  dateOfBirth: z.string().trim().optional(),
  gender: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const oidcParamsSchema = z.object({
  client_id: z.string().min(1).trim(),
  redirect_uri: z.string().url().trim(),
  scope: z.string().min(1).trim(),
  state: z.string().min(1).trim(),
  code_challenge: z.string().min(1).trim(),
  code_challenge_method: z.literal("S256"),
});

export const endSessionSchema = z.object({
  id_token_hint: z.string().trim().optional(),
  client_id: z.string().trim().optional(),
  post_logout_redirect_uri: z.string().url().trim().optional(),
  state: z.string().trim().optional(),
});

export const loginFormSchema = loginSchema.merge(oidcParamsSchema);

export const registerFormSchema = registerSchema.merge(oidcParamsSchema);

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OidcParams = z.infer<typeof oidcParamsSchema>;
export type LoginFormInput = z.infer<typeof loginFormSchema>;
export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;

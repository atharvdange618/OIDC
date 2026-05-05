import { z } from "zod";

export const devLoginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const devRegisterSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
});

export const updateAccountSchema = z.object({
  firstName: z.string().min(1, "First name cannot be empty").trim().optional(),
  lastName: z.string().min(1, "Last name cannot be empty").trim().optional(),
  phoneNumber: z.string().trim().optional(),
  dateOfBirth: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  profileImageUrl: z.string().url("Must be a valid URL").trim().optional(),
  address: z.string().trim().optional(),
});

export type DevLoginInput = z.infer<typeof devLoginSchema>;
export type DevRegisterInput = z.infer<typeof devRegisterSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

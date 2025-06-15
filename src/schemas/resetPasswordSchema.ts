import { z } from "zod";

export const resetPasswordRequestSchema = z.object({
  identifier: z.string().min(1, { message: "Email or username is required" }),
});

export const resetPasswordVerifySchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  code: z
    .string()
    .length(6, { message: "Verification code must be 6 digits long" }),
  newPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

import { z } from "zod";

// Define roles properly (fixes enum redline issue)
const roles = ["STUDENT", "TEACHER", "PROFESSIONAL"] as const;

// 🔐 Signup Schema
export const signupSchema = z.object({
  email: z
    .string()
    .email("Invalid email format"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),

  role: z.enum(roles),
});


// 🔐 Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format"),

  password: z
    .string()
    .min(6, "Password is required"),
});


// Optional: Export TypeScript types (VERY USEFUL)
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
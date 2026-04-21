import { z } from "zod";

// 🎯 Difficulty enum (strict)
const difficulties = ["EASY", "MEDIUM", "HARD"] as const;

// 🧩 Create Problem Schema
export const createProblemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),

  description: z.string().min(10, "Description must be at least 10 characters"),

  difficulty: z.enum(difficulties),
});

// Optional: Type inference (useful later)
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
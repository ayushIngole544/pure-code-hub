import { z } from "zod/v4";

// ==========================================
// 🔒 AI Response Validation Schemas
// ==========================================

const baseQuestionSchema = z.object({
  title: z.string().min(1),
  difficulty: z.string().min(1),
  description: z.string().min(1),
});

export const mcqResponseSchema = baseQuestionSchema.extend({
  options: z.array(z.string().min(1)).min(2).max(6),
  correctAnswer: z.string().min(1),
});

export const natResponseSchema = baseQuestionSchema.extend({
  correctAnswer: z.string().min(1),
});

export const codingResponseSchema = baseQuestionSchema.extend({
  constraints: z.string().optional(),
  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        explanation: z.string().optional(),
      })
    )
    .optional(),
  starterCode: z
    .object({
      cpp: z.string().optional(),
      java: z.string().optional(),
      python: z.string().optional(),
      c: z.string().optional(),
    })
    .optional(),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        isHidden: z.boolean().optional(),
      })
    )
    .min(1),
});

export function validateAIResponse(type: string, data: unknown) {
  if (type === "MCQ") return mcqResponseSchema.safeParse(data);
  if (type === "NAT") return natResponseSchema.safeParse(data);
  return codingResponseSchema.safeParse(data);
}

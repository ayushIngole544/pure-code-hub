import { z } from "zod";

export const createAssignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),

  dueDate: z.string().datetime("Invalid date format"),

  problemIds: z
    .array(z.string())
    .min(1, "At least one problem is required"),
});
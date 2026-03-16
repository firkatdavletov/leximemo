import { z } from "zod";

export const reviewGradeSchema = z.enum(["hard", "normal", "easy"]);

export const submitReviewSchema = z.object({
  cardId: z.string().trim().min(1, "cardId обязателен."),
  grade: reviewGradeSchema,
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;

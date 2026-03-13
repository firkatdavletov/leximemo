import { z } from "zod";

export const deckSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Название колоды обязательно.")
    .max(120, "Название колоды должно быть не длиннее 120 символов."),
  description: z
    .string()
    .trim()
    .max(500, "Описание колоды должно быть не длиннее 500 символов.")
    .optional(),
});

export type DeckInput = z.infer<typeof deckSchema>;

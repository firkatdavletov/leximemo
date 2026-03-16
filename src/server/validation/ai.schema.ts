import { z } from "zod";

export const generatedCardSchema = z.object({
  word: z
    .string()
    .trim()
    .min(1, "Поле word обязательно.")
    .max(160, "Слово должно быть не длиннее 160 символов."),
  translation: z
    .string()
    .trim()
    .min(1, "Поле translation обязательно.")
    .max(300, "Перевод должен быть не длиннее 300 символов."),
  example: z
    .string()
    .trim()
    .max(1000, "Пример должен быть не длиннее 1000 символов.")
    .optional()
    .nullable(),
  imagePrompt: z
    .string()
    .trim()
    .max(400, "imagePrompt должен быть не длиннее 400 символов.")
    .optional()
    .nullable(),
});

export const aiPreviewSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(3, "Prompt должен содержать минимум 3 символа.")
    .max(4000, "Prompt должен быть не длиннее 4000 символов."),
  cardsCount: z.coerce
    .number()
    .int("cardsCount должен быть целым числом.")
    .min(1, "cardsCount должен быть не меньше 1.")
    .max(20, "За один запрос можно сгенерировать максимум 20 карточек."),
});

export const aiGeneratedCardsSaveSchema = z.object({
  cards: z
    .array(generatedCardSchema)
    .min(1, "Добавьте хотя бы одну карточку для сохранения.")
    .max(20, "За один запрос можно сохранить максимум 20 карточек."),
});

export const aiGeneratedCardsResponseSchema = z.object({
  cards: z
    .array(generatedCardSchema)
    .min(1)
    .max(20),
});

export type AIPreviewInput = z.infer<typeof aiPreviewSchema>;
export type AIGeneratedCardsSaveInput = z.infer<typeof aiGeneratedCardsSaveSchema>;
export type AIGeneratedCardsResponse = z.infer<typeof aiGeneratedCardsResponseSchema>;

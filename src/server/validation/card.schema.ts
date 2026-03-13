import { z } from "zod";

export const cardSchema = z.object({
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
    .optional(),
  imageUrl: z
    .string()
    .trim()
    .url("imageUrl должен быть валидным URL.")
    .max(1000, "URL изображения должен быть не длиннее 1000 символов.")
    .optional(),
});

export type CardInput = z.infer<typeof cardSchema>;

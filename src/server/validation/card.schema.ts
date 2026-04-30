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
  languageCode: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const normalized = value.trim();
      return normalized.length === 0 ? undefined : normalized;
    },
    z
      .string()
      .max(35, "languageCode должен быть не длиннее 35 символов.")
      .regex(
        /^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{1,8})*$/,
        "languageCode должен быть в формате BCP-47, например en-US.",
      )
      .optional(),
  ),
  example: z
    .string()
    .trim()
    .max(1000, "Пример должен быть не длиннее 1000 символов.")
    .optional(),
  imageUrl: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const normalized = value.trim();
      return normalized.length === 0 ? undefined : normalized;
    },
    z
      .string()
      .url("imageUrl должен быть валидным URL.")
      .max(1000, "URL изображения должен быть не длиннее 1000 символов.")
      .optional(),
  ),
});

export const cardsImportSchema = z.object({
  cards: z
    .array(cardSchema)
    .min(1, "Массив cards должен содержать хотя бы одну карточку.")
    .max(200, "За один импорт можно добавить не более 200 карточек."),
});

export type CardInput = z.infer<typeof cardSchema>;
export type CardsImportInput = z.infer<typeof cardsImportSchema>;

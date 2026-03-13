import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Введите корректный email."),
  password: z
    .string()
    .min(6, "Пароль должен быть не короче 6 символов.")
    .max(72, "Пароль должен быть не длиннее 72 символов."),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .max(100, "Имя должно быть не длиннее 100 символов.")
    .optional(),
});

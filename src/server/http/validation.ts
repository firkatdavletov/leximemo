import type { ZodError } from "zod";

export function getFirstValidationError(error: ZodError): string {
  return error.issues[0]?.message ?? "Некорректные входные данные.";
}

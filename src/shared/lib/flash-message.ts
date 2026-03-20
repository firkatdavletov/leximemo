export const successMessages = {
  "deck-created": "Колода успешно создана.",
  "deck-updated": "Изменения в колоде сохранены.",
  "deck-deleted": "Колода удалена.",
  "card-created": "Карточка добавлена в колоду.",
  "card-updated": "Карточка обновлена.",
  "card-deleted": "Карточка удалена.",
  "ai-saved": "Сгенерированные карточки сохранены в колоду.",
} as const;

export function getSuccessMessage(key: string | null | undefined): string | null {
  if (!key) {
    return null;
  }

  return successMessages[key as keyof typeof successMessages] ?? null;
}

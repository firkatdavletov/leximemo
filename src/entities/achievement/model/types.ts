export const achievementCodes = [
  "FIRST_REVIEW",
  "FIRST_DECK_COMPLETED",
  "STREAK_3",
  "STREAK_7",
  "REVIEWS_10",
  "REVIEWS_50",
] as const;

export type AchievementCode = (typeof achievementCodes)[number];

export type AchievementDefinition = {
  code: AchievementCode;
  title: string;
  description: string;
};

export type AchievementUnlockDto = {
  code: AchievementCode;
  title: string;
  description: string;
  unlockedAt: string;
};

export type AchievementStatusDto = {
  code: AchievementCode;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
};

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    code: "FIRST_REVIEW",
    title: "Первое повторение",
    description: "Сделано первое повторение карточки.",
  },
  {
    code: "FIRST_DECK_COMPLETED",
    title: "Первая завершенная колода",
    description: "Хотя бы один раз повторены все карточки в колоде.",
  },
  {
    code: "STREAK_3",
    title: "Серия 3 дня",
    description: "Повторения 3 дня подряд.",
  },
  {
    code: "STREAK_7",
    title: "Серия 7 дней",
    description: "Повторения 7 дней подряд.",
  },
  {
    code: "REVIEWS_10",
    title: "10 повторений",
    description: "Суммарно выполнено 10 повторений.",
  },
  {
    code: "REVIEWS_50",
    title: "50 повторений",
    description: "Суммарно выполнено 50 повторений.",
  },
];

export const achievementDefinitionsByCode = new Map(
  ACHIEVEMENT_DEFINITIONS.map((definition) => [definition.code, definition]),
);

import type { AchievementUnlockDto } from "@/entities/achievement/model/types";

export type ReviewGrade = "hard" | "normal" | "easy";

export type StudyCardDto = {
  id: string;
  word: string;
  translation: string;
  example: string | null;
  imageUrl: string | null;
  repetitionsCount: number;
  intervalDays: number;
  nextReviewAt: string | null;
};

export type StudySessionDto = {
  deckId: string;
  cards: StudyCardDto[];
};

export type ReviewResultDto = {
  cardId: string;
  grade: ReviewGrade;
  previousIntervalDays: number;
  newIntervalDays: number;
  nextReviewAt: string;
  currentStreak: number;
  newlyUnlockedAchievements: AchievementUnlockDto[];
};

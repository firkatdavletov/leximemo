import type { ReviewGrade } from "@/entities/review/model/types";

export type CardDto = {
  id: string;
  deckId: string;
  word: string;
  translation: string;
  languageCode: string | null;
  example: string | null;
  imageUrl: string | null;
  isDue: boolean;
  repetitionsCount: number;
  intervalDays: number;
  easeFactor: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  lastGrade: ReviewGrade | null;
  mistakesCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CardListDto = {
  cards: CardDto[];
};

export type CardItemDto = {
  card: CardDto;
};

export type CreateCardRequestDto = {
  word: string;
  translation: string;
  languageCode?: string;
  example?: string;
  imageUrl?: string;
};

export type UpdateCardRequestDto = CreateCardRequestDto;

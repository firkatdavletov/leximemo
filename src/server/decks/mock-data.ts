import type { DeckDto } from "@/entities/deck/model/types";

export const MOCK_DECKS: DeckDto[] = [
  {
    id: "mock-deck-basic-english",
    title: "Basic English A1",
    description: "Базовые слова и фразы для старта.",
    cardCount: 24,
    updatedAt: "2026-03-01T12:00:00.000Z",
  },
  {
    id: "mock-deck-travel-spanish",
    title: "Travel Spanish",
    description: "Набор для путешествий и бытовых ситуаций.",
    cardCount: 18,
    updatedAt: "2026-03-05T09:15:00.000Z",
  },
];

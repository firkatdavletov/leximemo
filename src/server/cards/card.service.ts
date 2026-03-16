import type {
  CardDto,
  CreateCardRequestDto,
  UpdateCardRequestDto,
} from "@/entities/card/model/types";
import type { ReviewGrade } from "@/entities/review/model/types";
import { prisma } from "@/lib/prisma";

type CardRecord = {
  id: string;
  deckId: string;
  word: string;
  translation: string;
  example: string | null;
  imageUrl: string | null;
  repetitionsCount: number;
  intervalDays: number;
  easeFactor: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  lastGrade: "HARD" | "NORMAL" | "EASY" | null;
  mistakesCount: number;
  createdAt: Date;
  updatedAt: Date;
};

function mapPrismaGradeToDto(grade: CardRecord["lastGrade"]): ReviewGrade | null {
  if (!grade) {
    return null;
  }

  if (grade === "HARD") {
    return "hard";
  }

  if (grade === "EASY") {
    return "easy";
  }

  return "normal";
}

function mapCardToDto(card: CardRecord): CardDto {
  return {
    id: card.id,
    deckId: card.deckId,
    word: card.word,
    translation: card.translation,
    example: card.example,
    imageUrl: card.imageUrl,
    repetitionsCount: card.repetitionsCount,
    intervalDays: card.intervalDays,
    easeFactor: card.easeFactor,
    lastReviewedAt: card.lastReviewedAt?.toISOString() ?? null,
    nextReviewAt: card.nextReviewAt?.toISOString() ?? null,
    lastGrade: mapPrismaGradeToDto(card.lastGrade),
    mistakesCount: card.mistakesCount,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

export async function listCardsByDeck(
  userId: string,
  deckId: string,
): Promise<CardDto[] | null> {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!deck) {
    return null;
  }

  const cards = await prisma.card.findMany({
    where: {
      deckId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return cards.map(mapCardToDto);
}

export async function createCardInDeck(
  userId: string,
  deckId: string,
  input: CreateCardRequestDto,
): Promise<CardDto | null> {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!deck) {
    return null;
  }

  const card = await prisma.card.create({
    data: {
      deckId,
      word: input.word.trim(),
      translation: input.translation.trim(),
      example: input.example?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
    },
  });

  return mapCardToDto(card);
}

export async function createManyCardsInDeck(
  userId: string,
  deckId: string,
  cards: Array<{
    word: string;
    translation: string;
    example?: string | null;
  }>,
): Promise<number | null> {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!deck) {
    return null;
  }

  if (cards.length === 0) {
    return 0;
  }

  const result = await prisma.card.createMany({
    data: cards.map((card) => ({
      deckId,
      word: card.word.trim(),
      translation: card.translation.trim(),
      example: card.example?.trim() || null,
      imageUrl: null,
    })),
  });

  return result.count;
}

export async function getUserCardById(
  userId: string,
  deckId: string,
  cardId: string,
): Promise<CardDto | null> {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      deckId,
      deck: {
        userId,
      },
    },
  });

  if (!card) {
    return null;
  }

  return mapCardToDto(card);
}

export async function updateUserCard(
  userId: string,
  deckId: string,
  cardId: string,
  input: UpdateCardRequestDto,
): Promise<CardDto | null> {
  const updated = await prisma.card.updateMany({
    where: {
      id: cardId,
      deckId,
      deck: {
        userId,
      },
    },
    data: {
      word: input.word.trim(),
      translation: input.translation.trim(),
      example: input.example?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
    },
  });

  if (updated.count === 0) {
    return null;
  }

  return getUserCardById(userId, deckId, cardId);
}

export async function deleteUserCard(
  userId: string,
  deckId: string,
  cardId: string,
): Promise<boolean> {
  const deleted = await prisma.card.deleteMany({
    where: {
      id: cardId,
      deckId,
      deck: {
        userId,
      },
    },
  });

  return deleted.count > 0;
}

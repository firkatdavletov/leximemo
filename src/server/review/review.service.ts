import type { ReviewGrade as PrismaReviewGrade } from "@prisma/client";

import type {
  ReviewGrade,
  ReviewResultDto,
  StudyCardDto,
} from "@/entities/review/model/types";
import { calculateNextReview } from "@/features/review/model/spaced-repetition";
import { prisma } from "@/lib/prisma";
import { registerReviewProgress } from "@/server/progress/progress.service";

function mapPrismaGradeToDto(grade: PrismaReviewGrade): ReviewGrade {
  if (grade === "HARD") {
    return "hard";
  }

  if (grade === "EASY") {
    return "easy";
  }

  return "normal";
}

function mapDtoGradeToPrisma(grade: ReviewGrade): PrismaReviewGrade {
  if (grade === "hard") {
    return "HARD";
  }

  if (grade === "easy") {
    return "EASY";
  }

  return "NORMAL";
}

export async function listDueCardsForDeck(
  userId: string,
  deckId: string,
): Promise<StudyCardDto[] | null> {
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

  const now = new Date();

  const cards = await prisma.card.findMany({
    where: {
      deckId,
      OR: [
        {
          nextReviewAt: null,
        },
        {
          nextReviewAt: {
            lte: now,
          },
        },
      ],
    },
    orderBy: [
      {
        nextReviewAt: {
          sort: "asc",
          nulls: "first",
        },
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
      word: true,
      translation: true,
      languageCode: true,
      example: true,
      imageUrl: true,
      repetitionsCount: true,
      intervalDays: true,
      nextReviewAt: true,
    },
  });

  return cards.map((card) => ({
    id: card.id,
    word: card.word,
    translation: card.translation,
    languageCode: card.languageCode,
    example: card.example,
    imageUrl: card.imageUrl,
    repetitionsCount: card.repetitionsCount,
    intervalDays: card.intervalDays,
    nextReviewAt: card.nextReviewAt?.toISOString() ?? null,
  }));
}

export async function submitReviewForCard(
  userId: string,
  deckId: string,
  cardId: string,
  grade: ReviewGrade,
): Promise<ReviewResultDto | null> {
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const card = await tx.card.findFirst({
      where: {
        id: cardId,
        deckId,
        deck: {
          userId,
        },
      },
      select: {
        id: true,
        repetitionsCount: true,
        intervalDays: true,
        easeFactor: true,
        mistakesCount: true,
      },
    });

    if (!card) {
      return null;
    }

    const nextState = calculateNextReview(
      {
        repetitionsCount: card.repetitionsCount,
        intervalDays: card.intervalDays,
        easeFactor: card.easeFactor,
        mistakesCount: card.mistakesCount,
      },
      grade,
      now,
    );

    const prismaGrade = mapDtoGradeToPrisma(grade);

    await tx.card.update({
      where: {
        id: card.id,
      },
      data: {
        repetitionsCount: nextState.repetitionsCount,
        intervalDays: nextState.intervalDays,
        easeFactor: nextState.easeFactor,
        lastReviewedAt: now,
        nextReviewAt: nextState.nextReviewAt,
        lastGrade: prismaGrade,
        mistakesCount: nextState.mistakesCount,
      },
    });

    const historyEntry = await tx.reviewHistory.create({
      data: {
        userId,
        deckId,
        cardId: card.id,
        grade: prismaGrade,
        reviewedAt: now,
        previousIntervalDays: card.intervalDays > 0 ? card.intervalDays : null,
        newIntervalDays: nextState.intervalDays,
      },
      select: {
        cardId: true,
        grade: true,
        previousIntervalDays: true,
        newIntervalDays: true,
      },
    });

    const progress = await registerReviewProgress(tx, {
      userId,
      deckId,
      reviewedAt: now,
    });

    return {
      cardId: historyEntry.cardId,
      grade: mapPrismaGradeToDto(historyEntry.grade),
      previousIntervalDays: historyEntry.previousIntervalDays ?? 0,
      newIntervalDays: historyEntry.newIntervalDays,
      nextReviewAt: nextState.nextReviewAt.toISOString(),
      currentStreak: progress.currentStreak,
      newlyUnlockedAchievements: progress.newlyUnlockedAchievements,
    } satisfies ReviewResultDto;
  });

  return result;
}

import type { Prisma } from "@prisma/client";

import type {
  AchievementCode,
  AchievementUnlockDto,
} from "@/entities/achievement/model/types";
import {
  ACHIEVEMENT_DEFINITIONS,
  achievementDefinitionsByCode,
} from "@/entities/achievement/model/types";
import type {
  ReviewProgressUpdateDto,
  UserProgressDto,
  UserStatsDto,
} from "@/entities/progress/model/types";
import { prisma } from "@/lib/prisma";

type ProgressTransaction = Prisma.TransactionClient;

const MS_IN_DAY = 24 * 60 * 60 * 1000;

function getUtcDateStart(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_IN_DAY);
}

function isSameUtcDate(left: Date, right: Date): boolean {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

async function ensureUserStats(tx: ProgressTransaction, userId: string) {
  const existing = await tx.userStats.findUnique({
    where: {
      userId,
    },
  });

  if (existing) {
    return existing;
  }

  return tx.userStats.create({
    data: {
      userId,
    },
  });
}

function mapStatsToDto(stats: {
  currentStreak: number;
  longestStreak: number;
  totalReviewedCards: number;
  totalStudySessions: number;
  lastStudyDate: Date | null;
}): UserStatsDto {
  return {
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    totalReviewedCards: stats.totalReviewedCards,
    totalStudySessions: stats.totalStudySessions,
    lastStudyDate: stats.lastStudyDate?.toISOString() ?? null,
  };
}

function computeEligibleAchievements(input: {
  totalReviewedCards: number;
  currentStreak: number;
  deckCompleted: boolean;
}): AchievementCode[] {
  const codes: AchievementCode[] = [];

  if (input.totalReviewedCards >= 1) {
    codes.push("FIRST_REVIEW");
  }

  if (input.deckCompleted) {
    codes.push("FIRST_DECK_COMPLETED");
  }

  if (input.currentStreak >= 3) {
    codes.push("STREAK_3");
  }

  if (input.currentStreak >= 7) {
    codes.push("STREAK_7");
  }

  if (input.totalReviewedCards >= 10) {
    codes.push("REVIEWS_10");
  }

  if (input.totalReviewedCards >= 50) {
    codes.push("REVIEWS_50");
  }

  return codes;
}

function mapUnlockedAchievements(codes: AchievementCode[], unlockedAt: Date): AchievementUnlockDto[] {
  return codes
    .map((code) => {
      const definition = achievementDefinitionsByCode.get(code);

      if (!definition) {
        return null;
      }

      return {
        code,
        title: definition.title,
        description: definition.description,
        unlockedAt: unlockedAt.toISOString(),
      } satisfies AchievementUnlockDto;
    })
    .filter((value): value is AchievementUnlockDto => Boolean(value));
}

export async function registerReviewProgress(
  tx: ProgressTransaction,
  input: {
    userId: string;
    deckId: string;
    reviewedAt: Date;
  },
): Promise<ReviewProgressUpdateDto> {
  const activityDate = getUtcDateStart(input.reviewedAt);
  const previousDay = addDays(activityDate, -1);

  const stats = await ensureUserStats(tx, input.userId);
  const alreadyStudiedToday = stats.lastStudyDate
    ? isSameUtcDate(stats.lastStudyDate, activityDate)
    : false;

  let currentStreak = stats.currentStreak;

  if (!alreadyStudiedToday) {
    const studiedYesterday = stats.lastStudyDate
      ? isSameUtcDate(stats.lastStudyDate, previousDay)
      : false;

    if (studiedYesterday) {
      currentStreak = Math.max(1, stats.currentStreak + 1);
    } else {
      currentStreak = 1;
    }
  }

  const longestStreak = Math.max(stats.longestStreak, currentStreak);
  const totalReviewedCards = stats.totalReviewedCards + 1;
  const totalStudySessions = stats.totalStudySessions + (alreadyStudiedToday ? 0 : 1);

  await tx.userStats.update({
    where: {
      userId: input.userId,
    },
    data: {
      currentStreak,
      longestStreak,
      totalReviewedCards,
      totalStudySessions,
      lastStudyDate: activityDate,
    },
  });

  await tx.dailyStudyActivity.upsert({
    where: {
      userId_activityDate: {
        userId: input.userId,
        activityDate,
      },
    },
    create: {
      userId: input.userId,
      activityDate,
      reviewsCount: 1,
      sessionsCount: 1,
    },
    update: {
      reviewsCount: {
        increment: 1,
      },
    },
  });

  const notReviewedCardsCount = await tx.card.count({
    where: {
      deckId: input.deckId,
      repetitionsCount: 0,
    },
  });

  const eligibleCodes = computeEligibleAchievements({
    totalReviewedCards,
    currentStreak,
    deckCompleted: notReviewedCardsCount === 0,
  });

  if (eligibleCodes.length === 0) {
    return {
      currentStreak,
      newlyUnlockedAchievements: [],
    };
  }

  const existing = await tx.achievement.findMany({
    where: {
      userId: input.userId,
      code: {
        in: eligibleCodes,
      },
    },
    select: {
      code: true,
    },
  });

  const existingCodes = new Set(existing.map((item) => item.code));
  const codesToCreate = eligibleCodes.filter((code) => !existingCodes.has(code));

  if (codesToCreate.length === 0) {
    return {
      currentStreak,
      newlyUnlockedAchievements: [],
    };
  }

  const now = new Date();

  await tx.achievement.createMany({
    data: codesToCreate
      .map((code) => {
        const definition = achievementDefinitionsByCode.get(code);

        if (!definition) {
          return null;
        }

        return {
          userId: input.userId,
          code,
          title: definition.title,
          unlockedAt: now,
        };
      })
      .filter((value): value is { userId: string; code: AchievementCode; title: string; unlockedAt: Date } => Boolean(value)),
    skipDuplicates: true,
  });

  return {
    currentStreak,
    newlyUnlockedAchievements: mapUnlockedAchievements(codesToCreate, now),
  };
}

export async function getUserProgress(userId: string): Promise<UserProgressDto> {
  const [stats, unlockedAchievements] = await Promise.all([
    prisma.userStats.findUnique({
      where: {
        userId,
      },
      select: {
        currentStreak: true,
        longestStreak: true,
        totalReviewedCards: true,
        totalStudySessions: true,
        lastStudyDate: true,
      },
    }),
    prisma.achievement.findMany({
      where: {
        userId,
      },
      select: {
        code: true,
        unlockedAt: true,
      },
    }),
  ]);

  const unlockedAtByCode = new Map<AchievementCode, Date>();

  for (const unlock of unlockedAchievements) {
    if (!achievementDefinitionsByCode.has(unlock.code as AchievementCode)) {
      continue;
    }

    unlockedAtByCode.set(unlock.code as AchievementCode, unlock.unlockedAt);
  }

  return {
    stats: mapStatsToDto(
      stats ?? {
        currentStreak: 0,
        longestStreak: 0,
        totalReviewedCards: 0,
        totalStudySessions: 0,
        lastStudyDate: null,
      },
    ),
    achievements: ACHIEVEMENT_DEFINITIONS.map((definition) => {
      const unlockedAt = unlockedAtByCode.get(definition.code);

      return {
        code: definition.code,
        title: definition.title,
        description: definition.description,
        unlocked: Boolean(unlockedAt),
        unlockedAt: unlockedAt?.toISOString() ?? null,
      };
    }),
  };
}

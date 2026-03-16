import type {
  AchievementStatusDto,
  AchievementUnlockDto,
} from "@/entities/achievement/model/types";

export type UserStatsDto = {
  currentStreak: number;
  longestStreak: number;
  totalReviewedCards: number;
  totalStudySessions: number;
  lastStudyDate: string | null;
};

export type UserProgressDto = {
  stats: UserStatsDto;
  achievements: AchievementStatusDto[];
};

export type ReviewProgressUpdateDto = {
  currentStreak: number;
  newlyUnlockedAchievements: AchievementUnlockDto[];
};

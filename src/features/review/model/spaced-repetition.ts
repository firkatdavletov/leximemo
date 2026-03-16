import type { ReviewGrade } from "@/entities/review/model/types";

type SchedulingState = {
  repetitionsCount: number;
  intervalDays: number;
  easeFactor: number;
  mistakesCount: number;
};

type ScheduleResult = {
  repetitionsCount: number;
  intervalDays: number;
  easeFactor: number;
  mistakesCount: number;
  nextReviewAt: Date;
};

const INITIAL_INTERVAL_BY_GRADE: Record<ReviewGrade, number> = {
  hard: 1,
  normal: 2,
  easy: 4,
};

const GROWTH_MULTIPLIER_BY_GRADE: Record<ReviewGrade, number> = {
  hard: 0.7,
  normal: 1.8,
  easy: 2.5,
};

const EASE_DELTA_BY_GRADE: Record<ReviewGrade, number> = {
  hard: -0.2,
  normal: 0.05,
  easy: 0.15,
};

const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 3.0;

function clampEaseFactor(value: number): number {
  if (value < MIN_EASE_FACTOR) {
    return MIN_EASE_FACTOR;
  }

  if (value > MAX_EASE_FACTOR) {
    return MAX_EASE_FACTOR;
  }

  return Number(value.toFixed(2));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function resolveIntervalDays(
  currentIntervalDays: number,
  repetitionsCount: number,
  grade: ReviewGrade,
): number {
  if (repetitionsCount <= 0) {
    return INITIAL_INTERVAL_BY_GRADE[grade];
  }

  const safeCurrentInterval = Math.max(1, currentIntervalDays);
  const multiplier = GROWTH_MULTIPLIER_BY_GRADE[grade];

  if (grade === "hard") {
    return Math.max(1, Math.floor(safeCurrentInterval * multiplier));
  }

  if (grade === "easy") {
    return Math.max(2, Math.ceil(safeCurrentInterval * multiplier));
  }

  return Math.max(1, Math.ceil(safeCurrentInterval * multiplier));
}

export function calculateNextReview(
  state: SchedulingState,
  grade: ReviewGrade,
  now: Date = new Date(),
): ScheduleResult {
  const newIntervalDays = resolveIntervalDays(
    state.intervalDays,
    state.repetitionsCount,
    grade,
  );

  const currentEase = Number.isFinite(state.easeFactor) && state.easeFactor > 0
    ? state.easeFactor
    : 2.5;

  return {
    repetitionsCount: state.repetitionsCount + 1,
    intervalDays: newIntervalDays,
    easeFactor: clampEaseFactor(currentEase + EASE_DELTA_BY_GRADE[grade]),
    mistakesCount: grade === "hard" ? state.mistakesCount + 1 : state.mistakesCount,
    nextReviewAt: addDays(now, newIntervalDays),
  };
}

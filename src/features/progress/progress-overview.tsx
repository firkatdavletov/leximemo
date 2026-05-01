import Image from "next/image";

import type { AchievementCode } from "@/entities/achievement/model/types";
import type { UserProgressDto } from "@/entities/progress/model/types";

type ProgressOverviewProps = {
  progress: UserProgressDto;
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
});

const statsIconPaths = {
  currentStreak: "/icons/ic_current_strike.png",
  longestStreak: "/icons/ic_best_strike.png",
  totalReviewedCards: "/icons/ic_total_repeats.png",
  totalStudySessions: "/icons/ic_education_days.png",
} as const;

const achievementIconPaths: Record<AchievementCode, string> = {
  FIRST_REVIEW: "/icons/ic_first_repeat.png",
  FIRST_DECK_COMPLETED: "/icons/ic_first_completed_card.png",
  STREAK_3: "/icons/ic_three_days_strike.png",
  STREAK_7: "/icons/ic_seven_days_strike.png",
  REVIEWS_10: "/icons/ic_ten_repeats.png",
  REVIEWS_50: "/icons/ic_fifty_repeats.png",
};

export function ProgressOverview({ progress }: ProgressOverviewProps) {
  const unlockedCount = progress.achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <section className="grid gap-4 xl:grid-cols-[2fr_3fr]">
      <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Прогресс обучения</h2>

        <ul className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <li className="min-h-36 rounded-xl border border-border bg-white p-4">
            <Image
              src={statsIconPaths.currentStreak}
              alt=""
              width={32}
              height={32}
              className="mb-3"
            />
            <p className="text-xs uppercase tracking-wide text-muted">Текущая серия</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {progress.stats.currentStreak}
            </p>
          </li>

          <li className="min-h-36 rounded-xl border border-border bg-white p-4">
            <Image
              src={statsIconPaths.longestStreak}
              alt=""
              width={32}
              height={32}
              className="mb-3"
            />
            <p className="text-xs uppercase tracking-wide text-muted">Лучшая серия</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {progress.stats.longestStreak}
            </p>
          </li>

          <li className="min-h-36 rounded-xl border border-border bg-white p-4">
            <Image
              src={statsIconPaths.totalReviewedCards}
              alt=""
              width={32}
              height={32}
              className="mb-3"
            />
            <p className="text-xs uppercase tracking-wide text-muted">Всего повторений</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {progress.stats.totalReviewedCards}
            </p>
          </li>

          <li className="min-h-36 rounded-xl border border-border bg-white p-4">
            <Image
              src={statsIconPaths.totalStudySessions}
              alt=""
              width={32}
              height={32}
              className="mb-3"
            />
            <p className="text-xs uppercase tracking-wide text-muted">Учебных дней</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {progress.stats.totalStudySessions}
            </p>
          </li>
        </ul>

        <p className="mt-4 text-xs text-muted">
          {progress.stats.lastStudyDate
            ? ` • Последняя активность: ${dateFormatter.format(new Date(progress.stats.lastStudyDate))}`
            : "Пока еще нет зафиксированной учебной активности."}
        </p>
      </article>

      <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">Достижения</h2>
          <p className="text-sm text-muted">
            Открыто: {unlockedCount} / {progress.achievements.length}
          </p>
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {progress.achievements.map((achievement) => (
            <li
              key={achievement.code}
              className={`rounded-xl border p-3 ${
                achievement.unlocked
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-border bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <Image
                  src={achievementIconPaths[achievement.code]}
                  alt=""
                  width={36}
                  height={36}
                  className={
                    achievement.unlocked
                      ? "size-9 shrink-0 object-contain"
                      : "size-9 shrink-0 object-contain opacity-40 grayscale"
                  }
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{achievement.title}</p>
                  <p className="mt-1 text-xs text-muted">{achievement.description}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted">
                {achievement.unlocked && achievement.unlockedAt
                  ? `Открыто: ${dateFormatter.format(new Date(achievement.unlockedAt))}`
                  : "Еще не открыто"}
              </p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

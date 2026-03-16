import type { UserProgressDto } from "@/entities/progress/model/types";

type ProgressOverviewProps = {
  progress: UserProgressDto;
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
});

function getDayLabel(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "день";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "дня";
  }

  return "дней";
}

export function ProgressOverview({ progress }: ProgressOverviewProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[2fr_3fr]">
      <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Статистика</h2>

        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          <li className="rounded-xl border border-border bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-muted">Current streak</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {progress.stats.currentStreak}
            </p>
            <p className="mt-1 text-xs text-muted">{getDayLabel(progress.stats.currentStreak)}</p>
          </li>

          <li className="rounded-xl border border-border bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-muted">Longest streak</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {progress.stats.longestStreak}
            </p>
            <p className="mt-1 text-xs text-muted">{getDayLabel(progress.stats.longestStreak)}</p>
          </li>

          <li className="rounded-xl border border-border bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-muted">Total reviewed</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {progress.stats.totalReviewedCards}
            </p>
            <p className="mt-1 text-xs text-muted">карточек</p>
          </li>
        </ul>

        <p className="mt-4 text-xs text-muted">
          Всего учебных дней: {progress.stats.totalStudySessions}
          {progress.stats.lastStudyDate
            ? ` • Последняя активность: ${dateFormatter.format(new Date(progress.stats.lastStudyDate))}`
            : ""}
        </p>
      </article>

      <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Достижения</h2>

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
              <p className="text-sm font-medium text-foreground">{achievement.title}</p>
              <p className="mt-1 text-xs text-muted">{achievement.description}</p>
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

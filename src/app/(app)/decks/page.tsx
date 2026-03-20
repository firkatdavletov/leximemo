import Link from "next/link";

import { ProgressOverview } from "@/features/progress/progress-overview";
import { getCurrentUserId } from "@/server/auth/session";
import { listUserDecks } from "@/server/decks/deck.service";
import { getUserProgress } from "@/server/progress/progress.service";
import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageTitle } from "@/shared/ui/page-title";
import { QueryStatusMessage } from "@/shared/ui/query-status-message";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
});

export default async function DecksPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const [decks, progress] = await Promise.all([
    listUserDecks(userId),
    getUserProgress(userId),
  ]);

  return (
    <Container className="space-y-6">
      <PageTitle
        title="Мои колоды"
        description="Управляйте колодами, запускайте обучение и отслеживайте прогресс в рамках своего аккаунта."
        action={
          <Link href="/decks/new" className={buttonClassName()}>
            Создать колоду
          </Link>
        }
      />

      <QueryStatusMessage />

      <ProgressOverview progress={progress} />

      {decks.length === 0 ? (
        <EmptyState
          title="Пока нет колод"
          description="Создайте первую колоду и добавьте в нее карточки."
          action={<Link href="/decks/new" className={buttonClassName()}>Создать колоду</Link>}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {decks.map((deck) => (
            <li key={deck.id}>
              <Link
                href={`/decks/${deck.id}`}
                aria-label={`Открыть колоду ${deck.title}`}
                className="block rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-accent/40"
              >
                <h2 className="text-lg font-semibold text-foreground">{deck.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {deck.description ?? "Описание пока не заполнено."}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted">
                  <span>{deck.cardCount} карточек</span>
                  <span>Обновлено: {dateFormatter.format(new Date(deck.updatedAt))}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

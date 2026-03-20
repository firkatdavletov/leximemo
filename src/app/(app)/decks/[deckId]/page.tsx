import Link from "next/link";
import { notFound } from "next/navigation";

import { AICardGenerator } from "@/features/ai/ai-card-generator";
import { CardDeleteButton } from "@/features/cards/card-delete-button";
import { DeckDeleteButton } from "@/features/decks/deck-delete-button";
import { getCurrentUserId } from "@/server/auth/session";
import { listCardsByDeck } from "@/server/cards/card.service";
import { getUserDeckById } from "@/server/decks/deck.service";
import { BackLink } from "@/shared/ui/back-link";
import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageTitle } from "@/shared/ui/page-title";
import { QueryStatusMessage } from "@/shared/ui/query-status-message";
import { SpeakButton } from "@/shared/ui/speak-button";

type DeckDetailsPageProps = {
  params: Promise<{
    deckId: string;
  }>;
};

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

const gradeLabels = {
  hard: "Сложно",
  normal: "Нормально",
  easy: "Легко",
} as const;

export default async function DeckDetailsPage({ params }: DeckDetailsPageProps) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const { deckId } = await params;
  const deck = await getUserDeckById(userId, deckId);

  if (!deck) {
    notFound();
  }

  const cards = await listCardsByDeck(userId, deck.id);

  if (!cards) {
    notFound();
  }

  const dueCardsCount = cards.filter((card) => card.isDue).length;
  const newCardsCount = cards.filter((card) => card.repetitionsCount === 0).length;
  const reviewedCardsCount = cards.length - newCardsCount;

  return (
    <Container className="space-y-6">
      <BackLink href="/decks" label="К списку колод" />

      <PageTitle
        title={deck.title}
        description={deck.description ?? "Описание пока не добавлено."}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/decks/${deck.id}/study`} className={buttonClassName()}>
              Начать обучение
            </Link>
            <Link
              href={`/decks/${deck.id}/cards/new`}
              className={buttonClassName({ variant: "secondary" })}
            >
              Новая карточка
            </Link>
          </div>
        }
      />

      <QueryStatusMessage />

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted">Карточек всего</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{cards.length}</p>
        </article>
        <article className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted">Готово к повторению</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{dueCardsCount}</p>
        </article>
        <article className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted">Уже изучено</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{reviewedCardsCount}</p>
          <p className="mt-1 text-xs text-muted">Новых карточек: {newCardsCount}</p>
        </article>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/decks/${deck.id}/edit`}
            className={buttonClassName({ variant: "secondary" })}
          >
            Редактировать колоду
          </Link>
          <DeckDeleteButton deckId={deck.id} />
        </div>
        <p className="text-xs text-muted">
          Обновлено: {dateTimeFormatter.format(new Date(deck.updatedAt))}
        </p>
      </section>

      <AICardGenerator deckId={deck.id} />

      {cards.length === 0 ? (
        <EmptyState
          title="В колоде пока нет карточек"
          description="Добавьте первую карточку, чтобы начать обучение."
          action={
            <Link href={`/decks/${deck.id}/cards/new`} className={buttonClassName()}>
              Добавить карточку
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {cards.map((card) => (
            <li key={card.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-foreground">{card.word}</p>
                    <SpeakButton text={card.word} lang={card.languageCode ?? "en-US"} />
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        card.isDue
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {card.isDue ? "Можно повторять" : "Запланирована"}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{card.translation}</p>
                  {card.example ? (
                    <p className="text-sm text-muted">Пример: {card.example}</p>
                  ) : null}
                  <p className="text-xs text-muted">
                    Язык озвучки: {card.languageCode ?? "en-US"}
                  </p>
                  <p className="text-xs text-muted">
                    Интервал: {card.intervalDays || 0} дн., повторений: {card.repetitionsCount}
                  </p>
                  {card.lastGrade ? (
                    <p className="text-xs text-muted">
                      Последняя оценка: {gradeLabels[card.lastGrade]}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted">
                    Следующее повторение:{" "}
                    {card.nextReviewAt
                      ? dateTimeFormatter.format(new Date(card.nextReviewAt))
                      : "еще не назначено"}
                  </p>
                  {card.imageUrl ? (
                    <a
                      href={card.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-accent underline"
                    >
                      Открыть изображение
                    </a>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/decks/${deck.id}/cards/${card.id}/edit`}
                    className={buttonClassName({ variant: "secondary", size: "sm" })}
                  >
                    Редактировать
                  </Link>
                  <CardDeleteButton deckId={deck.id} cardId={card.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

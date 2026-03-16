import Link from "next/link";
import { notFound } from "next/navigation";

import { CardDeleteButton } from "@/features/cards/card-delete-button";
import { DeckDeleteButton } from "@/features/decks/deck-delete-button";
import { getCurrentUserId } from "@/server/auth/session";
import { listCardsByDeck } from "@/server/cards/card.service";
import { getUserDeckById } from "@/server/decks/deck.service";
import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageTitle } from "@/shared/ui/page-title";

type DeckDetailsPageProps = {
  params: Promise<{
    deckId: string;
  }>;
};

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

  return (
    <Container className="space-y-6">
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
              Добавить карточку
            </Link>
          </div>
        }
      />

      <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <Link href={`/decks/${deck.id}/edit`} className={buttonClassName({ variant: "secondary" })}>
          Редактировать колоду
        </Link>
        <DeckDeleteButton deckId={deck.id} />
      </section>

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
                  <p className="text-lg font-semibold text-foreground">{card.word}</p>
                  <p className="text-sm text-muted">{card.translation}</p>
                  {card.example ? <p className="text-sm text-muted">Пример: {card.example}</p> : null}
                  <p className="text-xs text-muted">
                    Интервал: {card.intervalDays || 0} дн., повторений: {card.repetitionsCount}
                  </p>
                  <p className="text-xs text-muted">
                    Следующее повторение:{" "}
                    {card.nextReviewAt
                      ? new Date(card.nextReviewAt).toLocaleString("ru-RU")
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

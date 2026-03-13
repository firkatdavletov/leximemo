import Link from "next/link";

import { getDecks } from "@/server/decks/deck.service";
import { ROUTES } from "@/shared/config/app";
import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageTitle } from "@/shared/ui/page-title";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
});

export default async function DecksPage() {
  const decks = await getDecks();

  return (
    <Container className="space-y-6">
      <PageTitle
        title="Колоды"
        description="Текущий список можно получать из mock-данных или из БД после настройки DATABASE_URL."
      />

      {decks.length === 0 ? (
        <EmptyState
          title="Пока нет колод"
          description="Создайте первую колоду через POST /api/decks или добавьте сид-данные в Prisma."
          action={
            <Link href={ROUTES.home} className={buttonClassName({ variant: "secondary" })}>
              Вернуться на главную
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {decks.map((deck) => (
            <li key={deck.id}>
              <Link
                href={`${ROUTES.decks}/${deck.id}`}
                className="block rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-accent/40"
              >
                <h2 className="text-lg font-semibold text-foreground">{deck.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {deck.description ?? "Описание пока не добавлено."}
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

      <section className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted shadow-sm">
        <p className="font-medium text-foreground">Быстрый тест API:</p>
        <code className="mt-2 block rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
          {`curl -X POST http://localhost:3000/api/decks -H "Content-Type: application/json" -d '{"title":"New Deck"}'`}
        </code>
      </section>
    </Container>
  );
}

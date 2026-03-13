import Link from "next/link";

import { getDeckById } from "@/server/decks/deck.service";
import { ROUTES } from "@/shared/config/app";
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
  const { deckId } = await params;
  const deck = await getDeckById(deckId);

  if (!deck) {
    return (
      <Container>
        <EmptyState
          title="Колодa не найдена"
          description="Проверьте ссылку или вернитесь к списку колод."
          action={
            <Link href={ROUTES.decks} className={buttonClassName({ variant: "secondary" })}>
              К списку колод
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="space-y-6">
      <PageTitle
        title={deck.title}
        description={deck.description ?? "Описание для этой колоды пока не заполнено."}
      />

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Текущее состояние</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>Deck ID: {deck.id}</li>
          <li>Карточек в колоде: {deck.cardCount}</li>
          <li>Обновлено: {new Date(deck.updatedAt).toLocaleString("ru-RU")}</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-surface p-6">
        <h2 className="text-base font-semibold text-foreground">Следующий шаг для этой страницы</h2>
        <p className="mt-2 text-sm text-muted">
          Подключить список карточек, форму добавления карточки и историю повторений.
        </p>
      </section>
    </Container>
  );
}

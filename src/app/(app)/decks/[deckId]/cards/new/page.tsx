import { notFound } from "next/navigation";

import { CardForm } from "@/features/cards/card-form";
import { getCurrentUserId } from "@/server/auth/session";
import { getUserDeckById } from "@/server/decks/deck.service";
import { BackLink } from "@/shared/ui/back-link";
import { Container } from "@/shared/ui/container";
import { PageTitle } from "@/shared/ui/page-title";

type NewCardPageProps = {
  params: Promise<{
    deckId: string;
  }>;
};

export default async function NewCardPage({ params }: NewCardPageProps) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const { deckId } = await params;
  const deck = await getUserDeckById(userId, deckId);

  if (!deck) {
    notFound();
  }

  return (
    <Container className="max-w-2xl space-y-6">
      <BackLink href={`/decks/${deck.id}`} label="К колоде" />

      <PageTitle
        title={`Новая карточка: ${deck.title}`}
        description="Добавьте слово, перевод и при необходимости пример."
      />

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <CardForm mode="create" deckId={deck.id} />
      </section>
    </Container>
  );
}

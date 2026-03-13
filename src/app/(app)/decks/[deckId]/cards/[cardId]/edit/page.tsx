import { notFound } from "next/navigation";

import { CardForm } from "@/features/cards/card-form";
import { getCurrentUserId } from "@/server/auth/session";
import { getUserCardById } from "@/server/cards/card.service";
import { getUserDeckById } from "@/server/decks/deck.service";
import { Container } from "@/shared/ui/container";
import { PageTitle } from "@/shared/ui/page-title";

type EditCardPageProps = {
  params: Promise<{
    deckId: string;
    cardId: string;
  }>;
};

export default async function EditCardPage({ params }: EditCardPageProps) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const { deckId, cardId } = await params;
  const deck = await getUserDeckById(userId, deckId);

  if (!deck) {
    notFound();
  }

  const card = await getUserCardById(userId, deck.id, cardId);

  if (!card) {
    notFound();
  }

  return (
    <Container className="max-w-2xl space-y-6">
      <PageTitle
        title="Редактирование карточки"
        description={`Колода: ${deck.title}`}
      />

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <CardForm
          mode="edit"
          deckId={deck.id}
          cardId={card.id}
          initialWord={card.word}
          initialTranslation={card.translation}
          initialExample={card.example}
          initialImageUrl={card.imageUrl}
        />
      </section>
    </Container>
  );
}

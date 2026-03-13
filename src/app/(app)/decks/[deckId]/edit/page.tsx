import { notFound } from "next/navigation";

import { DeckForm } from "@/features/decks/deck-form";
import { getCurrentUserId } from "@/server/auth/session";
import { getUserDeckById } from "@/server/decks/deck.service";
import { Container } from "@/shared/ui/container";
import { PageTitle } from "@/shared/ui/page-title";

type EditDeckPageProps = {
  params: Promise<{
    deckId: string;
  }>;
};

export default async function EditDeckPage({ params }: EditDeckPageProps) {
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
      <PageTitle
        title="Редактирование колоды"
        description="Обновите название и описание колоды."
      />

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <DeckForm
          mode="edit"
          deckId={deck.id}
          initialTitle={deck.title}
          initialDescription={deck.description}
          cancelHref={`/decks/${deck.id}`}
          successHref={`/decks/${deck.id}`}
        />
      </section>
    </Container>
  );
}

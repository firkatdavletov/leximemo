import { notFound } from "next/navigation";

import { StudySession } from "@/features/review/study-session";
import { getCurrentUserId } from "@/server/auth/session";
import { getUserDeckById } from "@/server/decks/deck.service";
import { Container } from "@/shared/ui/container";
import { PageTitle } from "@/shared/ui/page-title";

type StudyPageProps = {
  params: Promise<{
    deckId: string;
  }>;
};

export default async function StudyPage({ params }: StudyPageProps) {
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
    <Container className="max-w-3xl space-y-6">
      <PageTitle
        title={`Обучение: ${deck.title}`}
        description="Показываем только карточки, доступные к повторению на текущий момент."
      />

      <StudySession deckId={deck.id} />
    </Container>
  );
}

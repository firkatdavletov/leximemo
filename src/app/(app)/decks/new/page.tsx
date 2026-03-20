import { DeckForm } from "@/features/decks/deck-form";
import { BackLink } from "@/shared/ui/back-link";
import { Container } from "@/shared/ui/container";
import { PageTitle } from "@/shared/ui/page-title";

export default function NewDeckPage() {
  return (
    <Container className="max-w-2xl space-y-6">
      <BackLink href="/decks" label="К списку колод" />

      <PageTitle
        title="Новая колода"
        description="Укажите название и при необходимости краткое описание."
      />

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <DeckForm mode="create" cancelHref="/decks" successHref="/decks" />
      </section>
    </Container>
  );
}

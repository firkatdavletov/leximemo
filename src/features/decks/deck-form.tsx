"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { DeckItemDto } from "@/entities/deck/model/types";
import { buttonClassName } from "@/shared/ui/button";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type DeckFormProps = {
  mode: "create" | "edit";
  deckId?: string;
  initialTitle?: string;
  initialDescription?: string | null;
  cancelHref: string;
  successHref: string;
};

type DeckFormState = {
  title: string;
  description: string;
};

export function DeckForm({
  mode,
  deckId,
  initialTitle = "",
  initialDescription = "",
  cancelHref,
  successHref,
}: DeckFormProps) {
  const [state, setState] = useState<DeckFormState>({
    title: initialTitle,
    description: initialDescription ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const endpoint = mode === "create" ? "/api/decks" : `/api/decks/${deckId}`;
  const method = mode === "create" ? "POST" : "PUT";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!state.title.trim()) {
      setError("Название колоды обязательно.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: state.title,
        description: state.description,
      }),
    });

    const responseBody = (await response.json().catch(() => null)) as
      | ApiSuccess<DeckItemDto>
      | ApiError
      | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(responseBody && !responseBody.ok ? responseBody.error : "Не удалось сохранить колоду.");
      return;
    }

    const savedDeckId =
      responseBody && responseBody.ok ? responseBody.data.deck.id : deckId;

    router.push(mode === "create" ? `/decks/${savedDeckId}` : successHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="deck-title" className="text-sm font-medium text-foreground">
          Название
        </label>
        <input
          id="deck-title"
          type="text"
          value={state.title}
          onChange={(event) => setState((prev) => ({ ...prev, title: event.target.value }))}
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none ring-accent/40 transition focus:ring-2"
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="deck-description" className="text-sm font-medium text-foreground">
          Описание
        </label>
        <textarea
          id="deck-description"
          value={state.description}
          onChange={(event) =>
            setState((prev) => ({ ...prev, description: event.target.value }))
          }
          className="min-h-28 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring-2"
          maxLength={500}
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={isSubmitting} className={buttonClassName()}>
          {isSubmitting
            ? "Сохраняем..."
            : mode === "create"
              ? "Создать колоду"
              : "Сохранить изменения"}
        </button>
        <Link href={cancelHref} className={buttonClassName({ variant: "secondary" })}>
          Отмена
        </Link>
      </div>
    </form>
  );
}

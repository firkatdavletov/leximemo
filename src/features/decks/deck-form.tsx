"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { DeckItemDto } from "@/entities/deck/model/types";
import { buttonClassName } from "@/shared/ui/button";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
import {
  helperTextClassName,
  inputClassName,
  textareaClassName,
} from "@/shared/ui/form-fields";
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

    try {
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

      if (!response.ok) {
        setError(
          responseBody && !responseBody.ok
            ? responseBody.error
            : "Не удалось сохранить колоду.",
        );
        return;
      }

      const savedDeckId =
        responseBody && responseBody.ok ? responseBody.data.deck.id : deckId;
      const successKey = mode === "create" ? "deck-created" : "deck-updated";
      const destination =
        mode === "create"
          ? `/decks/${savedDeckId}?success=${successKey}`
          : `${successHref}?success=${successKey}`;

      router.push(destination);
      router.refresh();
    } catch {
      setError("Не удалось сохранить колоду. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
      <div className="space-y-1.5">
        <label htmlFor="deck-title" className="text-sm font-medium text-foreground">
          Название
        </label>
        <input
          id="deck-title"
          type="text"
          value={state.title}
          onChange={(event) => setState((prev) => ({ ...prev, title: event.target.value }))}
          className={inputClassName}
          placeholder="Например: Английский A1"
          required
          maxLength={120}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "deck-form-error" : "deck-title-hint"}
        />
        <p id="deck-title-hint" className={helperTextClassName}>
          Короткое и понятное название поможет быстро найти колоду на демо.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="deck-description" className="text-sm font-medium text-foreground">
          Описание (опционально)
        </label>
        <textarea
          id="deck-description"
          value={state.description}
          onChange={(event) =>
            setState((prev) => ({ ...prev, description: event.target.value }))
          }
          className={`${textareaClassName} min-h-28`}
          placeholder="Кратко опишите тему, уровень или формат карточек."
          maxLength={500}
        />
      </div>

      {error ? (
        <FeedbackMessage variant="error" className="py-2" title="Ошибка сохранения">
          <span id="deck-form-error">{error}</span>
        </FeedbackMessage>
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

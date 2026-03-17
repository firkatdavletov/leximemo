"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { CardItemDto } from "@/entities/card/model/types";
import { buttonClassName } from "@/shared/ui/button";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type CardFormProps = {
  mode: "create" | "edit";
  deckId: string;
  cardId?: string;
  initialWord?: string;
  initialTranslation?: string;
  initialLanguageCode?: string | null;
  initialExample?: string | null;
  initialImageUrl?: string | null;
};

type CardFormState = {
  word: string;
  translation: string;
  languageCode: string;
  example: string;
  imageUrl: string;
};

export function CardForm({
  mode,
  deckId,
  cardId,
  initialWord = "",
  initialTranslation = "",
  initialLanguageCode = "",
  initialExample = "",
  initialImageUrl = "",
}: CardFormProps) {
  const [state, setState] = useState<CardFormState>({
    word: initialWord,
    translation: initialTranslation,
    languageCode: initialLanguageCode ?? "",
    example: initialExample ?? "",
    imageUrl: initialImageUrl ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const endpoint =
    mode === "create"
      ? `/api/decks/${deckId}/cards`
      : `/api/decks/${deckId}/cards/${cardId}`;
  const method = mode === "create" ? "POST" : "PUT";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!state.word.trim() || !state.translation.trim()) {
      setError("Поля word и translation обязательны.");
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
        word: state.word,
        translation: state.translation,
        languageCode: state.languageCode,
        example: state.example,
        imageUrl: state.imageUrl,
      }),
    });

    const responseBody = (await response.json().catch(() => null)) as
      | ApiSuccess<CardItemDto>
      | ApiError
      | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(responseBody && !responseBody.ok ? responseBody.error : "Не удалось сохранить карточку.");
      return;
    }

    router.push(`/decks/${deckId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="card-word" className="text-sm font-medium text-foreground">
          Word
        </label>
        <input
          id="card-word"
          type="text"
          value={state.word}
          onChange={(event) => setState((prev) => ({ ...prev, word: event.target.value }))}
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none ring-accent/40 transition focus:ring-2"
          required
          maxLength={160}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="card-translation" className="text-sm font-medium text-foreground">
          Translation
        </label>
        <input
          id="card-translation"
          type="text"
          value={state.translation}
          onChange={(event) =>
            setState((prev) => ({ ...prev, translation: event.target.value }))
          }
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none ring-accent/40 transition focus:ring-2"
          required
          maxLength={300}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="card-language-code" className="text-sm font-medium text-foreground">
          Language code (опционально)
        </label>
        <input
          id="card-language-code"
          type="text"
          value={state.languageCode}
          onChange={(event) =>
            setState((prev) => ({ ...prev, languageCode: event.target.value }))
          }
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none ring-accent/40 transition focus:ring-2"
          maxLength={35}
          placeholder="en-US"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="card-example" className="text-sm font-medium text-foreground">
          Example (опционально)
        </label>
        <textarea
          id="card-example"
          value={state.example}
          onChange={(event) =>
            setState((prev) => ({ ...prev, example: event.target.value }))
          }
          className="min-h-24 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring-2"
          maxLength={1000}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="card-image-url" className="text-sm font-medium text-foreground">
          Image URL (опционально)
        </label>
        <input
          id="card-image-url"
          type="url"
          value={state.imageUrl}
          onChange={(event) =>
            setState((prev) => ({ ...prev, imageUrl: event.target.value }))
          }
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none ring-accent/40 transition focus:ring-2"
          maxLength={1000}
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
              ? "Создать карточку"
              : "Сохранить изменения"}
        </button>
        <Link
          href={`/decks/${deckId}`}
          className={buttonClassName({ variant: "secondary" })}
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}

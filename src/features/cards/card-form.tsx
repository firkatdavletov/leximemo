"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { CardItemDto } from "@/entities/card/model/types";
import { buttonClassName } from "@/shared/ui/button";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
import {
  helperTextClassName,
  inputClassName,
  textareaClassName,
} from "@/shared/ui/form-fields";
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
      setError("Поля «слово» и «перевод» обязательны.");
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

      if (!response.ok) {
        setError(
          responseBody && !responseBody.ok
            ? responseBody.error
            : "Не удалось сохранить карточку.",
        );
        return;
      }

      const successKey = mode === "create" ? "card-created" : "card-updated";
      router.push(`/decks/${deckId}?success=${successKey}`);
      router.refresh();
    } catch {
      setError("Не удалось сохранить карточку. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
      <div className="space-y-1.5">
        <label htmlFor="card-word" className="text-sm font-medium text-foreground">
          Слово
        </label>
        <input
          id="card-word"
          type="text"
          value={state.word}
          onChange={(event) => setState((prev) => ({ ...prev, word: event.target.value }))}
          className={inputClassName}
          placeholder="travel"
          required
          maxLength={160}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "card-form-error" : undefined}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="card-translation" className="text-sm font-medium text-foreground">
          Перевод
        </label>
        <input
          id="card-translation"
          type="text"
          value={state.translation}
          onChange={(event) =>
            setState((prev) => ({ ...prev, translation: event.target.value }))
          }
          className={inputClassName}
          placeholder="путешествие"
          required
          maxLength={300}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "card-form-error" : undefined}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="card-language-code" className="text-sm font-medium text-foreground">
          Код языка для озвучки (опционально)
        </label>
        <input
          id="card-language-code"
          type="text"
          value={state.languageCode}
          onChange={(event) =>
            setState((prev) => ({ ...prev, languageCode: event.target.value }))
          }
          className={inputClassName}
          maxLength={35}
          placeholder="en-US"
          aria-describedby="card-language-code-hint"
        />
        <p id="card-language-code-hint" className={helperTextClassName}>
          Используется для browser TTS. Подходит формат BCP-47, например `en-US`.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="card-example" className="text-sm font-medium text-foreground">
          Пример (опционально)
        </label>
        <textarea
          id="card-example"
          value={state.example}
          onChange={(event) =>
            setState((prev) => ({ ...prev, example: event.target.value }))
          }
          className={`${textareaClassName} min-h-24`}
          maxLength={1000}
          placeholder="I love to travel in summer."
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="card-image-url" className="text-sm font-medium text-foreground">
          URL изображения (опционально)
        </label>
        <input
          id="card-image-url"
          type="url"
          value={state.imageUrl}
          onChange={(event) =>
            setState((prev) => ({ ...prev, imageUrl: event.target.value }))
          }
          className={inputClassName}
          maxLength={1000}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {error ? (
        <FeedbackMessage variant="error" className="py-2" title="Ошибка сохранения">
          <span id="card-form-error">{error}</span>
        </FeedbackMessage>
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

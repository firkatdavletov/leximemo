"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  AIGeneratedCardDto,
  AIPreviewResponseDto,
  AISaveGeneratedResponseDto,
} from "@/entities/ai/model/types";
import { buttonClassName } from "@/shared/ui/button";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
import {
  helperTextClassName,
  inputClassName,
  textareaClassName,
} from "@/shared/ui/form-fields";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type AICardGeneratorProps = {
  deckId: string;
};

export function AICardGenerator({ deckId }: AICardGeneratorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [cardsCount, setCardsCount] = useState(5);
  const [previewCards, setPreviewCards] = useState<AIGeneratedCardDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const canGenerate = useMemo(
    () => prompt.trim().length >= 3 && cardsCount >= 1 && cardsCount <= 20,
    [cardsCount, prompt],
  );

  async function handleGeneratePreview() {
    if (!canGenerate || isGenerating) {
      return;
    }

    setError(null);
    setSavedCount(null);
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/decks/${deckId}/ai/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          cardsCount,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | ApiSuccess<AIPreviewResponseDto>
        | ApiError
        | null;

      if (!response.ok || !body || !body.ok) {
        setPreviewCards([]);
        setError(body && !body.ok ? body.error : "Не удалось получить превью карточек.");
        return;
      }

      setPreviewCards(body.data.cards);
    } catch {
      setPreviewCards([]);
      setError("Не удалось получить превью карточек. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (previewCards.length === 0 || isSaving) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/decks/${deckId}/ai/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cards: previewCards,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | ApiSuccess<AISaveGeneratedResponseDto>
        | ApiError
        | null;

      if (!response.ok || !body || !body.ok) {
        setError(
          body && !body.ok ? body.error : "Не удалось сохранить сгенерированные карточки.",
        );
        return;
      }

      setSavedCount(body.data.savedCount);
      setPreviewCards([]);
      setPrompt("");
      setCardsCount(5);
      router.refresh();
    } catch {
      setError("Не удалось сохранить карточки. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">AI-генерация карточек</h2>
          <p className="text-xs text-muted">Prompt, превью и подтвержденное сохранение.</p>
        </div>

        <button
          type="button"
          className={buttonClassName({ variant: isOpen ? "secondary" : "primary", size: "sm" })}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="ai-generator-panel"
        >
          {isOpen ? "Скрыть блок" : "Открыть генерацию"}
        </button>
      </div>

      {isOpen ? (
        <div id="ai-generator-panel" className="mt-4 space-y-4" aria-busy={isGenerating || isSaving}>
          <div className="space-y-1.5">
            <label htmlFor="ai-prompt" className="text-sm font-medium text-foreground">
              Тема или prompt
            </label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className={`${textareaClassName} min-h-24`}
              placeholder="Например: 15 базовых английских слов про путешествия для A1"
              maxLength={4000}
              aria-describedby="ai-prompt-hint"
            />
            <p id="ai-prompt-hint" className={helperTextClassName}>
              Чем конкретнее тема и уровень, тем полезнее будут карточки для демо.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ai-cards-count" className="text-sm font-medium text-foreground">
              Количество карточек (1-20)
            </label>
            <input
              id="ai-cards-count"
              type="number"
              min={1}
              max={20}
              value={cardsCount}
              onChange={(event) =>
                setCardsCount(Math.min(20, Math.max(1, Number(event.target.value) || 1)))
              }
              className={`${inputClassName} max-w-40`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleGeneratePreview()}
              disabled={!canGenerate || isGenerating}
              className={buttonClassName()}
            >
              {isGenerating ? "Генерируем..." : "Сгенерировать превью"}
            </button>

            {previewCards.length > 0 ? (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className={buttonClassName({ variant: "secondary" })}
              >
                {isSaving ? "Сохраняем..." : "Подтвердить и сохранить"}
              </button>
            ) : null}
          </div>

          {error ? (
            <FeedbackMessage variant="error" className="py-2" title="AI-ошибка">
              {error}
            </FeedbackMessage>
          ) : null}

          {savedCount !== null ? (
            <FeedbackMessage variant="success" className="py-2" title="Сохранение завершено">
              Сохранено карточек: {savedCount}
            </FeedbackMessage>
          ) : null}

          {previewCards.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted">
                Превью карточек: {previewCards.length}
              </p>
              <ul className="grid gap-2 md:grid-cols-2">
                {previewCards.map((card, index) => (
                  <li
                    key={`${card.word}-${index}`}
                    className="rounded-xl border border-border bg-white p-3"
                  >
                    <p className="text-sm font-semibold text-foreground">{card.word}</p>
                    <p className="mt-1 text-sm text-muted">{card.translation}</p>
                    {card.example ? (
                      <p className="mt-1 text-xs text-muted">{card.example}</p>
                    ) : null}
                    {card.imagePrompt ? (
                      <p className="mt-1 text-xs text-muted">
                        imagePrompt: {card.imagePrompt}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

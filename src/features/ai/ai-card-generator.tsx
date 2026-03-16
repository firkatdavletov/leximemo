"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  AIGeneratedCardDto,
  AIPreviewResponseDto,
  AISaveGeneratedResponseDto,
} from "@/entities/ai/model/types";
import { buttonClassName } from "@/shared/ui/button";
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

    setIsGenerating(false);

    if (!response.ok || !body || !body.ok) {
      setPreviewCards([]);
      setError(body && !body.ok ? body.error : "Не удалось получить превью карточек.");
      return;
    }

    setPreviewCards(body.data.cards);
  }

  async function handleSave() {
    if (previewCards.length === 0 || isSaving) {
      return;
    }

    setError(null);
    setIsSaving(true);

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

    setIsSaving(false);

    if (!response.ok || !body || !body.ok) {
      setError(body && !body.ok ? body.error : "Не удалось сохранить сгенерированные карточки.");
      return;
    }

    setSavedCount(body.data.savedCount);
    setPreviewCards([]);
    setPrompt("");
    setCardsCount(5);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">AI генерация карточек</h2>
          <p className="text-xs text-muted">{"Prompt -> preview -> confirm save"}</p>
        </div>

        <button
          type="button"
          className={buttonClassName({ variant: isOpen ? "secondary" : "primary", size: "sm" })}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? "Скрыть" : "Generate with AI"}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="ai-prompt" className="text-sm font-medium text-foreground">
              Prompt
            </label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring-2"
              placeholder="Например: 15 базовых английских слов про путешествия для A1"
              maxLength={4000}
            />
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
              onChange={(event) => setCardsCount(Number(event.target.value) || 1)}
              className="h-11 w-full max-w-40 rounded-xl border border-border bg-white px-3 text-sm outline-none ring-accent/40 transition focus:ring-2"
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
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {savedCount !== null ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Сохранено карточек: {savedCount}
            </p>
          ) : null}

          {previewCards.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted">Превью</p>
              <ul className="space-y-2">
                {previewCards.map((card, index) => (
                  <li key={`${card.word}-${index}`} className="rounded-xl border border-border bg-white p-3">
                    <p className="text-sm font-semibold text-foreground">{card.word}</p>
                    <p className="mt-1 text-sm text-muted">{card.translation}</p>
                    {card.example ? <p className="mt-1 text-xs text-muted">{card.example}</p> : null}
                    {card.imagePrompt ? (
                      <p className="mt-1 text-xs text-muted">imagePrompt: {card.imagePrompt}</p>
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

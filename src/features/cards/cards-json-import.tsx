"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useState } from "react";

import { buttonClassName } from "@/shared/ui/button";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
import { helperTextClassName, inputClassName, textareaClassName } from "@/shared/ui/form-fields";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type CardsJsonImportProps = {
  deckId: string;
};

type ImportCard = {
  word: string;
  translation: string;
  languageCode?: string;
  example?: string;
  imageUrl?: string;
};

type ImportResponseDto = {
  savedCount: number;
};

const languageCodeRegex = /^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{1,8})*$/;

const examplePayload = {
  cards: [
    {
      word: "journey",
      translation: "путешествие",
      languageCode: "en-US",
      example: "Our journey starts early in the morning.",
      imageUrl: "https://example.com/images/journey.jpg",
    },
    {
      word: "ticket",
      translation: "билет",
      example: "I bought a train ticket online.",
    },
  ],
};

const exampleJsonText = JSON.stringify(examplePayload, null, 2);

function validateCard(card: unknown, index: number): ImportCard {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw new Error(`cards[${index}] должен быть объектом.`);
  }

  const value = card as Record<string, unknown>;
  const word = typeof value.word === "string" ? value.word.trim() : "";
  const translation = typeof value.translation === "string" ? value.translation.trim() : "";

  if (!word) {
    throw new Error(`cards[${index}].word обязателен.`);
  }

  if (word.length > 160) {
    throw new Error(`cards[${index}].word должен быть не длиннее 160 символов.`);
  }

  if (!translation) {
    throw new Error(`cards[${index}].translation обязателен.`);
  }

  if (translation.length > 300) {
    throw new Error(`cards[${index}].translation должен быть не длиннее 300 символов.`);
  }

  const result: ImportCard = { word, translation };

  if (value.languageCode !== undefined) {
    if (typeof value.languageCode !== "string") {
      throw new Error(`cards[${index}].languageCode должен быть строкой.`);
    }

    const languageCode = value.languageCode.trim();
    if (languageCode.length > 35) {
      throw new Error(`cards[${index}].languageCode должен быть не длиннее 35 символов.`);
    }

    if (languageCode && !languageCodeRegex.test(languageCode)) {
      throw new Error(`cards[${index}].languageCode должен быть в формате BCP-47 (например, en-US).`);
    }

    if (languageCode) {
      result.languageCode = languageCode;
    }
  }

  if (value.example !== undefined) {
    if (typeof value.example !== "string") {
      throw new Error(`cards[${index}].example должен быть строкой.`);
    }

    const example = value.example.trim();
    if (example.length > 1000) {
      throw new Error(`cards[${index}].example должен быть не длиннее 1000 символов.`);
    }

    if (example) {
      result.example = example;
    }
  }

  if (value.imageUrl !== undefined) {
    if (typeof value.imageUrl !== "string") {
      throw new Error(`cards[${index}].imageUrl должен быть строкой.`);
    }

    const imageUrl = value.imageUrl.trim();
    if (imageUrl.length > 1000) {
      throw new Error(`cards[${index}].imageUrl должен быть не длиннее 1000 символов.`);
    }

    if (imageUrl) {
      try {
        // Проверяем, что URL валиден и абсолютный.
        new URL(imageUrl);
      } catch {
        throw new Error(`cards[${index}].imageUrl должен быть валидным URL.`);
      }

      result.imageUrl = imageUrl;
    }
  }

  return result;
}

function parseImportPayload(rawText: string): { cards: ImportCard[] } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("JSON не удалось распарсить. Проверьте синтаксис.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Корневой объект JSON должен быть объектом с полем cards.");
  }

  const payload = parsed as Record<string, unknown>;

  if (!Array.isArray(payload.cards)) {
    throw new Error("Поле cards обязательно и должно быть массивом.");
  }

  if (payload.cards.length === 0) {
    throw new Error("Массив cards не должен быть пустым.");
  }

  if (payload.cards.length > 200) {
    throw new Error("За один импорт можно добавить не более 200 карточек.");
  }

  return {
    cards: payload.cards.map((card, index) => validateCard(card, index)),
  };
}

export function CardsJsonImport({ deckId }: CardsJsonImportProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const canSubmit = useMemo(() => jsonText.trim().length > 0 && !isSubmitting, [isSubmitting, jsonText]);

  async function handleImport() {
    if (!canSubmit) {
      return;
    }

    setError(null);
    setSavedCount(null);

    let payload: { cards: ImportCard[] };

    try {
      payload = parseImportPayload(jsonText);
    } catch (validationError) {
      const message = validationError instanceof Error ? validationError.message : "Невалидный JSON.";
      setError(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/decks/${deckId}/cards/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as
        | ApiSuccess<ImportResponseDto>
        | ApiError
        | null;

      if (!response.ok || !body || !body.ok) {
        setError(body && !body.ok ? body.error : "Не удалось импортировать карточки.");
        return;
      }

      setSavedCount(body.data.savedCount);
      setJsonText("");
      router.refresh();
    } catch {
      setError("Не удалось импортировать карточки. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      setJsonText(content);
      setError(null);
      setSavedCount(null);
    } catch {
      setError("Не удалось прочитать файл. Попробуйте другой JSON-файл.");
    } finally {
      event.target.value = "";
    }
  }

  function handleDownloadTemplate() {
    const blob = new Blob([exampleJsonText], { type: "application/json;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "cards-import-template.json";
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Импорт карточек из JSON</h2>
          <p className="text-xs text-muted">Вставьте JSON или прикрепите .json файл.</p>
        </div>

        <button
          type="button"
          className={buttonClassName({ variant: isOpen ? "secondary" : "primary", size: "sm" })}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="cards-json-import-panel"
        >
          {isOpen ? "Скрыть блок" : "Открыть импорт"}
        </button>
      </div>

      {isOpen ? (
        <div id="cards-json-import-panel" className="mt-4 space-y-4" aria-busy={isSubmitting}>
          <div className="space-y-1.5">
            <label htmlFor="cards-json-file" className="text-sm font-medium text-foreground">
              JSON-файл
            </label>
            <input
              id="cards-json-file"
              type="file"
              accept="application/json,.json"
              onChange={(event) => void handleFileSelect(event)}
              className={inputClassName}
            />
            <p className={helperTextClassName}>После выбора файла содержимое подставится в поле ниже.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="cards-json-input" className="text-sm font-medium text-foreground">
                JSON-текст
              </label>
              <button
                type="button"
                className={buttonClassName({ variant: "ghost", size: "sm" })}
                onClick={() => setJsonText(exampleJsonText)}
              >
                Подставить пример
              </button>
              <button
                type="button"
                className={buttonClassName({ variant: "ghost", size: "sm" })}
                onClick={handleDownloadTemplate}
              >
                Скачать шаблон JSON
              </button>
            </div>
            <textarea
              id="cards-json-input"
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              className={`${textareaClassName} min-h-48 font-mono text-xs`}
              placeholder='{"cards":[{"word":"hello","translation":"привет"}]}'
              aria-describedby="cards-json-input-hint"
            />
            <p id="cards-json-input-hint" className={helperTextClassName}>
              Поддерживаются поля: word, translation, languageCode, example, imageUrl.
            </p>
          </div>

          <details className="rounded-xl border border-border bg-background p-3">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Пример JSON
            </summary>
            <pre className="mt-2 overflow-x-auto text-xs text-muted">{exampleJsonText}</pre>
          </details>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleImport()}
              disabled={!canSubmit}
              className={buttonClassName()}
            >
              {isSubmitting ? "Импортируем..." : "Импортировать карточки"}
            </button>
          </div>

          {error ? (
            <FeedbackMessage variant="error" className="py-2" title="Ошибка импорта">
              {error}
            </FeedbackMessage>
          ) : null}

          {savedCount !== null ? (
            <FeedbackMessage variant="success" className="py-2" title="Импорт завершен">
              Добавлено карточек: {savedCount}
            </FeedbackMessage>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

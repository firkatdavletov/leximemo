import type { AIGeneratedCardDto } from "@/entities/ai/model/types";
import { aiGeneratedCardsResponseSchema } from "@/server/validation/ai.schema";

const AI_ENDPOINT = "https://kong-proxy.yc.amvera.ru/api/v1/models/gpt";

export class AIGenerationError extends Error {
  public readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AIGenerationError";
    this.status = status;
  }
}

type AIResponse = {
  choices?: Array<{
    message?: {
      text?: string;
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

function getTokenHeaderValue(token: string): string {
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

function getResponseText(response: AIResponse): string | null {
  const firstChoice = response.choices?.[0];
  const message = firstChoice?.message;

  if (!message) {
    return null;
  }

  if (typeof message.text === "string" && message.text.trim()) {
    return message.text;
  }

  if (typeof message.content === "string" && message.content.trim()) {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    const textParts = message.content
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .filter((value) => value.trim().length > 0);

    if (textParts.length > 0) {
      return textParts.join("\n");
    }
  }

  return null;
}

function extractJsonBlock(value: string): string {
  const trimmed = value.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const firstBraceIndex = trimmed.indexOf("{");
  const lastBraceIndex = trimmed.lastIndexOf("}");

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || firstBraceIndex >= lastBraceIndex) {
    throw new AIGenerationError("AI вернул ответ в неожиданном формате.", 502);
  }

  return trimmed.slice(firstBraceIndex, lastBraceIndex + 1);
}

function buildGenerationPrompt(prompt: string, cardsCount: number): string {
  return [
    "Сгенерируй карточки для изучения слов.",
    `Количество карточек: ${cardsCount}.`,
    "Язык ответа: русский.",
    "Верни только JSON-объект без markdown и пояснений.",
    "Формат ответа (строго):",
    '{"cards":[{"word":"string","translation":"string","example":"string | null","imagePrompt":"string | null"}]}',
    `cards должен содержать ровно ${cardsCount} элементов.`,
    "word и translation обязательны и не должны быть пустыми.",
    "example и imagePrompt: если значения нет, верни null.",
    `Prompt пользователя: ${prompt}`,
  ].join("\n");
}

function normalizeCards(cards: Array<{ word: string; translation: string; example?: string | null; imagePrompt?: string | null }>): AIGeneratedCardDto[] {
  return cards.map((card) => ({
    word: card.word.trim(),
    translation: card.translation.trim(),
    example: card.example?.trim() || null,
    imagePrompt: card.imagePrompt?.trim() || null,
  }));
}

export async function generateCardsPreviewByPrompt(input: {
  prompt: string;
  cardsCount: number;
}): Promise<AIGeneratedCardDto[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt";

  if (!apiKey) {
    throw new AIGenerationError("OPENAI_API_KEY не настроен на сервере.", 500);
  }

  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": getTokenHeaderValue(apiKey),
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          text: buildGenerationPrompt(input.prompt, input.cardsCount),
        },
      ],
    }),
  }).catch(() => {
    throw new AIGenerationError("Не удалось выполнить запрос к AI сервису.", 502);
  });

  const rawResponseText = await response.text().catch(() => "");

  if (!response.ok) {
    console.error("[AI upstream error]", {
      status: response.status,
      statusText: response.statusText,
      body: rawResponseText.slice(0, 500),
    });
    throw new AIGenerationError(
      `AI сервис вернул ошибку ${response.status}. Проверьте OPENAI_API_KEY и формат запроса.`,
      502,
    );
  }

  const responseBody = ((): AIResponse | null => {
    if (!rawResponseText) {
      return null;
    }

    try {
      return JSON.parse(rawResponseText) as AIResponse;
    } catch {
      return null;
    }
  })();

  if (!responseBody) {
    throw new AIGenerationError("AI сервис вернул пустой ответ.", 502);
  }

  const text = getResponseText(responseBody);

  if (!text) {
    throw new AIGenerationError("AI сервис не вернул текст ответа.", 502);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonBlock(text));
  } catch {
    throw new AIGenerationError("Не удалось разобрать AI-ответ. Попробуйте другой prompt.", 502);
  }

  const validated = aiGeneratedCardsResponseSchema.safeParse(parsed);

  if (!validated.success) {
    throw new AIGenerationError("AI вернул карточки в некорректном формате.", 502);
  }

  return normalizeCards(validated.data.cards);
}

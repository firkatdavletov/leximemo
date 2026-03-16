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
    };
  }>;
};

function getTokenHeaderValue(token: string): string {
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

function getResponseText(response: AIResponse): string | null {
  const firstChoice = response.choices?.[0];

  if (!firstChoice || !firstChoice.message?.text) {
    return null;
  }

  return firstChoice.message.text;
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
    "Для каждой карточки верни word, translation, optional example, optional imagePrompt.",
    "Не добавляй markdown и пояснения. Только JSON.",
    `Prompt пользователя: ${prompt}`,
  ].join("\n");
}

function buildJsonSchema(cardsCount: number) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["cards"],
    properties: {
      cards: {
        type: "array",
        minItems: cardsCount,
        maxItems: cardsCount,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["word", "translation"],
          properties: {
            word: {
              type: "string",
            },
            translation: {
              type: "string",
            },
            example: {
              type: ["string", "null"],
            },
            imagePrompt: {
              type: ["string", "null"],
            },
          },
        },
      },
    },
  };
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
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "generated_cards",
          strict: true,
          schema: buildJsonSchema(input.cardsCount),
        },
      },
    }),
  }).catch(() => {
    throw new AIGenerationError("Не удалось выполнить запрос к AI сервису.", 502);
  });

  if (!response.ok) {
    throw new AIGenerationError("AI сервис временно недоступен. Попробуйте позже.", 502);
  }

  const responseBody = (await response.json().catch(() => null)) as AIResponse | null;

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

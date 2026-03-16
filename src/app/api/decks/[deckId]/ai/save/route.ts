import { NextResponse } from "next/server";

import type {
  AISaveGeneratedRequestDto,
  AISaveGeneratedResponseDto,
} from "@/entities/ai/model/types";
import { getCurrentUserId } from "@/server/auth/session";
import { createManyCardsInDeck } from "@/server/cards/card.service";
import { userOwnsDeck } from "@/server/decks/deck.service";
import { getFirstValidationError } from "@/server/http/validation";
import { aiGeneratedCardsSaveSchema } from "@/server/validation/ai.schema";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type SaveRouteContext = {
  params: Promise<{
    deckId: string;
  }>;
};

function unauthorized() {
  return NextResponse.json<ApiError>(
    {
      ok: false,
      error: "Требуется авторизация.",
    },
    { status: 401 },
  );
}

function badRequest(message: string) {
  return NextResponse.json<ApiError>(
    {
      ok: false,
      error: message,
    },
    { status: 400 },
  );
}

function notFound() {
  return NextResponse.json<ApiError>(
    {
      ok: false,
      error: "Колода не найдена.",
    },
    { status: 404 },
  );
}

export async function POST(request: Request, { params }: SaveRouteContext) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return unauthorized();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Некорректный JSON в теле запроса.");
  }

  const parsed = aiGeneratedCardsSaveSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(getFirstValidationError(parsed.error));
  }

  const payload: AISaveGeneratedRequestDto = {
    cards: parsed.data.cards.map((card) => ({
      word: card.word,
      translation: card.translation,
      example: card.example ?? null,
      imagePrompt: card.imagePrompt ?? null,
    })),
  };

  const { deckId } = await params;
  const ownsDeck = await userOwnsDeck(userId, deckId);

  if (!ownsDeck) {
    return notFound();
  }

  const savedCount = await createManyCardsInDeck(
    userId,
    deckId,
    payload.cards.map((card) => ({
      word: card.word,
      translation: card.translation,
      example: card.example,
    })),
  );

  if (savedCount === null) {
    return notFound();
  }

  return NextResponse.json<ApiSuccess<AISaveGeneratedResponseDto>>(
    {
      ok: true,
      data: {
        savedCount,
      },
    },
    { status: 201 },
  );
}

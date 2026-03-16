import { NextResponse } from "next/server";

import type { AIPreviewResponseDto } from "@/entities/ai/model/types";
import { getCurrentUserId } from "@/server/auth/session";
import { userOwnsDeck } from "@/server/decks/deck.service";
import { getFirstValidationError } from "@/server/http/validation";
import {
  AIGenerationError,
  generateCardsPreviewByPrompt,
} from "@/server/ai/ai-card-generation.service";
import { aiPreviewSchema } from "@/server/validation/ai.schema";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type PreviewRouteContext = {
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

export async function POST(request: Request, { params }: PreviewRouteContext) {
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

  const parsed = aiPreviewSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(getFirstValidationError(parsed.error));
  }

  const { deckId } = await params;
  const ownsDeck = await userOwnsDeck(userId, deckId);

  if (!ownsDeck) {
    return notFound();
  }

  try {
    const cards = await generateCardsPreviewByPrompt({
      prompt: parsed.data.prompt,
      cardsCount: parsed.data.cardsCount,
    });

    return NextResponse.json<ApiSuccess<AIPreviewResponseDto>>({
      ok: true,
      data: {
        cards,
      },
    });
  } catch (error) {
    if (error instanceof AIGenerationError) {
      return NextResponse.json<ApiError>(
        {
          ok: false,
          error: error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json<ApiError>(
      {
        ok: false,
        error: "Не удалось получить превью карточек от AI.",
      },
      { status: 500 },
    );
  }
}

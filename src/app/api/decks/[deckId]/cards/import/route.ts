import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/server/auth/session";
import { createManyCardsInDeck } from "@/server/cards/card.service";
import { userOwnsDeck } from "@/server/decks/deck.service";
import { getFirstValidationError } from "@/server/http/validation";
import { cardsImportSchema } from "@/server/validation/card.schema";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type ImportRouteContext = {
  params: Promise<{
    deckId: string;
  }>;
};

type ImportCardsResponseDto = {
  savedCount: number;
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

export async function POST(request: Request, { params }: ImportRouteContext) {
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

  const parsed = cardsImportSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(getFirstValidationError(parsed.error));
  }

  const { deckId } = await params;
  const ownsDeck = await userOwnsDeck(userId, deckId);

  if (!ownsDeck) {
    return notFound();
  }

  const savedCount = await createManyCardsInDeck(userId, deckId, parsed.data.cards);

  if (savedCount === null) {
    return notFound();
  }

  return NextResponse.json<ApiSuccess<ImportCardsResponseDto>>(
    {
      ok: true,
      data: {
        savedCount,
      },
    },
    { status: 201 },
  );
}

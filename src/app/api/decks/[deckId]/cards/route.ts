import { NextResponse } from "next/server";

import type {
  CardItemDto,
  CardListDto,
  CreateCardRequestDto,
} from "@/entities/card/model/types";
import { getCurrentUserId } from "@/server/auth/session";
import {
  createCardInDeck,
  listCardsByDeck,
} from "@/server/cards/card.service";
import { getFirstValidationError } from "@/server/http/validation";
import { cardSchema } from "@/server/validation/card.schema";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type CardsRouteContext = {
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

export async function GET(_: Request, { params }: CardsRouteContext) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return unauthorized();
  }

  const { deckId } = await params;
  const cards = await listCardsByDeck(userId, deckId);

  if (!cards) {
    return notFound();
  }

  return NextResponse.json<ApiSuccess<CardListDto>>({
    ok: true,
    data: {
      cards,
    },
  });
}

export async function POST(request: Request, { params }: CardsRouteContext) {
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

  const parsed = cardSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(getFirstValidationError(parsed.error));
  }

  const { deckId } = await params;
  const payload: CreateCardRequestDto = {
    word: parsed.data.word,
    translation: parsed.data.translation,
    languageCode: parsed.data.languageCode,
    example: parsed.data.example,
    imageUrl: parsed.data.imageUrl,
  };

  const card = await createCardInDeck(userId, deckId, payload);

  if (!card) {
    return notFound();
  }

  return NextResponse.json<ApiSuccess<CardItemDto>>(
    {
      ok: true,
      data: {
        card,
      },
    },
    { status: 201 },
  );
}

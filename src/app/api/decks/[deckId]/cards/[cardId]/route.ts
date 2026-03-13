import { NextResponse } from "next/server";

import type {
  CardItemDto,
  UpdateCardRequestDto,
} from "@/entities/card/model/types";
import { getCurrentUserId } from "@/server/auth/session";
import {
  deleteUserCard,
  getUserCardById,
  updateUserCard,
} from "@/server/cards/card.service";
import { getFirstValidationError } from "@/server/http/validation";
import { cardSchema } from "@/server/validation/card.schema";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type CardRouteContext = {
  params: Promise<{
    deckId: string;
    cardId: string;
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
      error: "Карточка или колода не найдена.",
    },
    { status: 404 },
  );
}

export async function GET(_: Request, { params }: CardRouteContext) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return unauthorized();
  }

  const { deckId, cardId } = await params;
  const card = await getUserCardById(userId, deckId, cardId);

  if (!card) {
    return notFound();
  }

  return NextResponse.json<ApiSuccess<CardItemDto>>({
    ok: true,
    data: {
      card,
    },
  });
}

export async function PUT(request: Request, { params }: CardRouteContext) {
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

  const { deckId, cardId } = await params;
  const payload: UpdateCardRequestDto = {
    word: parsed.data.word,
    translation: parsed.data.translation,
    example: parsed.data.example,
    imageUrl: parsed.data.imageUrl,
  };

  const card = await updateUserCard(userId, deckId, cardId, payload);

  if (!card) {
    return notFound();
  }

  return NextResponse.json<ApiSuccess<CardItemDto>>({
    ok: true,
    data: {
      card,
    },
  });
}

export async function DELETE(_: Request, { params }: CardRouteContext) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return unauthorized();
  }

  const { deckId, cardId } = await params;
  const deleted = await deleteUserCard(userId, deckId, cardId);

  if (!deleted) {
    return notFound();
  }

  return new NextResponse(null, { status: 204 });
}

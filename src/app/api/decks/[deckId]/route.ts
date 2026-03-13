import { NextResponse } from "next/server";

import type {
  DeckItemDto,
  UpdateDeckRequestDto,
} from "@/entities/deck/model/types";
import { getCurrentUserId } from "@/server/auth/session";
import {
  deleteUserDeck,
  getUserDeckById,
  updateUserDeck,
} from "@/server/decks/deck.service";
import { getFirstValidationError } from "@/server/http/validation";
import { deckSchema } from "@/server/validation/deck.schema";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type DeckRouteContext = {
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

export async function GET(_: Request, { params }: DeckRouteContext) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return unauthorized();
  }

  const { deckId } = await params;
  const deck = await getUserDeckById(userId, deckId);

  if (!deck) {
    return notFound();
  }

  return NextResponse.json<ApiSuccess<DeckItemDto>>({
    ok: true,
    data: {
      deck,
    },
  });
}

export async function PUT(request: Request, { params }: DeckRouteContext) {
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

  const parsed = deckSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(getFirstValidationError(parsed.error));
  }

  const { deckId } = await params;
  const payload: UpdateDeckRequestDto = {
    title: parsed.data.title,
    description: parsed.data.description,
  };

  const updatedDeck = await updateUserDeck(userId, deckId, payload);

  if (!updatedDeck) {
    return notFound();
  }

  return NextResponse.json<ApiSuccess<DeckItemDto>>({
    ok: true,
    data: {
      deck: updatedDeck,
    },
  });
}

export async function DELETE(_: Request, { params }: DeckRouteContext) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return unauthorized();
  }

  const { deckId } = await params;
  const deleted = await deleteUserDeck(userId, deckId);

  if (!deleted) {
    return notFound();
  }

  return new NextResponse(null, { status: 204 });
}

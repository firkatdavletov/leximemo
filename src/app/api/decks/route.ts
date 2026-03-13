import { NextResponse } from "next/server";

import type {
  CreateDeckRequestDto,
  DeckItemDto,
  DeckListDto,
} from "@/entities/deck/model/types";
import { getCurrentUserId } from "@/server/auth/session";
import { createUserDeck, listUserDecks } from "@/server/decks/deck.service";
import { getFirstValidationError } from "@/server/http/validation";
import { deckSchema } from "@/server/validation/deck.schema";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

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

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return unauthorized();
  }

  const decks = await listUserDecks(userId);

  return NextResponse.json<ApiSuccess<DeckListDto>>({
    ok: true,
    data: {
      decks,
    },
  });
}

export async function POST(request: Request) {
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

  const deckInput: CreateDeckRequestDto = {
    title: parsed.data.title,
    description: parsed.data.description,
  };

  const deck = await createUserDeck(userId, deckInput);

  return NextResponse.json<ApiSuccess<DeckItemDto>>(
    {
      ok: true,
      data: {
        deck,
      },
    },
    { status: 201 },
  );
}

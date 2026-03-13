import { NextResponse } from "next/server";

import type {
  CreateDeckRequestDto,
  DeckItemDto,
  DeckListDto,
} from "@/entities/deck/model/types";
import { createDeck, getDecks } from "@/server/decks/deck.service";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

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
  const decks = await getDecks();

  return NextResponse.json<ApiSuccess<DeckListDto>>({
    ok: true,
    data: {
      decks,
    },
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Некорректный JSON в теле запроса.");
  }

  if (!body || typeof body !== "object") {
    return badRequest("Ожидается объект с полями title и description.");
  }

  const payload = body as Partial<CreateDeckRequestDto>;
  const title = payload.title?.trim();
  const description = payload.description?.trim();

  if (!title) {
    return badRequest("Поле title обязательно.");
  }

  const deck = await createDeck({
    title,
    description,
  });

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

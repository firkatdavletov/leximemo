import { NextResponse } from "next/server";

import type { StudySessionDto } from "@/entities/review/model/types";
import { getCurrentUserId } from "@/server/auth/session";
import { listDueCardsForDeck } from "@/server/review/review.service";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type StudyRouteContext = {
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

function notFound() {
  return NextResponse.json<ApiError>(
    {
      ok: false,
      error: "Колода не найдена.",
    },
    { status: 404 },
  );
}

export async function GET(_: Request, { params }: StudyRouteContext) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return unauthorized();
  }

  const { deckId } = await params;
  const cards = await listDueCardsForDeck(userId, deckId);

  if (!cards) {
    return notFound();
  }

  return NextResponse.json<ApiSuccess<StudySessionDto>>({
    ok: true,
    data: {
      deckId,
      cards,
    },
  });
}

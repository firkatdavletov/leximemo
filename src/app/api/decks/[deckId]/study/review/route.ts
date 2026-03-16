import { NextResponse } from "next/server";

import type { ReviewResultDto } from "@/entities/review/model/types";
import { getCurrentUserId } from "@/server/auth/session";
import { getFirstValidationError } from "@/server/http/validation";
import { submitReviewForCard } from "@/server/review/review.service";
import { submitReviewSchema } from "@/server/validation/review.schema";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type ReviewRouteContext = {
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
      error: "Карточка или колода не найдена.",
    },
    { status: 404 },
  );
}

export async function POST(request: Request, { params }: ReviewRouteContext) {
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

  const parsed = submitReviewSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(getFirstValidationError(parsed.error));
  }

  const { deckId } = await params;
  const result = await submitReviewForCard(
    userId,
    deckId,
    parsed.data.cardId,
    parsed.data.grade,
  );

  if (!result) {
    return notFound();
  }

  return NextResponse.json<ApiSuccess<ReviewResultDto>>({
    ok: true,
    data: result,
  });
}

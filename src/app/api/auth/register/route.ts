import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getFirstValidationError } from "@/server/http/validation";
import { registerSchema } from "@/server/validation/auth.schema";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type RegisterResponseDto = {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

function badRequest(message: string) {
  return NextResponse.json<ApiError>(
    {
      ok: false,
      error: message,
    },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Некорректный JSON в теле запроса.");
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(getFirstValidationError(parsed.error));
  }

  const email = parsed.data.email.toLowerCase();
  const name = parsed.data.name?.trim() || null;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json<ApiError>(
      {
        ok: false,
        error: "Пользователь с таким email уже существует.",
      },
      { status: 409 },
    );
  }

  const passwordHash = await hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return NextResponse.json<ApiSuccess<RegisterResponseDto>>(
    {
      ok: true,
      data: {
        user,
      },
    },
    { status: 201 },
  );
}

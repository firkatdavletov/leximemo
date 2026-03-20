import { NextResponse } from "next/server";

import { createPwaIconResponse } from "@/shared/pwa/icon";

type PwaIconRouteContext = {
  params: Promise<{
    size: string;
  }>;
};

const allowedSizes = new Set([180, 192, 512]);

export async function GET(_: Request, { params }: PwaIconRouteContext) {
  const { size } = await params;
  const parsedSize = Number(size);

  if (!allowedSizes.has(parsedSize)) {
    return new NextResponse("Icon size is not supported.", { status: 404 });
  }

  return createPwaIconResponse(parsedSize);
}

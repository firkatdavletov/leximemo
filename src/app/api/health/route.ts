import { NextResponse } from "next/server";

import type { ApiSuccess } from "@/shared/types/api";

type HealthDto = {
  service: string;
  status: "ok";
  timestamp: string;
};

export function GET() {
  return NextResponse.json<ApiSuccess<HealthDto>>({
    ok: true,
    data: {
      service: "leximemo-api",
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
}

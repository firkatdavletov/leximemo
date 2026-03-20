"use client";

import { useSearchParams } from "next/navigation";

import { getSuccessMessage } from "@/shared/lib/flash-message";
import { FeedbackMessage } from "@/shared/ui/feedback-message";

export function QueryStatusMessage() {
  const searchParams = useSearchParams();
  const message = getSuccessMessage(searchParams.get("success"));

  if (!message) {
    return null;
  }

  return <FeedbackMessage variant="success">{message}</FeedbackMessage>;
}

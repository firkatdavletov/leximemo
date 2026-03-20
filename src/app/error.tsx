"use client";

import Link from "next/link";
import { useEffect } from "react";

import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { FeedbackMessage } from "@/shared/ui/feedback-message";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="max-w-2xl py-8">
      <FeedbackMessage
        variant="error"
        title="Не удалось загрузить страницу"
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={reset} className={buttonClassName()}>
              Попробовать снова
            </button>
            <Link href="/" className={buttonClassName({ variant: "secondary" })}>
              На главную
            </Link>
          </div>
        }
      >
        Произошла непредвиденная ошибка. Если проблема повторяется, перезагрузите
        страницу или вернитесь к предыдущему экрану.
      </FeedbackMessage>
    </Container>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonClassName } from "@/shared/ui/button";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
import type { ApiError } from "@/shared/types/api";

type DeckDeleteButtonProps = {
  deckId: string;
};

export function DeckDeleteButton({ deckId }: DeckDeleteButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const isConfirmed = window.confirm("Удалить колоду и все её карточки?");

    if (!isConfirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as ApiError | null;
        setError(errorBody?.error ?? "Не удалось удалить колоду.");
        return;
      }

      router.push("/decks?success=deck-deleted");
      router.refresh();
    } catch {
      setError("Не удалось удалить колоду. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Удалить колоду"
        className={buttonClassName({
          variant: "ghost",
          className: "text-red-700 hover:bg-red-100",
        })}
      >
        {isDeleting ? "Удаляем..." : "Удалить колоду"}
      </button>

      {error ? (
        <FeedbackMessage variant="error" className="py-2">
          {error}
        </FeedbackMessage>
      ) : null}
    </div>
  );
}

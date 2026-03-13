"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonClassName } from "@/shared/ui/button";
import type { ApiError } from "@/shared/types/api";

type CardDeleteButtonProps = {
  deckId: string;
  cardId: string;
};

export function CardDeleteButton({ deckId, cardId }: CardDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    const isConfirmed = window.confirm("Удалить карточку?");

    if (!isConfirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    const response = await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as ApiError | null;
      setError(errorBody?.error ?? "Не удалось удалить карточку.");
      setIsDeleting(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className={buttonClassName({
          variant: "ghost",
          size: "sm",
          className: "text-red-700 hover:bg-red-100",
        })}
      >
        {isDeleting ? "Удаляем..." : "Удалить"}
      </button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

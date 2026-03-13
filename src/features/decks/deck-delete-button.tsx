"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonClassName } from "@/shared/ui/button";
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

    const response = await fetch(`/api/decks/${deckId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as ApiError | null;
      setError(errorBody?.error ?? "Не удалось удалить колоду.");
      setIsDeleting(false);
      return;
    }

    router.push("/decks");
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
          className: "text-red-700 hover:bg-red-100",
        })}
      >
        {isDeleting ? "Удаляем..." : "Удалить колоду"}
      </button>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { AchievementUnlockDto } from "@/entities/achievement/model/types";
import type {
  ReviewGrade,
  ReviewResultDto,
  StudyCardDto,
  StudySessionDto,
} from "@/entities/review/model/types";
import { buttonClassName } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { SpeakButton } from "@/shared/ui/speak-button";
import type { ApiError, ApiSuccess } from "@/shared/types/api";

type StudySessionProps = {
  deckId: string;
};

type SessionStats = {
  reviewed: number;
  hard: number;
  normal: number;
  easy: number;
};

const initialStats: SessionStats = {
  reviewed: 0,
  hard: 0,
  normal: 0,
  easy: 0,
};

const gradeLabels: Record<ReviewGrade, string> = {
  hard: "Сложно",
  normal: "Нормально",
  easy: "Легко",
};

export function StudySession({ deckId }: StudySessionProps) {
  const [cards, setCards] = useState<StudyCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState<SessionStats>(initialStats);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<
    AchievementUnlockDto[]
  >([]);

  const currentCard = cards[currentIndex] ?? null;
  const isCompleted = cards.length > 0 && currentIndex >= cards.length;

  const progressLabel = useMemo(() => {
    if (!currentCard) {
      return null;
    }

    return `${currentIndex + 1} / ${cards.length}`;
  }, [cards.length, currentCard, currentIndex]);

  useEffect(() => {
    async function loadSessionCards() {
      setError(null);
      setIsLoading(true);
      setCurrentIndex(0);
      setShowAnswer(false);
      setStats(initialStats);
      setCurrentStreak(0);
      setNewlyUnlockedAchievements([]);

      const response = await fetch(`/api/decks/${deckId}/study`, {
        method: "GET",
      });

      const body = (await response.json().catch(() => null)) as
        | ApiSuccess<StudySessionDto>
        | ApiError
        | null;

      if (!response.ok || !body || !body.ok) {
        setError(
          body && !body.ok
            ? body.error
            : "Не удалось загрузить карточки для учебной сессии.",
        );
        setCards([]);
        setIsLoading(false);
        return;
      }

      setCards(body.data.cards);
      setIsLoading(false);
    }

    void loadSessionCards();
  }, [deckId]);

  async function handleGradeClick(grade: ReviewGrade) {
    if (!currentCard || isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const response = await fetch(`/api/decks/${deckId}/study/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardId: currentCard.id,
        grade,
      }),
    });

    const body = (await response.json().catch(() => null)) as
      | ApiSuccess<ReviewResultDto>
      | ApiError
      | null;

    setIsSubmitting(false);

    if (!response.ok || !body || !body.ok) {
      setError(
        body && !body.ok
          ? body.error
          : "Не удалось сохранить результат повторения.",
      );
      return;
    }

    setStats((prev) => ({
      reviewed: prev.reviewed + 1,
      hard: prev.hard + (grade === "hard" ? 1 : 0),
      normal: prev.normal + (grade === "normal" ? 1 : 0),
      easy: prev.easy + (grade === "easy" ? 1 : 0),
    }));
    setCurrentStreak(body.data.currentStreak);
    setNewlyUnlockedAchievements((prev) => {
      const map = new Map(prev.map((achievement) => [achievement.code, achievement]));

      for (const achievement of body.data.newlyUnlockedAchievements) {
        map.set(achievement.code, achievement);
      }

      return Array.from(map.values());
    });

    setCurrentIndex((prev) => prev + 1);
    setShowAnswer(false);
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-muted">Загружаем карточки для обучения...</p>
      </section>
    );
  }

  if (error && cards.length === 0) {
    return (
      <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-red-700">{error}</p>
        <Link href={`/decks/${deckId}`} className={buttonClassName({ variant: "secondary" })}>
          Вернуться к колоде
        </Link>
      </section>
    );
  }

  if (cards.length === 0) {
    return (
      <EmptyState
        title="Нет карточек для повторения"
        description="Сейчас нет карточек, у которых наступил срок повторения."
        action={
          <Link href={`/decks/${deckId}`} className={buttonClassName({ variant: "secondary" })}>
            К колоде
          </Link>
        }
      />
    );
  }

  if (isCompleted) {
    return (
      <section className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Сессия завершена</h2>
        <p className="text-sm text-muted">Карточек для этой сессии больше нет.</p>

        <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
          <li>Пройдено карточек: {stats.reviewed}</li>
          <li>Сложно: {stats.hard}</li>
          <li>Нормально: {stats.normal}</li>
          <li>Легко: {stats.easy}</li>
        </ul>

        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-sm font-medium text-foreground">
            Текущий streak: {currentStreak} {currentStreak === 1 ? "день" : "дней"}
          </p>
          {newlyUnlockedAchievements.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted">
                Новые достижения
              </p>
              <ul className="space-y-1 text-sm text-foreground">
                {newlyUnlockedAchievements.map((achievement) => (
                  <li key={achievement.code}>
                    {achievement.title} ({achievement.code})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Новых достижений в этой сессии пока нет.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/decks/${deckId}`} className={buttonClassName({ variant: "secondary" })}>
            Вернуться к колоде
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={buttonClassName()}
          >
            Проверить новые due-карточки
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Прогресс: {progressLabel}</p>
        <Link href={`/decks/${deckId}`} className={buttonClassName({ variant: "secondary", size: "sm" })}>
          Выйти из сессии
        </Link>
      </div>

      <article className="space-y-4 rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Слово</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{currentCard.word}</h2>
          </div>
          <SpeakButton
            text={currentCard.word}
            lang={currentCard.languageCode ?? "en-US"}
          />
        </div>

        {showAnswer ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Перевод</p>
              <p className="mt-1 text-lg text-foreground">{currentCard.translation}</p>
            </div>

            {currentCard.example ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Пример</p>
                <p className="mt-1 text-sm text-muted">{currentCard.example}</p>
              </div>
            ) : null}

            {currentCard.imageUrl ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Изображение</p>
                <a
                  href={currentCard.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm text-accent underline"
                >
                  Открыть изображение
                </a>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Попробуйте вспомнить перевод, затем откройте ответ.
          </p>
        )}
      </article>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!showAnswer ? (
        <button
          type="button"
          onClick={() => setShowAnswer(true)}
          className={buttonClassName()}
        >
          Показать ответ
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleGradeClick("hard")}
            disabled={isSubmitting}
            className={buttonClassName({
              variant: "ghost",
              className: "border border-red-300 text-red-700 hover:bg-red-50",
            })}
          >
            {isSubmitting ? "Сохраняем..." : gradeLabels.hard}
          </button>
          <button
            type="button"
            onClick={() => void handleGradeClick("normal")}
            disabled={isSubmitting}
            className={buttonClassName({ variant: "secondary" })}
          >
            {isSubmitting ? "Сохраняем..." : gradeLabels.normal}
          </button>
          <button
            type="button"
            onClick={() => void handleGradeClick("easy")}
            disabled={isSubmitting}
            className={buttonClassName()}
          >
            {isSubmitting ? "Сохраняем..." : gradeLabels.easy}
          </button>
        </div>
      )}
    </section>
  );
}

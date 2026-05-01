"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";

import type {
  AchievementCode,
  AchievementUnlockDto,
} from "@/entities/achievement/model/types";
import type {
  ReviewGrade,
  StudyCardDto,
  StudySessionDto,
} from "@/entities/review/model/types";
import { buttonClassName } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
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

const achievementIconPaths: Record<AchievementCode, string> = {
  FIRST_REVIEW: "/icons/ic_first_repeat.png",
  FIRST_DECK_COMPLETED: "/icons/ic_first_completed_card.png",
  STREAK_3: "/icons/ic_three_days_strike.png",
  STREAK_7: "/icons/ic_seven_days_strike.png",
  REVIEWS_10: "/icons/ic_ten_repeats.png",
  REVIEWS_50: "/icons/ic_fifty_repeats.png",
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
  const [reloadToken, setReloadToken] = useState(0);

  const currentCard = cards[currentIndex] ?? null;
  const isCompleted = cards.length > 0 && currentIndex >= cards.length;
  const progressLabel = currentCard ? `${currentIndex + 1} / ${cards.length}` : null;
  const remainingCards = Math.max(cards.length - currentIndex - 1, 0);
  const handleKeyboardGrade = useEffectEvent((grade: ReviewGrade) => {
    void handleGradeClick(grade);
  });

  useEffect(() => {
    async function loadSessionCards() {
      setError(null);
      setIsLoading(true);
      setCurrentIndex(0);
      setShowAnswer(false);
      setStats(initialStats);
      setCurrentStreak(0);
      setNewlyUnlockedAchievements([]);

      try {
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
          return;
        }

        setCards(body.data.cards);
      } catch {
        setCards([]);
        setError("Не удалось загрузить учебную сессию. Проверьте соединение и попробуйте снова.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSessionCards();
  }, [deckId, reloadToken]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;

      if (tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (!currentCard || isLoading || isSubmitting || isCompleted) {
        return;
      }

      if (!showAnswer && (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
        setShowAnswer(true);
        return;
      }

      if (!showAnswer) {
        return;
      }

      if (event.key === "1") {
        event.preventDefault();
        handleKeyboardGrade("hard");
      }

      if (event.key === "2") {
        event.preventDefault();
        handleKeyboardGrade("normal");
      }

      if (event.key === "3") {
        event.preventDefault();
        handleKeyboardGrade("easy");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentCard, isCompleted, isLoading, isSubmitting, showAnswer]);

  async function handleGradeClick(grade: ReviewGrade) {
    if (!currentCard || isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
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
        | ApiSuccess<{
            currentStreak: number;
            newlyUnlockedAchievements: AchievementUnlockDto[];
          }>
        | ApiError
        | null;

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
    } catch {
      setError("Не удалось сохранить результат повторения. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReloadSession() {
    setReloadToken((prev) => prev + 1);
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
        <FeedbackMessage variant="error" title="Сессию не удалось открыть">
          {error}
        </FeedbackMessage>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleReloadSession} className={buttonClassName()}>
            Повторить попытку
          </button>
          <Link
            href={`/decks/${deckId}`}
            className={buttonClassName({ variant: "secondary" })}
          >
            Вернуться к колоде
          </Link>
        </div>
      </section>
    );
  }

  if (cards.length === 0) {
    return (
      <EmptyState
        title="Нет карточек для повторения"
        description="Сейчас нет карточек, у которых наступил срок повторения."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={handleReloadSession} className={buttonClassName()}>
              Проверить снова
            </button>
            <Link
              href={`/decks/${deckId}`}
              className={buttonClassName({ variant: "secondary" })}
            >
              К колоде
            </Link>
          </div>
        }
      />
    );
  }

  if (isCompleted) {
    return (
      <section className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Сессия завершена</h2>
        <p className="text-sm text-muted">Карточек для этой сессии больше нет.</p>

        <ul className="grid gap-3 text-sm text-muted sm:grid-cols-2 lg:grid-cols-4">
          <li className="rounded-xl border border-border bg-white p-3">
            Пройдено карточек: {stats.reviewed}
          </li>
          <li className="rounded-xl border border-border bg-white p-3">
            Сложно: {stats.hard}
          </li>
          <li className="rounded-xl border border-border bg-white p-3">
            Нормально: {stats.normal}
          </li>
          <li className="rounded-xl border border-border bg-white p-3">
            Легко: {stats.easy}
          </li>
        </ul>

        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-sm font-medium text-foreground">
            Текущая серия: {currentStreak} {currentStreak === 1 ? "день" : "дней"}
          </p>
          {newlyUnlockedAchievements.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted">
                Новые достижения
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                {newlyUnlockedAchievements.map((achievement) => (
                  <li key={achievement.code} className="flex items-center gap-2">
                    <Image
                      src={achievementIconPaths[achievement.code]}
                      alt=""
                      width={28}
                      height={28}
                      className="shrink-0"
                    />
                    <span>{achievement.title}</span>
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
            onClick={handleReloadSession}
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
        <div>
          <p className="text-sm text-muted">Прогресс: {progressLabel}</p>
          <p className="text-xs text-muted">
            Осталось после текущей карточки: {remainingCards}
          </p>
        </div>
        <Link
          href={`/decks/${deckId}`}
          className={buttonClassName({ variant: "secondary", size: "sm" })}
        >
          Выйти из сессии
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Всего в сессии</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{cards.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Уже отвечено</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{stats.reviewed}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Текущая серия</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{currentStreak}</p>
        </div>
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Текущий интервал</p>
                <p className="mt-1 text-sm text-foreground">
                  {currentCard.intervalDays > 0
                    ? `${currentCard.intervalDays} дн.`
                    : "Еще не назначен"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Следующее повторение
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {currentCard.nextReviewAt
                    ? new Date(currentCard.nextReviewAt).toLocaleString("ru-RU")
                    : "После ответа на карточку"}
                </p>
              </div>
            </div>

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
        <FeedbackMessage variant="error" className="py-2">
          {error}
        </FeedbackMessage>
      ) : null}

      <p className="text-xs text-muted">
        Клавиши: `Space` или `Enter` открыть ответ, `1` сложно, `2` нормально, `3`
        легко.
      </p>

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

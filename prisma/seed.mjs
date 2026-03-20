import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const testEmail = process.env.SEED_TEST_EMAIL ?? "demo@leximemo.local";
const testPassword = process.env.SEED_TEST_PASSWORD ?? "demo12345";
const testName = process.env.SEED_TEST_NAME ?? "Demo User";

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

const now = new Date();
const today = startOfUtcDay(now);
const yesterday = addDays(today, -1);
const twoDaysAgo = addDays(today, -2);

const demoDecks = [
  {
    title: "English Essentials",
    description: "Базовая английская колода для быстрой демонстрации review flow.",
    cards: [
      {
        word: "travel",
        translation: "путешествовать",
        languageCode: "en-US",
        example: "I travel by train every summer.",
        repetitionsCount: 2,
        intervalDays: 2,
        easeFactor: 2.6,
        lastReviewedAt: twoDaysAgo,
        nextReviewAt: addDays(now, -1),
        lastGrade: "NORMAL",
        mistakesCount: 0,
      },
      {
        word: "library",
        translation: "библиотека",
        languageCode: "en-US",
        example: "The new library is open until 9 PM.",
        repetitionsCount: 3,
        intervalDays: 4,
        easeFactor: 2.7,
        lastReviewedAt: yesterday,
        nextReviewAt: addDays(now, 2),
        lastGrade: "EASY",
        mistakesCount: 0,
      },
      {
        word: "borrow",
        translation: "одалживать",
        languageCode: "en-US",
        example: "Can I borrow your dictionary?",
        repetitionsCount: 1,
        intervalDays: 1,
        easeFactor: 2.3,
        lastReviewedAt: yesterday,
        nextReviewAt: now,
        lastGrade: "HARD",
        mistakesCount: 1,
      },
      {
        word: "schedule",
        translation: "расписание",
        languageCode: "en-US",
        example: "My study schedule is on the wall.",
        repetitionsCount: 2,
        intervalDays: 3,
        easeFactor: 2.5,
        lastReviewedAt: addDays(now, -4),
        nextReviewAt: addDays(now, -1),
        lastGrade: "NORMAL",
        mistakesCount: 0,
      },
      {
        word: "improve",
        translation: "улучшать",
        languageCode: "en-US",
        example: "Daily practice helps me improve my English.",
        repetitionsCount: 1,
        intervalDays: 2,
        easeFactor: 2.4,
        lastReviewedAt: twoDaysAgo,
        nextReviewAt: addDays(now, 1),
        lastGrade: "NORMAL",
        mistakesCount: 0,
      },
      {
        word: "careful",
        translation: "осторожный",
        languageCode: "en-US",
        example: "Be careful with false friends in translation.",
        repetitionsCount: 2,
        intervalDays: 5,
        easeFactor: 2.8,
        lastReviewedAt: addDays(now, -5),
        nextReviewAt: addDays(now, 1),
        lastGrade: "EASY",
        mistakesCount: 0,
      },
    ],
  },
  {
    title: "Travel Spanish",
    description: "Испанские слова для путешествий и бытовых ситуаций.",
    cards: [
      {
        word: "aeropuerto",
        translation: "аэропорт",
        languageCode: "es-ES",
        example: "El aeropuerto está lejos del centro.",
        repetitionsCount: 1,
        intervalDays: 1,
        easeFactor: 2.4,
        lastReviewedAt: yesterday,
        nextReviewAt: addDays(now, -1),
        lastGrade: "NORMAL",
        mistakesCount: 0,
      },
      {
        word: "billete",
        translation: "билет",
        languageCode: "es-ES",
        example: "Necesito comprar un billete para Madrid.",
        repetitionsCount: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        lastReviewedAt: null,
        nextReviewAt: null,
        lastGrade: null,
        mistakesCount: 0,
      },
      {
        word: "equipaje",
        translation: "багаж",
        languageCode: "es-ES",
        example: "Mi equipaje es demasiado pesado.",
        repetitionsCount: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        lastReviewedAt: null,
        nextReviewAt: null,
        lastGrade: null,
        mistakesCount: 0,
      },
      {
        word: "reserva",
        translation: "бронь",
        languageCode: "es-ES",
        example: "Tengo una reserva en este hotel.",
        repetitionsCount: 1,
        intervalDays: 3,
        easeFactor: 2.6,
        lastReviewedAt: twoDaysAgo,
        nextReviewAt: addDays(now, 2),
        lastGrade: "EASY",
        mistakesCount: 0,
      },
      {
        word: "mapa",
        translation: "карта",
        languageCode: "es-ES",
        example: "¿Tienes un mapa de la ciudad?",
        repetitionsCount: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        lastReviewedAt: null,
        nextReviewAt: null,
        lastGrade: null,
        mistakesCount: 0,
      },
    ],
  },
  {
    title: "German Verbs",
    description: "Небольшая колода с базовыми немецкими глаголами.",
    cards: [
      {
        word: "lernen",
        translation: "учить",
        languageCode: "de-DE",
        example: "Ich lerne jeden Abend neue Wörter.",
        repetitionsCount: 1,
        intervalDays: 2,
        easeFactor: 2.4,
        lastReviewedAt: twoDaysAgo,
        nextReviewAt: addDays(now, -1),
        lastGrade: "NORMAL",
        mistakesCount: 0,
      },
      {
        word: "sprechen",
        translation: "говорить",
        languageCode: "de-DE",
        example: "Wir sprechen jeden Freitag Deutsch.",
        repetitionsCount: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        lastReviewedAt: null,
        nextReviewAt: null,
        lastGrade: null,
        mistakesCount: 0,
      },
      {
        word: "finden",
        translation: "находить",
        languageCode: "de-DE",
        example: "Ich kann die Antwort schnell finden.",
        repetitionsCount: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        lastReviewedAt: null,
        nextReviewAt: null,
        lastGrade: null,
        mistakesCount: 0,
      },
      {
        word: "verstehen",
        translation: "понимать",
        languageCode: "de-DE",
        example: "Jetzt verstehe ich diese Regel besser.",
        repetitionsCount: 1,
        intervalDays: 1,
        easeFactor: 2.3,
        lastReviewedAt: yesterday,
        nextReviewAt: addDays(now, 1),
        lastGrade: "HARD",
        mistakesCount: 1,
      },
    ],
  },
];

const reviewHistorySeed = [
  {
    deckTitle: "English Essentials",
    word: "travel",
    grade: "NORMAL",
    previousIntervalDays: 1,
    newIntervalDays: 2,
    reviewedAt: addDays(twoDaysAgo, 10 / 24),
  },
  {
    deckTitle: "English Essentials",
    word: "schedule",
    grade: "EASY",
    previousIntervalDays: 2,
    newIntervalDays: 3,
    reviewedAt: addDays(twoDaysAgo, 12 / 24),
  },
  {
    deckTitle: "Travel Spanish",
    word: "reserva",
    grade: "EASY",
    previousIntervalDays: 1,
    newIntervalDays: 3,
    reviewedAt: addDays(twoDaysAgo, 14 / 24),
  },
  {
    deckTitle: "German Verbs",
    word: "lernen",
    grade: "NORMAL",
    previousIntervalDays: 1,
    newIntervalDays: 2,
    reviewedAt: addDays(twoDaysAgo, 16 / 24),
  },
  {
    deckTitle: "English Essentials",
    word: "borrow",
    grade: "HARD",
    previousIntervalDays: 0,
    newIntervalDays: 1,
    reviewedAt: addDays(yesterday, 9 / 24),
  },
  {
    deckTitle: "English Essentials",
    word: "library",
    grade: "EASY",
    previousIntervalDays: 2,
    newIntervalDays: 4,
    reviewedAt: addDays(yesterday, 11 / 24),
  },
  {
    deckTitle: "English Essentials",
    word: "improve",
    grade: "NORMAL",
    previousIntervalDays: 1,
    newIntervalDays: 2,
    reviewedAt: addDays(yesterday, 13 / 24),
  },
  {
    deckTitle: "German Verbs",
    word: "verstehen",
    grade: "HARD",
    previousIntervalDays: 0,
    newIntervalDays: 1,
    reviewedAt: addDays(yesterday, 17 / 24),
  },
  {
    deckTitle: "English Essentials",
    word: "travel",
    grade: "NORMAL",
    previousIntervalDays: 1,
    newIntervalDays: 2,
    reviewedAt: addDays(today, 8 / 24),
  },
  {
    deckTitle: "English Essentials",
    word: "schedule",
    grade: "NORMAL",
    previousIntervalDays: 2,
    newIntervalDays: 3,
    reviewedAt: addDays(today, 9 / 24),
  },
  {
    deckTitle: "Travel Spanish",
    word: "aeropuerto",
    grade: "NORMAL",
    previousIntervalDays: 0,
    newIntervalDays: 1,
    reviewedAt: addDays(today, 10 / 24),
  },
  {
    deckTitle: "English Essentials",
    word: "careful",
    grade: "EASY",
    previousIntervalDays: 3,
    newIntervalDays: 5,
    reviewedAt: addDays(today, 12 / 24),
  },
];

const achievementSeed = [
  {
    code: "FIRST_REVIEW",
    title: "Первое повторение",
    unlockedAt: addDays(twoDaysAgo, 10 / 24),
  },
  {
    code: "FIRST_DECK_COMPLETED",
    title: "Первая завершенная колода",
    unlockedAt: addDays(yesterday, 18 / 24),
  },
  {
    code: "STREAK_3",
    title: "Серия 3 дня",
    unlockedAt: addDays(today, 12 / 24),
  },
  {
    code: "REVIEWS_10",
    title: "10 повторений",
    unlockedAt: addDays(today, 11 / 24),
  },
];

async function ensureDeck(tx, userId, title, description) {
  const existing = await tx.deck.findFirst({
    where: {
      userId,
      title,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    return tx.deck.update({
      where: {
        id: existing.id,
      },
      data: {
        title,
        description,
      },
      select: {
        id: true,
        title: true,
      },
    });
  }

  return tx.deck.create({
    data: {
      userId,
      title,
      description,
    },
    select: {
      id: true,
      title: true,
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(testPassword, 10);

  const user = await prisma.user.upsert({
    where: {
      email: testEmail,
    },
    update: {
      name: testName,
      passwordHash,
    },
    create: {
      email: testEmail,
      name: testName,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
    },
  });

  await prisma.$transaction(async (tx) => {
    const deckRecords = [];

    for (const deck of demoDecks) {
      const record = await ensureDeck(tx, user.id, deck.title, deck.description);
      deckRecords.push(record);
    }

    await tx.reviewHistory.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await tx.achievement.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await tx.dailyStudyActivity.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await tx.userStats.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await tx.card.deleteMany({
      where: {
        deckId: {
          in: deckRecords.map((deck) => deck.id),
        },
      },
    });

    const cardByKey = new Map();
    const deckIdByTitle = new Map(deckRecords.map((deck) => [deck.title, deck.id]));

    for (const deck of demoDecks) {
      const deckId = deckIdByTitle.get(deck.title);

      if (!deckId) {
        continue;
      }

      for (const card of deck.cards) {
        const createdCard = await tx.card.create({
          data: {
            deckId,
            ...card,
          },
          select: {
            id: true,
            word: true,
            deckId: true,
          },
        });

        cardByKey.set(`${deck.title}:${createdCard.word}`, createdCard);
      }
    }

    await tx.reviewHistory.createMany({
      data: reviewHistorySeed.map((entry) => {
        const card = cardByKey.get(`${entry.deckTitle}:${entry.word}`);
        const deckId = deckIdByTitle.get(entry.deckTitle);

        if (!card || !deckId) {
          throw new Error(`Cannot build review history for ${entry.deckTitle}:${entry.word}`);
        }

        return {
          userId: user.id,
          deckId,
          cardId: card.id,
          grade: entry.grade,
          previousIntervalDays: entry.previousIntervalDays,
          newIntervalDays: entry.newIntervalDays,
          reviewedAt: entry.reviewedAt,
        };
      }),
    });

    await tx.dailyStudyActivity.createMany({
      data: [
        {
          userId: user.id,
          activityDate: twoDaysAgo,
          reviewsCount: 4,
          sessionsCount: 1,
        },
        {
          userId: user.id,
          activityDate: yesterday,
          reviewsCount: 4,
          sessionsCount: 1,
        },
        {
          userId: user.id,
          activityDate: today,
          reviewsCount: 4,
          sessionsCount: 1,
        },
      ],
    });

    await tx.userStats.create({
      data: {
        userId: user.id,
        currentStreak: 3,
        longestStreak: 5,
        totalReviewedCards: reviewHistorySeed.length,
        totalStudySessions: 3,
        lastStudyDate: today,
      },
    });

    await tx.achievement.createMany({
      data: achievementSeed.map((achievement) => ({
        userId: user.id,
        code: achievement.code,
        title: achievement.title,
        unlockedAt: achievement.unlockedAt,
      })),
    });
  });

  console.log("Seed completed:");
  console.log(`- email: ${testEmail}`);
  console.log(`- password: ${testPassword}`);
  console.log(`- decks: ${demoDecks.map((deck) => deck.title).join(", ")}`);
  console.log(`- review history entries: ${reviewHistorySeed.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

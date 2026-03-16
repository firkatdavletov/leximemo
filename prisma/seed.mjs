import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const testEmail = process.env.SEED_TEST_EMAIL ?? "demo@leximemo.local";
const testPassword = process.env.SEED_TEST_PASSWORD ?? "demo12345";
const testName = process.env.SEED_TEST_NAME ?? "Demo User";

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
  });

  const demoDeckTitle = "Demo English Deck";
  let deck = await prisma.deck.findFirst({
    where: {
      userId: user.id,
      title: demoDeckTitle,
    },
    select: {
      id: true,
    },
  });

  if (!deck) {
    deck = await prisma.deck.create({
      data: {
        userId: user.id,
        title: demoDeckTitle,
        description: "Демонстрационная колода для режима обучения.",
      },
      select: {
        id: true,
      },
    });
  }

  const cardsCount = await prisma.card.count({
    where: {
      deckId: deck.id,
    },
  });

  if (cardsCount === 0) {
    await prisma.card.createMany({
      data: [
        {
          deckId: deck.id,
          word: "apple",
          translation: "яблоко",
          example: "I eat an apple every morning.",
        },
        {
          deckId: deck.id,
          word: "library",
          translation: "библиотека",
          example: "She studies at the city library.",
        },
        {
          deckId: deck.id,
          word: "journey",
          translation: "путешествие",
          example: "Their journey lasted two weeks.",
        },
      ],
    });
  }

  console.log("Seed completed:");
  console.log(`- email: ${testEmail}`);
  console.log(`- password: ${testPassword}`);
  console.log(`- deck: ${demoDeckTitle}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

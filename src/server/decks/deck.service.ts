import { randomUUID } from "node:crypto";

import type { CreateDeckRequestDto, DeckDto } from "@/entities/deck/model/types";
import { prisma } from "@/lib/prisma";

import { MOCK_DECKS } from "./mock-data";

type DeckWithCount = {
  id: string;
  title: string;
  description: string | null;
  updatedAt: Date;
  _count: {
    cards: number;
  };
};

const DEMO_USER_EMAIL = "demo@leximemo.local";

function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function mapDeckToDto(deck: DeckWithCount): DeckDto {
  return {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cardCount: deck._count.cards,
    updatedAt: deck.updatedAt.toISOString(),
  };
}

async function ensureDemoUserId(): Promise<string> {
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
    },
  });

  return demoUser.id;
}

export async function getDecks(): Promise<DeckDto[]> {
  if (!isDatabaseConfigured()) {
    return MOCK_DECKS;
  }

  try {
    const decks = await prisma.deck.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            cards: true,
          },
        },
      },
    });

    return decks.map(mapDeckToDto);
  } catch {
    return MOCK_DECKS;
  }
}

export async function getDeckById(deckId: string): Promise<DeckDto | null> {
  const mockDeck = MOCK_DECKS.find((deck) => deck.id === deckId) ?? null;

  if (!isDatabaseConfigured()) {
    return mockDeck;
  }

  try {
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        _count: {
          select: {
            cards: true,
          },
        },
      },
    });

    if (!deck) {
      return mockDeck;
    }

    return mapDeckToDto(deck);
  } catch {
    return mockDeck;
  }
}

export async function createDeck(input: CreateDeckRequestDto): Promise<DeckDto> {
  const title = input.title.trim();
  const description = input.description?.trim() || null;

  if (!isDatabaseConfigured()) {
    return {
      id: `mock-${randomUUID()}`,
      title,
      description,
      cardCount: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const userId = await ensureDemoUserId();
    const createdDeck = await prisma.deck.create({
      data: {
        title,
        description,
        userId,
      },
      include: {
        _count: {
          select: {
            cards: true,
          },
        },
      },
    });

    return mapDeckToDto(createdDeck);
  } catch {
    return {
      id: `mock-${randomUUID()}`,
      title,
      description,
      cardCount: 0,
      updatedAt: new Date().toISOString(),
    };
  }
}

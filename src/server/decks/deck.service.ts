import type {
  CreateDeckRequestDto,
  DeckDto,
  UpdateDeckRequestDto,
} from "@/entities/deck/model/types";
import { prisma } from "@/lib/prisma";

type DeckWithCount = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    cards: number;
  };
};

function mapDeckToDto(deck: DeckWithCount): DeckDto {
  return {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cardCount: deck._count.cards,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  };
}

const deckWithCountInclude = {
  _count: {
    select: {
      cards: true,
    },
  },
} as const;

export async function listUserDecks(userId: string): Promise<DeckDto[]> {
  const decks = await prisma.deck.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: deckWithCountInclude,
  });

  return decks.map(mapDeckToDto);
}

export async function createUserDeck(
  userId: string,
  input: CreateDeckRequestDto,
): Promise<DeckDto> {
  const title = input.title.trim();
  const description = input.description?.trim() || null;

  const deck = await prisma.deck.create({
    data: {
      userId,
      title,
      description,
    },
    include: deckWithCountInclude,
  });

  return mapDeckToDto(deck);
}

export async function getUserDeckById(
  userId: string,
  deckId: string,
): Promise<DeckDto | null> {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    include: deckWithCountInclude,
  });

  if (!deck) {
    return null;
  }

  return mapDeckToDto(deck);
}

export async function updateUserDeck(
  userId: string,
  deckId: string,
  input: UpdateDeckRequestDto,
): Promise<DeckDto | null> {
  const title = input.title.trim();
  const description = input.description?.trim() || null;

  const updateResult = await prisma.deck.updateMany({
    where: {
      id: deckId,
      userId,
    },
    data: {
      title,
      description,
    },
  });

  if (updateResult.count === 0) {
    return null;
  }

  return getUserDeckById(userId, deckId);
}

export async function deleteUserDeck(userId: string, deckId: string): Promise<boolean> {
  const deleteResult = await prisma.deck.deleteMany({
    where: {
      id: deckId,
      userId,
    },
  });

  return deleteResult.count > 0;
}

export async function userOwnsDeck(userId: string, deckId: string): Promise<boolean> {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(deck);
}

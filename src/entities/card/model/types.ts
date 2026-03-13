export type CardDto = {
  id: string;
  deckId: string;
  word: string;
  translation: string;
  example: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CardListDto = {
  cards: CardDto[];
};

export type CardItemDto = {
  card: CardDto;
};

export type CreateCardRequestDto = {
  word: string;
  translation: string;
  example?: string;
  imageUrl?: string;
};

export type UpdateCardRequestDto = CreateCardRequestDto;

export type DeckDto = {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
  updatedAt: string;
};

export type DeckListDto = {
  decks: DeckDto[];
};

export type DeckItemDto = {
  deck: DeckDto;
};

export type CreateDeckRequestDto = {
  title: string;
  description?: string;
};

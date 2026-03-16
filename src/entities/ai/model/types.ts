export type AIGeneratedCardDto = {
  word: string;
  translation: string;
  example: string | null;
  imagePrompt: string | null;
};

export type AIPreviewRequestDto = {
  prompt: string;
  cardsCount: number;
};

export type AIPreviewResponseDto = {
  cards: AIGeneratedCardDto[];
};

export type AISaveGeneratedRequestDto = {
  cards: AIGeneratedCardDto[];
};

export type AISaveGeneratedResponseDto = {
  savedCount: number;
};

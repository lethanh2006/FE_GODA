/** Kết quả tự đánh giá mới nhất trong phiên học, theo ID thẻ. */
export type FlashcardRatings = Record<string, boolean>;

export interface FlashcardRound<T extends { id: string }> {
  cards: T[];
  index: number;
  ratings: FlashcardRatings;
}

export function createFlashcardRound<T extends { id: string }>(
  cards: readonly T[],
): FlashcardRound<T> {
  return { cards: [...cards], index: 0, ratings: {} };
}

export function rateFlashcardRound<T extends { id: string }>(
  round: FlashcardRound<T>,
  remembered: boolean,
): FlashcardRound<T> {
  const card = round.cards[round.index];
  if (!card) return round;
  return {
    ...round,
    index: round.index + 1,
    ratings: { ...round.ratings, [card.id]: remembered },
  };
}

export function unrememberedCards<T extends { id: string }>(
  cards: readonly T[],
  ratings: FlashcardRatings,
): T[] {
  return cards.filter((card) => ratings[card.id] === false);
}

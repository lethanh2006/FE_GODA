import type { DeckCard } from "./decks";

export type PracticeMode = "matching" | "listening";
export interface PracticeAnswer {
  cardId: string;
  answerId: string;
}
export interface PracticeResult {
  correct: number;
  total: number;
  completed: boolean;
  learned: number;
}

export function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** API cũ vẫn dùng được; không đọc dấu ngoặc và phần chữ Hán hai lần. */
export function japaneseSpeechText(text: string): string {
  return text.replace(/\{([^|{}]+)\|([^|{}]+)\}/g, "$2").trim();
}

export const sameMeaning = (
  a: Pick<DeckCard, "meaning">,
  b: Pick<DeckCard, "meaning">,
) => a.meaning.trim() === b.meaning.trim();

export function listeningOptions<T extends Pick<DeckCard, "id" | "meaning">>(
  cards: readonly T[],
  answer: T,
): T[] {
  const seen = new Set([answer.meaning.trim()]);
  const distractors = shuffled(cards).filter((card) => {
    const meaning = card.meaning.trim();
    if (seen.has(meaning)) return false;
    seen.add(meaning);
    return true;
  });
  return shuffled([answer, ...distractors.slice(0, 3)]);
}

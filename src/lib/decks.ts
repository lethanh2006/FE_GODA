import type { JlptLevel } from "./types";

/** Bộ thẻ riêng của người dùng (ví dụ thẻ theo bài của khoá học đang theo). */

export interface DeckSummary {
  id: string;
  course: string;
  level: JlptLevel | null;
  chapter: number | null;
  title: string;
  kind: "vocab" | "kanji";
  cards: number;
  learned: number;
  due: number;
}

export interface DeckList {
  due: number;
  decks: DeckSummary[];
}

export interface DeckCard {
  id: string;
  term: string;
  /** Từ có furigana dạng {漢字|かんじ}. */
  furigana: string | null;
  reading: string;
  hanviet: string | null;
  wordType: string | null;
  meaning: string;
  examples: { ja: string; vi: string | null }[];
  learned: boolean;
}

export interface DeckDetail {
  id: string;
  course: string;
  level: JlptLevel | null;
  chapter: number | null;
  title: string;
  kind: "vocab" | "kanji";
  prevId: string | null;
  nextId: string | null;
  cards: DeckCard[];
}

export interface DeckReviewCard extends DeckCard {
  deckTitle: string;
  state: number;
  preview: { again: string; hard: string; good: string; easy: string };
}

export interface DeckChapter {
  course: string;
  chapter: number | null;
  decks: DeckSummary[];
}

/** Gom bộ thẻ theo khoá học và chương, giữ nguyên thứ tự từ API. */
export function groupByChapter(decks: DeckSummary[]): DeckChapter[] {
  const groups: DeckChapter[] = [];
  for (const deck of decks) {
    const last = groups.at(-1);
    if (last && last.course === deck.course && last.chapter === deck.chapter) last.decks.push(deck);
    else groups.push({ course: deck.course, chapter: deck.chapter, decks: [deck] });
  }
  return groups;
}

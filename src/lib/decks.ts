import type { JlptLevel } from "./types";

export type DeckCollection = "private" | "dung-mori-n4";

export const DECK_COLLECTIONS = {
  private: {
    title: "Bộ thẻ",
    description: "Chọn bài học, lật thẻ, ghép cặp và luyện nghe tiếng Nhật. GODA nhắc bạn ôn lại đúng lúc.",
    href: "/bo-the",
    listPath: "/decks",
    queuePath: "/decks/queue?limit=20",
  },
  "dung-mori-n4": {
    title: "Từ vựng N4 Dũng Mori",
    description: "Học từ vựng và chữ Hán N4 Dũng Mori qua lật thẻ, ghép cặp và luyện nghe. Nội dung dành cho mọi tài khoản đã đăng nhập, tiến độ học được lưu riêng cho bạn.",
    href: "/tu-vung-n4-dung-mori",
    listPath: "/decks?collection=dung-mori-n4",
    queuePath: "/decks/queue?collection=dung-mori-n4&limit=20",
  },
} as const;

export function deckHomeHref(collection: DeckCollection = "private") {
  return DECK_COLLECTIONS[collection].href;
}

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
  speechText?: string;
  examples: { ja: string; vi: string | null; speechText?: string }[];
  learned: boolean;
}

export interface DeckDetail {
  id: string;
  collection: DeckCollection;
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
    if (last && last.course === deck.course && last.chapter === deck.chapter)
      last.decks.push(deck);
    else
      groups.push({
        course: deck.course,
        chapter: deck.chapter,
        decks: [deck],
      });
  }
  return groups;
}

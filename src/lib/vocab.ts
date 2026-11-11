import type { JlptLevel } from "./types";

/** Kiểu dữ liệu và tiện ích cho từ điển, học từ, ôn tập. */

export interface WordExample {
  ja: string;
  furigana: string | null;
  en: string;
  tatoebaId: number | null;
}

export interface WordSummary {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  level: JlptLevel | null;
  hanviet: string | null;
  meaningsVi: string[];
  /** "goda": soạn tay; "ovdp": lọc tự động, có thể chưa chính xác; null: chưa có nghĩa tiếng Việt. */
  viSource: string | null;
  meaningsEn: string[];
}

/** Từ liên quan để học tiếp (GĐ1 kế hoạch AI): backend đọc danh sách tính sẵn bằng model embedding. */
export interface RelatedWordsResponse {
  /** "disabled": tính năng đang tắt; "unavailable": file kết quả thiếu hoặc lỗi; "ready": có thể rỗng. */
  status: "ready" | "disabled" | "unavailable";
  source: { modelId: string; generatedAt: string } | null;
  items: WordSummary[];
}

export interface KanjiSummary {
  char: string;
  level: JlptLevel;
  strokes: number;
  radical: string | null;
  onyomi: string[];
  kunyomi: string[];
  meaningsEn: string[];
  hanviet: string[];
}

export interface WordDetail extends WordSummary {
  pos: string[];
  examples: WordExample[];
  lessonNo: number | null;
  kanji: KanjiSummary[];
  sameReading: WordSummary[];
  progress: { state: number; due: string; suspended: boolean } | null;
}

export interface KanjiDetail extends KanjiSummary {
  words: WordSummary[];
}

export interface KanjiListItem {
  char: string;
  level: JlptLevel;
  hanviet: string[];
  meaningsEn: string[];
}

export interface DictionaryOverview {
  totalWords: number;
  totalKanji: number;
  levels: { level: JlptLevel; words: number; kanji: number }[];
}

export interface WordCard extends WordSummary {
  pos: string[];
  example: WordExample | null;
}

export interface VocabLevel {
  level: JlptLevel;
  words: number;
  lessons: number;
  learned: number;
}

export interface LessonSummary {
  no: number;
  words: number;
  preview: string[];
  learned: number;
}

export interface LessonDetail {
  level: JlptLevel;
  no: number;
  totalLessons: number;
  words: (WordCard & { progress: { state: number; suspended: boolean } | null })[];
}

export interface ReviewCard extends WordCard {
  state: number;
  reps: number;
  preview: { again: string; hard: string; good: string; easy: string };
}

export interface StudyQueue {
  total: number;
  cards: ReviewCard[];
}

export interface StudyStats {
  total: number;
  due: number;
  learning: number;
  mature: number;
  known: number;
  reviewedToday: number;
  byLevel: { level: JlptLevel; total: number; due: number }[];
  upcoming: { day: string; count: number }[];
}

export type WordStatus = "due" | "learning" | "mature" | "known";

export interface NotebookPage {
  total: number;
  page: number;
  pageSize: number;
  items: (WordCard & { due: string; suspended: boolean; scheduledDays: number })[];
}

const POS_LABEL: [RegExp, string][] = [
  [/^n$/, "Danh từ"],
  [/^v(5|1|k|s|z|t|i)/, "Động từ"],
  [/^adj-i/, "Tính từ đuôi い"],
  [/^adj-na/, "Tính từ đuôi な"],
  [/^adj-no/, "Tính từ の"],
  [/^adv/, "Trạng từ"],
  [/^exp/, "Cụm từ"],
  [/^int/, "Thán từ"],
  [/^pn/, "Đại từ"],
  [/^conj/, "Liên từ"],
  [/^ctr/, "Lượng từ"],
  [/^num/, "Số từ"],
  [/^prt/, "Trợ từ"],
  [/^aux/, "Trợ động từ"],
];

/** Mã từ loại JMdict → nhãn tiếng Việt, gộp trùng (v5u, vi đều là "Động từ"). */
export function posLabels(pos: string[]): string[] {
  const labels = pos.flatMap((code) => POS_LABEL.find(([pattern]) => pattern.test(code))?.[1] ?? []);
  return [...new Set(labels)];
}

export const meaningLine = (word: Pick<WordSummary, "meaningsVi" | "meaningsEn">) =>
  word.meaningsVi.length ? word.meaningsVi.join("; ") : word.meaningsEn.join("; ");

/** Khoảng cách tới lần ôn tiếp theo: "1 ngày", "3 tuần", "2 tháng". */
export function formatInterval(dueIso: string, now = Date.now()): string {
  const days = Math.max(1, Math.round((new Date(dueIso).getTime() - now) / 86_400_000));
  if (days < 14) return `${days} ngày`;
  if (days < 60) return `${Math.round(days / 7)} tuần`;
  if (days < 365) return `${Math.round(days / 30)} tháng`;
  return `${(days / 365).toFixed(1).replace(".0", "")} năm`;
}

const PENDING_KEY = "goda:pending-words";

/** Từ khách đã học xong; được thêm vào sổ ôn ngay sau khi đăng nhập. */
export function rememberPendingWords(ids: string[]) {
  try {
    const current = getPendingWords();
    localStorage.setItem(PENDING_KEY, JSON.stringify([...new Set([...current, ...ids])].slice(-500)));
  } catch {
    // localStorage không khả dụng
  }
}

export function getPendingWords(): string[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function clearPendingWords() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    // bỏ qua
  }
}

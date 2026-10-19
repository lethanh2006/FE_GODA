import type { JlptLevel, QuestionType, SkillGroup } from "./types";

export const LEVELS: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export const isLevel = (value: string): value is JlptLevel =>
  (LEVELS as string[]).includes(value.toUpperCase());

interface LevelMeta {
  name: string;
  summary: string;
  kanji: string;
  vocab: string;
  /** Lớp Tailwind viết đầy đủ để JIT nhận diện được. */
  badge: string;
  accent: string;
  ring: string;
  soft: string;
}

export const LEVEL_META: Record<JlptLevel, LevelMeta> = {
  N5: {
    name: "Sơ cấp 1",
    summary: "Đọc hiểu câu cơ bản viết bằng Hiragana, Katakana và Kanji đơn giản; nghe hội thoại chậm về chủ đề quen thuộc.",
    kanji: "~100 Kanji",
    vocab: "~800 từ",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    accent: "text-emerald-600 dark:text-emerald-400",
    ring: "hover:border-emerald-400 dark:hover:border-emerald-700",
    soft: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  N4: {
    name: "Sơ cấp 2",
    summary: "Hiểu tiếng Nhật cơ bản trong sinh hoạt hằng ngày; đọc đoạn văn ngắn với từ vựng và Kanji quen thuộc.",
    kanji: "~300 Kanji",
    vocab: "~1.500 từ",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    accent: "text-sky-600 dark:text-sky-400",
    ring: "hover:border-sky-400 dark:hover:border-sky-700",
    soft: "bg-sky-50 dark:bg-sky-950/40",
  },
  N3: {
    name: "Trung cấp",
    summary: "Hiểu tiếng Nhật dùng trong tình huống hằng ngày ở mức nhất định; đọc tiêu đề báo, văn bản có độ khó vừa.",
    kanji: "~650 Kanji",
    vocab: "~3.700 từ",
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    accent: "text-indigo-600 dark:text-indigo-400",
    ring: "hover:border-indigo-400 dark:hover:border-indigo-700",
    soft: "bg-indigo-50 dark:bg-indigo-950/40",
  },
  N2: {
    name: "Trung cao cấp",
    summary: "Hiểu báo chí, bài bình luận, văn bản công việc thông dụng và hội thoại ở tốc độ gần tự nhiên.",
    kanji: "~1.000 Kanji",
    vocab: "~6.000 từ",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
    accent: "text-violet-600 dark:text-violet-400",
    ring: "hover:border-violet-400 dark:hover:border-violet-700",
    soft: "bg-violet-50 dark:bg-violet-950/40",
  },
  N1: {
    name: "Cao cấp",
    summary: "Đọc văn bản phức tạp, trừu tượng về nhiều chủ đề; nắm bắt lập luận và ý đồ của người viết.",
    kanji: "~2.000 Kanji",
    vocab: "~10.000 từ",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    accent: "text-rose-600 dark:text-rose-400",
    ring: "hover:border-rose-400 dark:hover:border-rose-700",
    soft: "bg-rose-50 dark:bg-rose-950/40",
  },
};

export const SKILL_GROUPS: Record<SkillGroup, { nameJa: string; nameVi: string }> = {
  vocabulary: { nameJa: "文字・語彙", nameVi: "Chữ – Từ vựng" },
  grammar: { nameJa: "文法", nameVi: "Ngữ pháp" },
  reading: { nameJa: "読解", nameVi: "Đọc hiểu" },
};

export const QUESTION_TYPES: Record<QuestionType, { nameJa: string; nameVi: string; group: SkillGroup }> = {
  KANJI_READING: { nameJa: "漢字読み", nameVi: "Cách đọc Kanji", group: "vocabulary" },
  ORTHOGRAPHY: { nameJa: "表記", nameVi: "Cách viết Kanji", group: "vocabulary" },
  WORD_FORMATION: { nameJa: "語形成", nameVi: "Cấu tạo từ", group: "vocabulary" },
  CONTEXT: { nameJa: "文脈規定", nameVi: "Điền từ theo ngữ cảnh", group: "vocabulary" },
  PARAPHRASE: { nameJa: "言い換え類義", nameVi: "Từ đồng nghĩa", group: "vocabulary" },
  USAGE: { nameJa: "用法", nameVi: "Cách dùng từ", group: "vocabulary" },
  GRAMMAR_FORM: { nameJa: "文法形式の判断", nameVi: "Chọn ngữ pháp", group: "grammar" },
  SENTENCE_ORDER: { nameJa: "文の組み立て", nameVi: "Sắp xếp câu (★)", group: "grammar" },
  TEXT_GRAMMAR: { nameJa: "文章の文法", nameVi: "Ngữ pháp trong đoạn văn", group: "grammar" },
  READING_SHORT: { nameJa: "内容理解（短文）", nameVi: "Đọc hiểu đoạn ngắn", group: "reading" },
  READING_MEDIUM: { nameJa: "内容理解（中文）", nameVi: "Đọc hiểu đoạn vừa", group: "reading" },
  READING_LONG: { nameJa: "内容理解（長文）", nameVi: "Đọc hiểu đoạn dài", group: "reading" },
  READING_INTEGRATED: { nameJa: "統合理解", nameVi: "Đọc hiểu tổng hợp (A–B)", group: "reading" },
  READING_THEMATIC: { nameJa: "主張理解（長文）", nameVi: "Đọc hiểu quan điểm tác giả", group: "reading" },
  INFO_RETRIEVAL: { nameJa: "情報検索", nameVi: "Tìm kiếm thông tin", group: "reading" },
};

export const SOURCE_LABEL: Record<string, string> = {
  goda: "GODA biên soạn",
  openjlpt: "OpenJLPT",
};

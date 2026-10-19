export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type QuestionType =
  | "KANJI_READING"
  | "ORTHOGRAPHY"
  | "WORD_FORMATION"
  | "CONTEXT"
  | "PARAPHRASE"
  | "USAGE"
  | "GRAMMAR_FORM"
  | "SENTENCE_ORDER"
  | "TEXT_GRAMMAR"
  | "READING_SHORT"
  | "READING_MEDIUM"
  | "READING_LONG"
  | "READING_INTEGRATED"
  | "READING_THEMATIC"
  | "INFO_RETRIEVAL"
  | "LISTEN_TASK"
  | "LISTEN_POINT"
  | "LISTEN_SUMMARY"
  | "LISTEN_UTTERANCE"
  | "LISTEN_RESPONSE"
  | "LISTEN_INTEGRATED";

export type SkillGroup = "vocabulary" | "grammar" | "reading" | "listening";
export type AttemptMode = "EXAM" | "PRACTICE";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
  targetLevel: JlptLevel | null;
  createdAt: string;
}

export interface QuestionTypeMeta {
  type: QuestionType;
  group: SkillGroup;
  nameJa: string;
  nameVi: string;
  instruction: string;
  instructionVi: string;
  hasPassage: boolean;
  spokenOptions: boolean;
}

export interface LevelOverview {
  level: JlptLevel;
  totalQuestions: number;
  passageCount: number;
  examCount: number;
  questionTypes: { type: QuestionType; count: number }[];
  examMinutes: number;
  examQuestions: number;
}

export interface Catalog {
  levels: LevelOverview[];
  questionTypes: QuestionTypeMeta[];
  skillGroups: Record<SkillGroup, { nameJa: string; nameVi: string }>;
}

export interface ExamProgress {
  attemptCount: number;
  bestPercent: number | null;
  inProgressAttemptId: string | null;
}

export interface ExamSummary {
  slug: string;
  level: JlptLevel;
  number: number;
  title: string;
  description: string | null;
  source: string;
  totalQuestions: number;
  totalMinutes: number;
  sections: {
    id: string;
    order: number;
    title: string;
    titleVi: string;
    durationMinutes: number;
    questionCount: number;
  }[];
  progress: ExamProgress | null;
}

export interface ExamDetail extends Omit<ExamSummary, "sections"> {
  sections: (ExamSummary["sections"][number] & {
    mondai: { number: number; type: QuestionType; nameJa: string; nameVi: string; count: number }[];
  })[];
  history: {
    id: string;
    mode: AttemptMode;
    title: string;
    submittedAt: string;
    correctCount: number;
    totalCount: number;
    scorePercent: number;
    timeSpentSeconds: number;
  }[];
}

export interface AttemptMondai {
  number: number;
  type: QuestionType;
  title?: string;
  nameJa: string;
  nameVi: string;
  instruction: string;
  instructionVi: string;
  questionIds: string[];
}

export interface AttemptSection {
  title: string;
  titleVi: string;
  durationMinutes: number | null;
  mondai: AttemptMondai[];
}

export interface AttemptQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  passageId: string | null;
  source: string;
  selectedIndex: number | null;
  flagged: boolean;
  revealed: boolean;
  bookmarked: boolean;
  answerIndex?: number;
  explanation?: string | null;
  isCorrect?: boolean;
}

export interface Passage {
  id: string;
  title: string | null;
  content: string;
}

export interface CategoryScore {
  key: string;
  nameJa: string;
  nameVi: string;
  correct: number;
  total: number;
  score: number;
  maxScore: number;
  minScore: number;
  passedMin: boolean;
}

export interface AttemptResult {
  correctCount: number;
  totalCount: number;
  answeredCount: number;
  scorePercent: number;
  byType: {
    type: QuestionType;
    nameJa: string;
    nameVi: string;
    group: SkillGroup;
    correct: number;
    total: number;
    answered: number;
  }[];
  estimate: {
    categories: CategoryScore[];
    score: number;
    maxScore: number;
    passScore: number;
    passed: boolean;
    note: string;
  } | null;
}

export interface AttemptView {
  id: string;
  mode: AttemptMode;
  status: AttemptStatus;
  level: JlptLevel;
  title: string;
  examSlug: string | null;
  instantFeedback: boolean;
  timeLimitSeconds: number | null;
  startedAt: string;
  submittedAt: string | null;
  timeSpentSeconds: number | null;
  serverNow: string;
  isOwner: boolean;
  sections: AttemptSection[];
  passages: Record<string, Passage>;
  questions: AttemptQuestion[];
  result: AttemptResult | null;
}

export interface RevealResult {
  questionId: string;
  selectedIndex: number;
  answerIndex: number;
  explanation: string | null;
  isCorrect: boolean;
}

export interface AttemptListItem {
  id: string;
  title: string;
  mode: AttemptMode;
  status: AttemptStatus;
  level: JlptLevel;
  startedAt: string;
  submittedAt: string | null;
  totalCount: number;
  correctCount: number | null;
  scorePercent: number | null;
  timeSpentSeconds: number | null;
  examSlug: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserStats {
  totals: {
    attempts: number;
    answered: number;
    correct: number;
    accuracy: number | null;
    studySeconds: number;
    distinctQuestions: number;
    mistakes: number;
    streakDays: number;
  };
  byLevel: { level: JlptLevel; answered: number; correct: number; mistakes: number }[];
  byType: {
    level: JlptLevel;
    type: QuestionType;
    nameJa: string;
    nameVi: string;
    answered: number;
    correct: number;
    questions: number;
    mistakes: number;
    accuracy: number | null;
  }[];
  activity: { date: string; questions: number; correct: number; seconds: number }[];
  recentAttempts: AttemptListItem[];
  inProgress: { id: string; title: string; level: JlptLevel; mode: AttemptMode; startedAt: string; totalCount: number }[];
}

export interface BookmarkItem {
  createdAt: string;
  question: {
    id: string;
    level: JlptLevel;
    type: QuestionType;
    prompt: string;
    options: string[];
    answerIndex: number;
    explanation: string | null;
    source: string;
    passage: Passage | null;
  };
}

export type PracticeFocus = "smart" | "random" | "unseen" | "mistakes" | "bookmarks";

export interface CreateAttemptInput {
  kind: "exam" | "random_exam" | "practice" | "retry";
  examSlug?: string;
  sectionId?: string;
  level?: JlptLevel;
  types?: QuestionType[];
  count?: number;
  focus?: PracticeFocus;
  instantFeedback?: boolean;
  timeLimitMinutes?: number;
  practiceMode?: boolean;
  fromAttemptId?: string;
  retryScope?: "wrong" | "all";
}

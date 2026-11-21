export interface GrammarProgress {
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  completed: boolean;
  answers: { questionId: string; correct: boolean; attempts: number }[];
}
export interface GrammarQuestion {
  id: string;
  kind: "choice" | "order";
  prompt: string;
  translation: string;
  prefix: string;
  suffix: string;
  options: string[];
}
export interface GrammarPattern {
  id: string;
  title: string;
  usage: string;
  formula: string;
  pitfall: string;
  examples: { ja: string; vi: string }[];
  questions: GrammarQuestion[];
}
export interface GrammarSummary {
  id: string;
  chapter: number;
  title: string;
  description: string;
  patterns: string[];
  progress: GrammarProgress;
}
export interface GrammarLesson extends Omit<GrammarSummary, "patterns"> {
  patterns: GrammarPattern[];
  sources: { title: string; url: string }[];
}
export interface GrammarFeedback {
  correct: boolean;
  expected: number[];
  explanation: string;
  progress: GrammarProgress;
}

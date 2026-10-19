import { useMemo } from "react";
import type { AttemptMondai, AttemptQuestion, AttemptSection, AttemptView } from "@/lib/types";

export interface AttemptEntry {
  question: AttemptQuestion;
  /** Vị trí trong toàn bộ lượt làm (0-based). */
  index: number;
  /** Số thứ tự hiển thị trong phần thi (1-based), như trên đề JLPT. */
  number: number;
  sectionIndex: number;
  section: AttemptSection;
  mondai: AttemptMondai;
}

/** Trải phẳng sections → 問題 → câu hỏi theo đúng thứ tự trong đề. */
export function useAttemptEntries(view: AttemptView | undefined): AttemptEntry[] {
  return useMemo(() => {
    if (!view) return [];
    const byId = new Map(view.questions.map((q) => [q.id, q]));
    const entries: AttemptEntry[] = [];
    view.sections.forEach((section, sectionIndex) => {
      let number = 0;
      for (const mondai of section.mondai) {
        for (const id of mondai.questionIds) {
          const question = byId.get(id);
          if (!question) continue;
          entries.push({ question, index: entries.length, number: ++number, sectionIndex, section, mondai });
        }
      }
    });
    return entries;
  }, [view]);
}

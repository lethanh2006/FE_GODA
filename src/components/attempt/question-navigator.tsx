"use client";

import { cn } from "@/lib/cn";
import type { AttemptEntry } from "./use-attempt-entries";

export interface EntryState {
  answered: boolean;
  flagged: boolean;
  /** Chỉ có khi đã xem đáp án (luyện tập) hoặc đã nộp. */
  correct?: boolean;
}

export function QuestionNavigator({
  entries,
  current,
  stateOf,
  onJump,
}: {
  entries: AttemptEntry[];
  current: number;
  stateOf: (entry: AttemptEntry) => EntryState;
  onJump: (index: number) => void;
}) {
  const sections = new Map<number, AttemptEntry[]>();
  for (const entry of entries) {
    sections.set(entry.sectionIndex, [...(sections.get(entry.sectionIndex) ?? []), entry]);
  }
  const multipleSections = sections.size > 1;

  return (
    <div className="space-y-4">
      {[...sections.values()].map((sectionEntries) => {
        const groups = new Map<number, AttemptEntry[]>();
        for (const entry of sectionEntries) {
          groups.set(entry.mondai.number, [...(groups.get(entry.mondai.number) ?? []), entry]);
        }
        const section = sectionEntries[0].section;
        return (
          <div key={sectionEntries[0].sectionIndex} className="space-y-3">
            {multipleSections && <p className="jp text-xs font-semibold text-muted">{section.title}</p>}
            {[...groups.values()].map((group) => (
              <div key={group[0].mondai.number}>
                <p className="mb-1.5 text-xs text-muted">
                  <span className="jp font-medium text-foreground">問題{group[0].mondai.number}</span>{" "}
                  <span className="jp">{group[0].mondai.nameJa}</span>
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {group.map((entry) => {
                    const state = stateOf(entry);
                    return (
                      <button
                        key={entry.question.id}
                        type="button"
                        onClick={() => onJump(entry.index)}
                        aria-label={`Câu ${entry.number}`}
                        aria-current={entry.index === current}
                        className={cn(
                          "relative h-8 rounded-md border text-xs font-medium tabular-nums transition-colors",
                          state.correct === true && "border-emerald-500 bg-emerald-500 text-white",
                          state.correct === false && "border-red-500 bg-red-500 text-white",
                          state.correct === undefined && state.answered && "border-primary bg-primary text-primary-foreground",
                          state.correct === undefined && !state.answered && "border-border bg-card hover:bg-subtle",
                          entry.index === current && "ring-2 ring-foreground ring-offset-1 ring-offset-card",
                        )}
                      >
                        {entry.number}
                        {state.flagged && (
                          <span className="absolute -top-1 -right-1 size-2.5 rounded-full border border-card bg-amber-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}
      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted">
        <span className="flex items-center gap-1"><span className="size-3 rounded bg-primary" /> Đã làm</span>
        <span className="flex items-center gap-1"><span className="size-3 rounded border border-border" /> Chưa làm</span>
        <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-amber-500" /> Đánh dấu</span>
      </div>
    </div>
  );
}

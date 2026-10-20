"use client";

import { Button } from "@/components/ui/button";
import { useStartAttempt } from "@/lib/attempts";
import { formatNumber } from "@/lib/format";
import { QUESTION_TYPES } from "@/lib/jlpt";
import type { JlptLevel, QuestionType } from "@/lib/types";

export function RandomExamButton({ level }: { level: JlptLevel }) {
  const { start, pending, error } = useStartAttempt();
  return (
    <div className="space-y-2">
      <Button variant="secondary" size="sm" onClick={() => start({ kind: "random_exam", level })} disabled={pending !== null}>
        {pending ? "Đang tạo đề…" : "Tạo đề ngẫu nhiên"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

/** Một dòng dạng bài: bấm vào là tạo ngay bài luyện `count` câu. */
export function QuickPracticeRow({
  level,
  type,
  available,
  count = 10,
}: {
  level: JlptLevel;
  type: QuestionType;
  available: number;
  count?: number;
}) {
  const { start, pending, error } = useStartAttempt();
  const meta = QUESTION_TYPES[type];
  return (
    <div>
      <button
        type="button"
        onClick={() => start({ kind: "practice", level, types: [type], count })}
        disabled={pending !== null}
        title={`Luyện ${count} câu ${meta.nameJa}, xem đáp án ngay sau mỗi câu`}
        className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle disabled:opacity-60"
      >
        <span className="min-w-0 flex-1">
          <span className="jp block leading-snug font-medium">{meta.nameJa}</span>
          <span className="block text-xs text-muted">
            {meta.nameVi} · {formatNumber(available)} câu
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold whitespace-nowrap text-primary opacity-70 transition-opacity group-hover:opacity-100">
          {pending ? "Đang tạo…" : `Luyện ${count} câu`}
        </span>
      </button>
      {error && <p className="px-4 pb-3 text-xs text-danger">{error}</p>}
    </div>
  );
}

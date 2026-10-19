"use client";

import { Shuffle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStartAttempt } from "@/lib/attempts";
import type { JlptLevel, QuestionType } from "@/lib/types";

export function RandomExamButton({ level }: { level: JlptLevel }) {
  const { start, pending, error } = useStartAttempt();
  return (
    <div className="space-y-2">
      <Button onClick={() => start({ kind: "random_exam", level })} disabled={pending !== null} className="w-full">
        <Shuffle className="size-4" />
        {pending ? "Đang tạo đề…" : "Tạo đề ngẫu nhiên"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function QuickPracticeButton({
  level,
  type,
  count = 10,
}: {
  level: JlptLevel;
  type: QuestionType;
  count?: number;
}) {
  const { start, pending, error } = useStartAttempt();
  return (
    <>
      <Button
        size="sm"
        onClick={() => start({ kind: "practice", level, types: [type], count })}
        disabled={pending !== null}
        title={`Luyện ${count} câu, xem đáp án ngay sau mỗi câu`}
      >
        <Zap className="size-3.5" />
        {pending ? "…" : `${count} câu`}
      </Button>
      {error && <p className="basis-full text-xs text-red-600">{error}</p>}
    </>
  );
}

"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStartAttempt } from "@/lib/attempts";
import { cn } from "@/lib/cn";
import type { ExamDetail } from "@/lib/types";

export function ExamStartPanel({ exam }: { exam: ExamDetail }) {
  const { start, pending, error } = useStartAttempt();
  const [practice, setPractice] = useState(false);
  const [sectionId, setSectionId] = useState<string | "all">("all");

  const section = exam.sections.find((s) => s.id === sectionId);
  const minutes = section ? section.durationMinutes : exam.totalMinutes;
  const count = section ? section.questionCount : exam.totalQuestions;
  const inProgress = exam.progress?.inProgressAttemptId;

  return (
    <Card className="space-y-5 p-5">
      {inProgress && (
        <div className="rounded-lg border border-warning/30 bg-warning-soft p-3 text-sm">
          <p className="font-medium">Bạn đang làm dở đề này.</p>
          <ButtonLink href={`/attempts/${inProgress}`} size="sm" className="mt-2">
            Làm tiếp
          </ButtonLink>
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold">Chế độ</legend>
        <ModeOption
          active={!practice}
          onClick={() => setPractice(false)}
          title="Thi thử"
          text="Tính giờ như thi thật, xem đáp án sau khi nộp."
        />
        <ModeOption
          active={practice}
          onClick={() => setPractice(true)}
          title="Luyện tập"
          text="Không giới hạn giờ, chọn xong xem đáp án và giải thích ngay."
        />
      </fieldset>

      {exam.sections.length > 1 && (
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Phần thi</span>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="jp h-10 w-full rounded-lg border border-border-strong/70 bg-card px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">Cả đề ({exam.totalQuestions} câu · {exam.totalMinutes} phút)</option>
            {exam.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.questionCount} câu · {s.durationMinutes} phút)
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="space-y-2 border-t border-border pt-5">
        <Button
          size="lg"
          className="w-full"
          disabled={pending !== null}
          onClick={() =>
            start({
              kind: "exam",
              examSlug: exam.slug,
              sectionId: section?.id,
              practiceMode: practice,
            })
          }
        >
          {pending ? "Đang chuẩn bị đề…" : practice ? `Bắt đầu luyện ${count} câu` : `Bắt đầu thi · ${minutes} phút`}
        </Button>
        {error && <p className="text-sm text-danger">{error}</p>}
        <p className="text-xs text-muted">Bài làm được tự động lưu — có thể thoát ra và làm tiếp bất cứ lúc nào.</p>
      </div>
    </Card>
  );
}

function ModeOption({
  active,
  onClick,
  title,
  text,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        active ? "border-primary bg-primary-soft" : "border-border hover:bg-subtle",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          active ? "border-primary" : "border-border-strong",
        )}
      >
        {active && <span className="size-2 rounded-full bg-primary" />}
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted">{text}</span>
      </span>
    </button>
  );
}

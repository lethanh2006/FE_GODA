"use client";

import { BookOpen, PlayCircle, Timer } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
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
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      {inProgress && (
        <div className="rounded-lg bg-primary-soft p-3 text-sm">
          <p className="font-medium">Bạn đang làm dở đề này.</p>
          <ButtonLink href={`/attempts/${inProgress}`} size="sm" className="mt-2">
            <PlayCircle className="size-4" /> Làm tiếp
          </ButtonLink>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Chế độ</p>
        <div className="grid gap-2">
          <ModeOption
            active={!practice}
            onClick={() => setPractice(false)}
            icon={<Timer className="size-5" />}
            title="Thi thử"
            text="Tính giờ như thi thật, xem đáp án sau khi nộp."
          />
          <ModeOption
            active={practice}
            onClick={() => setPractice(true)}
            icon={<BookOpen className="size-5" />}
            title="Luyện tập"
            text="Không giới hạn giờ, chọn xong xem đáp án và giải thích ngay."
          />
        </div>
      </div>

      {exam.sections.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Phần thi</p>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="jp h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">Cả đề ({exam.totalQuestions} câu · {exam.totalMinutes} phút)</option>
            {exam.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.questionCount} câu · {s.durationMinutes} phút)
              </option>
            ))}
          </select>
        </div>
      )}

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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-muted">Bài làm được tự động lưu — bạn có thể thoát và làm tiếp bất cứ lúc nào.</p>
    </div>
  );
}

function ModeOption({
  active,
  onClick,
  icon,
  title,
  text,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        active ? "border-primary bg-primary-soft" : "border-border hover:bg-subtle",
      )}
    >
      <span className={cn("mt-0.5", active ? "text-primary" : "text-muted")}>{icon}</span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted">{text}</span>
      </span>
    </button>
  );
}

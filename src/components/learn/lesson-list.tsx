"use client";

import { Check, Play } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { ErrorNotice, ProgressBar, Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import type { JlptLevel } from "@/lib/types";
import type { LessonSummary } from "@/lib/vocab";

export function LessonList({ level }: { level: JlptLevel }) {
  const { data, error, isLoading } = useSWR<LessonSummary[]>(`/vocab/levels/${level}/lessons`);

  if (error) return <ErrorNotice message="Không tải được danh sách bài. Vui lòng thử lại." />;
  if (isLoading || !data) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const nextNo = data.find((lesson) => lesson.learned < lesson.words)?.no;
  const totalWords = data.reduce((sum, lesson) => sum + lesson.words, 0);
  const learned = data.reduce((sum, lesson) => sum + lesson.learned, 0);

  return (
    <div className="space-y-5">
      <div className="panel flex flex-wrap items-center gap-4 p-5">
        <div className="min-w-48 flex-1 space-y-2">
          <p className="text-sm font-semibold">
            Đã học {formatNumber(learned)}/{formatNumber(totalWords)} từ
          </p>
          <ProgressBar value={(learned / totalWords) * 100} />
        </div>
        {nextNo && (
          <Link
            href={`/hoc-tu/${level.toLowerCase()}/${nextNo}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary bg-primary px-4.5 text-sm font-semibold text-primary-foreground shadow-[0_3px_0_0_color-mix(in_srgb,var(--primary)_62%,#000)] active:translate-y-[2px]"
          >
            <Play className="size-4" aria-hidden /> {learned ? `Học tiếp bài ${nextNo}` : "Bắt đầu bài 1"}
          </Link>
        )}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((lesson) => {
          const finished = lesson.learned >= lesson.words;
          return (
            <li key={lesson.no}>
              <Link
                href={`/hoc-tu/${level.toLowerCase()}/${lesson.no}`}
                className={cn(
                  "panel flex h-full flex-col gap-2 p-4 transition-colors hover:border-primary/40",
                  lesson.no === nextNo && "border-primary/50",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Bài {lesson.no}</span>
                  {finished ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-success">
                      <Check className="size-3.5" aria-hidden /> Đã học
                    </span>
                  ) : (
                    <span className="text-xs text-muted tabular-nums">{lesson.learned ? `${lesson.learned}/` : ""}{lesson.words} từ</span>
                  )}
                </span>
                <span className="jp truncate text-sm text-muted" lang="ja">{lesson.preview.join("・")}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

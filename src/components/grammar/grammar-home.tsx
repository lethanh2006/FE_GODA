"use client";

import Link from "next/link";
import useSWR from "swr";
import { Check, ArrowRight } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  ErrorNotice,
  PageLoading,
  ProgressBar,
} from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import type { GrammarSummary } from "@/lib/grammar";

export function GrammarHome() {
  const { data, error, mutate } = useSWR<{ lessons: GrammarSummary[] }>(
    "/grammar/n4",
  );
  if (error)
    return (
      <ErrorNotice
        message="Chưa tải được bài ngữ pháp."
        action={
          <Button variant="ghost" onClick={() => void mutate()}>
            Thử lại
          </Button>
        }
      />
    );
  if (!data) return <PageLoading label="Đang tải các chương ngữ pháp…" />;
  const next = data.lessons.find((lesson) => !lesson.progress.completed);
  const finished = data.lessons.filter(
    (lesson) => lesson.progress.completed,
  ).length;
  return (
    <>
      <PageHeader
        title="Ngữ pháp N4"
        description="Bám chương bạn đang học. Hiểu một ý, xem ví dụ rồi tự ghép câu. Những câu chưa chắc được lưu để bạn luyện lại."
      />
      <section
        aria-label="Tiến độ ngữ pháp"
        className="panel flex flex-wrap items-center justify-between gap-5 p-5 sm:p-6"
      >
        <div className="min-w-48 flex-1 space-y-3">
          <p className="font-semibold">
            Đã hoàn thành {finished}/{data.lessons.length} chương
          </p>
          <ProgressBar
            value={
              data.lessons.length ? (finished / data.lessons.length) * 100 : 0
            }
          />
          <p className="text-sm text-muted">
            Bạn có thể bắt đầu thẳng ở chương đang học trong khóa N4.
          </p>
        </div>
        {next && (
          <ButtonLink href={`/ngu-phap-n4/${next.chapter}`}>
            Học tiếp chương {next.chapter}
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        )}
      </section>
      <ol className="panel divide-y divide-border overflow-hidden">
        {data.lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/ngu-phap-n4/${lesson.chapter}`}
              className="flex min-h-28 items-center gap-4 px-5 py-5 hover:bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:gap-6 sm:px-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xl font-bold text-primary tabular-nums">
                {lesson.chapter}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-lg font-semibold text-balance">
                  {lesson.title}
                </h2>
                <p className="text-sm text-muted">
                  {lesson.patterns.length} mục nhỏ · {lesson.progress.total} bài
                  tập
                </p>
                <p className="text-sm text-muted">
                  {lesson.progress.completed ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <Check className="size-4" aria-hidden /> Đã luyện đúng cả
                      chương
                    </span>
                  ) : (
                    `${lesson.progress.correct}/${lesson.progress.total} câu đã làm đúng`
                  )}
                  {lesson.progress.wrong > 0 &&
                    ` · ${lesson.progress.wrong} câu cần luyện lại`}
                </p>
              </div>
              <ArrowRight className="size-5 shrink-0 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-sm leading-relaxed text-muted">
        Bài bổ trợ do Goda biên soạn, bám mục lục chương 15–33 của khóa N4 Dũng
        Mori. Mỗi chương có liên kết tới phần học gốc để bạn đối chiếu.
      </p>
    </>
  );
}

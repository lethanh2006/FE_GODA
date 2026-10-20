"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { BarList } from "@/components/charts/bar-list";
import { BookmarkButton } from "@/components/question/bookmark-button";
import { blankNumber, JpText, PassageBox } from "@/components/question/jp-text";
import { ListeningPlayer } from "@/components/question/listening-player";
import { OptionList } from "@/components/question/option-list";
import { ReportButton } from "@/components/question/report-dialog";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, ErrorNotice, PageLoading, ProgressBar } from "@/components/ui/feedback";
import { Segmented } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { useStartAttempt } from "@/lib/attempts";
import { cn } from "@/lib/cn";
import { formatDateTime, formatDuration, formatPercent } from "@/lib/format";
import { isListening, SOURCE_LABEL, SPOKEN_OPTIONS } from "@/lib/jlpt";
import type { AttemptView } from "@/lib/types";
import { useAttemptEntries, type AttemptEntry } from "./use-attempt-entries";

type Filter = "all" | "wrong" | "blank" | "correct" | "flagged";

export function AttemptResult({ id }: { id: string }) {
  const router = useRouter();
  const { data: view, error } = useSWR<AttemptView>(`/attempts/${id}`);

  useEffect(() => {
    if (view?.status === "IN_PROGRESS") router.replace(`/attempts/${id}`);
  }, [view?.status, id, router]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <ErrorNotice message={error instanceof ApiError ? error.message : "Không tải được kết quả."} />
      </div>
    );
  }
  if (!view || !view.result) return <PageLoading label="Đang tải kết quả…" />;
  return <ResultView view={view} />;
}

function ResultView({ view }: { view: AttemptView }) {
  const { user } = useAuth();
  const { start, pending, error } = useStartAttempt();
  const entries = useAttemptEntries(view);
  const result = view.result!;
  const [filter, setFilter] = useState<Filter>(() => (result.correctCount < result.totalCount ? "wrong" : "all"));

  const counts = useMemo(() => {
    const c = { all: entries.length, wrong: 0, blank: 0, correct: 0, flagged: 0 };
    for (const e of entries) {
      if (e.question.selectedIndex === null) c.blank++;
      else if (e.question.isCorrect) c.correct++;
      else c.wrong++;
      if (e.question.flagged) c.flagged++;
    }
    return c;
  }, [entries]);

  const visible = entries.filter((e) => {
    const q = e.question;
    if (filter === "wrong") return q.selectedIndex !== null && !q.isCorrect;
    if (filter === "blank") return q.selectedIndex === null;
    if (filter === "correct") return q.isCorrect;
    if (filter === "flagged") return q.flagged;
    return true;
  });

  const levelHref = `/${view.level.toLowerCase()}`;
  const missed = result.totalCount - result.correctCount;
  const estimate = result.estimate;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <ButtonLink href={view.examSlug ? `/exams/${view.examSlug}` : levelHref} variant="ghost" size="sm">
          <ArrowLeft className="size-4" /> Quay lại
        </ButtonLink>
        <LevelBadge level={view.level} />
        <Badge>{view.mode === "EXAM" ? "Thi thử" : "Luyện tập"}</Badge>
        <span>Nộp lúc {formatDateTime(view.submittedAt)}</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{view.title}</h1>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-6">
          <p className="text-sm text-muted">Số câu đúng</p>
          <p className="mt-1 text-5xl font-bold tracking-tight">
            {result.correctCount}
            <span className="text-2xl font-semibold text-muted">/{result.totalCount}</span>
          </p>
          <ProgressBar value={result.scorePercent} className="mt-4" />
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5"><Target className="size-4" /> Tỷ lệ đúng {formatPercent(result.scorePercent)}</span>
            <span className="flex items-center gap-1.5"><Clock className="size-4" /> {formatDuration(view.timeSpentSeconds)}</span>
            <span className="flex items-center gap-1.5"><Flag className="size-4" /> Đã làm {result.answeredCount}/{result.totalCount}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {missed > 0 && (
              <Button
                onClick={() => start({ kind: "retry", fromAttemptId: view.id, retryScope: "wrong" }, "wrong")}
                disabled={pending !== null}
              >
                <RotateCcw className="size-4" />
                {pending === "wrong" ? "Đang tạo…" : `Làm lại ${missed} câu sai`}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => start({ kind: "retry", fromAttemptId: view.id, retryScope: "all" }, "all")}
              disabled={pending !== null}
            >
              {pending === "all" ? "Đang tạo…" : "Luyện lại cả bài"}
            </Button>
            {view.examSlug && view.mode === "EXAM" && (
              <ButtonLink href={`/exams/${view.examSlug}`} variant="secondary">Thi lại đề này</ButtonLink>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </Card>

        {estimate ? (
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Điểm JLPT ước tính</p>
                <p className="mt-1 text-2xl font-semibold">
                  {estimate.score}
                  <span className="text-base font-normal text-muted">/{estimate.maxScore}</span>
                </p>
              </div>
              <Badge tone={estimate.passed ? "success" : "danger"} className="text-sm">
                {estimate.passed ? <Trophy className="size-4" /> : <XCircle className="size-4" />}
                {estimate.passed ? "Có khả năng đỗ" : "Chưa đạt"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted">Ngưỡng đỗ quy đổi cho phần đã thi: {estimate.passScore}/{estimate.maxScore}</p>
            <div className="mt-5 space-y-4">
              {estimate.categories.map((c) => (
                <div key={c.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                    <span>
                      <span className="jp">{c.nameJa}</span>
                      <span className="ml-2 text-xs text-muted">{c.correct}/{c.total} câu</span>
                    </span>
                    <span className="flex items-center gap-1 tabular-nums">
                      {c.passedMin ? (
                        <CheckCircle2 className="size-4 text-success" aria-label="Vượt điểm liệt" />
                      ) : (
                        <XCircle className="size-4 text-danger" aria-label="Dưới điểm liệt" />
                      )}
                      {c.score}/{c.maxScore}
                    </span>
                  </div>
                  <ProgressBar
                    value={(c.score / c.maxScore) * 100}
                    marker={(c.minScore / c.maxScore) * 100}
                    tone={c.passedMin ? "primary" : "danger"}
                  />
                  <p className="mt-1 text-xs text-muted">Điểm liệt: {c.minScore}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">{estimate.note}</p>
          </Card>
        ) : (
          <Card className="p-6">
            <p className="font-semibold">Tiếp theo nên làm gì?</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>• Xem lại giải thích các câu sai bên dưới, lưu những câu muốn ôn.</li>
              <li>• Bấm “Làm lại câu sai” để luyện lại ngay khi còn nhớ.</li>
              <li>• Câu sai được ghi lại để bạn ôn tập trong mục Tiến độ.</li>
            </ul>
            <ButtonLink href={levelHref} variant="secondary" className="mt-4">Luyện tiếp {view.level}</ButtonLink>
          </Card>
        )}
      </div>

      {!user && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary-soft px-4 py-3 text-sm">
          <span>Đăng ký miễn phí để lưu kết quả, theo dõi tiến độ và ôn lại câu sai.</span>
          <ButtonLink href={`/register?next=/attempts/${view.id}/result`} size="sm">Đăng ký</ButtonLink>
        </div>
      )}

      <Card>
        <CardHeader title="Kết quả theo dạng bài" description="Dạng có tỷ lệ đúng thấp là nơi nên luyện thêm." />
        <div className="p-5">
          <BarList
            items={result.byType.map((t) => {
              const percent = t.total ? (t.correct / t.total) * 100 : 0;
              return {
                key: t.type,
                label: (
                  <>
                    <span className="jp">{t.nameJa}</span>
                    <span className="ml-2 text-xs text-muted">{t.nameVi}</span>
                  </>
                ),
                percent,
                valueLabel: `${formatPercent(percent)} · ${t.correct}/${t.total}`,
                action: (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                    disabled={pending !== null}
                    onClick={() =>
                      start({ kind: "practice", level: view.level, types: [t.type], count: 10 }, `type-${t.type}`)
                    }
                  >
                    {pending === `type-${t.type}` ? "…" : "Luyện"}
                  </button>
                ),
              };
            })}
          />
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Xem lại bài làm</h2>
          <Segmented<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: `Tất cả (${counts.all})` },
              { value: "wrong", label: `Sai (${counts.wrong})` },
              { value: "blank", label: `Bỏ trống (${counts.blank})` },
              { value: "correct", label: `Đúng (${counts.correct})` },
              { value: "flagged", label: `Đánh dấu (${counts.flagged})` },
            ]}
          />
        </div>
        {visible.length === 0 ? (
          <EmptyState title="Không có câu nào trong mục này" />
        ) : (
          <div className="space-y-4">
            {visible.map((entry, i) => (
              <ReviewItem
                key={entry.question.id}
                entry={entry}
                view={view}
                showPassage={entry.question.passageId !== null && visible[i - 1]?.question.passageId !== entry.question.passageId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewItem({ entry, view, showPassage }: { entry: AttemptEntry; view: AttemptView; showPassage: boolean }) {
  const q = entry.question;
  const passage = q.passageId ? view.passages[q.passageId] : undefined;
  const blank = blankNumber(q.prompt);
  const status = q.selectedIndex === null ? "blank" : q.isCorrect ? "correct" : "wrong";

  return (
    <div className="space-y-3">
      {showPassage && passage && isListening(q.type) && (
        <ListeningPlayer
          script={passage.content}
          spokenOptions={SPOKEN_OPTIONS.has(q.type) ? q.options : undefined}
          showTranscript
        />
      )}
      {showPassage && passage && !isListening(q.type) && (
        <details className="group rounded-xl border border-border bg-card" open={false}>
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted hover:text-foreground">
            Bài đọc ({entry.mondai.nameJa}) — bấm để xem
          </summary>
          <PassageBox content={passage.content} title={passage.title} className="m-3 mt-0" />
        </details>
      )}
      <Card className={cn("p-4 sm:p-5", status === "wrong" && "border-danger/40")}>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold">Câu {entry.number}</span>
          <span className="jp text-muted">問題{entry.mondai.number} · {entry.mondai.nameJa}</span>
          {status === "correct" && <Badge tone="success"><CheckCircle2 className="size-3.5" /> Đúng</Badge>}
          {status === "wrong" && <Badge tone="danger"><XCircle className="size-3.5" /> Sai</Badge>}
          {status === "blank" && <Badge tone="warning">Bỏ trống</Badge>}
          {q.flagged && <Badge tone="warning"><Flag className="size-3.5" /> Đánh dấu</Badge>}
        </div>
        <div className="mb-4">
          {blank !== undefined && passage ? (
            <p className="text-sm">
              Chỗ trống <JpText text={q.prompt} highlightBlank={blank} /> trong bài đọc
            </p>
          ) : (
            <JpText text={q.prompt} className={cn("block", q.type === "USAGE" && "text-xl font-semibold")} />
          )}
        </div>
        <OptionList options={q.options} selectedIndex={q.selectedIndex} answerIndex={q.answerIndex} compact />
        {q.explanation && (
          <div className="mt-4 rounded-lg bg-subtle p-3 text-sm">
            <p className="mb-1 text-xs font-semibold text-muted">Giải thích</p>
            <JpText text={q.explanation} className="block" />
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Badge>{SOURCE_LABEL[q.source] ?? q.source}</Badge>
          <BookmarkButton questionId={q.id} initial={q.bookmarked} />
          <ReportButton questionId={q.id} />
        </div>
      </Card>
    </div>
  );
}

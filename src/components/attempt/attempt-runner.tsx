"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  Keyboard,
  LayoutGrid,
  LogOut,
  Type,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { BookmarkButton } from "@/components/question/bookmark-button";
import { blankNumber, JpText, PassageBox } from "@/components/question/jp-text";
import { ListeningPlayer } from "@/components/question/listening-player";
import { OptionList } from "@/components/question/option-list";
import { ReportButton } from "@/components/question/report-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorNotice, PageLoading, ProgressBar } from "@/components/ui/feedback";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatClock } from "@/lib/format";
import { rememberGuestAttempt } from "@/lib/guest";
import { isListening, SOURCE_LABEL, SPOKEN_OPTIONS } from "@/lib/jlpt";
import type { AttemptView, RevealResult } from "@/lib/types";
import { QuestionNavigator, type EntryState } from "./question-navigator";
import { useAttemptEntries, type AttemptEntry } from "./use-attempt-entries";

const FONT_SIZES = ["1rem", "1.125rem", "1.3rem"];
const FONT_KEY = "goda:font-size";
const SAVE_DELAY_MS = 800;

interface AnswerState {
  selectedIndex: number | null;
  flagged: boolean;
}

export function AttemptRunner({ id }: { id: string }) {
  const router = useRouter();
  const { data: view, error } = useSWR<AttemptView>(`/attempts/${id}`, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  useEffect(() => {
    if (view?.status === "SUBMITTED") router.replace(`/attempts/${id}/result`);
  }, [view?.status, id, router]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <ErrorNotice
          message={error instanceof ApiError ? error.message : "Không tải được bài làm."}
          action={<ButtonLink href="/" variant="secondary" size="sm">Về trang chủ</ButtonLink>}
        />
      </div>
    );
  }
  if (!view || view.status === "SUBMITTED") return <PageLoading label="Đang tải đề…" />;
  return <Runner view={view} />;
}

function Runner({ view }: { view: AttemptView }) {
  const router = useRouter();
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  const entries = useAttemptEntries(view);

  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() =>
    Object.fromEntries(view.questions.map((q) => [q.id, { selectedIndex: q.selectedIndex, flagged: q.flagged }])),
  );
  const [reveals, setReveals] = useState<Record<string, RevealResult>>(() =>
    Object.fromEntries(
      view.questions
        .filter((q) => q.revealed && q.answerIndex !== undefined && q.selectedIndex !== null)
        .map((q) => [
          q.id,
          {
            questionId: q.id,
            selectedIndex: q.selectedIndex!,
            answerIndex: q.answerIndex!,
            explanation: q.explanation ?? null,
            isCorrect: q.isCorrect === true,
          },
        ]),
    ),
  );
  const [current, setCurrent] = useState(() => {
    const firstOpen = entries.findIndex((e) => e.question.selectedIndex === null);
    return firstOpen >= 0 ? firstOpen : 0;
  });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  /** Câu nghe mà người học chọn hiện chữ các lựa chọn (mặc định ẩn như đề thật). */
  const [optionTextShown, setOptionTextShown] = useState<Set<string>>(() => new Set());
  // Runner chỉ render phía client (sau khi tải đề) nên đọc localStorage ở initializer là an toàn.
  const [fontStep, setFontStep] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(FONT_KEY));
      return saved > 0 && saved < FONT_SIZES.length ? saved : 0;
    } catch {
      return 0;
    }
  });

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const pending = useRef(new Set<string>());
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!user) rememberGuestAttempt(view.id);
  }, [user, view.id]);

  const cycleFont = () => {
    const next = (fontStep + 1) % FONT_SIZES.length;
    setFontStep(next);
    try {
      localStorage.setItem(FONT_KEY, String(next));
    } catch {
      // bỏ qua
    }
  };

  // ------------------------------------------------------------ timer
  // Độ lệch đồng hồ máy người dùng so với server, tính một lần khi mở đề.
  const [clockOffset] = useState(() => new Date(view.serverNow).getTime() - Date.now());
  const startedAt = new Date(view.startedAt).getTime();
  const deadline = view.timeLimitSeconds ? startedAt + view.timeLimitSeconds * 1000 : null;
  const [now, setNow] = useState(() => Date.now() + clockOffset);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() + clockOffset), 1000);
    return () => clearInterval(timer);
  }, [clockOffset]);
  const remaining = deadline ? Math.max(0, Math.round((deadline - now) / 1000)) : null;
  const elapsed = Math.max(0, Math.round((now - startedAt) / 1000));

  // ------------------------------------------------------------ autosave
  const flush = useCallback(
    async (keepalive = false) => {
      if (pending.current.size === 0 || submittedRef.current) return;
      const ids = [...pending.current];
      pending.current.clear();
      setSaveState("saving");
      try {
        await api(`/attempts/${view.id}/answers`, {
          method: "PUT",
          json: { answers: ids.map((questionId) => ({ questionId, ...answersRef.current[questionId] })) },
          keepalive,
        });
        setSaveState("saved");
      } catch {
        ids.forEach((qid) => pending.current.add(qid));
        setSaveState("error");
      }
    },
    [view.id],
  );

  useEffect(() => {
    if (pending.current.size === 0) return;
    const timer = setTimeout(() => void flush(), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [answers, flush]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush(true);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flush]);

  const update = useCallback((questionId: string, patch: Partial<AnswerState>) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: { ...prev[questionId], ...patch } };
      answersRef.current = next;
      return next;
    });
    pending.current.add(questionId);
  }, []);

  // ------------------------------------------------------------ actions
  const entry = entries[current];
  const go = useCallback(
    (index: number) => {
      setCurrent(Math.max(0, Math.min(entries.length - 1, index)));
      setNavOpen(false);
      setRevealError(null);
    },
    [entries.length],
  );

  const select = useCallback(
    async (target: AttemptEntry, index: number) => {
      const qid = target.question.id;
      if (reveals[qid] || submittedRef.current) return;

      if (!view.instantFeedback) {
        const same = answersRef.current[qid]?.selectedIndex === index;
        update(qid, { selectedIndex: same ? null : index });
        return;
      }
      update(qid, { selectedIndex: index });
      try {
        const result = await api<RevealResult>(`/attempts/${view.id}/reveal`, {
          method: "POST",
          json: { questionId: qid, selectedIndex: index },
        });
        setReveals((prev) => ({ ...prev, [qid]: result }));
      } catch (error) {
        setRevealError(error instanceof ApiError ? error.message : "Không kiểm tra được đáp án, thử lại nhé.");
      }
    },
    [reveals, view.id, view.instantFeedback, update],
  );

  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    pending.current.clear();
    try {
      await api(`/attempts/${view.id}/submit`, {
        method: "POST",
        json: {
          answers: Object.entries(answersRef.current).map(([questionId, a]) => ({ questionId, ...a })),
        },
      });
      await mutate(`/attempts/${view.id}`, undefined, { revalidate: false });
      router.replace(`/attempts/${view.id}/result`);
    } catch (error) {
      submittedRef.current = false;
      setSubmitting(false);
      setSubmitError(error instanceof ApiError ? error.message : "Nộp bài không thành công, vui lòng thử lại.");
    }
  }, [view.id, mutate, router]);

  // Hết giờ → tự nộp.
  useEffect(() => {
    if (remaining === 0 && !submittedRef.current) void submit();
  }, [remaining, submit]);

  // Phím tắt.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, dialog[open]") || event.metaKey || event.ctrlKey || event.altKey) return;
      if (!entry) return;
      if (["1", "2", "3", "4"].includes(event.key)) {
        const index = Number(event.key) - 1;
        if (index < entry.question.options.length) void select(entry, index);
      } else if (event.key === "ArrowRight" || (event.key === "Enter" && reveals[entry.question.id])) {
        go(current + 1);
      } else if (event.key === "ArrowLeft") {
        go(current - 1);
      } else if (event.key.toLowerCase() === "f") {
        update(entry.question.id, { flagged: !answersRef.current[entry.question.id]?.flagged });
      } else {
        return;
      }
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entry, current, go, select, reveals, update]);

  // ------------------------------------------------------------ derived
  const stateOf = useCallback(
    (e: AttemptEntry): EntryState => ({
      answered: answers[e.question.id]?.selectedIndex != null,
      flagged: answers[e.question.id]?.flagged ?? false,
      correct: reveals[e.question.id]?.isCorrect,
    }),
    [answers, reveals],
  );
  const answeredCount = entries.filter((e) => answers[e.question.id]?.selectedIndex != null).length;
  const flaggedCount = entries.filter((e) => answers[e.question.id]?.flagged).length;
  const unanswered = entries.length - answeredCount;
  const exitHref = view.examSlug ? `/exams/${view.examSlug}` : `/${view.level.toLowerCase()}`;

  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorNotice message="Lượt làm bài này không có câu hỏi." />
      </div>
    );
  }

  const question = entry.question;
  const answer = answers[question.id];
  const reveal = reveals[question.id];
  const passage = question.passageId ? view.passages[question.passageId] : undefined;
  const blank = blankNumber(question.prompt);
  const listening = isListening(question.type);
  const spokenOptions = SPOKEN_OPTIONS.has(question.type);
  const hideOptionText = spokenOptions && !reveal && !optionTextShown.has(question.id);
  const lowTime = remaining !== null && remaining <= 300;
  const isLast = current === entries.length - 1;

  return (
    <div
      className="flex flex-1 flex-col"
      style={{ "--q-size": FONT_SIZES[fontStep] } as React.CSSProperties}
    >
      {/* Thanh trên cùng */}
      <div className="sticky top-14 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <Link
            href={exitHref}
            className="flex items-center gap-1 rounded-md p-1.5 text-sm text-muted hover:bg-subtle hover:text-foreground"
            title="Thoát (bài làm đã được lưu, có thể làm tiếp sau)"
          >
            <LogOut className="size-4 rotate-180" />
            <span className="hidden sm:inline">Thoát</span>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{view.title}</p>
            <div className="flex items-center gap-2">
              <ProgressBar value={(answeredCount / entries.length) * 100} className="h-1.5 w-28 sm:w-40" />
              <span className="text-xs text-muted tabular-nums">
                {answeredCount}/{entries.length}
              </span>
              <SaveIndicator state={saveState} />
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm tabular-nums",
              lowTime ? "bg-danger-soft text-danger" : "bg-subtle",
            )}
            title={remaining !== null ? "Thời gian còn lại" : "Thời gian đã làm"}
          >
            <Clock className="size-4" />
            {formatClock(remaining ?? elapsed)}
          </div>
          <button
            type="button"
            onClick={cycleFont}
            className="hidden rounded-md p-2 text-muted hover:bg-subtle hover:text-foreground sm:block"
            title="Đổi cỡ chữ"
          >
            <Type className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="hidden rounded-md p-2 text-muted hover:bg-subtle hover:text-foreground lg:block"
            title="Phím tắt"
          >
            <Keyboard className="size-4" />
          </button>
          <Button size="sm" onClick={() => setSubmitOpen(true)} disabled={submitting}>
            Nộp bài
          </Button>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 pb-28 lg:pb-8 xl:grid-cols-[1fr_17rem]">
        <div className="min-w-0">
          {/* Tiêu đề 問題 */}
          <div className="mb-4 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {view.sections.length > 1 && <span className="jp text-xs text-muted">{entry.section.title}</span>}
              <span className="jp font-semibold">問題{entry.mondai.number}</span>
              <span className="jp text-muted">{entry.mondai.nameJa}</span>
              <Badge tone="primary">{entry.mondai.nameVi}</Badge>
            </div>
            <p className="jp text-sm text-muted">{entry.mondai.instruction}</p>
            <p className="text-xs text-muted">{entry.mondai.instructionVi}</p>
          </div>

          <div className={cn("grid gap-5", passage && !listening && "lg:grid-cols-2")}>
            {passage && !listening && (
              <PassageBox
                key={passage.id}
                content={passage.content}
                title={passage.title}
                highlightBlank={blank}
                className="max-h-[45vh] overflow-y-auto lg:sticky lg:top-32 lg:max-h-[calc(100vh-10rem)] [&_.jp]:text-(length:--q-size)"
              />
            )}

            <div className="min-w-0 space-y-4">
              {passage && listening && (
                <ListeningPlayer
                  key={question.id}
                  script={passage.content}
                  spokenOptions={spokenOptions ? question.options : undefined}
                  showTranscript={!!reveal}
                />
              )}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-muted">Câu {entry.number}</span>
                  <button
                    type="button"
                    onClick={() => update(question.id, { flagged: !answer?.flagged })}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                      answer?.flagged
                        ? "bg-warning-soft text-warning"
                        : "text-muted hover:bg-subtle",
                    )}
                    title="Đánh dấu để xem lại (phím F)"
                  >
                    <Flag className="size-3.5" />
                    {answer?.flagged ? "Đã đánh dấu" : "Đánh dấu"}
                  </button>
                </div>
                <div className="mb-4 text-(length:--q-size)">
                  {question.type === "USAGE" ? (
                    <JpText text={question.prompt} className="text-[1.4em] font-semibold" />
                  ) : blank !== undefined ? (
                    <p>
                      Chọn từ phù hợp cho chỗ trống <JpText text={question.prompt} />
                      {passage ? " trong đoạn văn." : ""}
                    </p>
                  ) : (
                    <JpText text={question.prompt} className="block" />
                  )}
                </div>
                <div key={question.id} className="[&_.jp]:text-(length:--q-size)">
                  <OptionList
                    options={question.options}
                    selectedIndex={answer?.selectedIndex ?? null}
                    answerIndex={reveal?.answerIndex}
                    onSelect={(index) => void select(entry, index)}
                    disabled={!!reveal || submitting}
                    hideText={hideOptionText}
                  />
                </div>
                {hideOptionText && (
                  <button
                    type="button"
                    className="mt-3 text-xs text-muted underline hover:text-foreground"
                    onClick={() => setOptionTextShown((prev) => new Set(prev).add(question.id))}
                  >
                    Các lựa chọn được đọc trong bài nghe — hiện chữ để luyện dễ hơn
                  </button>
                )}
                {revealError && <p className="mt-3 text-sm text-danger">{revealError}</p>}
              </div>

              {reveal && (
                <div
                  className={cn(
                    "rounded-xl border p-4",
                    reveal.isCorrect
                      ? "border-success/40 bg-success-soft"
                      : "border-danger/40 bg-danger-soft",
                  )}
                >
                  <p className="flex items-center gap-2 font-semibold">
                    {reveal.isCorrect ? (
                      <><CheckCircle2 className="size-5 text-success" /> Chính xác!</>
                    ) : (
                      <><XCircle className="size-5 text-danger" /> Chưa đúng — đáp án là {reveal.answerIndex + 1}</>
                    )}
                  </p>
                  {reveal.explanation && (
                    <JpText text={reveal.explanation} className="mt-2 block text-sm" />
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Badge>{SOURCE_LABEL[question.source] ?? question.source}</Badge>
                    <BookmarkButton questionId={question.id} initial={question.bookmarked} />
                    <ReportButton questionId={question.id} />
                  </div>
                </div>
              )}

              {/* Điều hướng */}
              <div className="hidden items-center justify-between gap-2 lg:flex">
                <Button variant="secondary" onClick={() => go(current - 1)} disabled={current === 0}>
                  <ArrowLeft className="size-4" /> Câu trước
                </Button>
                {isLast ? (
                  <Button onClick={() => setSubmitOpen(true)}>Nộp bài</Button>
                ) : (
                  <Button variant={reveal ? "primary" : "secondary"} onClick={() => go(current + 1)}>
                    Câu tiếp <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl border border-border bg-card p-4">
            <QuestionNavigator entries={entries} current={current} stateOf={stateOf} onJump={go} />
          </div>
        </aside>
      </div>

      {/* Thanh điều hướng trên mobile / tablet */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2">
          <Button variant="secondary" size="sm" onClick={() => go(current - 1)} disabled={current === 0} aria-label="Câu trước">
            <ArrowLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setNavOpen(true)}>
            <LayoutGrid className="size-4" /> Câu {entry.number} · {answeredCount}/{entries.length}
          </Button>
          {isLast ? (
            <Button size="sm" onClick={() => setSubmitOpen(true)}>Nộp bài</Button>
          ) : (
            <Button variant={reveal ? "primary" : "secondary"} size="sm" onClick={() => go(current + 1)} aria-label="Câu tiếp">
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="mx-auto hidden w-full max-w-6xl px-4 pb-8 lg:block xl:hidden">
        <div className="rounded-xl border border-border bg-card p-4">
          <QuestionNavigator entries={entries} current={current} stateOf={stateOf} onJump={go} />
        </div>
      </div>

      <Dialog open={navOpen} onClose={() => setNavOpen(false)} title="Danh sách câu hỏi">
        <div className="max-h-[65vh] overflow-y-auto">
          <QuestionNavigator entries={entries} current={current} stateOf={stateOf} onJump={go} />
        </div>
      </Dialog>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Phím tắt">
        <ul className="space-y-2 text-sm">
          <li><Kbd>1</Kbd>–<Kbd>4</Kbd> Chọn đáp án</li>
          <li><Kbd>←</Kbd> / <Kbd>→</Kbd> Câu trước / câu tiếp</li>
          <li><Kbd>F</Kbd> Đánh dấu câu để xem lại</li>
          <li><Kbd>Enter</Kbd> Sang câu tiếp sau khi xem đáp án (chế độ luyện tập)</li>
        </ul>
      </Dialog>

      <Dialog open={submitOpen} onClose={() => !submitting && setSubmitOpen(false)} title="Nộp bài?">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Đã làm" value={answeredCount} />
            <Stat label="Chưa làm" value={unanswered} tone={unanswered ? "warning" : undefined} />
            <Stat label="Đánh dấu" value={flaggedCount} />
          </div>
          {unanswered > 0 && (
            <p className="flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              Bạn còn {unanswered} câu chưa trả lời. Các câu bỏ trống sẽ tính là sai.
            </p>
          )}
          {remaining !== null && <p className="text-muted">Thời gian còn lại: {formatClock(remaining)}</p>}
          {submitError && <p className="text-danger">{submitError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSubmitOpen(false)} disabled={submitting}>
              Làm tiếp
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Đang chấm bài…" : "Nộp bài & xem kết quả"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  const label = { saving: "Đang lưu…", saved: "Đã lưu", error: "Chưa lưu được — sẽ thử lại" }[state];
  return <span className={cn("hidden text-xs sm:inline", state === "error" ? "text-danger" : "text-muted")}>{label}</span>;
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warning" }) {
  return (
    <div className={cn("rounded-lg bg-subtle p-3", tone === "warning" && "bg-warning-soft")}>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 rounded border border-border bg-subtle px-1.5 py-0.5 font-mono text-xs">{children}</kbd>
  );
}

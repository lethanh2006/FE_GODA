"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorNotice } from "@/components/ui/feedback";
import { Furigana } from "@/components/vocab/furigana";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { GrammarFeedback, GrammarQuestion } from "@/lib/grammar";

export function GrammarExercise({
  question,
  chapter,
  number,
  total,
  onChecked,
  onNext,
}: {
  question: GrammarQuestion;
  chapter: number;
  number: number;
  total: number;
  onChecked: (feedback: GrammarFeedback) => void;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<GrammarFeedback | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const result = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus();
  }, []);
  useEffect(() => {
    if (feedback) result.current?.focus();
  }, [feedback]);
  const ready =
    question.kind === "choice"
      ? selected.length === 1
      : selected.length === question.options.length;
  const locked = pending || feedback !== null;
  async function check() {
    if (!ready || locked) return;
    setPending(true);
    setError("");
    try {
      const response = await api<GrammarFeedback>(
        `/grammar/n4/${chapter}/answers`,
        { method: "POST", json: { questionId: question.id, answer: selected } },
      );
      if (!alive.current) return;
      setFeedback(response);
      onChecked(response);
    } catch {
      setError("Chưa kiểm tra được câu trả lời. Bạn thử lại nhé.");
    } finally {
      setPending(false);
    }
  }
  const sentence = feedback
    ? `${question.prefix}${feedback.expected.map((index) => question.options[index]).join("")}${question.suffix}`
    : "";
  return (
    <section className="space-y-5" aria-busy={pending}>
      <p className="text-sm font-semibold text-muted">
        Thử ngay · Câu {number}/{total}
      </p>
      <h3
        ref={title}
        tabIndex={-1}
        className="text-xl leading-relaxed font-semibold outline-none"
      >
        <Furigana text={question.prompt} />
      </h3>
      {question.kind === "choice" ? (
        <fieldset disabled={locked} className="space-y-3">
          <legend className="sr-only">Chọn một đáp án</legend>
          {question.options.map((option, index) => (
            <label
              key={index}
              className={cn(
                "flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 focus-within:outline-2 focus-within:outline-primary",
                selected[0] === index
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card",
                locked && "cursor-default",
              )}
            >
              <input
                type="radio"
                name={question.id}
                value={index}
                checked={selected[0] === index}
                onChange={() => setSelected([index])}
                className="size-4 shrink-0 accent-primary"
              />
              <span
                className="jp min-w-0 text-xl leading-loose wrap-anywhere"
                lang="ja"
              >
                <Furigana text={option} />
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">{question.translation}</p>
          <div className="rounded-xl border border-primary/30 bg-primary-soft p-4">
            <p className="jp text-xl leading-loose wrap-anywhere" lang="ja">
              <Furigana text={question.prefix} />
              <span className="mx-1 text-muted">［ phần cần ghép ］</span>
              <Furigana text={question.suffix} />
            </p>
            <ol
              aria-label="Các mảnh đã ghép; chọn một mảnh để bỏ"
              className="mt-3 flex min-h-12 flex-wrap items-center gap-2"
            >
              {selected.map((index, position) => (
                <li key={index}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      setSelected((current) =>
                        current.filter((_, item) => item !== position),
                      )
                    }
                    aria-label={`Bỏ mảnh ${position + 1}: ${question.options[index].replace(/\{([^|{}]+)\|[^|{}]+\}/g, "$1")}`}
                    className="jp min-h-11 rounded-lg border border-primary/40 bg-card px-3 py-2 text-lg focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-80"
                    lang="ja"
                  >
                    <Furigana text={question.options[index]} />
                  </button>
                </li>
              ))}
              {!selected.length && (
                <li className="text-sm text-muted">
                  Chọn các mảnh bên dưới theo thứ tự.
                </li>
              )}
            </ol>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Các mảnh để chọn">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="secondary"
                disabled={locked || selected.includes(index)}
                onClick={() => setSelected((current) => [...current, index])}
                className="jp min-h-12 whitespace-normal text-lg leading-loose"
                lang="ja"
              >
                <Furigana text={option} />
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted" aria-live="polite">
              Đã ghép {selected.length}/{question.options.length} mảnh. Bấm mảnh
              đã ghép để bỏ.
            </p>
            <Button
              variant="ghost"
              disabled={locked || !selected.length}
              onClick={() => setSelected([])}
            >
              Ghép lại
            </Button>
          </div>
        </div>
      )}
      {error && (
        <div role="alert">
          <ErrorNotice message={error} />
        </div>
      )}
      {feedback ? (
        <>
          <div
            ref={result}
            tabIndex={-1}
            role="status"
            className={cn(
              "space-y-3 rounded-xl border p-4 outline-none sm:p-5",
              feedback.correct
                ? "border-success/30 bg-success-soft"
                : "border-warning/40 bg-warning-soft",
            )}
          >
            <p className="font-bold">
              {feedback.correct
                ? "Đúng rồi."
                : "Chưa đúng — cùng xem cách ghép nhé."}
            </p>
            <p className="jp text-xl leading-loose wrap-anywhere" lang="ja">
              <Furigana text={sentence} />
            </p>
            <p className="leading-relaxed">
              <Furigana text={feedback.explanation} />
            </p>
            {!feedback.correct && (
              <p className="text-sm text-muted">
                Câu này đã được lưu để luyện lại.
              </p>
            )}
          </div>
          <Button size="lg" onClick={onNext}>
            {number < total ? "Câu tiếp theo" : "Xem kết quả"}
          </Button>
        </>
      ) : (
        <div className="space-y-2">
          <Button
            size="lg"
            disabled={!ready || pending}
            onClick={() => void check()}
          >
            {pending ? "Đang kiểm tra…" : "Kiểm tra"}
          </Button>
          {!ready && (
            <p className="text-sm text-muted">
              {question.kind === "choice"
                ? "Chọn một đáp án trước khi kiểm tra."
                : "Ghép đủ các mảnh trước khi kiểm tra."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

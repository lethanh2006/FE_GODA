"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { JpText } from "./jp-text";

/**
 * Danh sách 4 đáp án đánh số 1–4 như đề JLPT.
 * Khi có `answerIndex` (đã xem đáp án / đã nộp) sẽ tô đúng/sai.
 */
export function OptionList({
  options,
  selectedIndex,
  answerIndex,
  onSelect,
  disabled,
  compact,
  hideText,
}: {
  options: string[];
  selectedIndex: number | null;
  answerIndex?: number;
  onSelect?: (index: number) => void;
  disabled?: boolean;
  compact?: boolean;
  /** Chỉ hiện số thứ tự (lựa chọn được đọc trong bài nghe). */
  hideText?: boolean;
}) {
  const graded = answerIndex !== undefined;
  const longOptions = options.some((o) => o.length > 18);

  return (
    <div className={cn("grid gap-2", hideText ? "grid-cols-3 sm:grid-cols-4" : !longOptions && !compact && "sm:grid-cols-2")}>
      {options.map((option, index) => {
        const selected = selectedIndex === index;
        const correct = graded && index === answerIndex;
        const wrong = graded && selected && index !== answerIndex;
        return (
          <button
            key={index}
            type="button"
            disabled={disabled || !onSelect}
            onClick={() => onSelect?.(index)}
            className={cn(
              "group flex w-full items-start gap-3 rounded-xl border px-3 text-left transition-colors",
              compact ? "py-2" : "py-3",
              !graded && selected && "border-primary bg-primary-soft",
              !graded && !selected && "border-border bg-card hover:border-primary/50 hover:bg-subtle",
              correct && "border-success bg-success-soft",
              wrong && "border-danger bg-danger-soft",
              graded && !correct && !wrong && "border-border bg-card opacity-80",
              "disabled:cursor-default",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                !graded && selected && "border-primary bg-primary text-primary-foreground",
                !graded && !selected && "border-border text-muted group-hover:border-primary/50",
                correct && "border-success bg-success text-on-status",
                wrong && "border-danger bg-danger text-on-status",
                graded && !correct && !wrong && "border-border text-muted",
              )}
            >
              {correct ? <Check className="size-4" /> : wrong ? <X className="size-4" /> : index + 1}
            </span>
            {hideText ? (
              <span className="flex-1 text-sm text-muted">Phương án {index + 1}</span>
            ) : (
              <JpText text={option} className="min-w-0 flex-1 break-words text-[15px] sm:text-base" />
            )}
          </button>
        );
      })}
    </div>
  );
}

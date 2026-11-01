import { cn } from "@/lib/cn";
import type { WordSummary } from "@/lib/vocab";

/** Nhãn báo nghĩa tiếng Việt lọc tự động; người học cần đối chiếu với nghĩa tiếng Anh. */
export function AutoMeaningNote({ viSource, className }: { viSource: string | null; className?: string }) {
  if (viSource === "goda") return null;
  return (
    <p className={cn("text-xs text-muted", className)}>
      {viSource === "ovdp"
        ? "Nghĩa tiếng Việt lọc tự động từ từ điển mở, có thể chưa chính xác — hãy đối chiếu với nghĩa tiếng Anh."
        : "Chưa có nghĩa tiếng Việt cho từ này."}
    </p>
  );
}

/** Nghĩa của từ: tiếng Việt trước; nghĩa tiếng Anh luôn hiện kèm khi nghĩa Việt chưa được soát tay. */
export function WordMeaning({
  word,
  className,
  compact,
}: {
  word: Pick<WordSummary, "meaningsVi" | "meaningsEn" | "viSource">;
  className?: string;
  compact?: boolean;
}) {
  const showEnglish = word.viSource !== "goda" && word.meaningsEn.length > 0;
  return (
    <div className={cn("min-w-0 space-y-0.5", className)}>
      {word.meaningsVi.length > 0 && (
        <p className={cn("text-foreground", compact && "truncate text-sm")}>{word.meaningsVi.join("; ")}</p>
      )}
      {showEnglish && (
        <p className={cn("text-muted", compact ? "truncate text-xs" : "text-sm")}>
          <span lang="en">{word.meaningsEn.join("; ")}</span>
        </p>
      )}
    </div>
  );
}

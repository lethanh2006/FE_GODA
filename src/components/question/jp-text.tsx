import { Fragment } from "react";
import { cn } from "@/lib/cn";

const TOKEN = /(《[^》]*》|（[\s　]*\d*[\s　]*）|＿＿|★)/g;

/**
 * Hiển thị đề bài theo quy ước dữ liệu:
 * 《…》 gạch chân · （　）/（　3　） ô trống · ＿＿ ô sắp xếp · ★ ô cần chọn.
 */
export function JpText({
  text,
  className,
  highlightBlank,
}: {
  text: string;
  className?: string;
  /** Số ô trống cần làm nổi bật (文章の文法). */
  highlightBlank?: number;
}) {
  const parts = text.split(TOKEN);
  return (
    <span className={cn("jp whitespace-pre-line", className)}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("《") && part.endsWith("》")) {
          return (
            <span key={i} className="underline decoration-2 underline-offset-[7px]">
              {part.slice(1, -1)}
            </span>
          );
        }
        if (/^（[\s　]*\d*[\s　]*）$/.test(part)) {
          const number = part.match(/\d+/)?.[0];
          const active = number !== undefined && Number(number) === highlightBlank;
          return (
            <span
              key={i}
              className={cn(
                "mx-0.5 inline-flex min-w-14 items-center justify-center rounded border px-2 text-sm leading-7",
                active ? "border-primary bg-primary-soft font-semibold text-primary" : "border-muted/50",
              )}
            >
              {number ?? "　"}
            </span>
          );
        }
        if (part === "＿＿") {
          return <span key={i} className="mx-1 inline-block w-14 border-b-2 border-muted/70 align-baseline" />;
        }
        if (part === "★") {
          return (
            <span key={i} className="mx-1 inline-flex w-14 justify-center border-b-2 border-primary align-baseline text-primary">
              ★
            </span>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </span>
  );
}

export function PassageBox({
  content,
  title,
  highlightBlank,
  className,
}: {
  content: string;
  title?: string | null;
  highlightBlank?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-subtle/40 p-4 sm:p-5", className)}>
      {title && <p className="jp mb-2 font-semibold">{title}</p>}
      <JpText text={content} highlightBlank={highlightBlank} className="block text-[15px] sm:text-base" />
    </div>
  );
}

/** Số ô trống trong prompt dạng （　3　）. */
export const blankNumber = (prompt: string) => {
  const match = prompt.match(/^（[\s　]*(\d+)[\s　]*）$/);
  return match ? Number(match[1]) : undefined;
};

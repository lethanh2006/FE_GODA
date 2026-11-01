import { X } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/feedback";

const EXIT_CLASS =
  "flex size-10 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-subtle hover:text-foreground";

/** Thanh trên của phiên học tập trung: nút thoát, tiêu đề, tiến độ. */
export function FocusBar({
  exitHref,
  onExit,
  title,
  done,
  total,
}: {
  exitHref?: string;
  /** Phiên chạy ngay trong trang hiện tại thì thoát bằng hàm này thay vì chuyển trang. */
  onExit?: () => void;
  title: string;
  done: number;
  total: number;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        {onExit ? (
          <button type="button" onClick={onExit} aria-label="Thoát" title="Thoát" className={EXIT_CLASS}>
            <X className="size-5" aria-hidden />
          </button>
        ) : (
          <Link href={exitHref ?? "/"} aria-label="Thoát" title="Thoát" className={EXIT_CLASS}>
            <X className="size-5" aria-hidden />
          </Link>
        )}
        <span className="hidden shrink-0 text-sm font-semibold sm:block">{title}</span>
        <ProgressBar value={total ? (done / total) * 100 : 0} className="flex-1" />
        <span className="shrink-0 text-sm text-muted tabular-nums">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

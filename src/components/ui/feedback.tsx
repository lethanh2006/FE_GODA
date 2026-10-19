import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn("size-5 animate-spin text-muted", className)} aria-hidden />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-subtle", className)} />;
}

export function PageLoading({ label = "Đang tải…" }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center gap-3 py-24 text-sm text-muted">
      <Spinner /> {label}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      {icon && <div className="text-muted">{icon}</div>}
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-md text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorNotice({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
      <span>{message}</span>
      {action}
    </div>
  );
}

/** Meter: phần tô mang trạng thái, track là tông nhạt của cùng dải màu; đầu dữ liệu bo 4px, gốc vuông. */
export function ProgressBar({
  value,
  className,
  tone = "primary",
  marker,
}: {
  value: number;
  className?: string;
  tone?: "primary" | "success" | "danger" | "warning";
  /** Vạch mốc (vd điểm đỗ), tính theo %. */
  marker?: number;
}) {
  const fills = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    danger: "bg-red-500",
    warning: "bg-amber-500",
  };
  const tracks = {
    primary: "bg-primary-soft",
    success: "bg-emerald-100 dark:bg-emerald-950",
    danger: "bg-red-100 dark:bg-red-950",
    warning: "bg-amber-100 dark:bg-amber-950",
  };
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative h-2 rounded-[4px]", tracks[tone], className)}>
      <div
        className={cn("h-full rounded-r-[4px] transition-[width]", fills[tone], width >= 100 && "rounded-[4px]")}
        style={{ width: `${width}%` }}
      />
      {marker !== undefined && (
        <div
          className="absolute -top-1 -bottom-1 w-0.5 rounded bg-foreground/70"
          style={{ left: `${Math.max(0, Math.min(100, marker))}%` }}
          aria-hidden
        />
      )}
    </div>
  );
}

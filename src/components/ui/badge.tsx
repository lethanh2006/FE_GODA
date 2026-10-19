import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { LEVEL_META } from "@/lib/jlpt";
import type { JlptLevel } from "@/lib/types";

type Tone = "neutral" | "primary" | "success" | "danger" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-subtle text-muted",
  primary: "bg-primary-soft text-primary",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}

export function LevelBadge({ level, className }: { level: JlptLevel; className?: string }) {
  return <Badge className={cn("font-bold", LEVEL_META[level].badge, className)}>{level}</Badge>;
}

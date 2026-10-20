import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import type { JlptLevel } from "@/lib/types";

type Tone = "neutral" | "primary" | "success" | "danger" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-subtle text-muted",
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
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
  return (
    <Badge className={cn("border border-border-strong bg-card font-semibold text-foreground", className)}>{level}</Badge>
  );
}

import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  // Nút "nổi khối": bóng đáy đặc, bấm thì lún xuống.
  primary:
    "border border-primary bg-primary text-primary-foreground shadow-[0_3px_0_0_color-mix(in_srgb,var(--primary)_62%,#000)] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_0_color-mix(in_srgb,var(--primary)_62%,#000)]",
  secondary:
    "border border-border bg-card text-foreground shadow-[0_3px_0_0_var(--border)] hover:border-primary/30 hover:bg-subtle active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--border)]",
  ghost: "text-muted hover:bg-subtle hover:text-foreground",
  danger:
    "border border-danger bg-danger text-on-status shadow-[0_3px_0_0_color-mix(in_srgb,var(--danger)_62%,#000)] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_0_color-mix(in_srgb,var(--danger)_62%,#000)]",
  success:
    "border border-success bg-success text-on-status shadow-[0_3px_0_0_color-mix(in_srgb,var(--success)_62%,#000)] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_0_color-mix(in_srgb,var(--success)_62%,#000)]",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3.5 text-[13px]",
  md: "min-h-11 px-4.5 text-sm",
  lg: "min-h-12 px-6 text-[15px]",
};

export interface ButtonStyleProps {
  variant?: Variant;
  size?: Size;
}

export const buttonClass = ({ variant = "primary", size = "md" }: ButtonStyleProps = {}, extra?: string) =>
  cn(base, variants[variant], sizes[size], extra);

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonStyleProps) {
  return <button type={type} className={buttonClass({ variant, size }, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonStyleProps) {
  return <Link className={buttonClass({ variant, size }, className)} {...props} />;
}

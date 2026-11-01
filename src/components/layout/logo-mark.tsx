import { cn } from "@/lib/cn";

/** Logo GODA: dấu triện chữ 合 (合格 — đỗ), vẽ bằng nét để không phụ thuộc font. Màu lấy từ .logo-mark trong globals.css. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("logo-mark", className)}>
      <rect className="logo-mark-seal" width="64" height="64" rx="16" />
      <path className="logo-mark-ink" d="M32 10 9.5 30M32 10l22.5 20M21 33h22" />
      <rect className="logo-mark-ink" x="19" y="40" width="26" height="15" rx="2.5" />
    </svg>
  );
}

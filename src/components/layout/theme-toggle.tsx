"use client";

import { Moon, Sun } from "lucide-react";
import { Segmented } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { setThemeChoice, useResolvedTheme, useThemeChoice, type ThemeChoice } from "@/lib/theme";

/** Nút trên header: chuyển nhanh giữa sáng và tối. */
export function ThemeToggle({ className }: { className?: string }) {
  const resolved = useResolvedTheme();
  const dark = resolved === "dark";
  const label = dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối";

  return (
    <button
      type="button"
      onClick={() => setThemeChoice(dark ? "light" : "dark")}
      className={cn(
        "flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-foreground",
        className,
      )}
      aria-label={label}
      title={label}
    >
      {/* Chưa biết giao diện (lúc render trên server) thì giữ chỗ trống để không nhảy icon. */}
      {resolved === null ? <span className="size-[18px]" /> : dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Sáng" },
  { value: "dark", label: "Tối" },
  { value: "system", label: "Theo hệ thống" },
];

/** Lựa chọn đầy đủ (gồm "theo hệ thống") cho trang cài đặt. */
export function ThemeSelect() {
  const choice = useThemeChoice();
  return <Segmented value={choice} onChange={setThemeChoice} options={OPTIONS} />;
}

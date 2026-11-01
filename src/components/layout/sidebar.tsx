"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { isNavActive, NAV_ACCOUNT, NAV_ADMIN, NAV_MAIN, NAV_MORE, type NavLink } from "@/lib/nav";
import type { StudyStats } from "@/lib/vocab";
import { Logo } from "./header";
import { ThemeToggle } from "./theme-toggle";

/** Số từ đến hạn, hiện cạnh mục Ôn tập. */
export function useDueCount(enabled: boolean) {
  const { data } = useSWR<StudyStats>(enabled ? "/study/stats" : null);
  return data?.due ?? 0;
}

export function DueBadge({ count, className }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span
      title={`${count} từ cần ôn`}
      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-soft px-1.5 text-xs font-bold text-primary ${className ?? ""}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Thanh bên cố định khi đã đăng nhập (màn hình ≥ lg). Trạng thái ẩn hiện theo trang nằm ở globals.css. */
export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const due = useDueCount(!!user);
  if (!user) return null;

  const item = (link: NavLink) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={isNavActive(pathname, link.href) ? "page" : undefined}
      className="nav-item"
    >
      <link.icon className="size-[18px] shrink-0" aria-hidden />
      <span className="truncate">{link.label}</span>
      {link.href === "/on-tap" && <DueBadge count={due} className="ml-auto" />}
    </Link>
  );

  return (
    <aside className="sidebar fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto border-r border-border bg-card p-4 lg:flex">
      <div className="mb-6 px-1 pt-1">
        <Logo tagline={false} />
      </div>
      <nav className="space-y-1" aria-label="Điều hướng học tập">
        {NAV_MAIN.map(item)}
        <div className="my-3 border-t border-border" />
        {NAV_MORE.map(item)}
      </nav>
      <div className="mt-auto space-y-1 pt-6">
        {NAV_ACCOUNT.map(item)}
        {user.role === "ADMIN" && item(NAV_ADMIN)}
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            {user.displayName.trim().charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{user.displayName}</span>
          <ThemeToggle />
          <button
            type="button"
            title="Đăng xuất"
            aria-label="Đăng xuất"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-danger"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  );
}

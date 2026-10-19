"use client";

import { BarChart3, BookMarked, History, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LEVELS } from "@/lib/jlpt";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight whitespace-nowrap" onClick={() => setMobileOpen(false)}>
          <span className="jp flex size-8 items-center justify-center rounded-lg bg-red-600 text-sm leading-none text-white">
            合
          </span>
          <span>GODA JLPT</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LEVELS.map((level) => (
            <Link
              key={level}
              href={`/${level.toLowerCase()}`}
              className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-muted hover:bg-subtle hover:text-foreground"
            >
              {level}
            </Link>
          ))}
          <span className="mx-2 h-5 w-px bg-border" />
          <Link href="/practice" className="rounded-md px-2.5 py-1.5 text-sm text-muted hover:bg-subtle hover:text-foreground">
            Luyện tập
          </Link>
          <Link href="/dashboard" className="rounded-md px-2.5 py-1.5 text-sm text-muted hover:bg-subtle hover:text-foreground">
            Tiến độ
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <UserMenu />
          <button
            type="button"
            className="rounded-md p-2 text-muted hover:bg-subtle md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border px-4 py-3 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="grid grid-cols-5 gap-2">
            {LEVELS.map((level) => (
              <Link
                key={level}
                href={`/${level.toLowerCase()}`}
                className="rounded-lg border border-border py-2 text-center text-sm font-semibold"
              >
                {level}
              </Link>
            ))}
          </div>
          <div className="mt-3 grid gap-1 text-sm">
            <Link href="/practice" className="rounded-md px-2 py-2 hover:bg-subtle">Luyện tập theo dạng bài</Link>
            <Link href="/dashboard" className="rounded-md px-2 py-2 hover:bg-subtle">Tiến độ học tập</Link>
            <Link href="/history" className="rounded-md px-2 py-2 hover:bg-subtle">Lịch sử làm bài</Link>
            <Link href="/bookmarks" className="rounded-md px-2 py-2 hover:bg-subtle">Câu hỏi đã lưu</Link>
            <Link href="/about" className="rounded-md px-2 py-2 hover:bg-subtle">Giới thiệu & nguồn dữ liệu</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function UserMenu() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (isLoading) return <div className="h-8 w-24 animate-pulse rounded-lg bg-subtle" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <ButtonLink href="/login" variant="ghost" size="sm">
          Đăng nhập
        </ButtonLink>
        <span className="hidden sm:inline-flex">
          <ButtonLink href="/register" size="sm">
            Đăng ký
          </ButtonLink>
        </span>
      </div>
    );
  }

  const items = [
    { href: "/dashboard", label: "Tiến độ học tập", icon: BarChart3 },
    { href: "/history", label: "Lịch sử làm bài", icon: History },
    { href: "/bookmarks", label: "Câu hỏi đã lưu", icon: BookMarked },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-subtle"
        aria-expanded={open}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
          {user.displayName.trim().charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-32 truncate sm:block">{user.displayName}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <UserIcon className="size-4 text-muted" /> {user.displayName}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-subtle"
            >
              <Icon className="size-4 text-muted" /> {label}
            </Link>
          ))}
          <button
            type="button"
            className={cn("flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-subtle")}
            onClick={async () => {
              setOpen(false);
              await logout();
              router.push("/");
            }}
          >
            <LogOut className="size-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

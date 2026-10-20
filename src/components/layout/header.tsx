"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LEVELS } from "@/lib/jlpt";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { href: "/practice", label: "Luyện tập" },
  { href: "/dashboard", label: "Tiến độ" },
];

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap" aria-label="GODA JLPT — trang chủ">
      {/* Dấu triện 合 (合格 — đỗ). */}
      <span className="flex size-8 items-center justify-center rounded-md bg-accent font-serif-jp text-[17px] leading-none text-white">
        合
      </span>
      <span className="text-[15px] font-bold tracking-tight">
        GODA <span className="font-medium text-muted">JLPT</span>
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4">
        <Logo />
        {/* Trạng thái "đang ở trang nào" chỉ có lúc chạy, nên phần dùng usePathname nằm trong Suspense. */}
        <Suspense fallback={<DesktopNav pathname={null} />}>
          <WithPathname render={(pathname) => <DesktopNav pathname={pathname} />} />
        </Suspense>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <UserMenu />
          <Suspense fallback={<MobileMenu pathname={null} />}>
            <WithPathname render={(pathname) => <MobileMenu pathname={pathname} />} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function WithPathname({ render }: { render: (pathname: string) => React.ReactNode }) {
  return render(usePathname());
}

const isActive = (pathname: string | null, href: string) =>
  pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));

function DesktopNav({ pathname }: { pathname: string | null }) {
  return (
    <nav className="hidden items-center gap-6 md:flex" aria-label="Điều hướng chính">
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
        {LEVELS.map((level) => {
          const href = `/${level.toLowerCase()}`;
          const active = isActive(pathname, href);
          return (
            <Link
              key={level}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm font-semibold transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted hover:bg-subtle hover:text-foreground",
              )}
            >
              {level}
            </Link>
          );
        })}
      </div>
      {LINKS.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative py-1 text-sm font-medium transition-colors",
              active
                ? "text-foreground after:absolute after:inset-x-0 after:-bottom-[18px] after:h-0.5 after:bg-primary"
                : "text-muted hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

const MOBILE_LINKS = [
  { href: "/practice", label: "Luyện tập theo dạng bài" },
  { href: "/dashboard", label: "Tiến độ học tập" },
  { href: "/history", label: "Lịch sử làm bài" },
  { href: "/bookmarks", label: "Câu hỏi đã lưu" },
  { href: "/settings", label: "Cài đặt" },
  { href: "/about", label: "Giới thiệu & nguồn dữ liệu" },
];

function MobileMenu({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-foreground md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng menu" : "Mở menu"}
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <nav
          className="absolute inset-x-0 top-full border-b border-border bg-background px-4 pt-3 pb-4 shadow-lg shadow-black/5 md:hidden"
          aria-label="Menu"
        >
          <p className="mb-2 text-xs font-medium text-muted">Cấp độ</p>
          <div className="grid grid-cols-5 gap-2">
            {LEVELS.map((level) => {
              const href = `/${level.toLowerCase()}`;
              return (
                <Link
                  key={level}
                  href={href}
                  onClick={close}
                  className={cn(
                    "rounded-lg border py-2 text-center text-sm font-semibold",
                    isActive(pathname, href) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                  )}
                >
                  {level}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 grid text-sm">
            {MOBILE_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  "border-b border-border py-2.5 last:border-0",
                  isActive(pathname, href) ? "font-semibold" : "text-muted",
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}

function UserMenu() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isLoading) return <div className="h-9 w-24 animate-pulse rounded-lg bg-subtle" />;

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <ButtonLink href="/login" variant="ghost" size="sm">
          Đăng nhập
        </ButtonLink>
        <ButtonLink href="/register" size="sm" className="hidden sm:inline-flex">
          Đăng ký
        </ButtonLink>
      </div>
    );
  }

  const items = [
    { href: "/dashboard", label: "Tiến độ học tập" },
    { href: "/history", label: "Lịch sử làm bài" },
    { href: "/bookmarks", label: "Câu hỏi đã lưu" },
    { href: "/settings", label: "Cài đặt" },
    ...(user.role === "ADMIN" ? [{ href: "/admin/reports", label: "Quản trị · Báo lỗi" }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pr-1.5 pl-1 text-sm hover:bg-subtle"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
          {user.displayName.trim().charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-32 truncate font-medium sm:block">{user.displayName}</span>
        <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/5">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.displayName}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="py-1">
            {items.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-subtle"
              >
                {label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            role="menuitem"
            className="block w-full border-t border-border px-4 py-2.5 text-left text-sm text-danger hover:bg-subtle"
            onClick={async () => {
              setOpen(false);
              await logout();
              router.push("/");
            }}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

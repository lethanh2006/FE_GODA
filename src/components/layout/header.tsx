"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { isNavActive, NAV_ACCOUNT, NAV_ADMIN, NAV_GUEST, NAV_MORE } from "@/lib/nav";
import { ThemeToggle } from "./theme-toggle";

export function Logo({ tagline = true }: { tagline?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap" aria-label="GODA JLPT — trang chủ">
      {/* Dấu triện 合 (合格 — đỗ). */}
      <span className="flex size-10 items-center justify-center rounded-xl bg-accent font-serif-jp text-[21px] leading-none text-white shadow-[0_3px_0_0_color-mix(in_srgb,var(--accent)_62%,#000)] dark:text-[#26110d]">
        合
      </span>
      <span className="flex flex-col">
        <span className="text-[17px] leading-tight font-bold tracking-tight">
          GODA<span className="text-accent">.</span>
        </span>
        {tagline && <span className="text-xs text-muted">Luyện thi JLPT · Học từ · Tra từ</span>}
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="site-header sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-8">
        <Logo />
        {/* Trạng thái "đang ở trang nào" chỉ có lúc chạy, nên phần dùng usePathname nằm trong Suspense. */}
        <Suspense fallback={<DesktopNav pathname={null} />}>
          <WithPathname render={(pathname) => <DesktopNav pathname={pathname} />} />
        </Suspense>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function WithPathname({ render }: { render: (pathname: string) => React.ReactNode }) {
  return render(usePathname());
}

function DesktopNav({ pathname }: { pathname: string | null }) {
  const { user } = useAuth();
  // Đã đăng nhập: điều hướng nằm ở thanh bên / thanh đáy, thanh trên chỉ còn khi làm bài.
  if (user) return null;
  return (
    <nav className="hidden items-center gap-7 md:flex" aria-label="Điều hướng chính">
      {NAV_GUEST.map(({ href, label }) => {
        const active = isNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative py-1 text-sm font-medium transition-colors",
              active
                ? "text-foreground after:absolute after:inset-x-0 after:-bottom-[2px] after:h-0.5 after:bg-primary"
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

  if (isLoading) return <div className="h-9 w-24 animate-pulse rounded-xl bg-subtle" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <ButtonLink href="/login" variant="secondary" size="sm">
          Đăng nhập
        </ButtonLink>
        {/* Bọc span: lớp "hidden" đặt thẳng lên nút sẽ xung đột với "inline-flex" sẵn có của nút. */}
        <span className="hidden sm:inline-flex">
          <ButtonLink href="/register" size="sm">
            Học miễn phí
          </ButtonLink>
        </span>
      </div>
    );
  }

  const items = [...NAV_MORE, ...NAV_ACCOUNT, ...(user.role === "ADMIN" ? [NAV_ADMIN] : [])];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-9 items-center gap-2 rounded-xl py-1 pr-1.5 pl-1 text-sm hover:bg-subtle"
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
        <div role="menu" className="panel absolute right-0 mt-2 w-64 overflow-hidden">
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
                className="block px-4 py-2.5 text-sm hover:bg-subtle"
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

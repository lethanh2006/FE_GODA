"use client";

import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/cn";
import { isNavActive, NAV_GUEST, NAV_MAIN, type NavLink } from "@/lib/nav";
import { useDueCount } from "./sidebar";

/** Thanh đáy trên điện thoại, cho cả khách lẫn người đã đăng nhập. */
export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const due = useDueCount(!!user);
  const links: NavLink[] = user
    ? NAV_MAIN
    : [...NAV_GUEST, { href: "/login", label: "Tài khoản", icon: CircleUserRound }];

  return (
    <nav
      aria-label="Điều hướng chính"
      className="bottom-nav fixed inset-x-0 bottom-0 z-30 grid border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}
    >
      {links.map(({ href, label, shortLabel, icon: Icon }) => {
        const active = isNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
              active ? "text-primary" : "text-muted",
            )}
          >
            <Icon className="size-5" aria-hidden />
            <span className="px-1 text-center leading-tight">{shortLabel ?? label}</span>
            {href === "/on-tap" && due > 0 && (
              <span className="absolute top-1.5 left-1/2 ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {due > 99 ? "99+" : due}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

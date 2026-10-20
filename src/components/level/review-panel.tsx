"use client";

import { BookMarked, RotateCcw } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { useStartAttempt } from "@/lib/attempts";
import type { JlptLevel } from "@/lib/types";

export function ReviewPanel({ level }: { level: JlptLevel }) {
  const { user } = useAuth();
  const { start, pending, error } = useStartAttempt();

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-border p-5 text-sm">
        <p className="font-medium">Ôn câu sai & câu đã lưu</p>
        <p className="mt-1 text-muted">Đăng nhập để hệ thống ghi nhớ câu bạn làm sai và câu bạn lưu lại.</p>
        <div className="mt-3 flex gap-2">
          <ButtonLink href={`/login?next=/${level.toLowerCase()}`} size="sm">Đăng nhập</ButtonLink>
          <ButtonLink href={`/register?next=/${level.toLowerCase()}`} size="sm" variant="secondary">Đăng ký</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-5">
      <p className="font-medium">Ôn tập {level}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={pending !== null}
          onClick={() => start({ kind: "practice", level, focus: "mistakes", count: 20 }, "mistakes")}
        >
          <RotateCcw className="size-4" /> {pending === "mistakes" ? "Đang tạo…" : "Ôn câu sai"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={pending !== null}
          onClick={() => start({ kind: "practice", level, focus: "bookmarks", count: 30 }, "bookmarks")}
        >
          <BookMarked className="size-4" /> {pending === "bookmarks" ? "Đang tạo…" : "Ôn câu đã lưu"}
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

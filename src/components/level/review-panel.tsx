"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStartAttempt } from "@/lib/attempts";
import type { JlptLevel } from "@/lib/types";

export function ReviewPanel({ level }: { level: JlptLevel }) {
  const { user } = useAuth();
  const { start, pending, error } = useStartAttempt();
  const here = `/${level.toLowerCase()}`;

  if (!user) {
    return (
      <Card className="space-y-3 p-5">
        <p className="font-semibold">Ôn câu sai & câu đã lưu</p>
        <p className="text-sm text-muted">Đăng nhập để hệ thống ghi nhớ câu bạn làm sai và câu bạn lưu lại.</p>
        <div className="flex gap-2 pt-1">
          <ButtonLink href={`/login?next=${here}`} size="sm">Đăng nhập</ButtonLink>
          <ButtonLink href={`/register?next=${here}`} size="sm" variant="secondary">Đăng ký</ButtonLink>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 p-5">
      <div>
        <p className="font-semibold">Ôn tập {level}</p>
        <p className="mt-1 text-sm text-muted">Làm lại câu sai gần nhất hoặc câu bạn đã lưu.</p>
      </div>
      <div className="grid gap-2">
        <Button
          variant="secondary"
          disabled={pending !== null}
          onClick={() => start({ kind: "practice", level, focus: "mistakes", count: 20 }, "mistakes")}
        >
          {pending === "mistakes" ? "Đang tạo…" : "Ôn câu sai"}
        </Button>
        <Button
          variant="secondary"
          disabled={pending !== null}
          onClick={() => start({ kind: "practice", level, focus: "bookmarks", count: 30 }, "bookmarks")}
        >
          {pending === "bookmarks" ? "Đang tạo…" : "Ôn câu đã lưu"}
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </Card>
  );
}

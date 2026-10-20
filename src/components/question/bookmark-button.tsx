"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

export function BookmarkButton({
  questionId,
  initial,
  onChange,
  className,
}: {
  questionId: string;
  initial: boolean;
  onChange?: (saved: boolean) => void;
  className?: string;
}) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const toggle = async () => {
    const next = !saved;
    setSaved(next);
    setBusy(true);
    try {
      await api(`/bookmarks/${questionId}`, { method: next ? "PUT" : "DELETE" });
      onChange?.(next);
    } catch {
      setSaved(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={saved ? "Bỏ lưu câu hỏi" : "Lưu câu hỏi để ôn lại"}
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        saved ? "text-warning" : "text-muted hover:text-foreground",
        className,
      )}
    >
      {saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
      {saved ? "Đã lưu" : "Lưu"}
    </button>
  );
}

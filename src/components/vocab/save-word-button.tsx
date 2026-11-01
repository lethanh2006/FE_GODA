"use client";

import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, buttonClass } from "@/components/ui/button";
import { api } from "@/lib/api";

/** Thêm một từ vào sổ ôn; bấm lần nữa để bỏ. */
export function SaveWordButton({ wordId, initialSaved }: { wordId: string; initialSaved: boolean }) {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <Link href={`/login?next=${encodeURIComponent(`/tu-dien/${wordId}`)}`} className={buttonClass({ variant: "secondary" })}>
        <Plus className="size-4" aria-hidden /> Đăng nhập để lưu từ
      </Link>
    );
  }

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      if (saved) await api(`/study/words/${encodeURIComponent(wordId)}`, { method: "DELETE" });
      else await api("/study/words", { method: "POST", json: { wordIds: [wordId] } });
      setSaved(!saved);
      await mutate("/study/stats");
    } catch {
      setError("Không lưu được, vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col gap-1">
      <Button variant={saved ? "secondary" : "primary"} disabled={busy} onClick={toggle} aria-pressed={saved}>
        {saved ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
        {saved ? "Đã có trong sổ ôn" : "Lưu để ôn tập"}
      </Button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </span>
  );
}

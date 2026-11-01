"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { EmptyState, ErrorNotice, Skeleton } from "@/components/ui/feedback";
import { LEVELS } from "@/lib/jlpt";
import type { JlptLevel } from "@/lib/types";
import type { KanjiListItem } from "@/lib/vocab";

export function KanjiBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q")?.trim() ?? "";
  const levelParam = params.get("level");
  const level = (LEVELS as string[]).includes(levelParam ?? "") ? (levelParam as JlptLevel) : q ? null : "N5";
  const [value, setValue] = useState(q);

  const key = `/dictionary/kanji?${new URLSearchParams({ ...(q && { q }), ...(level && { level }) }).toString()}`;
  const { data, error, isLoading } = useSWR<KanjiListItem[]>(key);

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <p className="eyebrow">Từ điển Nhật – Việt</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tra chữ Hán</h1>
        <p className="text-muted">Gõ chữ Hán, âm Hán Việt (“học”, “hoc”) hoặc nghĩa tiếng Anh (“study”).</p>
        <form
          role="search"
          className="flex items-center gap-2 rounded-full border border-primary/25 bg-card py-1.5 pr-1.5 pl-5"
          onSubmit={(event) => {
            event.preventDefault();
            const next = value.trim();
            router.push(next ? `/tu-dien/kanji?q=${encodeURIComponent(next)}` : "/tu-dien/kanji");
          }}
        >
          <Search className="size-5 shrink-0 text-muted" aria-hidden />
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="学, học, study…"
            aria-label="Tra chữ Hán"
            className="min-h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
          <button type="submit" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
            Tra
          </button>
        </form>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/tu-dien" className="chip">Từ vựng</Link>
        <span className="chip chip-on" aria-current="page">Hán tự</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {LEVELS.map((item) => (
          <Link key={item} href={`/tu-dien/kanji?level=${item}`} className={`chip ${level === item ? "chip-on" : ""}`}>
            {item}
          </Link>
        ))}
      </div>
      {error ? (
        <ErrorNotice message="Không tải được danh sách chữ Hán. Vui lòng thử lại." />
      ) : isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : !data?.length ? (
        <EmptyState title={`Không tìm thấy “${q}”`} description="Thử gõ đúng một chữ Hán hoặc một âm Hán Việt." />
      ) : (
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8">
          {data.map((kanji) => (
            <li key={kanji.char}>
              <Link
                href={`/tu-dien/kanji/${encodeURIComponent(kanji.char)}`}
                className="panel flex h-full flex-col items-center gap-1 p-3 text-center transition-colors hover:border-primary/40"
              >
                <span className="jp text-3xl leading-tight font-semibold">{kanji.char}</span>
                <span className="line-clamp-1 text-xs font-semibold text-hanviet uppercase">
                  {kanji.hanviet.join(", ") || "—"}
                </span>
                <span className="line-clamp-1 text-[11px] text-muted" lang="en">{kanji.meaningsEn.join(", ")}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

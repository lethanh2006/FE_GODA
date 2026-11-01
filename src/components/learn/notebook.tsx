"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorNotice, Skeleton } from "@/components/ui/feedback";
import { LevelTag } from "@/components/vocab/level-tag";
import { SpeakButton } from "@/components/vocab/speak-button";
import { WordMeaning } from "@/components/vocab/word-meaning";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { LEVELS } from "@/lib/jlpt";
import type { JlptLevel } from "@/lib/types";
import { formatInterval, type NotebookPage, type WordStatus } from "@/lib/vocab";

const TABS: { value: WordStatus | null; label: string }[] = [
  { value: null, label: "Tất cả" },
  { value: "due", label: "Cần ôn" },
  { value: "learning", label: "Đang học" },
  { value: "mature", label: "Đã nhớ chắc" },
  { value: "known", label: "Đã biết" },
];

export function Notebook() {
  const [status, setStatus] = useState<WordStatus | null>(null);
  const [level, setLevel] = useState<JlptLevel | null>(null);
  const [page, setPage] = useState(1);
  const { mutate: globalMutate } = useSWRConfig();
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  if (level) params.set("level", level);
  const { data, error, isLoading, mutate } = useSWR<NotebookPage>(`/study/words?${params.toString()}`, {
    keepPreviousData: true,
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [now] = useState(Date.now);

  const refresh = async () => {
    await mutate();
    await globalMutate("/study/stats");
  };

  const act = async (run: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await run();
      await refresh();
    } catch {
      setActionError("Thao tác chưa thành công, vui lòng thử lại.");
    }
  };

  const pageCount = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            aria-pressed={status === tab.value}
            className={`chip ${status === tab.value ? "chip-on" : ""}`}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={level === null}
          className={`chip ${level === null ? "chip-on" : ""}`}
          onClick={() => {
            setLevel(null);
            setPage(1);
          }}
        >
          Mọi cấp
        </button>
        {LEVELS.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={level === item}
            className={`chip ${level === item ? "chip-on" : ""}`}
            onClick={() => {
              setLevel(item);
              setPage(1);
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {actionError && <ErrorNotice message={actionError} />}

      {error ? (
        <ErrorNotice message="Không tải được sổ từ. Vui lòng thử lại." />
      ) : isLoading && !data ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : !data?.items.length ? (
        <EmptyState
          title={status || level ? "Không có từ nào khớp bộ lọc" : "Sổ từ đang trống"}
          description="Từ trong các bài đã học và từ bạn lưu ở từ điển sẽ hiện ở đây."
          action={!status && !level ? <ButtonLink href="/hoc-tu">Học từ mới</ButtonLink> : undefined}
        />
      ) : (
        <>
          <p className="text-sm text-muted tabular-nums">{formatNumber(data.total)} từ</p>
          <ul className="space-y-3">
            {data.items.map((word) => {
              const isDue = !word.suspended && new Date(word.due).getTime() <= now;
              return (
                <li key={word.id} className="panel flex flex-wrap items-center gap-3 p-4">
                  <Link href={`/tu-dien/${word.id}`} className="min-w-48 flex-1 space-y-1">
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="jp text-lg font-semibold" lang="ja">{word.word}</span>
                      {word.reading !== word.word && <span className="jp text-sm text-muted">{word.reading}</span>}
                      <LevelTag level={word.level} />
                      {word.suspended ? (
                        <Badge tone="success">Đã biết</Badge>
                      ) : isDue ? (
                        <Badge tone="warning">Cần ôn</Badge>
                      ) : (
                        <span className="text-xs text-muted">Ôn sau {formatInterval(word.due)}</span>
                      )}
                    </span>
                    <WordMeaning word={word} compact />
                  </Link>
                  <div className="flex items-center gap-2">
                    <SpeakButton text={word.reading} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        void act(() =>
                          api(`/study/words/${encodeURIComponent(word.id)}/known`, {
                            method: "PUT",
                            json: { known: !word.suspended },
                          }),
                        )
                      }
                    >
                      {word.suspended ? "Học lại" : "Đã biết"}
                    </Button>
                    <button
                      type="button"
                      aria-label={`Xoá ${word.word} khỏi sổ`}
                      title="Xoá khỏi sổ"
                      className="flex size-10 items-center justify-center rounded-xl text-muted hover:bg-danger-soft hover:text-danger"
                      onClick={() => void act(() => api(`/study/words/${encodeURIComponent(word.id)}`, { method: "DELETE" }))}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {pageCount > 1 && (
            <nav className="flex items-center justify-center gap-3" aria-label="Phân trang">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trang trước</Button>
              <span className="text-sm text-muted tabular-nums">{page}/{pageCount}</span>
              <Button variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Trang sau</Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

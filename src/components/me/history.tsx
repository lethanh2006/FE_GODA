"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorNotice, PageLoading } from "@/components/ui/feedback";
import { Segmented } from "@/components/ui/switch";
import { LEVELS } from "@/lib/jlpt";
import type { AttemptListItem, AttemptMode, JlptLevel, Paginated } from "@/lib/types";
import { AttemptList } from "./attempt-list";

const PAGE_SIZE = 20;

export function History() {
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<JlptLevel | "all">("all");
  const [mode, setMode] = useState<AttemptMode | "all">("all");
  const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (level !== "all") query.set("level", level);
  if (mode !== "all") query.set("mode", mode);
  const { data, error, isLoading } = useSWR<Paginated<AttemptListItem>>(`/me/attempts?${query}`, {
    keepPreviousData: true,
  });
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Segmented<JlptLevel | "all">
          value={level}
          onChange={(v) => {
            setLevel(v);
            setPage(1);
          }}
          options={[{ value: "all", label: "Tất cả" }, ...LEVELS.map((l) => ({ value: l, label: l }))]}
        />
        <Segmented<AttemptMode | "all">
          value={mode}
          onChange={(v) => {
            setMode(v);
            setPage(1);
          }}
          options={[
            { value: "all", label: "Mọi chế độ" },
            { value: "EXAM", label: "Thi thử" },
            { value: "PRACTICE", label: "Luyện tập" },
          ]}
        />
      </div>
      {error && <ErrorNotice message="Không tải được lịch sử." />}
      {isLoading && !data && <PageLoading />}
      {data && data.items.length === 0 && <EmptyState title="Chưa có bài làm nào" />}
      {data && data.items.length > 0 && (
        <Card className="py-2">
          <AttemptList items={data.items} />
        </Card>
      )}
      {data && pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</Button>
          <span className="text-muted tabular-nums">Trang {page}/{pages}</span>
          <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Sau</Button>
        </div>
      )}
    </div>
  );
}

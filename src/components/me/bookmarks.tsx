"use client";

import { useState } from "react";
import useSWR from "swr";
import { BookmarkButton } from "@/components/question/bookmark-button";
import { JpText, PassageBox } from "@/components/question/jp-text";
import { ListeningPlayer } from "@/components/question/listening-player";
import { OptionList } from "@/components/question/option-list";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorNotice, PageLoading } from "@/components/ui/feedback";
import { Segmented } from "@/components/ui/switch";
import { useStartAttempt } from "@/lib/attempts";
import { isListening, LEVELS, QUESTION_TYPES, SPOKEN_OPTIONS } from "@/lib/jlpt";
import type { BookmarkItem, JlptLevel } from "@/lib/types";

export function Bookmarks() {
  const [level, setLevel] = useState<JlptLevel | "all">("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const { data, error, mutate } = useSWR<BookmarkItem[]>(`/bookmarks${level === "all" ? "" : `?level=${level}`}`);
  const { start, pending, error: startError } = useStartAttempt();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented<JlptLevel | "all">
          value={level}
          onChange={setLevel}
          options={[{ value: "all", label: "Tất cả" }, ...LEVELS.map((l) => ({ value: l, label: l }))]}
        />
        {data && data.length > 0 && (
          <Button
            disabled={pending !== null}
            onClick={() =>
              start({ kind: "practice", focus: "bookmarks", level: level === "all" ? undefined : level, count: 50 })
            }
          >
            {pending ? "Đang tạo…" : "Luyện các câu đã lưu"}
          </Button>
        )}
      </div>
      {startError && <ErrorNotice message={startError} />}
      {error && <ErrorNotice message="Không tải được danh sách." />}
      {!data && !error && <PageLoading />}
      {data && data.length === 0 && (
        <EmptyState
          title="Chưa có câu hỏi nào được lưu"
          description="Bấm “Lưu” ở câu hỏi khi xem đáp án hoặc khi xem lại bài làm để ôn lại sau."
        />
      )}
      <div className="space-y-4">
        {data?.map(({ question: q }) => {
          const show = revealed.has(q.id);
          return (
            <Card key={q.id} className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <LevelBadge level={q.level} />
                <span className="jp">{QUESTION_TYPES[q.type].nameJa}</span>
                <span className="text-xs text-muted">{QUESTION_TYPES[q.type].nameVi}</span>
                <span className="ml-auto">
                  <BookmarkButton questionId={q.id} initial onChange={(saved) => !saved && void mutate()} />
                </span>
              </div>
              {q.passage && isListening(q.type) && (
                <ListeningPlayer
                  script={q.passage.content}
                  spokenOptions={SPOKEN_OPTIONS.has(q.type) ? q.options : undefined}
                  showTranscript={show}
                />
              )}
              {q.passage && !isListening(q.type) && (
                <details className="rounded-lg border border-border">
                  <summary className="cursor-pointer px-3 py-2 text-sm text-muted">Bài đọc</summary>
                  <PassageBox content={q.passage.content} title={q.passage.title} className="exam-paper m-2 mt-0" />
                </details>
              )}
              <div className="exam-paper space-y-3">
                <JpText text={q.prompt} className="block" />
                <OptionList options={q.options} selectedIndex={null} answerIndex={show ? q.answerIndex : undefined} compact />
              </div>
              {show ? (
                q.explanation && (
                  <div className="rounded-lg bg-subtle p-3 text-sm">
                    <JpText text={q.explanation} className="block" />
                  </div>
                )
              ) : (
                <Button size="sm" variant="secondary" onClick={() => setRevealed((s) => new Set(s).add(q.id))}>
                  Hiện đáp án
                </Button>
              )}
              {show && <Badge>{q.source === "goda" ? "GODA biên soạn" : "OpenJLPT"}</Badge>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

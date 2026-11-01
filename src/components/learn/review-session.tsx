"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorNotice, PageLoading } from "@/components/ui/feedback";
import { speakJapanese } from "@/components/vocab/speak-button";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { formatInterval, type ReviewCard, type StudyQueue, type StudyStats } from "@/lib/vocab";
import { Flashcard } from "./flashcard";
import { FocusBar } from "./focus-bar";

const BATCH = 20;

const RATINGS = [
  { rating: 1, label: "Quên", key: "again", className: "border-danger/40 text-danger hover:bg-danger-soft" },
  { rating: 2, label: "Khó", key: "hard", className: "border-warning/40 text-warning hover:bg-warning-soft" },
  { rating: 3, label: "Nhớ", key: "good", className: "border-success/40 text-success hover:bg-success-soft" },
  { rating: 4, label: "Dễ", key: "easy", className: "border-border-strong text-foreground hover:bg-subtle" },
] as const;

export function ReviewHome() {
  const [running, setRunning] = useState(false);
  const { data: stats, error, mutate } = useSWR<StudyStats>("/study/stats");

  if (running) {
    return (
      <div className="focus-mode flex flex-1 flex-col">
        <ReviewRun onExit={() => { setRunning(false); void mutate(); }} />
      </div>
    );
  }
  if (error) return <ErrorNotice message="Không tải được thống kê ôn tập. Vui lòng thử lại." />;
  if (!stats) return <PageLoading />;
  if (stats.total === 0) {
    return (
      <EmptyState
        title="Sổ ôn đang trống"
        description="Học xong một bài từ vựng, các từ sẽ tự vào đây và được nhắc ôn đúng lúc sắp quên."
        action={<ButtonLink href="/hoc-tu">Học bài đầu tiên</ButtonLink>}
      />
    );
  }

  const facts = [
    { label: "Đang học", value: stats.learning },
    { label: "Đã nhớ chắc", value: stats.mature },
    { label: "Đã ôn hôm nay", value: stats.reviewedToday },
    { label: "Tổng trong sổ", value: stats.total },
  ];

  return (
    <div className="space-y-5">
      <Card className="hero flex flex-wrap items-center justify-between gap-5 p-6 sm:p-8">
        <div>
          <p className="eyebrow">Đến hạn ôn</p>
          <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">{formatNumber(stats.due)} từ</p>
          <p className="mt-1 text-sm text-muted">
            {stats.due > 0 ? `Mỗi lượt tối đa ${BATCH} từ, khoảng ${Math.ceil(Math.min(stats.due, BATCH) / 4)} phút.` : "Bạn đã ôn hết từ đến hạn."}
          </p>
        </div>
        {stats.due > 0 ? (
          <Button size="lg" onClick={() => setRunning(true)}>Bắt đầu ôn</Button>
        ) : (
          <ButtonLink href="/hoc-tu" size="lg" variant="secondary">Học thêm từ mới</ButtonLink>
        )}
      </Card>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="panel p-4">
            <dt className="text-xs text-muted">{fact.label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{formatNumber(fact.value)}</dd>
          </div>
        ))}
      </dl>
      {stats.upcoming.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 text-[15px] font-semibold">7 ngày tới</h2>
          <ul className="divide-y divide-border text-sm">
            {stats.upcoming.map((day) => (
              <li key={day.day} className="flex items-center justify-between py-2 tabular-nums">
                <span className="text-muted">{new Date(`${day.day}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" })}</span>
                <span className="font-semibold">{formatNumber(day.count)} từ</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function ReviewRun({ onExit }: { onExit: () => void }) {
  const { mutate } = useSWRConfig();
  const [cards, setCards] = useState<ReviewCard[] | null>(null);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api<StudyQueue>(`/study/queue?limit=${BATCH}`)
      .then((queue) => {
        if (cancelled) return;
        setCards(queue.cards);
        setTotal(queue.cards.length);
        setDone(0);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [round]);

  const reload = () => {
    setLoadError(false);
    setCards(null);
    setRound((r) => r + 1);
  };

  const refresh = () => mutate((key) => typeof key === "string" && key.startsWith("/study/"), undefined, { revalidate: true });

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <ErrorNotice
          message="Không tải được hàng ôn."
          action={<button type="button" className="font-semibold underline" onClick={reload}>Thử lại</button>}
        />
      </div>
    );
  }
  if (!cards) return <PageLoading label="Đang tải thẻ…" />;

  if (cards.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-14 text-center">
        <span className="jp flex size-20 items-center justify-center rounded-2xl bg-primary-soft text-4xl font-bold text-primary">合</span>
        <h1 className="text-2xl font-bold tracking-tight">Xong lượt ôn!</h1>
        <p className="text-muted">Bạn vừa ôn {total} từ.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reload}>Ôn tiếp nếu còn</Button>
          <Button variant="secondary" onClick={onExit}>Về trang ôn tập</Button>
        </div>
      </div>
    );
  }

  return (
    <ReviewCardView
      key={`${cards[0].id}-${cards.length}`}
      card={cards[0]}
      done={done}
      total={total}
      onExit={onExit}
      onRated={(again) => {
        // Bấm "Quên": lịch đã ghi; thẻ quay lại cuối lượt để nhìn lại một lần nữa, không chấm lần hai.
        setCards((list) => {
          if (!list) return list;
          const [head, ...rest] = list;
          return again && !isRetry(head) ? [...rest, markRetry(head)] : rest;
        });
        if (!again) setDone((d) => d + 1);
        void refresh();
      }}
    />
  );
}

const RETRY = Symbol("retry");
type MaybeRetry = ReviewCard & { [RETRY]?: true };
const isRetry = (card: MaybeRetry) => card[RETRY] === true;
const markRetry = (card: ReviewCard): MaybeRetry => ({ ...card, [RETRY]: true });

function ReviewCardView({
  card,
  done,
  total,
  onExit,
  onRated,
}: {
  card: MaybeRetry;
  done: number;
  total: number;
  onExit: () => void;
  onRated: (again: boolean) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const retry = isRetry(card);

  const rate = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      if (busy) return;
      if (retry) return onRated(false);
      setBusy(true);
      setFailed(false);
      try {
        await api("/study/review", { method: "POST", json: { wordId: card.id, rating } });
        onRated(rating === 1);
      } catch {
        setFailed(true);
        setBusy(false);
      }
    },
    [busy, card.id, onRated, retry],
  );

  const flip = useCallback(() => {
    setFlipped((value) => {
      if (!value) speakJapanese(card.reading);
      return !value;
    });
  }, [card.reading]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        // Nút đang được chọn tự xử lý phím của nó.
        if ((event.target as HTMLElement).closest("button, a")) return;
        event.preventDefault();
        if (!flipped) flip();
      } else if (flipped && /^[1-4]$/.test(event.key)) {
        void rate(Number(event.key) as 1 | 2 | 3 | 4);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, flipped, rate]);

  return (
    <>
      <FocusBar onExit={onExit} title="Ôn tập" done={done} total={total} />
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8">
        <Flashcard word={card} flipped={flipped} onFlip={flip} />
        {flipped ? (
          retry ? (
            <Button className="w-full" onClick={() => onRated(false)}>Đã xem lại, tiếp tục</Button>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {RATINGS.map(({ rating, label, key, className }) => (
                <button
                  key={rating}
                  type="button"
                  disabled={busy}
                  onClick={() => void rate(rating)}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center rounded-xl border bg-card px-2 py-2 font-semibold transition-colors disabled:opacity-50",
                    className,
                  )}
                >
                  {label}
                  <span className="text-xs font-normal text-muted tabular-nums">{formatInterval(card.preview[key])}</span>
                </button>
              ))}
            </div>
          )
        ) : (
          <Button className="w-full" size="lg" onClick={flip}>Xem đáp án</Button>
        )}
        {failed && <ErrorNotice message="Chưa lưu được kết quả. Hãy bấm lại." />}
        <p className="hidden text-center text-xs text-muted sm:block">Phím tắt: Space xem đáp án · 1–4 chấm thẻ</p>
      </div>
    </>
  );
}

"use client";

import { ArrowLeft, ArrowRight, Languages, Shuffle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { FocusBar } from "@/components/learn/focus-bar";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorNotice, PageLoading } from "@/components/ui/feedback";
import { speakJapanese } from "@/components/vocab/speak-button";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { DeckCard, DeckDetail } from "@/lib/decks";
import { DeckFlashcard } from "./deck-flashcard";

const EXIT_HREF = "/bo-the";

const shuffled = <T,>(items: readonly T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function DeckSession({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useSWR<DeckDetail>(`/decks/${id}`, { revalidateIfStale: false });

  if (isLoading) return <PageLoading label="Đang chuẩn bị bộ thẻ…" />;
  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <ErrorNotice
          message="Không tải được bộ thẻ. Vui lòng thử lại."
          action={<button type="button" className="font-semibold underline" onClick={() => void mutate()}>Thử lại</button>}
        />
      </div>
    );
  }
  return <DeckFlow key={id} deck={data} />;
}

function DeckFlow({ deck }: { deck: DeckDetail }) {
  const [round, setRound] = useState(0);
  const [finished, setFinished] = useState(false);
  if (finished) return <DoneStep deck={deck} onAgain={() => { setFinished(false); setRound((r) => r + 1); }} />;
  return <LearnStep key={round} deck={deck} onFinish={() => setFinished(true)} />;
}

function Toggle({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Shuffle; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-colors",
        active ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden /> {label}
    </button>
  );
}

function LearnStep({ deck, onFinish }: { deck: DeckDetail; onFinish: () => void }) {
  const [order, setOrder] = useState<DeckCard[]>(deck.cards);
  const [isShuffled, setIsShuffled] = useState(false);
  const [meaningFirst, setMeaningFirst] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = order[index];
  const isLast = index === order.length - 1;

  const move = useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) => Math.max(0, Math.min(order.length - 1, i + delta)));
    },
    [order.length],
  );

  const flip = useCallback(() => {
    setFlipped((value) => {
      if (!value && card.reading) speakJapanese(card.reading);
      return !value;
    });
  }, [card.reading]);

  const toggleShuffle = () => {
    setOrder(isShuffled ? deck.cards : shuffled(deck.cards));
    setIsShuffled((v) => !v);
    setIndex(0);
    setFlipped(false);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("input, textarea")) return;
      if (event.key === " ") {
        event.preventDefault();
        flip();
      } else if (event.key === "ArrowRight") move(1);
      else if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, move]);

  return (
    <>
      <FocusBar exitHref={EXIT_HREF} title={deck.title} done={index + 1} total={order.length} />
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Toggle active={isShuffled} onClick={toggleShuffle} icon={Shuffle} label="Trộn thẻ" />
          <Toggle
            active={meaningFirst}
            onClick={() => { setMeaningFirst((v) => !v); setFlipped(false); }}
            icon={Languages}
            label="Hiện nghĩa trước"
          />
        </div>
        <DeckFlashcard key={card.id} card={card} flipped={flipped} meaningFirst={meaningFirst} onFlip={flip} />
        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" disabled={index === 0} onClick={() => move(-1)}>
            <ArrowLeft className="size-4" aria-hidden /> Trước
          </Button>
          {isLast ? (
            <Button onClick={onFinish}>
              Xong bài <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button onClick={() => move(1)}>
              Thẻ tiếp <ArrowRight className="size-4" aria-hidden />
            </Button>
          )}
        </div>
        <p className="hidden text-center text-xs text-muted sm:block">Phím tắt: Space lật thẻ · ← → chuyển thẻ</p>
      </div>
    </>
  );
}

function DoneStep({ deck, onAgain }: { deck: DeckDetail; onAgain: () => void }) {
  const { mutate } = useSWRConfig();
  const [saveFailed, setSaveFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Gọi lại không sao: thẻ đã có lịch ôn được giữ nguyên.
  useEffect(() => {
    api(`/decks/${deck.id}/learned`, { method: "POST" })
      .then(() => mutate((key) => typeof key === "string" && key.startsWith("/decks"), undefined, { revalidate: true }))
      .catch(() => setSaveFailed(true));
  }, [attempt, deck.id, mutate]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-4 py-14 text-center">
      <span className="jp flex size-20 items-center justify-center rounded-2xl bg-primary-soft text-4xl font-bold text-primary">合</span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Xong {deck.title}!</h1>
        <p className="text-muted">{deck.cards.length} thẻ đã vào lịch ôn. GODA sẽ nhắc bạn ôn lại đúng lúc sắp quên.</p>
      </div>
      {saveFailed && (
        <ErrorNotice
          message="Chưa lưu được tiến độ."
          action={<button type="button" className="font-semibold underline" onClick={() => { setSaveFailed(false); setAttempt((n) => n + 1); }}>Thử lại</button>}
        />
      )}
      <div className="flex flex-wrap justify-center gap-3">
        {deck.nextId && (
          <ButtonLink href={`/bo-the/${deck.nextId}`}>
            Bộ tiếp theo <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        )}
        <Button variant="secondary" onClick={onAgain}>Lật lại bộ này</Button>
        <ButtonLink href={EXIT_HREF} variant="secondary">Về danh sách</ButtonLink>
      </div>
    </div>
  );
}

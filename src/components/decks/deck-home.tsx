"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { FrameMode } from "@/components/layout/frame-mode";
import { ReviewRun, type ReviewSource } from "@/components/learn/review-session";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorNotice, PageLoading, ProgressBar } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";
import { type DeckList, type DeckReviewCard, groupByChapter } from "@/lib/decks";
import { formatNumber } from "@/lib/format";
import { DeckFlashcard } from "./deck-flashcard";

const DECK_SOURCE: ReviewSource<DeckReviewCard> = {
  title: "Ôn bộ thẻ",
  queuePath: "/decks/queue?limit=20",
  reviewPath: "/decks/review",
  reviewBody: (card, rating) => ({ cardId: card.id, rating }),
  refreshPrefix: "/decks",
  speakText: (card) => card.reading,
  renderCard: (card, flipped, onFlip) => <DeckFlashcard card={card} flipped={flipped} onFlip={onFlip} />,
  unit: "thẻ",
  exitLabel: "Về danh sách bộ thẻ",
};

export function DeckHome() {
  const [reviewing, setReviewing] = useState(false);
  const { data, error, mutate } = useSWR<DeckList>("/decks");

  if (reviewing) {
    return (
      <div className="focus-mode flex flex-1 flex-col">
        <FrameMode mode="focus" />
        <ReviewRun source={DECK_SOURCE} onExit={() => { setReviewing(false); void mutate(); }} />
      </div>
    );
  }

  const header = <PageHeader title="Bộ thẻ" description="Thẻ lật theo từng bài của khoá học bạn đang theo, học xong bài thì GODA nhắc ôn đúng lúc." />;
  if (error) return <>{header}<ErrorNotice message="Không tải được bộ thẻ. Vui lòng thử lại." /></>;
  if (!data) return <>{header}<PageLoading /></>;
  if (data.decks.length === 0) {
    return (
      <>
        {header}
        <EmptyState title="Chưa có bộ thẻ nào" description="Bộ thẻ riêng được nạp vào tài khoản bằng lệnh decks:import của backend." />
      </>
    );
  }

  const total = data.decks.reduce((sum, deck) => sum + deck.cards, 0);
  const learned = data.decks.reduce((sum, deck) => sum + deck.learned, 0);
  const next = data.decks.find((deck) => deck.learned < deck.cards);

  return (
    <>
      {header}
      <Card className="hero flex flex-wrap items-center justify-between gap-5 p-6 sm:p-8">
        <div className="min-w-48 flex-1 space-y-2">
          <p className="eyebrow">Đến hạn ôn</p>
          <p className="text-4xl font-bold tracking-tight tabular-nums">{formatNumber(data.due)} thẻ</p>
          <p className="text-sm text-muted">
            Đã học {formatNumber(learned)}/{formatNumber(total)} thẻ
          </p>
          <ProgressBar value={(learned / total) * 100} className="max-w-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {data.due > 0 && <Button size="lg" onClick={() => setReviewing(true)}>Ôn ngay</Button>}
          {next && (
            <ButtonLink href={`/bo-the/${next.id}`} size="lg" variant={data.due > 0 ? "secondary" : "primary"}>
              Học tiếp: {next.title}
            </ButtonLink>
          )}
        </div>
      </Card>
      {groupByChapter(data.decks).map((group) => (
        <section key={`${group.course}-${group.chapter}`} className="space-y-3">
          <h2 className="text-[15px] font-semibold">
            {group.course}
            {group.chapter !== null && ` · Chương ${group.chapter}`}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.decks.map((deck) => {
              const finished = deck.learned >= deck.cards;
              return (
                <li key={deck.id}>
                  <Link
                    href={`/bo-the/${deck.id}`}
                    className={cn(
                      "panel flex h-full flex-col gap-2 p-4 transition-colors hover:border-primary/40",
                      deck.id === next?.id && "border-primary/50",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{deck.title}</span>
                      {finished ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-success">
                          <Check className="size-3.5" aria-hidden /> Đã học
                        </span>
                      ) : (
                        <span className="text-xs text-muted tabular-nums">
                          {deck.learned ? `${deck.learned}/` : ""}
                          {deck.cards} thẻ
                        </span>
                      )}
                    </span>
                    {deck.due > 0 && <span className="text-xs font-semibold text-primary">{deck.due} thẻ đến hạn ôn</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}

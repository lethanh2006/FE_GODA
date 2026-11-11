"use client";

import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Furigana } from "@/components/vocab/furigana";
import { cn } from "@/lib/cn";
import {
  deckFrontFurigana,
  sameMeaning,
  shuffled,
  type PracticeAnswer,
} from "@/lib/deck-games";
import type { DeckCard } from "@/lib/decks";

export function DeckMatching({
  cards,
  onFinish,
  onProgress,
}: {
  cards: DeckCard[];
  onFinish: (answers: PracticeAnswer[], mistakes: number) => void;
  onProgress: (done: number) => void;
}) {
  const [order] = useState(() => shuffled(cards));
  const [answers, setAnswers] = useState<PracticeAnswer[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [round, setRound] = useState(0);
  const offset = round * 5;
  return (
    <MatchingRound
      key={round}
      cards={order.slice(offset, offset + 5)}
      round={round + 1}
      rounds={Math.ceil(cards.length / 5)}
      onProgress={(done) => onProgress(offset + done)}
      onNext={(pairs, errors) => {
        const next = [...answers, ...pairs];
        const totalErrors = mistakes + errors;
        if (next.length === cards.length) onFinish(next, totalErrors);
        else {
          setAnswers(next);
          setMistakes(totalErrors);
          setRound((n) => n + 1);
        }
      }}
    />
  );
}

function MatchingRound({
  cards,
  round,
  rounds,
  onNext,
  onProgress,
}: {
  cards: DeckCard[];
  round: number;
  rounds: number;
  onNext: (answers: PracticeAnswer[], mistakes: number) => void;
  onProgress: (done: number) => void;
}) {
  const [right] = useState(() => shuffled(cards));
  const [selected, setSelected] = useState<string | null>(null);
  const [pairs, setPairs] = useState<PracticeAnswer[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState(
    "Chọn một từ tiếng Nhật, sau đó chọn nghĩa tiếng Việt.",
  );
  const complete = pairs.length === cards.length;
  const chooseMeaning = (choice: DeckCard) => {
    const term = cards.find((card) => card.id === selected);
    if (!term) {
      setMessage("Chọn từ tiếng Nhật ở cột bên trái trước nhé.");
      return;
    }
    if (!sameMeaning(term, choice)) {
      setMistakes((n) => n + 1);
      setMessage("Chưa đúng rồi. Hãy thử một nghĩa khác nhé!");
      return;
    }
    const next = [...pairs, { cardId: term.id, answerId: choice.id }];
    setPairs(next);
    onProgress(next.length);
    setSelected(null);
    setMessage(
      next.length === cards.length
        ? "Tuyệt! Bạn đã ghép xong lượt này."
        : `Đúng rồi! ${term.term} — ${choice.meaning}`,
    );
  };
  const tileClass =
    "flex min-h-16 w-full items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-center leading-relaxed wrap-anywhere transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-18 sm:px-4";
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="space-y-2">
        <p className="eyebrow">
          Lượt {round}/{rounds}
        </p>
        <h1 className="text-xl font-bold text-balance sm:text-2xl">
          Tìm cặp tương ứng
        </h1>
        <p className="text-sm text-pretty text-muted">
          Ghép hết các cặp để mở lượt tiếp theo.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted">Tiếng Nhật</h2>
          {cards.map((card) => {
            const matched = pairs.some((pair) => pair.cardId === card.id);
            return (
              <button
                key={card.id}
                type="button"
                disabled={matched}
                aria-pressed={selected === card.id}
                lang="ja"
                onClick={() => {
                  setSelected(card.id);
                  setMessage("Chọn nghĩa tiếng Việt tương ứng ở cột bên phải.");
                }}
                className={cn(
                  tileClass,
                  "jp text-lg font-semibold sm:text-xl",
                  matched
                    ? "border-success/30 bg-success/10 text-success"
                    : selected === card.id
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card hover:border-primary/40",
                )}
              >
                {matched && (
                  <Check className="size-4 shrink-0" aria-label="Đã ghép" />
                )}
                <Furigana text={deckFrontFurigana(card)} />
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted">Tiếng Việt</h2>
          {right.map((card) => {
            const matched = pairs.some((pair) => pair.answerId === card.id);
            return (
              <button
                key={card.id}
                type="button"
                disabled={matched}
                onClick={() => chooseMeaning(card)}
                className={cn(
                  tileClass,
                  "text-sm font-medium sm:text-base",
                  matched
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                {matched && (
                  <Check className="size-4 shrink-0" aria-label="Đã ghép" />
                )}
                {card.meaning}
              </button>
            );
          })}
        </div>
      </div>
      <p role="status" className="min-h-10 text-center text-sm text-muted">
        {message}
      </p>
      {complete && (
        <div className="flex justify-end">
          <Button size="lg" onClick={() => onNext(pairs, mistakes)}>
            {round === rounds ? "Xem kết quả" : "Lượt tiếp"}
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}

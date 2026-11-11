"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SpeakButton, stopJapanese } from "@/components/vocab/speak-button";
import { cn } from "@/lib/cn";
import {
  listeningOptions,
  sameMeaning,
  shuffled,
  type PracticeAnswer,
} from "@/lib/deck-games";
import type { DeckCard } from "@/lib/decks";

export function DeckListening({
  cards,
  onFinish,
  onProgress,
}: {
  cards: DeckCard[];
  onFinish: (answers: PracticeAnswer[], mistakes: number) => void;
  onProgress: (done: number) => void;
}) {
  const [questions] = useState(() =>
    shuffled(cards).map((card) => ({
      card,
      options: listeningOptions(cards, card),
    })),
  );
  const [answers, setAnswers] = useState<PracticeAnswer[]>([]);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  return (
    <ListeningQuestion
      key={index}
      {...questions[index]}
      last={index === questions.length - 1}
      onMistake={() => setMistakes((n) => n + 1)}
      onNext={(answer) => {
        stopJapanese();
        const next = [...answers, answer];
        onProgress(next.length);
        if (next.length === questions.length) onFinish(next, mistakes);
        else {
          setAnswers(next);
          setIndex((n) => n + 1);
        }
      }}
    />
  );
}

function ListeningQuestion({
  card,
  options,
  last,
  onMistake,
  onNext,
}: {
  card: DeckCard;
  options: DeckCard[];
  last: boolean;
  onMistake: () => void;
  onNext: (answer: PracticeAnswer) => void;
}) {
  const [choice, setChoice] = useState<DeckCard | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const correct = choice !== null && sameMeaning(card, choice);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Luyện tai mỗi ngày</p>
        <h1 className="text-3xl font-bold">Nghe và chọn nghĩa</h1>
        <p className="text-muted">
          Bấm loa để nghe từ tiếng Nhật. Bạn có thể nghe lại nhiều lần.
        </p>
      </div>
      <div className="panel flex min-h-60 flex-col items-center justify-center gap-5 p-6 sm:min-h-72">
        <SpeakButton
          key={card.id}
          text={card.speechText || card.reading || card.furigana || card.term}
          label="Nghe từ để chọn nghĩa"
          className="size-20 rounded-2xl bg-primary-soft text-primary"
        />
        {correct ? (
          <p
            className="jp text-4xl font-bold wrap-anywhere sm:text-5xl"
            lang="ja"
          >
            {card.term}
          </p>
        ) : (
          <p className="text-lg text-muted">Từ bạn vừa nghe có nghĩa là gì?</p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={correct || wrongIds.includes(option.id)}
            onClick={() => {
              setChoice(option);
              if (!sameMeaning(card, option)) {
                setWrongIds((ids) => [...ids, option.id]);
                onMistake();
              }
            }}
            className={cn(
              "flex min-h-24 items-center justify-center gap-2 rounded-2xl border-2 px-5 py-4 text-xl leading-relaxed font-medium wrap-anywhere transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              correct && option.id === choice.id
                ? "border-success bg-success/10 text-success"
                : wrongIds.includes(option.id)
                  ? "border-danger/40 bg-danger/10 text-danger"
                  : "border-border bg-card enabled:hover:border-primary/40",
            )}
          >
            {correct && option.id === choice.id && (
              <Check className="size-5 shrink-0" aria-hidden />
            )}
            {option.meaning}
            {wrongIds.includes(option.id) && (
              <span className="text-sm">· Chưa đúng</span>
            )}
          </button>
        ))}
      </div>
      <p role="status" className="min-h-7 text-center text-base text-muted">
        {correct
          ? `Chính xác! ${card.meaning}`
          : choice
            ? "Chưa đúng. Nghe lại và thử một nghĩa khác nhé."
            : "Chọn một đáp án bên trên."}
      </p>
      {correct && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={() => onNext({ cardId: card.id, answerId: choice.id })}
          >
            {last ? "Xem kết quả" : "Từ tiếp"}
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}

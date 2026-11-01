"use client";

import { Furigana } from "@/components/vocab/furigana";
import { LevelTag } from "@/components/vocab/level-tag";
import { SpeakButton } from "@/components/vocab/speak-button";
import { AutoMeaningNote, WordMeaning } from "@/components/vocab/word-meaning";
import { posLabels, type WordCard } from "@/lib/vocab";

/** Thẻ ghi nhớ: mặt trước là từ, bấm để lật xem cách đọc, nghĩa, ví dụ. */
export function Flashcard({
  word,
  flipped,
  onFlip,
  showReading,
}: {
  word: WordCard;
  flipped: boolean;
  onFlip: () => void;
  /** Hiện cách đọc ngay ở mặt trước khi đang học từ mới. */
  showReading?: boolean;
}) {
  const labels = posLabels(word.pos);
  return (
    <div className="flip-card" data-flipped={flipped}>
      <div className="flip-inner">
        <button
          type="button"
          onClick={onFlip}
          aria-label="Lật thẻ xem nghĩa"
          inert={flipped}
          className="flip-face panel flex min-h-80 flex-col items-center justify-center gap-3 p-6 text-center"
        >
          <span className="jp text-5xl font-bold sm:text-6xl" lang="ja">{word.word}</span>
          {showReading && word.reading !== word.word && <span className="jp text-xl text-muted">{word.reading}</span>}
          <span className="mt-4 text-sm text-muted">Bấm để lật thẻ</span>
        </button>
        <div className="flip-back flip-face panel flex min-h-80 flex-col gap-3 p-6" inert={!flipped}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="jp text-3xl font-bold sm:text-4xl" lang="ja">{word.word}</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
                {word.reading !== word.word && <span className="jp text-lg">{word.reading}</span>}
                <span className="text-sm text-muted">{word.romaji}</span>
                {word.hanviet && <span className="text-sm font-semibold text-hanviet uppercase">{word.hanviet}</span>}
              </p>
            </div>
            <SpeakButton text={word.reading} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <LevelTag level={word.level} />
            {labels.slice(0, 2).map((label) => (
              <span key={label} className="rounded-lg bg-subtle px-2 py-0.5 text-xs text-muted">{label}</span>
            ))}
          </div>
          <WordMeaning word={word} className="text-lg" />
          {word.example && (
            <div className="mt-auto rounded-xl bg-subtle p-3">
              <p lang="ja" className="jp text-[15px]">
                {word.example.furigana ? <Furigana text={word.example.furigana} /> : word.example.ja}
              </p>
              <p className="mt-1 text-xs text-muted" lang="en">{word.example.en}</p>
            </div>
          )}
          <AutoMeaningNote viSource={word.viSource} />
          <button type="button" onClick={onFlip} className="min-h-9 self-center text-sm text-muted hover:text-foreground">
            Lật lại
          </button>
        </div>
      </div>
    </div>
  );
}

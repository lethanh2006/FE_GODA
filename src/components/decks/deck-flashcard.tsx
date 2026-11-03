"use client";

import { Furigana } from "@/components/vocab/furigana";
import { SpeakButton } from "@/components/vocab/speak-button";
import type { DeckCard } from "@/lib/decks";

/** Thẻ của bộ thẻ riêng: mặt trước là từ (hoặc nghĩa nếu học ngược), bấm để lật. */
export function DeckFlashcard({
  card,
  flipped,
  onFlip,
  showReading,
  meaningFirst,
}: {
  card: DeckCard;
  flipped: boolean;
  onFlip: () => void;
  /** Hiện cách đọc ngay ở mặt trước. */
  showReading?: boolean;
  /** Mặt trước là nghĩa tiếng Việt, đoán từ tiếng Nhật. */
  meaningFirst?: boolean;
}) {
  const hasReading = card.reading !== "" && card.reading !== card.term;
  return (
    <div className="flip-card" data-flipped={flipped}>
      <div className="flip-inner">
        <button
          type="button"
          onClick={onFlip}
          aria-label="Lật thẻ"
          inert={flipped}
          className="flip-face panel flex min-h-80 flex-col items-center justify-center gap-3 p-6 text-center"
        >
          {meaningFirst ? (
            <span className="text-2xl font-semibold sm:text-3xl">{card.meaning}</span>
          ) : (
            <>
              <span className="jp text-5xl font-bold sm:text-6xl" lang="ja">{card.term}</span>
              {showReading && hasReading && <span className="jp text-xl text-muted">{card.reading}</span>}
            </>
          )}
          <span className="mt-4 text-sm text-muted">Bấm để lật thẻ</span>
        </button>
        <div className="flip-back flip-face panel flex min-h-80 flex-col gap-3 p-6" inert={!flipped}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="jp text-3xl leading-relaxed font-bold sm:text-4xl" lang="ja">
                {card.furigana ? <Furigana text={card.furigana} /> : card.term}
              </p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
                {hasReading && <span className="jp text-lg">{card.reading}</span>}
                {card.hanviet && <span className="text-sm font-semibold text-hanviet uppercase">{card.hanviet}</span>}
              </p>
            </div>
            {card.reading && <SpeakButton text={card.reading} />}
          </div>
          {card.wordType && (
            <span className="self-start rounded-lg bg-subtle px-2 py-0.5 text-xs text-muted">{card.wordType}</span>
          )}
          <p className="text-lg">{card.meaning}</p>
          {card.examples.length > 0 && (
            <ul className="mt-auto space-y-2">
              {card.examples.map((example) => (
                <li key={example.ja} className="rounded-xl bg-subtle p-3">
                  <p lang="ja" className="jp text-[15px] leading-loose">
                    <Furigana text={example.ja} />
                  </p>
                  {example.vi && <p className="mt-0.5 text-sm text-muted">{example.vi}</p>}
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={onFlip} className="min-h-9 self-center text-sm text-muted hover:text-foreground">
            Lật lại
          </button>
        </div>
      </div>
    </div>
  );
}

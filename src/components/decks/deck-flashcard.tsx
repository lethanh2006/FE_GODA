"use client";

import { useRef } from "react";
import { Furigana } from "@/components/vocab/furigana";
import { SpeakButton } from "@/components/vocab/speak-button";
import { cn } from "@/lib/cn";
import { deckFrontFurigana, japaneseSentenceText } from "@/lib/deck-games";
import type { DeckCard } from "@/lib/decks";
import "./deck-layout.css";

/** Luôn học từ tiếng Nhật trước, lật để xem nghĩa và câu ví dụ. */
export function DeckFlashcard({
  card,
  flipped,
  onFlip,
  showReading,
  autoPlay = false,
}: {
  card: DeckCard;
  flipped: boolean;
  onFlip: () => void;
  showReading?: boolean;
  autoPlay?: boolean;
}) {
  const front = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const hasReading = card.reading !== "" && card.reading !== card.term;
  const speech = card.speechText || card.reading || card.furigana || card.term;
  const flip = () => {
    onFlip();
    // Đợi DOM cập nhật inert rồi đặt focus vào mặt đang hiển thị.
    requestAnimationFrame(() =>
      (flipped ? front : back).current?.focus({ preventScroll: true }),
    );
  };
  return (
    <div
      className={cn("flip-card", "deck-flashcard-viewport")}
      data-flipped={flipped}
    >
      <div className="flip-inner">
        <div
          className="flip-face panel relative flex flex-col overflow-hidden"
          inert={flipped}
        >
          <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
            <SpeakButton
              text={speech}
              label="Nghe từ tiếng Nhật"
              autoPlay={autoPlay}
            />
          </div>
          <button
            ref={front}
            type="button"
            onClick={flip}
            aria-label={`Từ tiếng Nhật: ${card.term}. Lật thẻ để xem nghĩa tiếng Việt`}
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto rounded-2xl px-5 py-8 text-center focus-visible:outline-2 focus-visible:outline-primary sm:px-8"
          >
            <span className="text-sm font-semibold tracking-widest text-muted">
              TIẾNG NHẬT
            </span>
            <span
              className="jp w-full text-5xl leading-relaxed font-bold wrap-anywhere sm:text-7xl"
              lang="ja"
            >
              <Furigana text={deckFrontFurigana(card)} />
            </span>
            {showReading && hasReading && (
              <span className="jp text-2xl text-muted" lang="ja">
                {card.reading}
              </span>
            )}
            <span className="mt-3 text-base text-muted">
              Bấm để lật thẻ · Xem nghĩa tiếng Việt
            </span>
          </button>
        </div>
        <div
          className="flip-back flip-face panel flex flex-col gap-3 overflow-hidden p-4 sm:p-6"
          inert={!flipped}
        >
          <div
            role="region"
            aria-label="Nghĩa và ví dụ"
            tabIndex={0}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain rounded-lg pr-1 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p
                  className="jp text-4xl leading-relaxed font-bold wrap-anywhere sm:text-6xl"
                  lang="ja"
                >
                  {card.furigana ? (
                    <Furigana text={card.furigana} />
                  ) : (
                    card.term
                  )}
                </p>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  {hasReading && (
                    <span className="jp text-xl sm:text-2xl" lang="ja">
                      {card.reading}
                    </span>
                  )}
                  {card.hanviet && (
                    <span className="text-base font-semibold text-hanviet uppercase sm:text-lg">
                      {card.hanviet}
                    </span>
                  )}
                </p>
              </div>
              <SpeakButton text={speech} label="Nghe từ tiếng Nhật" />
            </div>
            {card.wordType && (
              <span className="self-start rounded-lg bg-subtle px-3 py-1 text-sm text-muted">
                {card.wordType}
              </span>
            )}
            <p className="text-2xl leading-relaxed font-medium wrap-anywhere sm:text-3xl">
              {card.meaning}
            </p>
            {card.examples.length > 0 && (
              <ul className="mt-auto space-y-3">
                {card.examples.map((example, index) => (
                  <li
                    key={`${index}-${example.ja}`}
                    className="rounded-2xl bg-subtle p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p
                        lang="ja"
                        className="jp min-w-0 text-xl leading-loose wrap-anywhere sm:text-2xl"
                      >
                        <Furigana text={example.ja} />
                      </p>
                      <SpeakButton
                        text={japaneseSentenceText(example.ja)}
                        label={`Nghe câu ví dụ ${index + 1}`}
                      />
                    </div>
                    {example.vi && (
                      <p className="mt-2 text-base leading-relaxed text-muted sm:text-lg">
                        {example.vi}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            ref={back}
            type="button"
            onClick={flip}
            className="min-h-11 shrink-0 self-center rounded-lg px-4 text-base text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            Lật lại
          </button>
        </div>
      </div>
    </div>
  );
}

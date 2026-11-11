"use client";

import { ArrowLeft, ArrowRight, Check, Shuffle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { FocusBar } from "@/components/learn/focus-bar";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorNotice, PageLoading } from "@/components/ui/feedback";
import {
  SpeechSettings,
  useSpeechPreferences,
} from "@/components/vocab/speech-settings";
import { stopJapanese } from "@/components/vocab/speak-button";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  shuffled,
  type PracticeAnswer,
  type PracticeResult,
} from "@/lib/deck-games";
import { deckHomeHref, type DeckCard, type DeckDetail } from "@/lib/decks";
import { DeckActivityPicker, type DeckActivity } from "./deck-activity-picker";
import { DeckFlashcard } from "./deck-flashcard";
import { DeckListening } from "./deck-listening";
import { DeckMatching } from "./deck-matching";
import "./deck-layout.css";

export function DeckSession({ id }: { id: string }) {
  const { data, isLoading, mutate } = useSWR<DeckDetail>(`/decks/${id}`, {
    revalidateIfStale: false,
  });
  if (isLoading) return <PageLoading label="Đang chuẩn bị bộ thẻ…" />;
  if (!data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <ErrorNotice
          message="Không tải được bộ thẻ. Vui lòng thử lại."
          action={
            <button
              type="button"
              className="font-semibold underline"
              onClick={() => void mutate()}
            >
              Thử lại
            </button>
          }
        />
      </div>
    );
  }
  if (!data.cards.length)
    return (
      <EmptyState
        title="Bài học chưa có thẻ"
        description="Hãy chọn một bài học khác để bắt đầu."
        action={
          <ButtonLink href={deckHomeHref(data.collection)}>
            Về danh sách bộ thẻ
          </ButtonLink>
        }
      />
    );
  return <DeckFlow key={id} deck={data} />;
}

type Completion = {
  activity: DeckActivity;
  answers?: PracticeAnswer[];
  mistakes: number;
};

function DeckFlow({ deck: latestDeck }: { deck: DeckDetail }) {
  // Mỗi lượt chơi dùng một ảnh chụp nội dung; reconnect không đổi bộ câu hỏi giữa lượt.
  const [deck, setDeck] = useState(latestDeck);
  const [activity, setActivity] = useState<DeckActivity | null>(null);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(0);
  useEffect(() => () => stopJapanese(), [activity, completion]);
  const choose = (next: DeckActivity | null) => {
    if (next) setDeck(latestDeck);
    setActivity(next);
    setCompletion(null);
    setDone(0);
    setRound((n) => n + 1);
  };
  if (completion)
    return (
      <DoneStep
        deck={deck}
        completion={completion}
        onAgain={() => choose(completion.activity)}
        onChoose={() => choose(null)}
      />
    );
  if (!activity)
    return <DeckActivityPicker deck={latestDeck} onChoose={choose} />;
  if (activity === "flashcards")
    return (
      <LearnStep
        key={round}
        deck={deck}
        onExit={() => choose(null)}
        onFinish={() => setCompletion({ activity, mistakes: 0 })}
      />
    );
  const Game = activity === "matching" ? DeckMatching : DeckListening;
  return (
    <>
      <FocusBar
        onExit={() => choose(null)}
        title={
          activity === "matching"
            ? `${deck.title} · Ghép cặp`
            : `${deck.title} · Luyện nghe`
        }
        done={done}
        total={deck.cards.length}
      />
      <div
        className={cn(
          "mx-auto w-full max-w-4xl px-4 sm:px-6",
          activity === "matching"
            ? cn("deck-matching-screen", "flex min-h-0 flex-col py-3")
            : "py-6 sm:py-10",
        )}
      >
        <Game
          key={`${activity}-${round}`}
          cards={deck.cards}
          onProgress={setDone}
          onFinish={(answers, mistakes) =>
            setCompletion({ activity, answers, mistakes })
          }
        />
      </div>
    </>
  );
}

function LearnStep({
  deck,
  onExit,
  onFinish,
}: {
  deck: DeckDetail;
  onExit: () => void;
  onFinish: () => void;
}) {
  const { autoPlay } = useSpeechPreferences();
  const [order, setOrder] = useState<DeckCard[]>(deck.cards);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleRound, setShuffleRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = order[index];
  const move = useCallback(
    (delta: number) => {
      const next = Math.max(0, Math.min(order.length - 1, index + delta));
      if (next === index) return;
      stopJapanese();
      setFlipped(false);
      setIndex(next);
    },
    [index, order.length],
  );
  const flip = useCallback(() => setFlipped((value) => !value), []);
  const toggleShuffle = () => {
    stopJapanese();
    setOrder(isShuffled ? deck.cards : shuffled(deck.cards));
    setIsShuffled((v) => !v);
    setShuffleRound((round) => round + 1);
    setIndex(0);
    setFlipped(false);
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.repeat ||
        target.closest(
          'input, textarea, select, [contenteditable], [role="region"][tabindex]',
        )
      )
        return;
      // Space giữ hành vi gốc của nút; mũi tên vẫn chuyển thẻ khi nút đang có focus.
      if (event.key === " " && target.closest("button, a")) return;
      if (event.key === " ") {
        event.preventDefault();
        flip();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, move]);
  return (
    <>
      <FocusBar
        onExit={onExit}
        title={deck.title}
        done={index + 1}
        total={order.length}
      />
      <div
        className={cn(
          "deck-study-screen",
          "mx-auto flex min-h-0 w-full max-w-4xl flex-col gap-3 px-4 py-3 sm:px-6",
        )}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={onExit}>
            <ArrowLeft className="size-4" aria-hidden /> Đổi cách học
          </Button>
          <Button
            variant="secondary"
            aria-pressed={isShuffled}
            onClick={toggleShuffle}
          >
            <Shuffle className="size-4" aria-hidden />
            {isShuffled ? "Đã trộn thẻ" : "Trộn thẻ"}
          </Button>
        </div>
        <SpeechSettings />
        <DeckFlashcard
          key={`${shuffleRound}-${card.id}`}
          card={card}
          flipped={flipped}
          onFlip={flip}
          autoPlay={autoPlay}
        />
        <div className="flex shrink-0 items-center justify-between gap-3">
          <Button
            size="lg"
            variant="secondary"
            disabled={index === 0}
            onClick={() => move(-1)}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Trước
          </Button>
          {index === order.length - 1 ? (
            <Button size="lg" onClick={onFinish}>
              Xong bài
              <Check className="size-5" aria-hidden />
            </Button>
          ) : (
            <Button size="lg" onClick={() => move(1)}>
              Thẻ tiếp
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          )}
        </div>
        <p
          className={cn(
            "deck-study-shortcuts",
            "hidden shrink-0 text-center text-sm text-muted sm:block",
          )}
        >
          Phím tắt: Space lật thẻ · ← → chuyển thẻ · Bấm loa để nghe lại
        </p>
      </div>
    </>
  );
}

function DoneStep({
  deck,
  completion,
  onAgain,
  onChoose,
}: {
  deck: DeckDetail;
  completion: Completion;
  onAgain: () => void;
  onChoose: () => void;
}) {
  const { mutate } = useSWRConfig();
  const [status, setStatus] = useState<"saving" | "saved" | "error">("saving");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const save =
      completion.activity === "flashcards"
        ? api(`/decks/${deck.id}/learned`, { method: "POST" })
        : api<PracticeResult>(`/decks/${deck.id}/practice`, {
            method: "POST",
            json: { mode: completion.activity, answers: completion.answers },
          }).then((result) => {
            if (!result.completed)
              throw new Error(
                "Nội dung bài đã thay đổi. Hãy quay lại chọn hoạt động và luyện lại bài này.",
              );
          });
    void save
      .then(() => {
        if (active) setStatus("saved");
        // Làm mới dữ liệu không quyết định kết quả lưu đã được API xác nhận.
        void mutate(
          (key) => typeof key === "string" && key.startsWith("/decks"),
          undefined,
          { populateCache: false, revalidate: true },
        ).catch(() => undefined);
      })
      .catch((error: unknown) => {
        if (active) {
          void mutate(`/decks/${deck.id}`).catch(() => undefined);
          setStatus("error");
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Chưa lưu được tiến độ. Vui lòng thử lại.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [attempt, completion, deck.id, mutate]);
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-14 text-center">
      <span className="flex size-20 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Check className="size-10" aria-hidden />
      </span>
      <div className="space-y-3">
        <p className="eyebrow">Mỗi lượt học, nhớ thêm một chút</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Bạn đã luyện xong {deck.title}!
        </h1>
        <p className="text-lg text-muted">
          {deck.cards.length} thẻ đã luyện
          {completion.activity !== "flashcards" &&
            ` · ${completion.mistakes} lần thử chưa đúng`}
        </p>
      </div>
      <div role="status" className="text-base text-muted">
        {status === "saving"
          ? "Đang lưu tiến độ…"
          : status === "saved"
            ? "Đã lưu vào lịch ôn. GODA sẽ nhắc bạn ôn lại đúng lúc."
            : "Tiến độ chưa được lưu."}
      </div>
      {status === "error" && (
        <ErrorNotice
          message={errorMessage}
          action={
            <button
              type="button"
              className="font-semibold underline"
              onClick={() => {
                setStatus("saving");
                setAttempt((n) => n + 1);
              }}
            >
              Thử lưu lại
            </button>
          }
        />
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onChoose} disabled={status === "saving"}>
          Chọn hoạt động khác
        </Button>
        {status === "saved" && (
          <>
            <Button variant="secondary" onClick={onAgain}>
              Chơi lại
            </Button>
            {deck.nextId && (
              <ButtonLink
                href={`${deckHomeHref(deck.collection)}/${deck.nextId}`}
                variant="secondary"
              >
                Bài tiếp theo
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            )}
          </>
        )}
        <ButtonLink href={deckHomeHref(deck.collection)} variant="ghost">
          Về danh sách
        </ButtonLink>
      </div>
    </div>
  );
}

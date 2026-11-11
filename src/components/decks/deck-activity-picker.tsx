"use client";

import {
  ArrowLeft,
  ArrowRight,
  GalleryVerticalEnd,
  Headphones,
  Link2,
} from "lucide-react";
import Link from "next/link";
import type { DeckDetail } from "@/lib/decks";
import type { PracticeMode } from "@/lib/deck-games";

export type DeckActivity = "flashcards" | PracticeMode;

const activities = [
  {
    id: "flashcards",
    title: "Lật thẻ",
    icon: GalleryVerticalEnd,
    tag: "Làm quen",
    description:
      "Nhìn từ tiếng Nhật, tự nhớ nghĩa rồi lật thẻ để khám phá câu ví dụ.",
    detail: "Theo nhịp của bạn",
  },
  {
    id: "matching",
    title: "Ghép cặp",
    icon: Link2,
    tag: "Ghi nhớ",
    description: "Tìm những cặp từ tiếng Nhật và nghĩa tiếng Việt tương ứng.",
    detail: "Từng lượt 5 cặp",
  },
  {
    id: "listening",
    title: "Nghe chọn nghĩa",
    icon: Headphones,
    tag: "Luyện nghe",
    description:
      "Lắng nghe cách phát âm, chọn nghĩa đúng và luyện lại những từ khó.",
    detail: "Nghe lại không giới hạn",
  },
] as const;

export function DeckActivityPicker({
  deck,
  onChoose,
}: {
  deck: DeckDetail;
  onChoose: (activity: DeckActivity) => void;
}) {
  const canListen =
    new Set(deck.cards.map((card) => card.meaning.trim())).size >= 2;
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
      <Link
        href="/bo-the"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-4" aria-hidden /> Tất cả bộ thẻ
      </Link>
      <div className="mt-8 space-y-4 sm:mt-10">
        <p className="eyebrow">
          {deck.course}
          {deck.chapter !== null && ` · Chương ${deck.chapter}`}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          {deck.title}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {deck.cards.length} thẻ · Chọn cách học hôm nay. Bắt đầu với tiếng
          Nhật, ghi nhớ qua từng trò chơi.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3">
        {activities.map((activity) => {
          const disabled = activity.id === "listening" && !canListen;
          return (
            <button
              key={activity.id}
              type="button"
              disabled={disabled}
              onClick={() => onChoose(activity.id)}
              className="panel group flex min-h-72 flex-col items-start gap-5 p-6 text-left transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-60 sm:p-7"
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <activity.icon className="size-7" aria-hidden />
                </span>
                <span className="text-xs font-semibold text-muted">
                  {activity.tag}
                </span>
              </span>
              <span className="space-y-3">
                <span className="block text-2xl font-bold">
                  {activity.title}
                </span>
                <span className="block text-base leading-relaxed text-muted">
                  {activity.description}
                </span>
              </span>
              <span className="mt-auto flex w-full items-center justify-between gap-2 pt-3 text-sm font-semibold text-primary">
                {disabled ? "Cần ít nhất 2 nghĩa khác nhau" : activity.detail}
                <ArrowRight className="size-5 shrink-0" aria-hidden />
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        Hoàn thành một hoạt động để đưa bài vào lịch ôn. Bạn có thể quay lại và
        thử các cách học khác bất cứ lúc nào.
      </p>
    </div>
  );
}

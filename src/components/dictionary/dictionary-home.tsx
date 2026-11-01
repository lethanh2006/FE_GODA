"use client";

import { Clock, Flame, Languages, LayoutGrid, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorNotice, Skeleton } from "@/components/ui/feedback";
import { LevelTag } from "@/components/vocab/level-tag";
import { SpeakButton } from "@/components/vocab/speak-button";
import { WordMeaning } from "@/components/vocab/word-meaning";
import { formatNumber } from "@/lib/format";
import { LEVELS } from "@/lib/jlpt";
import type { JlptLevel } from "@/lib/types";
import type { DictionaryOverview, WordSummary } from "@/lib/vocab";
import { SearchBox } from "./search-box";

const POPULAR = ["学校", "勉強", "ありがとう", "先生", "友達", "仕事", "時間", "日本語", "大丈夫", "頑張る", "好き", "美味しい"];
const TIPS = [
  { title: "Gõ theo cách bạn nhớ", text: "Chữ Hán, hiragana, katakana, romaji đều được: 学校, がっこう, gakkou." },
  { title: "Tra bằng tiếng Việt", text: "Có dấu hay không dấu đều được: “trường học”, “truong hoc”." },
  { title: "Tra theo âm Hán Việt", text: "Nhớ âm Hán Việt là tìm ra từ: “học hiệu” → 学校, “điện thoại” → 電話." },
];
const RECENT_KEY = "goda:recent-searches";
const MAX_RECENT = 8;

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

const NO_RECENT = "[]";
const subscribeNothing = () => () => undefined;

/** Lịch sử tra chỉ có ở trình duyệt; lúc render trên server coi như trống. */
function useRecent(): string[] {
  const raw = useSyncExternalStore(
    subscribeNothing,
    () => {
      try {
        return localStorage.getItem(RECENT_KEY) ?? NO_RECENT;
      } catch {
        return NO_RECENT;
      }
    },
    () => NO_RECENT,
  );
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...readRecent().filter((x) => x !== q)].slice(0, MAX_RECENT)));
  } catch {
    // localStorage không khả dụng
  }
}

export function DictionaryHome() {
  const params = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const level = (params.get("level") as JlptLevel | null) ?? null;

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <p className="eyebrow">Từ điển Nhật – Việt</p>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Tra từ tiếng Nhật, có <span className="text-primary">âm Hán Việt</span>
        </h1>
        <Overview />
        <SearchBox initial={q} autoFocus={!q} className="pt-3" />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <span className="chip chip-on" aria-current="page">Từ vựng</span>
        <Link href="/tu-dien/kanji" className="chip">Hán tự</Link>
      </div>
      {q ? <Results q={q} level={level} /> : <Landing />}
    </div>
  );
}

function Overview() {
  const { data } = useSWR<DictionaryOverview>("/dictionary");
  return (
    <p className="text-muted">
      {data
        ? `${formatNumber(data.totalWords)} từ · ${formatNumber(data.totalKanji)} chữ Hán · câu ví dụ, phân tích từng chữ, phát âm.`
        : "Từ vựng, chữ Hán, câu ví dụ, phân tích từng chữ, phát âm."}
    </p>
  );
}

function Results({ q, level }: { q: string; level: JlptLevel | null }) {
  const key = `/dictionary/search?limit=50&q=${encodeURIComponent(q)}${level ? `&level=${level}` : ""}`;
  const { data, error, isLoading, mutate } = useSWR<WordSummary[]>(key);

  useEffect(() => pushRecent(q), [q]);

  const levelHref = (next: JlptLevel | null) =>
    `/tu-dien?q=${encodeURIComponent(q)}${next ? `&level=${next}` : ""}`;

  return (
    <section className="mx-auto max-w-3xl space-y-4" aria-label="Kết quả tra từ">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={levelHref(null)} className={`chip ${level ? "" : "chip-on"}`}>Tất cả</Link>
        {LEVELS.map((item) => (
          <Link key={item} href={levelHref(item)} className={`chip ${level === item ? "chip-on" : ""}`}>
            {item}
          </Link>
        ))}
      </div>
      {error ? (
        <ErrorNotice
          message="Không tải được kết quả. Vui lòng thử lại."
          action={
            <button type="button" className="font-semibold underline" onClick={() => void mutate()}>
              Thử lại
            </button>
          }
        />
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : !data?.length ? (
        <EmptyState
          icon={<Search className="size-6" aria-hidden />}
          title={`Không tìm thấy “${q}”`}
          description={
            level
              ? `Chưa có từ khớp ở cấp ${level}. Thử bỏ bộ lọc cấp độ.`
              : "Từ điển chưa chia động từ: nếu gõ 食べました, hãy thử dạng gốc 食べる."
          }
        />
      ) : (
        <ul className="space-y-3">
          {data.map((word) => (
            <li key={word.id}>
              <WordRow word={word} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function WordRow({ word }: { word: WordSummary }) {
  return (
    <div className="panel flex items-start gap-3 p-4 transition-colors hover:border-primary/30 sm:p-5">
      <Link href={`/tu-dien/${word.id}`} className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="jp text-xl font-semibold">{word.word}</span>
          {word.reading !== word.word && <span className="jp text-sm text-muted">{word.reading}</span>}
          {word.hanviet && <span className="text-sm font-medium text-hanviet uppercase">{word.hanviet}</span>}
          <LevelTag level={word.level} />
        </div>
        <WordMeaning word={word} />
      </Link>
      <SpeakButton text={word.reading} />
    </div>
  );
}

function Landing() {
  const router = useRouter();
  const recent = useRecent();
  const { data } = useSWR<DictionaryOverview>("/dictionary");

  const tryWord = (word: string) => router.push(`/tu-dien?q=${encodeURIComponent(word)}`);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-3">
      <div className="space-y-5">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
            <Flame className="size-4 text-primary" aria-hidden /> Từ khoá phổ biến
          </h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((word) => (
              <button key={word} type="button" onClick={() => tryWord(word)} className="chip jp border-transparent bg-subtle">
                {word}
              </button>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
            <Clock className="size-4 text-primary" aria-hidden /> Tra gần đây
          </h2>
          {recent.length ? (
            <div className="flex flex-wrap gap-2">
              {recent.map((word) => (
                <button key={word} type="button" onClick={() => tryWord(word)} className="chip jp">
                  {word}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Chưa tra từ nào. Từ bạn tra sẽ hiện ở đây để tra lại nhanh.</p>
          )}
        </Card>
      </div>
      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
          <Languages className="size-4 text-primary" aria-hidden /> Mẹo tra từ
        </h2>
        <ul className="space-y-4">
          {TIPS.map((tip) => (
            <li key={tip.title}>
              <p className="text-sm font-semibold">{tip.title}</p>
              <p className="mt-0.5 text-sm text-muted">{tip.text}</p>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
          <LayoutGrid className="size-4 text-primary" aria-hidden /> Từ vựng theo cấp
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {LEVELS.map((level) => (
            <Link
              key={level}
              href={`/hoc-tu/${level.toLowerCase()}`}
              className="rounded-xl border border-border p-3 text-center transition-colors hover:border-primary/40"
            >
              <p className="font-bold">{level}</p>
              <p className="text-xs text-muted tabular-nums">
                {data ? `${formatNumber(data.levels.find((l) => l.level === level)?.words ?? 0)} từ` : "—"}
              </p>
            </Link>
          ))}
          <Link
            href="/tu-dien/kanji"
            className="rounded-xl border border-border p-3 text-center transition-colors hover:border-primary/40"
          >
            <p className="jp font-bold">漢字</p>
            <p className="text-xs text-muted tabular-nums">{data ? `${formatNumber(data.totalKanji)} chữ` : "—"}</p>
          </Link>
        </div>
      </Card>
    </div>
  );
}

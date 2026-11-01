import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/feedback";
import { Furigana } from "@/components/vocab/furigana";
import { LevelTag } from "@/components/vocab/level-tag";
import { SaveWordButton } from "@/components/vocab/save-word-button";
import { SpeakButton } from "@/components/vocab/speak-button";
import { AutoMeaningNote } from "@/components/vocab/word-meaning";
import { serverApi } from "@/lib/server-api";
import { meaningLine, posLabels, type WordDetail } from "@/lib/vocab";

export const metadata: Metadata = { title: "Từ điển" };

export default function WordPage({ params }: PageProps<"/tu-dien/[id]">) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-10 sm:px-8">
      <Suspense fallback={<PageLoading label="Đang tải từ…" />}>
        <WordContent params={params} />
      </Suspense>
    </main>
  );
}

async function WordContent({ params }: { params: PageProps<"/tu-dien/[id]">["params"] }) {
  const { id } = await params;
  const word = await serverApi<WordDetail>(`/dictionary/words/${encodeURIComponent(id)}`);
  if (!word) notFound();
  const labels = posLabels(word.pos);

  return (
    <div className="space-y-5">
      <Link href="/tu-dien" className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Từ điển
      </Link>

      <Card className="hero space-y-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <LevelTag level={word.level} />
              {labels.map((label) => (
                <Badge key={label}>{label}</Badge>
              ))}
            </div>
            <h1 className="jp text-5xl leading-tight font-bold sm:text-6xl">{word.word}</h1>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {word.reading !== word.word && <span className="jp text-xl">{word.reading}</span>}
              <span className="text-muted" lang="ja-Latn">{word.romaji}</span>
              {word.hanviet && <span className="font-semibold text-hanviet uppercase">{word.hanviet}</span>}
            </p>
          </div>
          <SpeakButton text={word.reading} className="size-12" />
        </div>
        <SaveWordButton wordId={word.id} initialSaved={!!word.progress} />
      </Card>

      <Card className="space-y-3 p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold">Nghĩa</h2>
        {word.meaningsVi.length > 0 && (
          <ol className="list-decimal space-y-1.5 pl-5 text-[17px]">
            {word.meaningsVi.map((meaning) => (
              <li key={meaning}>{meaning}</li>
            ))}
          </ol>
        )}
        <p className="text-sm text-muted">
          <span className="font-medium">Tiếng Anh: </span>
          <span lang="en">{word.meaningsEn.join("; ")}</span>
        </p>
        <AutoMeaningNote viSource={word.viSource} />
      </Card>

      {word.examples.length > 0 && (
        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold">Câu ví dụ</h2>
          <ul className="divide-y divide-border">
            {word.examples.map((example) => (
              <li key={example.ja} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1 space-y-1">
                  <p lang="ja" className="jp text-lg">
                    {example.furigana ? <Furigana text={example.furigana} /> : example.ja}
                  </p>
                  <p className="text-sm text-muted" lang="en">{example.en}</p>
                </div>
                <SpeakButton text={example.ja} label="Nghe câu ví dụ" />
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted">
            Câu ví dụ và bản dịch tiếng Anh từ{" "}
            <a href="https://tatoeba.org" className="underline" target="_blank" rel="noreferrer">Tatoeba</a> (CC BY 2.0 FR).
          </p>
        </Card>
      )}

      {word.kanji.length > 0 && (
        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold">Phân tích chữ Hán</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {word.kanji.map((kanji) => (
              <Link
                key={kanji.char}
                href={`/tu-dien/kanji/${encodeURIComponent(kanji.char)}`}
                className="flex gap-4 rounded-xl border border-border p-4 transition-colors hover:border-primary/40"
              >
                <span className="jp text-4xl leading-tight font-semibold">{kanji.char}</span>
                <span className="min-w-0 space-y-1 text-sm">
                  {kanji.hanviet.length > 0 && (
                    <span className="block font-semibold text-hanviet uppercase">{kanji.hanviet.slice(0, 2).join(", ")}</span>
                  )}
                  <span className="block truncate text-muted" lang="en">{kanji.meaningsEn.slice(0, 3).join(", ")}</span>
                  <span className="jp block truncate text-xs text-muted">
                    {[...kanji.onyomi.slice(0, 2), ...kanji.kunyomi.slice(0, 2)].join("・")}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {word.sameReading.length > 0 && (
        <Card className="space-y-3 p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold">Cùng cách đọc</h2>
          <ul className="divide-y divide-border">
            {word.sameReading.map((other) => (
              <li key={other.id}>
                <Link href={`/tu-dien/${other.id}`} className="flex min-h-11 items-center gap-3 py-2 hover:text-primary">
                  <span className="jp shrink-0 font-semibold">{other.word}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-muted">{meaningLine(other)}</span>
                  {other.level && <LevelTag level={other.level} />}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

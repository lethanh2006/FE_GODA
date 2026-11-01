import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WordRow } from "@/components/dictionary/dictionary-home";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/feedback";
import { LevelTag } from "@/components/vocab/level-tag";
import { SpeakButton } from "@/components/vocab/speak-button";
import { serverApi } from "@/lib/server-api";
import type { KanjiDetail } from "@/lib/vocab";

export const metadata: Metadata = { title: "Chữ Hán" };

export default function KanjiDetailPage({ params }: PageProps<"/tu-dien/kanji/[char]">) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-10 sm:px-8">
      <Suspense fallback={<PageLoading label="Đang tải chữ Hán…" />}>
        <KanjiContent params={params} />
      </Suspense>
    </main>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

async function KanjiContent({ params }: { params: PageProps<"/tu-dien/kanji/[char]">["params"] }) {
  const { char } = await params;
  const kanji = await serverApi<KanjiDetail>(`/dictionary/kanji/${encodeURIComponent(decodeURIComponent(char))}`);
  if (!kanji) notFound();

  return (
    <div className="space-y-5">
      <Link href="/tu-dien/kanji" className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Tra chữ Hán
      </Link>
      <Card className="hero flex flex-wrap items-start gap-6 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3">
          <h1 className="jp rounded-2xl border border-border bg-card px-6 py-3 text-7xl leading-none font-semibold">{kanji.char}</h1>
          <SpeakButton text={kanji.char} />
        </div>
        <dl className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
          <Fact label="Âm Hán Việt">
            <span className="font-semibold text-hanviet uppercase">{kanji.hanviet.join(", ") || "Chưa có"}</span>
          </Fact>
          <Fact label="Cấp JLPT">
            <LevelTag level={kanji.level} />
          </Fact>
          <Fact label="Âm on">
            <span className="jp">{kanji.onyomi.join("、") || "—"}</span>
          </Fact>
          <Fact label="Âm kun">
            <span className="jp">{kanji.kunyomi.join("、") || "—"}</span>
          </Fact>
          <Fact label="Số nét">
            <span className="tabular-nums">{kanji.strokes}</span>
          </Fact>
          <Fact label="Bộ">
            <span className="jp">{kanji.radical ?? "—"}</span>
          </Fact>
          <Fact label="Nghĩa (tiếng Anh)">
            <span lang="en">{kanji.meaningsEn.join(", ") || "—"}</span>
          </Fact>
        </dl>
      </Card>
      {kanji.words.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[15px] font-semibold">Từ có chữ {kanji.char}</h2>
          <ul className="space-y-3">
            {kanji.words.map((word) => (
              <li key={word.id}>
                <WordRow word={word} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

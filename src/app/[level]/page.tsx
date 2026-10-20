import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DifficultyMeter } from "@/components/home/level-cards";
import { LevelContent } from "@/components/level/level-content";
import { ReviewPanel } from "@/components/level/review-panel";
import { Skeleton } from "@/components/ui/feedback";
import { isLevel, LEVEL_META, LEVELS } from "@/lib/jlpt";
import type { JlptLevel } from "@/lib/types";

export function generateStaticParams() {
  return LEVELS.map((level) => ({ level: level.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/[level]">): Promise<Metadata> {
  const { level } = await params;
  if (!isLevel(level)) return {};
  const code = level.toUpperCase() as JlptLevel;
  return {
    title: `Luyện đề JLPT ${code}`,
    description: `Đề thi thử và bài luyện JLPT ${code} (${LEVEL_META[code].name}) theo đúng cấu trúc đề thật.`,
  };
}

export default async function LevelPage({ params }: PageProps<"/[level]">) {
  const { level: slug } = await params;
  if (!isLevel(slug) || slug !== slug.toLowerCase()) notFound();
  const level = slug.toUpperCase() as JlptLevel;
  const meta = LEVEL_META[level];
  const facts = [
    { label: "Chữ Hán", value: meta.kanji.split(" ")[0] },
    { label: "Từ vựng", value: meta.vocab.split(" ")[0] },
    { label: "Điểm đỗ", value: `${meta.passScore}/180` },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-14 px-4 pt-8 pb-8">
      <div className="space-y-6">
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">JLPT {level}</span>
        </nav>
        <header className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <p className="jp text-sm text-muted">日本語能力試験</p>
              <DifficultyMeter level={level} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              JLPT {level} <span className="font-semibold text-muted">· {meta.name}</span>
            </h1>
            <p className="max-w-2xl text-muted">{meta.summary}</p>
            <dl className="flex flex-wrap gap-x-10 gap-y-3 pt-1">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs text-muted">{fact.label}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ReviewPanel level={level} />
        </header>
      </div>

      <Suspense fallback={<LevelSkeleton />}>
        <LevelContent level={level} />
      </Suspense>
    </main>
  );
}

function LevelSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-56" />
      <Skeleton className="h-6 w-52" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

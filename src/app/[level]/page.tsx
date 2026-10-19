import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LevelContent } from "@/components/level/level-content";
import { ReviewPanel } from "@/components/level/review-panel";
import { Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
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

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
      <header className={cn("grid gap-6 rounded-2xl p-6 sm:p-8 lg:grid-cols-[1fr_20rem]", meta.soft)}>
        <div className="space-y-3">
          <p className="jp text-sm text-muted">日本語能力試験</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            JLPT <span className={meta.accent}>{level}</span> · {meta.name}
          </h1>
          <p className="max-w-2xl text-muted">{meta.summary}</p>
          <p className="text-sm text-muted">
            Yêu cầu tham khảo: {meta.kanji}, {meta.vocab}.
          </p>
        </div>
        <ReviewPanel level={level} />
      </header>

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
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
      <Skeleton className="h-6 w-52" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

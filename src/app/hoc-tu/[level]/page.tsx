import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonList } from "@/components/learn/lesson-list";
import { PageLoading } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { isLevel, LEVEL_META, LEVELS } from "@/lib/jlpt";
import type { JlptLevel } from "@/lib/types";

export const metadata: Metadata = { title: "Học từ vựng theo cấp" };

export default function VocabLevelPage({ params }: PageProps<"/hoc-tu/[level]">) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pt-8 pb-10 sm:px-8">
      <Suspense fallback={<PageLoading />}>
        <LevelContent params={params} />
      </Suspense>
    </main>
  );
}

async function LevelContent({ params }: { params: PageProps<"/hoc-tu/[level]">["params"] }) {
  const { level: slug } = await params;
  if (!isLevel(slug) || slug !== slug.toLowerCase()) notFound();
  const level = slug.toUpperCase() as JlptLevel;
  return (
    <>
      <PageHeader
        eyebrow="Học từ vựng"
        title={`Từ vựng ${level} · ${LEVEL_META[level].name}`}
        description="Mỗi bài 20 từ, từ phổ biến học trước. Làm quen bằng thẻ ghi nhớ, kiểm tra, rồi GODA nhắc ôn lại đúng lúc sắp quên."
      />
      <nav className="flex flex-wrap gap-2" aria-label="Chọn cấp độ">
        {LEVELS.map((item) => (
          <Link
            key={item}
            href={`/hoc-tu/${item.toLowerCase()}`}
            aria-current={item === level ? "page" : undefined}
            className={`chip ${item === level ? "chip-on" : ""}`}
          >
            {item}
          </Link>
        ))}
      </nav>
      <LessonList level={level} />
    </>
  );
}

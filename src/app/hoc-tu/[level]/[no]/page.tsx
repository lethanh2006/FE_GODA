import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FrameMode } from "@/components/layout/frame-mode";
import { LessonSession } from "@/components/learn/lesson-session";
import { PageLoading } from "@/components/ui/feedback";
import { isLevel } from "@/lib/jlpt";
import type { JlptLevel } from "@/lib/types";

export const metadata: Metadata = { title: "Bài học từ vựng" };

export default function LessonPage({ params }: PageProps<"/hoc-tu/[level]/[no]">) {
  return (
    <main className="flex flex-1 flex-col">
      <FrameMode mode="focus" />
      <Suspense fallback={<PageLoading label="Đang chuẩn bị bài học…" />}>
        <LessonLoader params={params} />
      </Suspense>
    </main>
  );
}

async function LessonLoader({ params }: { params: PageProps<"/hoc-tu/[level]/[no]">["params"] }) {
  const { level, no } = await params;
  const lessonNo = Number(no);
  if (!isLevel(level) || level !== level.toLowerCase() || !Number.isInteger(lessonNo) || lessonNo < 1) notFound();
  return <LessonSession level={level.toUpperCase() as JlptLevel} no={lessonNo} />;
}

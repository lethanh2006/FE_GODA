import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RequireAuth } from "@/components/auth/require-auth";
import { GrammarLesson } from "@/components/grammar/grammar-lesson";
import { PageLoading } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: "Học ngữ pháp N4",
  description: "Hiểu cách dùng, xem ví dụ và luyện ghép câu theo từng mục nhỏ.",
  robots: { index: false, follow: false },
};
export default function GrammarChapterPage({
  params,
}: PageProps<"/ngu-phap-n4/[chapter]">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <Suspense fallback={<PageLoading label="Đang chuẩn bị bài học…" />}>
        <Loader params={params} />
      </Suspense>
    </main>
  );
}
async function Loader({
  params,
}: {
  params: PageProps<"/ngu-phap-n4/[chapter]">["params"];
}) {
  const { chapter } = await params;
  if (!/^\d+$/.test(chapter) || Number(chapter) < 15 || Number(chapter) > 33)
    notFound();
  return (
    <RequireAuth next={`/ngu-phap-n4/${chapter}`}>
      <GrammarLesson chapter={Number(chapter)} />
    </RequireAuth>
  );
}

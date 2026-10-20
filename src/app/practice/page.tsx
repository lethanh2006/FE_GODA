import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeBuilder } from "@/components/practice/practice-builder";
import { Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Luyện tập theo dạng bài" };

export default function PracticePage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 pt-10 pb-8">
      <PageHeader
        title="Luyện tập theo dạng bài"
        description="Chọn cấp độ, dạng bài và cách luyện. Không chọn dạng nào thì luyện trộn tất cả các dạng."
      />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <PracticeBuilder />
      </Suspense>
    </main>
  );
}

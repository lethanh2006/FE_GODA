import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeBuilder } from "@/components/practice/practice-builder";
import { Skeleton } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Luyện tập theo dạng bài" };

export default function PracticePage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Luyện tập theo dạng bài</h1>
        <p className="mt-1 text-muted">Chọn cấp độ, dạng bài và cách luyện phù hợp với bạn.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <PracticeBuilder />
      </Suspense>
    </main>
  );
}

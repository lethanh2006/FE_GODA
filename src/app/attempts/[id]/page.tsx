import type { Metadata } from "next";
import { Suspense } from "react";
import { AttemptRunner } from "@/components/attempt/attempt-runner";
import { FrameMode } from "@/components/layout/frame-mode";
import { PageLoading } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Làm bài" };

export default function AttemptPage({ params }: PageProps<"/attempts/[id]">) {
  return (
    <div className="flex flex-1 flex-col">
      <FrameMode mode="exam" />
      <Suspense fallback={<PageLoading label="Đang tải đề…" />}>
        <AttemptLoader params={params} />
      </Suspense>
    </div>
  );
}

async function AttemptLoader({ params }: { params: PageProps<"/attempts/[id]">["params"] }) {
  const { id } = await params;
  return <AttemptRunner id={id} />;
}

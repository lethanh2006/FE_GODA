import type { Metadata } from "next";
import { Suspense } from "react";
import { AttemptRunner } from "@/components/attempt/attempt-runner";
import { PageLoading } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Làm bài" };

export default function AttemptPage({ params }: PageProps<"/attempts/[id]">) {
  return (
    <Suspense fallback={<PageLoading label="Đang tải đề…" />}>
      <AttemptLoader params={params} />
    </Suspense>
  );
}

async function AttemptLoader({ params }: { params: PageProps<"/attempts/[id]">["params"] }) {
  const { id } = await params;
  return <AttemptRunner id={id} />;
}

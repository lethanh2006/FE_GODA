import type { Metadata } from "next";
import { Suspense } from "react";
import { AttemptResult } from "@/components/attempt/attempt-result";
import { PageLoading } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Kết quả" };

export default function ResultPage({ params }: PageProps<"/attempts/[id]/result">) {
  return (
    <Suspense fallback={<PageLoading label="Đang tải kết quả…" />}>
      <ResultLoader params={params} />
    </Suspense>
  );
}

async function ResultLoader({ params }: { params: PageProps<"/attempts/[id]/result">["params"] }) {
  const { id } = await params;
  return <AttemptResult id={id} />;
}

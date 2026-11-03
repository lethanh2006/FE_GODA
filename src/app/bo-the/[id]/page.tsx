import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { DeckSession } from "@/components/decks/deck-session";
import { FrameMode } from "@/components/layout/frame-mode";
import { PageLoading } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Học bộ thẻ" };

export default function DeckPage({ params }: PageProps<"/bo-the/[id]">) {
  return (
    <main className="flex flex-1 flex-col">
      <FrameMode mode="focus" />
      <Suspense fallback={<PageLoading label="Đang chuẩn bị bộ thẻ…" />}>
        <DeckLoader params={params} />
      </Suspense>
    </main>
  );
}

async function DeckLoader({ params }: { params: PageProps<"/bo-the/[id]">["params"] }) {
  const { id } = await params;
  return (
    <RequireAuth next={`/bo-the/${id}`}>
      <DeckSession id={id} />
    </RequireAuth>
  );
}

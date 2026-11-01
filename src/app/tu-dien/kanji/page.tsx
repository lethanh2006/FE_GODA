import type { Metadata } from "next";
import { Suspense } from "react";
import { KanjiBrowser } from "@/components/dictionary/kanji-browser";
import { PageLoading } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: "Tra chữ Hán",
  description: "2.383 chữ Hán theo cấp JLPT, kèm âm Hán Việt, âm on, âm kun, số nét và từ thường gặp.",
};

export default function KanjiPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-10 pb-10 sm:px-8">
      <Suspense fallback={<PageLoading />}>
        <KanjiBrowser />
      </Suspense>
    </main>
  );
}

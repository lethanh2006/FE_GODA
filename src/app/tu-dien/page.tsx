import type { Metadata } from "next";
import { Suspense } from "react";
import { DictionaryHome } from "@/components/dictionary/dictionary-home";
import { PageLoading } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: "Từ điển Nhật – Việt",
  description: "Tra từ tiếng Nhật bằng chữ Hán, kana, romaji, tiếng Việt hoặc âm Hán Việt, kèm câu ví dụ và phân tích từng chữ.",
};

export default function DictionaryPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-10 pb-10 sm:px-8">
      <Suspense fallback={<PageLoading />}>
        <DictionaryHome />
      </Suspense>
    </main>
  );
}

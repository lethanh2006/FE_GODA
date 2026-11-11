"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import type { RelatedWordsResponse, WordSummary } from "@/lib/vocab";

/** Nét nghĩa đầu tiên, ngắn gọn cho thẻ nhỏ. */
const firstMeaning = (word: WordSummary) => (word.meaningsVi[0] ?? word.meaningsEn[0] ?? "").split(/[;,]/)[0];

/**
 * "Từ liên quan để học tiếp": lưới thẻ như khối "Cùng chủ đề" của Hanni. Danh sách do AI tính sẵn
 * (model embedding, GĐ1 kế hoạch AI). Tính năng tắt, lỗi hoặc không có gợi ý thì không hiện gì.
 */
export function RelatedWords({ wordId }: { wordId: string }) {
  const { data } = useSWR<RelatedWordsResponse>(`/dictionary/words/${encodeURIComponent(wordId)}/related?limit=6`);
  if (data?.status !== "ready" || data.items.length === 0) return null;

  return (
    <Card className="space-y-4 p-5 sm:p-6">
      <h2 className="text-[15px] font-semibold">Từ liên quan để học tiếp</h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {data.items.map((word) => (
          <li key={word.id} className="min-w-0">
            <Link
              href={`/tu-dien/${word.id}`}
              className="block h-full rounded-xl border border-border px-3 py-2.5 transition-colors hover:border-primary/40 focus-visible:border-primary"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span lang="ja" className="jp truncate text-lg font-semibold">
                  {word.word}
                </span>
                {word.level && <span className="shrink-0 text-[11px] font-semibold text-primary">{word.level}</span>}
              </span>
              <span className="block truncate text-xs text-muted">
                {word.reading !== word.word && <span lang="ja">{word.reading}</span>}
                {word.hanviet && <span className="ml-1 font-semibold text-hanviet uppercase">{word.hanviet}</span>}
              </span>
              <span className="mt-0.5 block truncate text-sm">{firstMeaning(word)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="flex items-start gap-1.5 text-xs text-muted">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
        Gợi ý tự động bằng AI theo nghĩa và chủ đề; các từ không nhất thiết thay thế được cho nhau.
      </p>
    </Card>
  );
}

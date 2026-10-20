import { ArrowRight, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { LEVEL_META, LEVELS } from "@/lib/jlpt";
import { serverApi } from "@/lib/server-api";
import type { Catalog, LevelOverview } from "@/lib/types";

/** Thẻ các cấp độ kèm số liệu thật từ API (nếu backend chưa chạy thì chỉ hiện thông tin tĩnh). */
export async function LevelCards() {
  const catalog = await serverApi<Catalog>("/catalog").catch(() => null);
  return <LevelGrid overview={catalog?.levels} />;
}

export function LevelGrid({ overview }: { overview?: LevelOverview[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {LEVELS.map((level) => {
        const meta = LEVEL_META[level];
        const stats = overview?.find((o) => o.level === level);
        return (
          <Link
            key={level}
            href={`/${level.toLowerCase()}`}
            className={cn(
              "group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors",
              "hover:border-primary/50",
            )}
          >
            <div className="flex items-baseline justify-between">
              <span className={"text-3xl font-bold"}>{level}</span>
              <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
            </div>
            <div>
              <p className="font-semibold">{meta.name}</p>
              <p className="text-xs text-muted">
                {meta.kanji} · {meta.vocab}
              </p>
            </div>
            <div className="mt-auto space-y-1 text-xs text-muted">
              {stats ? (
                <>
                  <p className="flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    {stats.examCount > 0 ? `${stats.examCount} đề thi thử · ` : ""}
                    {formatNumber(stats.totalQuestions)} câu
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> Đề: {stats.examQuestions} câu / {stats.examMinutes} phút
                  </p>
                </>
              ) : (
                <p className="h-8" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

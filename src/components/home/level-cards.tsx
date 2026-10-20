import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { LEVEL_META, LEVELS } from "@/lib/jlpt";
import { serverApi } from "@/lib/server-api";
import type { Catalog, JlptLevel, LevelOverview } from "@/lib/types";

/** Thẻ các cấp độ kèm số liệu thật từ API (nếu backend chưa chạy thì chỉ hiện thông tin tĩnh). */
export async function LevelCards() {
  const catalog = await serverApi<Catalog>("/catalog").catch(() => null);
  return <LevelGrid overview={catalog?.levels} />;
}

/** Thước độ khó 5 nấc. */
export function DifficultyMeter({ level, className }: { level: JlptLevel; className?: string }) {
  const value = LEVEL_META[level].difficulty;
  return (
    <span className={cn("flex items-end gap-[3px]", className)} role="img" aria-label={`Độ khó ${value}/5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          className={cn("w-[5px] rounded-[1.5px]", step <= value ? "bg-primary" : "bg-border-strong/60")}
          style={{ height: 6 + step * 2.5 }}
        />
      ))}
    </span>
  );
}

export function LevelGrid({ overview }: { overview?: LevelOverview[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {LEVELS.map((level) => {
        const meta = LEVEL_META[level];
        const stats = overview?.find((o) => o.level === level);
        return (
          <Link
            key={level}
            href={`/${level.toLowerCase()}`}
            className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-lg hover:shadow-black/[0.04]"
          >
            <div className="flex items-start justify-between">
              <span className="text-[2rem] leading-none font-bold tracking-tight">{level}</span>
              <DifficultyMeter level={level} className="mt-1" />
            </div>
            <p className="mt-3 font-semibold">{meta.name}</p>
            <p className="text-xs text-muted">
              {meta.kanji} · {meta.vocab}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-y-1 border-t border-border pt-4 text-xs">
              <dt className="text-muted">Đề thi thử</dt>
              <dd className="text-right font-medium tabular-nums">{stats ? stats.examCount : "—"}</dd>
              <dt className="text-muted">Câu hỏi</dt>
              <dd className="text-right font-medium tabular-nums">{stats ? formatNumber(stats.totalQuestions) : "—"}</dd>
              <dt className="text-muted">Thời gian thi</dt>
              <dd className="text-right font-medium tabular-nums">{stats ? `${stats.examMinutes} phút` : "—"}</dd>
            </dl>
            <span className="mt-4 text-sm font-semibold text-primary">
              Luyện {level} <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

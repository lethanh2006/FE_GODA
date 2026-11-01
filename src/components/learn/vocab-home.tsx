"use client";

import { ArrowRight, Layers, NotebookText } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { ButtonLink } from "@/components/ui/button";
import { ErrorNotice, ProgressBar, Skeleton } from "@/components/ui/feedback";
import { formatNumber } from "@/lib/format";
import { LEVEL_META } from "@/lib/jlpt";
import type { StudyStats, VocabLevel } from "@/lib/vocab";

export function VocabHome() {
  const { user } = useAuth();
  const { data: levels, error } = useSWR<VocabLevel[]>("/vocab/levels");
  const { data: stats } = useSWR<StudyStats>(user ? "/study/stats" : null);

  return (
    <div className="space-y-8">
      {user && stats && (
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="panel hero flex flex-wrap items-center gap-5 p-6">
            <span className="icon-tile bg-card"><Layers className="size-5" aria-hidden /></span>
            <div className="min-w-48 flex-1">
              <p className="text-2xl font-bold tracking-tight tabular-nums">
                {stats.due > 0 ? `${formatNumber(stats.due)} từ cần ôn` : "Hôm nay đã ôn xong"}
              </p>
              <p className="text-sm text-muted">
                {stats.due > 0
                  ? "Ôn ngay lúc này để nhớ lâu hơn."
                  : stats.total > 0
                    ? "Từ đến hạn tiếp theo sẽ tự xuất hiện ở đây."
                    : "Học bài đầu tiên để bắt đầu sổ ôn của bạn."}
              </p>
            </div>
            {stats.due > 0 && <ButtonLink href="/on-tap">Ôn tập ngay</ButtonLink>}
          </div>
          <Link href="/so-tu" className="panel flex items-center gap-4 p-6 transition-colors hover:border-primary/40">
            <span className="icon-tile"><NotebookText className="size-5" aria-hidden /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Sổ từ của bạn</span>
              <span className="block text-sm text-muted tabular-nums">
                {formatNumber(stats.total)} từ · {formatNumber(stats.mature)} từ đã nhớ chắc
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden />
          </Link>
        </div>
      )}

      {error ? (
        <ErrorNotice message="Không tải được danh sách cấp độ. Vui lòng thử lại." />
      ) : !levels ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {levels.map((item) => (
            <li key={item.level}>
              <Link
                href={`/hoc-tu/${item.level.toLowerCase()}`}
                className="panel flex h-full flex-col gap-3 p-5 transition-colors hover:border-primary/40"
              >
                <span className="text-[2rem] leading-none font-bold tracking-tight">{item.level}</span>
                <span>
                  <span className="block text-sm font-semibold">{LEVEL_META[item.level].name}</span>
                  <span className="block text-xs text-muted tabular-nums">
                    {formatNumber(item.words)} từ · {item.lessons} bài
                  </span>
                </span>
                <span className="mt-auto space-y-1.5">
                  <ProgressBar value={item.words ? (item.learned / item.words) * 100 : 0} />
                  <span className="block text-xs text-muted tabular-nums">
                    {user ? `Đã học ${formatNumber(item.learned)}` : "Chưa có tiến độ"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!user && (
        <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="text-sm text-muted">
            Không cần tài khoản để học thử. Đăng ký để lưu tiến độ và được nhắc ôn đúng lúc sắp quên.
          </p>
          <ButtonLink href="/register?next=/hoc-tu" size="sm">Đăng ký miễn phí</ButtonLink>
        </div>
      )}
    </div>
  );
}

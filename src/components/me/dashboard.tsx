"use client";

import { Flame, PlayCircle, RotateCcw, Target, Timer, TrendingUp } from "lucide-react";
import useSWR from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { BarList } from "@/components/charts/bar-list";
import { ColumnChart } from "@/components/charts/column-chart";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, ErrorNotice, PageLoading } from "@/components/ui/feedback";
import { LevelBadge } from "@/components/ui/badge";
import { useStartAttempt } from "@/lib/attempts";
import { formatDuration, formatNumber, formatPercent } from "@/lib/format";
import { LEVELS } from "@/lib/jlpt";
import type { UserStats } from "@/lib/types";
import { AttemptList } from "./attempt-list";

const shortDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${Number(d)}/${Number(m)}`;
};

export function Dashboard() {
  const { user } = useAuth();
  const { data: stats, error } = useSWR<UserStats>("/me/stats");
  const { start, pending, error: startError } = useStartAttempt();

  if (error) return <ErrorNotice message="Không tải được thống kê." />;
  if (!stats) return <PageLoading />;

  const { totals } = stats;
  const weakest = stats.byType.filter((t) => t.answered >= 3).slice(0, 6);
  const levels = LEVELS.map((level) => stats.byLevel.find((l) => l.level === level)).filter((l) => l !== undefined);

  if (totals.attempts === 0 && stats.inProgress.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp className="size-8" />}
        title={`Chào ${user?.displayName ?? "bạn"}! Bạn chưa làm bài nào.`}
        description="Làm một đề thi thử hoặc vài câu luyện tập để bắt đầu theo dõi tiến độ."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href={`/${(user?.targetLevel ?? "N5").toLowerCase()}`}>Chọn đề để làm</ButtonLink>
            <ButtonLink href="/practice" variant="secondary">Luyện tập nhanh</ButtonLink>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={<Target className="size-4" />} label="Độ chính xác" value={formatPercent(totals.accuracy !== null ? totals.accuracy * 100 : null)} hint={`${formatNumber(totals.correct)}/${formatNumber(totals.answered)} câu đúng`} />
        <StatTile icon={<TrendingUp className="size-4" />} label="Bài đã nộp" value={formatNumber(totals.attempts)} hint={`${formatNumber(totals.distinctQuestions)} câu khác nhau`} />
        <StatTile icon={<Timer className="size-4" />} label="Thời gian học" value={formatDuration(totals.studySeconds)} hint="Tổng thời gian làm bài" />
        <StatTile icon={<Flame className="size-4" />} label="Chuỗi ngày học" value={`${totals.streakDays} ngày`} hint={totals.streakDays ? "Giữ vững nhé!" : "Làm 1 bài hôm nay để bắt đầu"} />
      </div>

      {stats.inProgress.length > 0 && (
        <Card>
          <CardHeader title="Đang làm dở" description="Bài làm được lưu tự động, bấm để làm tiếp." />
          <ul className="flex flex-wrap gap-2 p-5">
            {stats.inProgress.map((a) => (
              <li key={a.id}>
                <ButtonLink href={`/attempts/${a.id}`} variant="secondary" size="sm">
                  <PlayCircle className="size-4" /> <LevelBadge level={a.level} /> {a.title}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Số câu đã làm mỗi ngày" description="30 ngày gần nhất" />
          <div className="p-5 pt-8">
            <ColumnChart
              title="Số câu đã làm mỗi ngày trong 30 ngày gần nhất"
              unit="câu"
              data={stats.activity.map((d) => ({
                key: d.date,
                label: shortDate(d.date),
                value: d.questions,
                detail: d.questions ? `${d.correct} đúng · ${formatDuration(d.seconds)}` : undefined,
              }))}
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Độ chính xác theo cấp độ"
            action={
              totals.mistakes > 0 ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pending !== null}
                  onClick={() => start({ kind: "practice", focus: "mistakes", count: 20 }, "mistakes")}
                >
                  <RotateCcw className="size-4" /> {pending === "mistakes" ? "…" : `Ôn ${totals.mistakes} câu sai`}
                </Button>
              ) : undefined
            }
          />
          <div className="p-5">
            <BarList
              items={levels.map((l) => {
                const percent = l.answered ? (l.correct / l.answered) * 100 : null;
                return {
                  key: l.level,
                  label: (
                    <span className="flex items-center gap-2">
                      <LevelBadge level={l.level} /> {formatNumber(l.answered)} lượt trả lời
                    </span>
                  ),
                  percent,
                  valueLabel: `${formatPercent(percent)}${l.mistakes ? ` · ${l.mistakes} câu sai` : ""}`,
                };
              })}
            />
            {startError && <p className="mt-3 text-sm text-red-600">{startError}</p>}
          </div>
        </Card>
      </div>

      {weakest.length > 0 && (
        <Card>
          <CardHeader title="Dạng bài cần cải thiện" description="Tỷ lệ đúng thấp nhất (tính trên dạng đã làm ít nhất 3 lượt)." />
          <div className="p-5">
            <BarList
              items={weakest.map((t) => {
                const percent = t.accuracy !== null ? t.accuracy * 100 : null;
                const key = `${t.level}-${t.type}`;
                return {
                  key,
                  label: (
                    <span className="flex items-center gap-2">
                      <LevelBadge level={t.level} />
                      <span className="jp">{t.nameJa}</span>
                      <span className="hidden text-xs text-muted sm:inline">{t.nameVi}</span>
                    </span>
                  ),
                  percent,
                  valueLabel: `${formatPercent(percent)} · ${t.correct}/${t.answered}`,
                  action: (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                      disabled={pending !== null}
                      onClick={() => start({ kind: "practice", level: t.level, types: [t.type], count: 10 }, key)}
                    >
                      {pending === key ? "…" : "Luyện"}
                    </button>
                  ),
                };
              })}
            />
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Bài làm gần đây" action={<ButtonLink href="/history" variant="ghost" size="sm">Xem tất cả</ButtonLink>} />
        <div className="pt-3 pb-2">
          <AttemptList items={stats.recentAttempts} />
        </div>
      </Card>
    </div>
  );
}

function StatTile({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-1.5 text-sm text-muted">{icon} {label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Card>
  );
}

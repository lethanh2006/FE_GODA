import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExamStartPanel } from "@/components/exam/exam-start-panel";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/feedback";
import { formatDateTime, formatDuration, formatPercent } from "@/lib/format";
import { SOURCE_LABEL } from "@/lib/jlpt";
import { serverApi } from "@/lib/server-api";
import type { ExamDetail } from "@/lib/types";

export const metadata: Metadata = { title: "Đề thi thử" };

export default function ExamPage({ params }: PageProps<"/exams/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <Suspense fallback={<PageLoading label="Đang tải đề thi…" />}>
        <ExamContent params={params} />
      </Suspense>
    </main>
  );
}

async function ExamContent({ params }: { params: PageProps<"/exams/[slug]">["params"] }) {
  const { slug } = await params;
  const exam = await serverApi<ExamDetail>(`/exams/${encodeURIComponent(slug)}`);
  if (!exam) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href={`/${exam.level.toLowerCase()}`} className="text-muted hover:text-foreground">
            ← JLPT {exam.level}
          </Link>
          <LevelBadge level={exam.level} />
          <Badge tone={exam.source === "goda" ? "primary" : "neutral"}>{SOURCE_LABEL[exam.source] ?? exam.source}</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
        {exam.description && <p className="max-w-3xl text-muted">{exam.description}</p>}
        <p className="text-sm text-muted">
          {exam.totalQuestions} câu · {exam.totalMinutes} phút · chưa gồm phần Nghe hiểu (聴解)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {exam.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader
                title={<span className="jp">{section.title}</span>}
                description={`${section.titleVi} · ${section.questionCount} câu · ${section.durationMinutes} phút`}
              />
              <div className="overflow-x-auto p-5">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-muted">
                    <tr className="border-b border-border">
                      <th className="py-2 pr-4 font-medium">問題</th>
                      <th className="py-2 pr-4 font-medium">Dạng bài</th>
                      <th className="py-2 text-right font-medium">Số câu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.mondai.map((m) => (
                      <tr key={m.number} className="border-b border-border last:border-0">
                        <td className="jp py-2 pr-4 font-medium">問題{m.number}</td>
                        <td className="py-2 pr-4">
                          <span className="jp">{m.nameJa}</span>
                          <span className="ml-2 text-xs text-muted">{m.nameVi}</span>
                        </td>
                        <td className="py-2 text-right tabular-nums">{m.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}

          {exam.history.length > 0 && (
            <Card>
              <CardHeader title="Lịch sử làm đề này" />
              <ul className="divide-y divide-border p-5 pt-3">
                {exam.history.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="text-muted">{formatDateTime(h.submittedAt)}</span>
                    <span>{h.mode === "EXAM" ? "Thi thử" : "Luyện tập"}</span>
                    <span className="tabular-nums">
                      {h.correctCount}/{h.totalCount} · {formatPercent(h.scorePercent)}
                    </span>
                    <span className="text-muted">{formatDuration(h.timeSpentSeconds)}</span>
                    <Link href={`/attempts/${h.id}/result`} className="text-primary hover:underline">
                      Xem lại
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ExamStartPanel exam={exam} />
        </aside>
      </div>
    </div>
  );
}

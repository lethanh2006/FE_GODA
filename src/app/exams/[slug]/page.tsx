import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExamStartPanel } from "@/components/exam/exam-start-panel";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime, formatDuration, formatPercent } from "@/lib/format";
import { SOURCE_LABEL } from "@/lib/jlpt";
import { serverApi } from "@/lib/server-api";
import type { ExamDetail } from "@/lib/types";

export const metadata: Metadata = { title: "Đề thi thử" };

export default function ExamPage({ params }: PageProps<"/exams/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-8">
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

  const levelHref = `/${exam.level.toLowerCase()}`;
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href={levelHref} className="hover:text-foreground">JLPT {exam.level}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Đề số {exam.number}</span>
        </nav>
        <PageHeader
          title={exam.title}
          description={exam.description}
          eyebrow={
            <span className="flex flex-wrap items-center gap-2">
              <LevelBadge level={exam.level} />
              <Badge tone={exam.source === "goda" ? "primary" : "neutral"}>{SOURCE_LABEL[exam.source] ?? exam.source}</Badge>
            </span>
          }
        />
        <dl className="flex flex-wrap gap-x-10 gap-y-3">
          {[
            { label: "Số câu", value: exam.totalQuestions },
            { label: "Thời gian", value: `${exam.totalMinutes} phút` },
            { label: "Phần thi", value: exam.sections.length },
          ].map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-muted">{fact.label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>
        {!exam.sections.some((s) => s.title === "聴解") && (
          <p className="text-sm text-muted">Đề này chưa gồm phần Nghe hiểu (聴解).</p>
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          {exam.sections.map((section, index) => (
            <Card key={section.id} className="overflow-hidden">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-medium text-muted">Phần {index + 1}</p>
                  <h2 className="jp mt-0.5 text-[15px] font-semibold">{section.title}</h2>
                  <p className="text-sm text-muted">{section.titleVi}</p>
                </div>
                <p className="text-sm text-muted tabular-nums">
                  {section.questionCount} câu · {section.durationMinutes} phút
                </p>
              </div>
              <table className="w-full text-left text-sm">
                <tbody>
                  {section.mondai.map((m) => (
                    <tr key={m.number} className="border-b border-border last:border-0">
                      <td className="jp w-20 py-2.5 pl-5 font-medium sm:pl-6">問題{m.number}</td>
                      <td className="py-2.5 pr-4">
                        <span className="jp">{m.nameJa}</span>
                        <span className="ml-2 text-xs text-muted">{m.nameVi}</span>
                      </td>
                      <td className="py-2.5 pr-5 text-right text-muted tabular-nums sm:pr-6">{m.count} câu</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}

          {exam.history.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader title="Lịch sử làm đề này" />
              <ul className="mt-3 divide-y divide-border border-t border-border">
                {exam.history.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/attempts/${h.id}/result`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm hover:bg-subtle sm:px-6"
                    >
                      <span className="w-36 text-muted">{formatDateTime(h.submittedAt)}</span>
                      <span className="w-20">{h.mode === "EXAM" ? "Thi thử" : "Luyện tập"}</span>
                      <span className="flex-1 font-medium tabular-nums">
                        {h.correctCount}/{h.totalCount} · {formatPercent(h.scorePercent)}
                      </span>
                      <span className="text-muted">{formatDuration(h.timeSpentSeconds)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <ExamStartPanel exam={exam} />
        </aside>
      </div>
    </div>
  );
}

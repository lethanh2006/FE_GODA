"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { JpText } from "@/components/question/jp-text";
import { OptionList } from "@/components/question/option-list";
import { LevelBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorNotice, PageLoading } from "@/components/ui/feedback";
import { Segmented } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { QUESTION_TYPES } from "@/lib/jlpt";
import type { JlptLevel, QuestionType } from "@/lib/types";

type ReportStatus = "OPEN" | "RESOLVED" | "REJECTED";

interface Report {
  id: string;
  reason: string;
  message: string | null;
  status: ReportStatus;
  createdAt: string;
  user: { id: string; email: string; displayName: string } | null;
  question: {
    id: string;
    level: JlptLevel;
    type: QuestionType;
    prompt: string;
    options: string[];
    answerIndex: number;
  };
}

const REASON_LABEL: Record<string, string> = {
  wrong_answer: "Đáp án sai",
  multiple_answers: "Nhiều đáp án đúng",
  typo: "Lỗi chính tả / hiển thị",
  unclear: "Đề khó hiểu",
  other: "Khác",
};

export function AdminReports() {
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState<ReportStatus>("OPEN");
  const { data, error, mutate } = useSWR<Report[]>(user?.role === "ADMIN" ? `/admin/reports?status=${status}` : null);
  const [busy, setBusy] = useState<string | null>(null);

  if (isLoading) return <PageLoading />;
  if (user?.role !== "ADMIN") {
    return <EmptyState title="Chỉ quản trị viên mới xem được trang này" />;
  }

  const setReportStatus = async (id: string, next: ReportStatus) => {
    setBusy(id);
    try {
      await api(`/admin/reports/${id}`, { method: "PATCH", json: { status: next } });
      await mutate();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <Segmented<ReportStatus>
        value={status}
        onChange={setStatus}
        options={[
          { value: "OPEN", label: "Chờ xử lý" },
          { value: "RESOLVED", label: "Đã sửa" },
          { value: "REJECTED", label: "Bỏ qua" },
        ]}
      />
      {error && <ErrorNotice message="Không tải được danh sách báo lỗi." />}
      {!data && !error && <PageLoading />}
      {data?.length === 0 && <EmptyState title="Không có báo lỗi nào" />}
      {data?.map((report) => (
        <Card key={report.id} className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <LevelBadge level={report.question.level} />
            <span className="jp">{QUESTION_TYPES[report.question.type].nameJa}</span>
            <code className="rounded bg-subtle px-1.5 py-0.5 text-xs">{report.question.id}</code>
            <span className="ml-auto text-xs text-muted">{formatDateTime(report.createdAt)}</span>
          </div>
          <div className="rounded-lg bg-warning-soft p-3 text-sm">
            <p className="font-medium">{REASON_LABEL[report.reason] ?? report.reason}</p>
            {report.message && <p className="mt-1 whitespace-pre-line">{report.message}</p>}
            <p className="mt-1 text-xs text-muted">
              {report.user ? `${report.user.displayName} (${report.user.email})` : "Khách"}
            </p>
          </div>
          <div className="exam-paper space-y-3">
            <JpText text={report.question.prompt} className="block" />
            <OptionList
              options={report.question.options}
              selectedIndex={null}
              answerIndex={report.question.answerIndex}
              compact
            />
          </div>
          {report.status === "OPEN" && (
            <div className="flex gap-2">
              <Button size="sm" variant="success" disabled={busy === report.id} onClick={() => setReportStatus(report.id, "RESOLVED")}>
                Đánh dấu đã sửa
              </Button>
              <Button size="sm" variant="secondary" disabled={busy === report.id} onClick={() => setReportStatus(report.id, "REJECTED")}>
                Bỏ qua
              </Button>
            </div>
          )}
        </Card>
      ))}
      <p className="text-xs text-muted">
        Sửa nội dung câu hỏi trong repo backend (thư mục <code>content/</code>) rồi chạy <code>pnpm db:seed</code>, sau đó đánh dấu “Đã sửa”.
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminReports } from "@/components/admin/reports";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata: Metadata = { title: "Báo lỗi câu hỏi", robots: { index: false } };

export default function AdminReportsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 pt-10 pb-8">
      <PageHeader title="Báo lỗi câu hỏi" description="Báo lỗi do người học gửi. Sửa câu hỏi trong content/ của backend rồi đánh dấu đã sửa." />
      <RequireAuth next="/admin/reports">
        <AdminReports />
      </RequireAuth>
    </main>
  );
}

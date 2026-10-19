import type { Metadata } from "next";
import { AdminReports } from "@/components/admin/reports";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata: Metadata = { title: "Báo lỗi câu hỏi", robots: { index: false } };

export default function AdminReportsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Báo lỗi câu hỏi</h1>
      <RequireAuth next="/admin/reports">
        <AdminReports />
      </RequireAuth>
    </main>
  );
}

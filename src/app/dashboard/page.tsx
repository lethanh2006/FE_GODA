import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { RequireAuth } from "@/components/auth/require-auth";
import { Dashboard } from "@/components/me/dashboard";

export const metadata: Metadata = { title: "Tiến độ học tập" };

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 pt-10 pb-8">
      <PageHeader title="Tiến độ học tập" description="Độ chính xác theo cấp độ và dạng bài, hoạt động 30 ngày gần nhất." />
      <RequireAuth next="/dashboard">
        <Dashboard />
      </RequireAuth>
    </main>
  );
}

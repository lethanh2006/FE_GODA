import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { RequireAuth } from "@/components/auth/require-auth";
import { History } from "@/components/me/history";

export const metadata: Metadata = { title: "Lịch sử làm bài" };

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 pt-10 pb-8">
      <PageHeader title="Lịch sử làm bài" description="Mọi lượt thi thử và luyện tập của bạn. Bấm vào một lượt để xem lại hoặc làm tiếp." />
      <RequireAuth next="/history">
        <History />
      </RequireAuth>
    </main>
  );
}

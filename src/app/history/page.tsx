import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { History } from "@/components/me/history";

export const metadata: Metadata = { title: "Lịch sử làm bài" };

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Lịch sử làm bài</h1>
      <RequireAuth next="/history">
        <History />
      </RequireAuth>
    </main>
  );
}

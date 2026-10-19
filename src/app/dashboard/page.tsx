import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { Dashboard } from "@/components/me/dashboard";

export const metadata: Metadata = { title: "Tiến độ học tập" };

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Tiến độ học tập</h1>
      <RequireAuth next="/dashboard">
        <Dashboard />
      </RequireAuth>
    </main>
  );
}

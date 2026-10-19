import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { SettingsForm } from "@/components/me/settings-form";

export const metadata: Metadata = { title: "Cài đặt tài khoản" };

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Cài đặt tài khoản</h1>
      <RequireAuth next="/settings">
        <SettingsForm />
      </RequireAuth>
    </main>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { RequireAuth } from "@/components/auth/require-auth";
import { SettingsForm } from "@/components/me/settings-form";

export const metadata: Metadata = { title: "Cài đặt tài khoản" };

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 pt-10 pb-8">
      <PageHeader title="Cài đặt" description="Thông tin tài khoản, cấp độ mục tiêu và giao diện." />
      <RequireAuth next="/settings">
        <SettingsForm />
      </RequireAuth>
    </main>
  );
}

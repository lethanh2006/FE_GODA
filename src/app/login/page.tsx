import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Skeleton } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Đăng nhập</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Tiếp tục luyện đề và xem lại tiến độ của bạn.</p>
        <Suspense fallback={<Skeleton className="h-64" />}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </main>
  );
}

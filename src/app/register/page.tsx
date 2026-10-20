import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Skeleton } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Đăng ký" };

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/[0.04] sm:p-8">
        <span className="flex size-10 items-center justify-center rounded-lg bg-accent font-serif-jp text-xl text-white">合</span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Tạo tài khoản</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Miễn phí. Lưu kết quả, ôn câu sai và theo dõi tiến độ học.</p>
        <Suspense fallback={<Skeleton className="h-64" />}>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </main>
  );
}

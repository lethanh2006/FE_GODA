"use client";

import { LogIn } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageLoading } from "@/components/ui/feedback";
import { useAuth } from "./auth-provider";

export function RequireAuth({ next, children }: { next: string; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoading />;
  if (!user) {
    return (
      <EmptyState
        icon={<LogIn className="size-8" />}
        title="Đăng nhập để xem mục này"
        description="Tiến độ, lịch sử làm bài và câu hỏi đã lưu được gắn với tài khoản của bạn."
        action={
          <div className="flex gap-2">
            <ButtonLink href={`/login?next=${encodeURIComponent(next)}`}>Đăng nhập</ButtonLink>
            <ButtonLink href={`/register?next=${encodeURIComponent(next)}`} variant="secondary">Đăng ký</ButtonLink>
          </div>
        }
      />
    );
  }
  return <>{children}</>;
}

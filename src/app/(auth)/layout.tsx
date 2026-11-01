import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { FrameMode } from "@/components/layout/frame-mode";
import { Logo } from "@/components/layout/header";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Mascot } from "@/components/mascot/mascot";
import { Skeleton } from "@/components/ui/feedback";

/**
 * Màn đăng nhập và đăng ký dùng chung một form đặt ở layout, nên chuyển qua lại giữa hai trang
 * vẫn giữ email đã gõ và phần chữ bên phải đổi có hiệu ứng.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-screen">
      <FrameMode mode="focus" />
      <section className="auth-entry">
        <header className="auth-header">
          <Logo tagline={false} />
          <ThemeToggle />
        </header>
        <main className="auth-main">
          <div className="auth-card">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <AuthForm />
            </Suspense>
          </div>
          {children}
        </main>
        <footer className="auth-footer">
          <span>© GODA JLPT</span>
          <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
            <ArrowLeft className="size-3.5" />
            Về trang chủ
          </Link>
        </footer>
      </section>

      <aside className="auth-story" aria-label="Cùng GODA học tiếng Nhật mỗi ngày">
        <span className="auth-story-pattern font-serif-jp" lang="ja" aria-hidden="true">
          語
        </span>
        <div className="auth-story-content">
          <div className="auth-mascot-stage">
            <Mascot animation="login" className="auth-mascot auth-mascot-login" />
            <Mascot animation="register" className="auth-mascot auth-mascot-register" />
          </div>
          <div className="auth-copy-stack">
            <div className="auth-copy auth-copy-login">
              <p lang="ja" className="font-serif-jp text-lg tracking-[.18em] text-white/90">
                継続は力なり
              </p>
              <h2 className="mt-4 text-2xl leading-snug font-bold tracking-tight sm:text-3xl">
                Mỗi lần quay lại,
                <br />
                gần kỳ thi thêm một bước.
              </h2>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-white/90">
                Từ đến hạn ôn và đề đang luyện vẫn chờ bạn.
              </p>
            </div>
            <div className="auth-copy auth-copy-register">
              <p lang="ja" className="font-serif-jp text-lg tracking-[.18em] text-white/90">
                千里の道も一歩から
              </p>
              <h2 className="mt-4 text-2xl leading-snug font-bold tracking-tight sm:text-3xl">
                Bắt đầu từ một chữ,
                <br />
                đi tới ngày thi JLPT.
              </h2>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-white/90">
                Tạo tài khoản để lưu từ đã học, kết quả đề và lịch ôn.
              </p>
            </div>
          </div>
          <span className="auth-story-note">
            <Sparkles className="size-3.5" />
            Luyện đề · Học từ · Tra từ
          </span>
        </div>
      </aside>
    </div>
  );
}

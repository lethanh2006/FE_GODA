"use client";

import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { getPendingWords } from "@/lib/vocab";
import { useAuth } from "./auth-provider";

/** Chỉ cho phép chuyển hướng nội bộ để tránh open redirect. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/hoc-tu";
}

const noSubscribe = () => () => {};
const pendingWordCount = () => getPendingWords().length;

const COPY = {
  login: {
    title: "Chào mừng bạn trở lại",
    subtitle: "Tiếp tục luyện đề và ôn những từ đã học.",
    submit: "Đăng nhập",
    busy: "Đang đăng nhập…",
  },
  register: {
    title: "Bắt đầu cùng GODA",
    subtitle: "Miễn phí. Lưu từ đã học, kết quả đề và lịch ôn của bạn.",
    submit: "Tạo tài khoản",
    busy: "Đang tạo tài khoản…",
  },
};

export function AuthForm() {
  const { user, isLoading, login, register } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const mode = pathname.startsWith("/register") ? "register" : "login";
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Khách vừa học bài (localStorage): máy chủ luôn coi là 0.
  const pendingWords = useSyncExternalStore(noSubscribe, pendingWordCount, () => 0);

  const [shownMode, setShownMode] = useState(mode);
  if (shownMode !== mode) {
    setShownMode(mode);
    setError(null);
  }

  // Đã đăng nhập sẵn mà vào đây thì đi tiếp; lúc đang gửi form thì để onSubmit tự chuyển trang.
  const submitting = useRef(false);
  useEffect(() => {
    if (!isLoading && user && !submitting.current) router.replace(next);
  }, [isLoading, user, router, next]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") await login(email, password);
      else await register({ email, password, displayName });
      router.replace(next);
      // Trang vừa rời được giữ ẩn trong DOM, nên phải xoá mật khẩu và mở lại form.
      setPassword("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  return (
    <div data-mode={mode}>
      <div key={mode} className="auth-heading">
        <span className="auth-label">
          <Sparkles className="size-3" />
          MỖI NGÀY MỘT CHÚT TIẾNG NHẬT
        </span>
        <h1 className="mt-5 text-[27px] leading-tight font-bold tracking-tight sm:text-3xl">
          {copy.title}
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-2.5 text-sm leading-6 text-muted">
          {mode === "register" && pendingWords > 0
            ? `${pendingWords} từ bạn vừa học sẽ được lưu ngay khi tạo tài khoản xong.`
            : copy.subtitle}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-5" aria-busy={busy}>
        {mode === "register" && (
          <div>
            <label htmlFor="auth-name" className="mb-2 block text-xs font-semibold">
              Tên hiển thị
            </label>
            <input
              id="auth-name"
              className="auth-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              autoComplete="nickname"
              placeholder="Tên bạn muốn được gọi"
            />
          </div>
        )}
        <div>
          <label htmlFor="auth-email" className="mb-2 block text-xs font-semibold">
            Email
          </label>
          <input
            id="auth-email"
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="ban@email.com"
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="mb-2 block text-xs font-semibold">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="auth-password"
              className="auth-input pr-12"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 8 : 1}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "register" ? "Ít nhất 8 ký tự" : "Nhập mật khẩu của bạn"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-1 flex w-10 items-center justify-center rounded-lg text-muted transition-colors hover:text-primary"
            >
              {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full rounded-[14px]" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {copy.busy}
            </>
          ) : (
            <>
              {copy.submit}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs leading-6 text-muted">
        {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
        <Link
          href={`/${mode === "login" ? "register" : "login"}?next=${encodeURIComponent(next)}`}
          replace
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
        </Link>
      </p>
      <p className="mt-1 text-center text-xs leading-6 text-muted">
        Chưa muốn đăng ký?{" "}
        <Link href="/hoc-tu" className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline">
          Vào học ở chế độ khách
        </Link>
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { useAuth } from "./auth-provider";

/** Chỉ cho phép chuyển hướng nội bộ để tránh open redirect. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") await login(email, password);
      else await register({ email, password, displayName });
      router.replace(next);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Có lỗi xảy ra, vui lòng thử lại.");
      setBusy(false);
    }
  };

  const input =
    "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-primary";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "register" && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Tên hiển thị</span>
          <input
            className={input}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            minLength={2}
            maxLength={50}
            autoComplete="nickname"
            placeholder="Nguyễn Văn A"
          />
        </label>
      )}
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Email</span>
        <input
          className={input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="ban@example.com"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Mật khẩu</span>
        <input
          className={input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === "register" ? 8 : 1}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder={mode === "register" ? "Tối thiểu 8 ký tự" : ""}
        />
      </label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
      </Button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>Chưa có tài khoản? <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">Đăng ký</Link></>
        ) : (
          <>Đã có tài khoản? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">Đăng nhập</Link></>
        )}
      </p>
    </form>
  );
}

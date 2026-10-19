"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { LEVEL_META, LEVELS } from "@/lib/jlpt";
import type { JlptLevel, User } from "@/lib/types";

export function SettingsForm() {
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [targetLevel, setTargetLevel] = useState<JlptLevel | null>(user?.targetLevel ?? null);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;
  const dirty = displayName.trim() !== user.displayName || targetLevel !== user.targetLevel;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("saving");
    setError(null);
    try {
      const updated = await api<User>("/users/me", {
        method: "PATCH",
        json: { displayName: displayName.trim(), targetLevel },
      });
      updateUser(updated);
      setState("saved");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không lưu được, vui lòng thử lại.");
      setState("idle");
    }
  };

  return (
    <form onSubmit={save}>
      <Card className="space-y-6 p-6">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Tên hiển thị</span>
          <input
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setState("idle");
            }}
            required
            minLength={2}
            maxLength={50}
            className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm font-medium">Cấp độ mục tiêu</p>
          <p className="text-xs text-muted">Trang Tiến độ sẽ gợi ý bài luyện theo cấp độ này.</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={targetLevel === level}
                onClick={() => {
                  setTargetLevel(level);
                  setState("idle");
                }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left transition-colors",
                  targetLevel === level ? "border-primary bg-primary-soft" : "border-border hover:bg-subtle",
                )}
              >
                <span className="block font-bold">{level}</span>
                <span className="block text-xs text-muted">{LEVEL_META[level].name}</span>
              </button>
            ))}
            <button
              type="button"
              aria-pressed={targetLevel === null}
              onClick={() => {
                setTargetLevel(null);
                setState("idle");
              }}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                targetLevel === null ? "border-primary bg-primary-soft" : "border-border hover:bg-subtle",
              )}
            >
              Chưa chọn
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border pt-5">
          <Button type="submit" disabled={!dirty || state === "saving"}>
            {state === "saving" ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
          {state === "saved" && !dirty && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <Check className="size-4" /> Đã lưu
            </span>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
        <p className="text-xs text-muted">Email đăng nhập: {user.email}</p>
      </Card>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { api, ApiError } from "./api";
import { rememberGuestAttempt } from "./guest";
import type { CreateAttemptInput } from "./types";

/** Tạo lượt làm bài rồi chuyển tới màn hình làm bài. */
export function useStartAttempt() {
  const router = useRouter();
  const { user } = useAuth();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (input: CreateAttemptInput, key = "default") => {
    setPending(key);
    setError(null);
    try {
      const { id } = await api<{ id: string }>("/attempts", { method: "POST", json: input });
      if (!user) rememberGuestAttempt(id);
      router.push(`/attempts/${id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tạo được bài làm, vui lòng thử lại.");
      setPending(null);
    }
  };

  return { start, pending, error, clearError: () => setError(null) };
}

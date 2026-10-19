"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import useSWR, { SWRConfig, useSWRConfig } from "swr";
import { api, ApiError, fetcher } from "@/lib/api";
import { clearGuestAttempts, getGuestAttempts } from "@/lib/guest";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { email: string; password: string; displayName: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<User | null> {
  try {
    return await api<User>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

function AuthState({ children }: { children: React.ReactNode }) {
  const { mutate: globalMutate } = useSWRConfig();
  const { data, isLoading, mutate } = useSWR("/auth/me", fetchMe, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const afterAuth = useCallback(
    async (user: User) => {
      await mutate(user, { revalidate: false });
      const guestIds = getGuestAttempts();
      if (guestIds.length) {
        await api("/attempts/claim", { method: "POST", json: { attemptIds: guestIds } }).catch(() => undefined);
        clearGuestAttempts();
      }
      // Làm mới mọi dữ liệu phụ thuộc người dùng (tiến độ đề, thống kê…).
      await globalMutate((key) => key !== "/auth/me", undefined, { revalidate: true });
      return user;
    },
    [mutate, globalMutate],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data ?? null,
      isLoading,
      login: async (email, password) => {
        const { user } = await api<{ user: User }>("/auth/login", { method: "POST", json: { email, password } });
        return afterAuth(user);
      },
      register: async (input) => {
        const { user } = await api<{ user: User }>("/auth/register", { method: "POST", json: input });
        return afterAuth(user);
      },
      logout: async () => {
        await api("/auth/logout", { method: "POST" });
        await mutate(null, { revalidate: false });
        await globalMutate((key) => key !== "/auth/me", undefined, { revalidate: false });
      },
      updateUser: (user) => void mutate(user, { revalidate: false }),
    }),
    [data, isLoading, afterAuth, mutate, globalMutate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ fetcher, revalidateOnFocus: false }}>
      <AuthState>{children}</AuthState>
    </SWRConfig>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải nằm trong <AuthProvider>");
  return context;
}

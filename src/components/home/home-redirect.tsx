"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";

/** Đã đăng nhập thì trang giới thiệu không còn cần thiết: vào thẳng góc học. */
export function HomeRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) router.replace("/hoc-tu");
  }, [user, router]);
  return null;
}

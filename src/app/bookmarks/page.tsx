import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { Bookmarks } from "@/components/me/bookmarks";

export const metadata: Metadata = { title: "Câu hỏi đã lưu" };

export default function BookmarksPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Câu hỏi đã lưu</h1>
      <RequireAuth next="/bookmarks">
        <Bookmarks />
      </RequireAuth>
    </main>
  );
}

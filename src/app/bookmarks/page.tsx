import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { RequireAuth } from "@/components/auth/require-auth";
import { Bookmarks } from "@/components/me/bookmarks";

export const metadata: Metadata = { title: "Câu hỏi đã lưu" };

export default function BookmarksPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 pt-10 pb-8">
      <PageHeader title="Câu hỏi đã lưu" description="Những câu bạn muốn ôn lại. Có thể luyện lại tất cả trong một lượt." />
      <RequireAuth next="/bookmarks">
        <Bookmarks />
      </RequireAuth>
    </main>
  );
}

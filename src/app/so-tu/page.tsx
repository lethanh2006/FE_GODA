import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { Notebook } from "@/components/learn/notebook";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Sổ từ" };

export default function NotebookPageRoute() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 pt-8 pb-10 sm:px-8">
      <PageHeader title="Sổ từ của bạn" description="Tất cả từ đã học và đã lưu, kèm lịch ôn tiếp theo." />
      <RequireAuth next="/so-tu">
        <Notebook />
      </RequireAuth>
    </main>
  );
}

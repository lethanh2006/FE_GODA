import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { GrammarHome } from "@/components/grammar/grammar-home";

export const metadata: Metadata = {
  title: "Ngữ pháp N4",
  description:
    "Bài ngữ pháp bổ trợ theo chương 15–33, ví dụ tiếng Việt và luyện ghép câu có giải thích.",
  robots: { index: false, follow: false },
};
export default function GrammarPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
      <RequireAuth next="/ngu-phap-n4">
        <GrammarHome />
      </RequireAuth>
    </main>
  );
}

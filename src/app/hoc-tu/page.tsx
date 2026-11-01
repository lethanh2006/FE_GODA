import type { Metadata } from "next";
import { VocabHome } from "@/components/learn/vocab-home";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Học từ vựng JLPT",
  description: "Học 7.811 từ vựng JLPT N5–N1 theo bài, bằng thẻ ghi nhớ, bài kiểm tra và ôn tập ngắt quãng.",
};

export default function VocabPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pt-8 pb-10 sm:px-8">
      <PageHeader
        eyebrow="Học từ vựng"
        title="Chọn cấp độ để học"
        description="N5 dễ nhất, N1 khó nhất. Mỗi bài 20 từ, từ phổ biến học trước."
      />
      <VocabHome />
    </main>
  );
}

import { BarChart3, BookOpenCheck, RefreshCcw, Timer } from "lucide-react";
import { Suspense } from "react";
import { LevelCards, LevelGrid } from "@/components/home/level-cards";
import { ButtonLink } from "@/components/ui/button";

const features = [
  {
    icon: Timer,
    title: "Đề thi thử như thi thật",
    text: "Đúng cấu trúc 問題 và thời gian từng phần của JLPT. Tính giờ, tự nộp khi hết giờ, ước tính điểm và khả năng đỗ.",
  },
  {
    icon: BookOpenCheck,
    title: "Luyện theo dạng bài",
    text: "21 dạng: 漢字読み, 表記, 文脈規定, 文法, 並べ替え, 読解, 聴解… Chọn xong là biết đúng sai, có giải thích ngay.",
  },
  {
    icon: RefreshCcw,
    title: "Ôn câu sai thông minh",
    text: "Hệ thống ghi nhớ câu bạn làm sai và ưu tiên câu chưa làm, giúp ôn đúng chỗ còn yếu.",
  },
  {
    icon: BarChart3,
    title: "Theo dõi tiến độ",
    text: "Độ chính xác theo cấp độ và dạng bài, lịch sử làm bài, chuỗi ngày học liên tục.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:py-16">
      <section className="flex flex-col gap-6">
        <p className="jp text-sm font-medium text-red-600">日本語能力試験 · JLPT</p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Luyện đề JLPT N5–N1, chấm điểm và giải thích ngay.
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Làm đề thi thử theo đúng cấu trúc đề thật, luyện từng dạng bài, ôn lại câu sai và theo dõi
          tiến độ. Miễn phí, không cần cài đặt.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#levels" size="lg">Chọn cấp độ</ButtonLink>
          <ButtonLink href="/practice" size="lg" variant="secondary">Luyện nhanh 10 câu</ButtonLink>
        </div>
      </section>

      <section id="levels" className="scroll-mt-20 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Chọn cấp độ</h2>
          <p className="text-sm text-muted">N5 dễ nhất, N1 khó nhất. Chưa biết bắt đầu từ đâu? Hãy thử một đề N5 hoặc N4.</p>
        </div>
        <Suspense fallback={<LevelGrid />}>
          <LevelCards />
        </Suspense>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-5">
            <Icon className="size-6 text-primary" />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Cấu trúc đề JLPT</h2>
        <p className="mt-1 text-sm text-muted">
          Đề gồm 3 phần thi. Phần Nghe hiểu (聴解) được đọc bằng giọng tiếng Nhật có sẵn trong trình duyệt — nên dùng Chrome, Edge hoặc Safari.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-medium">Cấp</th>
                <th className="py-2 pr-4 font-medium">言語知識（文字・語彙）</th>
                <th className="py-2 pr-4 font-medium">言語知識（文法）・読解</th>
                <th className="py-2 pr-4 font-medium">聴解</th>
                <th className="py-2 font-medium">Điểm đỗ</th>
              </tr>
            </thead>
            <tbody className="jp tabular-nums">
              <tr className="border-b border-border"><td className="py-2 pr-4 font-semibold">N1</td><td className="py-2 pr-4" colSpan={2}>110分</td><td className="py-2 pr-4">55分</td><td className="py-2">100/180</td></tr>
              <tr className="border-b border-border"><td className="py-2 pr-4 font-semibold">N2</td><td className="py-2 pr-4" colSpan={2}>105分</td><td className="py-2 pr-4">50分</td><td className="py-2">90/180</td></tr>
              <tr className="border-b border-border"><td className="py-2 pr-4 font-semibold">N3</td><td className="py-2 pr-4">30分</td><td className="py-2 pr-4">70分</td><td className="py-2 pr-4">40分</td><td className="py-2">95/180</td></tr>
              <tr className="border-b border-border"><td className="py-2 pr-4 font-semibold">N4</td><td className="py-2 pr-4">25分</td><td className="py-2 pr-4">55分</td><td className="py-2 pr-4">35分</td><td className="py-2">90/180</td></tr>
              <tr><td className="py-2 pr-4 font-semibold">N5</td><td className="py-2 pr-4">20分</td><td className="py-2 pr-4">40分</td><td className="py-2 pr-4">30分</td><td className="py-2">80/180</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

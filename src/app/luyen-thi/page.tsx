import { Headphones, ListChecks, Shuffle, Timer } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { JlptStructureTable } from "@/components/home/jlpt-structure";
import { LevelCards, LevelGrid } from "@/components/home/level-cards";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/page-header";
import { formatNumber } from "@/lib/format";
import { serverApi } from "@/lib/server-api";
import type { Catalog } from "@/lib/types";

export const metadata: Metadata = {
  title: "Luyện thi JLPT",
  description: "Đề thi thử JLPT N5–N1 đúng cấu trúc đề thật, luyện theo dạng bài, có Nghe hiểu, chấm điểm theo thang 180.",
};

const HIGHLIGHTS = ["Đề thi thử", "Nghe · Đọc · Từ vựng · Ngữ pháp", "Chữa bài tiếng Việt", "Miễn phí"];

const MODES = [
  { icon: Timer, title: "Thi thử như thật", text: "Tính giờ từng phần, đánh dấu câu cần xem lại, bài làm tự lưu." },
  { icon: Shuffle, title: "Đề ngẫu nhiên", text: "Ghép đề mới từ ngân hàng câu hỏi, ưu tiên câu bạn chưa làm." },
  { icon: ListChecks, title: "Luyện theo dạng bài", text: "Chọn 問題 cần luyện, xem đáp án và giải thích ngay sau mỗi câu." },
  { icon: Headphones, title: "Phần Nghe hiểu", text: "Bài nghe đọc bằng giọng tiếng Nhật của trình duyệt, có đủ dạng 聴解." },
];

export default function ExamHomePage() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 pt-8 pb-10 sm:px-8">
      <div className="grid items-stretch gap-5 lg:grid-cols-[1fr_20rem]">
        <Card className="hero space-y-4 p-6 sm:p-10">
          <p className="eyebrow">Luyện thi JLPT</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Đề thi thử JLPT online</h1>
          <p className="max-w-2xl text-muted">
            Đúng cấu trúc đề thật, nộp bài là có điểm ước tính và chữa từng câu bằng tiếng Việt. Khách cũng làm bài được,
            đăng nhập để lưu kết quả.
          </p>
          <ul className="flex flex-wrap gap-2 pt-1">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-semibold">{item}</li>
            ))}
          </ul>
        </Card>
        <Card className="flex flex-col justify-between gap-5 p-6">
          <Suspense fallback={<p className="text-muted">Ngân hàng câu hỏi theo từng cấp.</p>}>
            <BankStats />
          </Suspense>
          <ButtonLink href="/practice" size="lg">Tự tạo bài luyện</ButtonLink>
        </Card>
      </div>

      <section className="space-y-5">
        <SectionHeader title="Chọn cấp độ" description="Mỗi cấp có đề thi thử, đề ngẫu nhiên và luyện theo từng dạng bài." />
        <Suspense fallback={<LevelGrid />}>
          <LevelCards />
        </Suspense>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Các cách luyện">
        {MODES.map((mode) => (
          <Card key={mode.title} className="space-y-2 p-5">
            <span className="icon-tile"><mode.icon className="size-5" aria-hidden /></span>
            <h2 className="pt-1 font-semibold">{mode.title}</h2>
            <p className="text-sm text-muted">{mode.text}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-5">
        <SectionHeader title="Cấu trúc đề JLPT" description="Thời gian từng phần và điểm đỗ theo đề chính thức." />
        <JlptStructureTable />
      </section>
    </main>
  );
}

async function BankStats() {
  const catalog = await serverApi<Catalog>("/catalog").catch(() => null);
  if (!catalog) return <p className="text-muted">Ngân hàng câu hỏi theo từng cấp.</p>;
  const exams = catalog.levels.reduce((sum, level) => sum + level.examCount, 0);
  const questions = catalog.levels.reduce((sum, level) => sum + level.totalQuestions, 0);
  return (
    <dl className="grid grid-cols-2 gap-4">
      <div>
        <dd className="text-3xl font-bold tracking-tight tabular-nums">{formatNumber(exams)}</dd>
        <dt className="text-sm text-muted">đề thi thử</dt>
      </div>
      <div>
        <dd className="text-3xl font-bold tracking-tight tabular-nums">{formatNumber(questions)}</dd>
        <dt className="text-sm text-muted">câu hỏi</dt>
      </div>
    </dl>
  );
}

import { Suspense } from "react";
import { LevelCards, LevelGrid } from "@/components/home/level-cards";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/page-header";
import { formatNumber } from "@/lib/format";
import { serverApi } from "@/lib/server-api";
import type { Catalog } from "@/lib/types";

const STEPS = [
  {
    title: "Chọn đề hoặc dạng bài",
    text: "Đề thi thử đủ 3 phần thi, đề ngẫu nhiên ghép từ ngân hàng câu hỏi, hoặc luyện riêng từng dạng 問題.",
  },
  {
    title: "Làm bài như trong phòng thi",
    text: "Tính giờ từng phần, đánh dấu câu cần xem lại, bài làm tự lưu. Phần nghe được đọc bằng giọng tiếng Nhật.",
  },
  {
    title: "Xem kết quả, ôn câu sai",
    text: "Điểm ước tính theo thang 180 và điểm liệt từng phần, giải thích tiếng Việt; câu sai được lưu để ôn lại.",
  },
];

const STRUCTURE = [
  { level: "N1", vocab: "110分", grammar: null, listening: "55分", pass: "100/180" },
  { level: "N2", vocab: "105分", grammar: null, listening: "50分", pass: "90/180" },
  { level: "N3", vocab: "30分", grammar: "70分", listening: "40分", pass: "95/180" },
  { level: "N4", vocab: "25分", grammar: "55分", listening: "35分", pass: "90/180" },
  { level: "N5", vocab: "20分", grammar: "40分", listening: "30分", pass: "80/180" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pt-14 pb-8 sm:pt-20">
      <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-7">
          <p className="jp inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-accent" />
            日本語能力試験 · JLPT N5–N1
          </p>
          <h1 className="text-4xl leading-[1.15] font-bold tracking-tight text-balance sm:text-5xl">
            Luyện đề JLPT như đang ngồi trong phòng thi.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Đề thi thử đúng cấu trúc và thời gian từng phần, có phần Nghe hiểu, chấm điểm theo thang 180 và giải
            thích tiếng Việt cho từng câu. Miễn phí.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="#levels" size="lg">Làm đề thi thử</ButtonLink>
            <ButtonLink href="/practice" size="lg" variant="secondary">Luyện theo dạng bài</ButtonLink>
          </div>
          <Suspense fallback={<HeroStats />}>
            <HeroStatsLoader />
          </Suspense>
        </div>
        <SampleQuestion />
      </section>

      <section id="levels" className="scroll-mt-24 space-y-6">
        <SectionHeader
          title="Chọn cấp độ"
          description="N5 dễ nhất, N1 khó nhất. Chưa biết bắt đầu từ đâu? Hãy thử một đề N5 hoặc N4 trước."
        />
        <Suspense fallback={<LevelGrid />}>
          <LevelCards />
        </Suspense>
      </section>

      <section className="space-y-6">
        <SectionHeader title="Luyện trên GODA như thế nào?" />
        <ol className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="bg-card p-6">
              <p className="font-mono text-sm font-medium text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-6">
        <SectionHeader
          title="Cấu trúc đề JLPT"
          description="Mỗi đề gồm 3 phần thi. Phần Nghe hiểu (聴解) đọc bằng giọng tiếng Nhật có sẵn trong trình duyệt — nên dùng Chrome, Edge hoặc Safari."
        />
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-subtle/60 text-xs text-muted">
                <th className="px-5 py-3 font-medium">Cấp</th>
                <th className="jp px-5 py-3 font-medium">言語知識（文字・語彙）</th>
                <th className="jp px-5 py-3 font-medium">言語知識（文法）・読解</th>
                <th className="jp px-5 py-3 font-medium">聴解</th>
                <th className="px-5 py-3 text-right font-medium">Điểm đỗ</th>
              </tr>
            </thead>
            <tbody className="jp tabular-nums">
              {STRUCTURE.map((row) => (
                <tr key={row.level} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-sans font-semibold">{row.level}</td>
                  {row.grammar ? (
                    <>
                      <td className="px-5 py-3">{row.vocab}</td>
                      <td className="px-5 py-3">{row.grammar}</td>
                    </>
                  ) : (
                    <td className="px-5 py-3" colSpan={2}>
                      {row.vocab} <span className="font-sans text-xs text-muted">(gộp chung)</span>
                    </td>
                  )}
                  <td className="px-5 py-3">{row.listening}</td>
                  <td className="px-5 py-3 text-right font-sans font-medium">{row.pass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

async function HeroStatsLoader() {
  const catalog = await serverApi<Catalog>("/catalog").catch(() => null);
  if (!catalog) return <HeroStats />;
  return (
    <HeroStats
      exams={catalog.levels.reduce((sum, l) => sum + l.examCount, 0)}
      questions={catalog.levels.reduce((sum, l) => sum + l.totalQuestions, 0)}
      types={catalog.questionTypes.length}
    />
  );
}

function HeroStats({ exams, questions, types }: { exams?: number; questions?: number; types?: number }) {
  const items = [
    { value: exams, label: "đề thi thử" },
    { value: questions, label: "câu hỏi" },
    { value: types, label: "dạng bài" },
  ];
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="sr-only">{item.label}</dt>
          <dd className="text-2xl font-bold tracking-tight tabular-nums">
            {item.value !== undefined ? formatNumber(item.value) : "—"}
          </dd>
          <dd className="text-sm text-muted">{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}

const SAMPLE_OPTIONS = ["にもつ", "にもの", "かもつ", "かもの"];

/** Minh hoạ một câu hỏi trong màn làm bài (tĩnh, chỉ để giới thiệu). */
function SampleQuestion() {
  return (
    <div className="relative" aria-hidden>
      <div className="absolute -inset-3 -z-10 rotate-2 rounded-2xl border border-border bg-subtle/70 sm:-inset-4" />
      <div className="exam-paper overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/[0.05]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3 text-xs">
          <span className="jp font-medium">JLPT N4 · 言語知識（文字・語彙）</span>
          <span className="rounded-md bg-subtle px-2 py-0.5 font-mono tabular-nums text-muted">残り 18:42</span>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="jp shrink-0 border border-foreground px-1.5 text-sm leading-6 font-semibold">問題1</span>
            <p className="jp text-sm leading-6">＿＿のことばの読み方として最もよいものを、1・2・3・4から一つえらびなさい。</p>
          </div>
          <p className="jp text-lg">
            <span className="mr-3 font-semibold">1</span>この<span className="underline decoration-2 underline-offset-[7px]">荷物</span>を二階まで運んでください。
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_OPTIONS.map((option, i) => (
              <div
                key={option}
                className={
                  i === 0
                    ? "flex items-center gap-3 rounded-lg border border-success bg-success-soft px-3 py-2.5"
                    : "flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                }
              >
                <span
                  className={
                    i === 0
                      ? "flex size-6 items-center justify-center rounded-full bg-success text-xs font-semibold text-on-status"
                      : "flex size-6 items-center justify-center rounded-full border border-border-strong text-xs font-semibold text-muted"
                  }
                >
                  {i + 1}
                </span>
                <span className="jp">{option}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-subtle px-4 py-3 text-sm">
            <span className="font-semibold text-success">Chính xác.</span>{" "}
            <span className="text-muted">
              「荷物」đọc là <span className="jp">「にもつ」</span> — hành lý.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

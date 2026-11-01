import { ArrowRight, BookOpen, Check, Search, Target } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { HeroArt } from "@/components/home/hero-art";
import { HeroSearch } from "@/components/home/hero-search";
import { HomeRedirect } from "@/components/home/home-redirect";
import { JlptStructureTable } from "@/components/home/jlpt-structure";
import { LevelCards, LevelGrid } from "@/components/home/level-cards";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/page-header";

const FEATURES = [
  {
    href: "/luyen-thi",
    icon: Target,
    title: "Luyện thi JLPT",
    text: "Đề thi thử đúng cấu trúc và thời gian từng phần, có Nghe hiểu, điểm theo thang 180 và giải thích tiếng Việt.",
    action: "Vào luyện thi",
  },
  {
    href: "/hoc-tu",
    icon: BookOpen,
    title: "Học từ vựng",
    text: "7.811 từ N5–N1 chia thành bài 20 từ. Thẻ ghi nhớ, kiểm tra, rồi được nhắc ôn đúng lúc sắp quên.",
    action: "Bắt đầu học",
  },
  {
    href: "/tu-dien",
    icon: Search,
    title: "Tra từ Nhật – Việt",
    text: "Hơn 23.000 từ và 2.383 chữ Hán, có âm Hán Việt, câu ví dụ, phân tích từng chữ và phát âm.",
    action: "Mở từ điển",
  },
];

export default function Home() {
  return (
    <main className="flex w-full flex-col">
      <HomeRedirect />
      <section className="hero border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:py-16">
          <div className="min-w-0 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              TIẾNG NHẬT CHO NGƯỜI VIỆT
            </p>
            <h1 className="text-4xl leading-[1.12] font-bold tracking-tight text-balance sm:text-6xl">
              Đỗ JLPT bắt đầu từ <span className="text-primary">từng từ một.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted">
              <span className="jp">学校</span> là <span className="font-semibold text-hanviet">học hiệu</span>,{" "}
              <span className="jp">電話</span> là <span className="font-semibold text-hanviet">điện thoại</span> — người Việt có
              sẵn lợi thế âm Hán Việt. GODA giúp bạn học từ, luyện đề và tra cứu ở cùng một nơi.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/hoc-tu/n5/1" size="lg">
                Học bài đầu tiên <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/luyen-thi" size="lg" variant="secondary">
                Làm đề thi thử
              </ButtonLink>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted">
              <Check className="size-4 text-success" aria-hidden /> Không cần đăng ký để bắt đầu · Miễn phí
            </p>
            <HeroSearch />
          </div>
          <HeroArt />
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pt-14 pb-4 sm:px-8">
        <section className="grid gap-4 md:grid-cols-3" aria-label="Tính năng chính">
          {FEATURES.map((feature) => (
            <Link key={feature.href} href={feature.href} className="panel group flex flex-col gap-3 p-6 transition-colors hover:border-primary/40">
              <span className="icon-tile"><feature.icon className="size-5" aria-hidden /></span>
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="flex-1 text-sm text-muted">{feature.text}</p>
              <span className="text-sm font-semibold text-primary">
                {feature.action} <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          ))}
        </section>

        <section id="levels" className="scroll-mt-24 space-y-6">
          <SectionHeader
            title="Chọn cấp độ thi"
            description="N5 dễ nhất, N1 khó nhất. Chưa biết bắt đầu từ đâu? Hãy thử một đề N5 hoặc N4 trước."
          />
          <Suspense fallback={<LevelGrid />}>
            <LevelCards />
          </Suspense>
        </section>

        <section className="space-y-6">
          <SectionHeader
            title="Cấu trúc đề JLPT"
            description="Mỗi đề gồm 3 phần thi. Phần Nghe hiểu (聴解) đọc bằng giọng tiếng Nhật có sẵn trong trình duyệt — nên dùng Chrome, Edge hoặc Safari."
          />
          <JlptStructureTable />
        </section>
      </div>
    </main>
  );
}

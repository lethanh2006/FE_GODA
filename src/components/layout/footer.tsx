import Link from "next/link";
import { LEVELS } from "@/lib/jlpt";

const GROUPS = [
  {
    title: "Luyện thi",
    links: [
      ...LEVELS.map((level) => ({ href: `/${level.toLowerCase()}`, label: `Đề thi JLPT ${level}` })),
      { href: "/practice", label: "Luyện theo dạng bài" },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { href: "/dashboard", label: "Tiến độ học tập" },
      { href: "/history", label: "Lịch sử làm bài" },
      { href: "/bookmarks", label: "Câu hỏi đã lưu" },
      { href: "/settings", label: "Cài đặt" },
    ],
  },
  {
    title: "Thông tin",
    links: [{ href: "/about", label: "Giới thiệu & nguồn dữ liệu" }],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <p className="flex items-center gap-2.5 font-bold">
            <span className="flex size-7 items-center justify-center rounded-md bg-accent font-serif-jp text-sm text-white">合</span>
            GODA <span className="-ml-1.5 font-medium text-muted">JLPT</span>
          </p>
          <p className="max-w-xs text-sm text-muted">
            Luyện đề thi năng lực tiếng Nhật N5–N1 theo đúng cấu trúc đề thật, có giải thích tiếng Việt.
          </p>
        </div>
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-3 text-sm font-semibold">{group.title}</p>
            <ul className="space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted">
          Câu hỏi là đề mô phỏng, không phải đề thi chính thức. GODA JLPT không liên kết với Japan Foundation / JEES.
        </p>
      </div>
    </footer>
  );
}

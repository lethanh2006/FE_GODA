import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          GODA JLPT — luyện đề thi năng lực tiếng Nhật N5–N1. Không liên kết với Japan Foundation / JEES.
        </p>
        <nav className="flex gap-4">
          <Link href="/about" className="hover:text-foreground">Giới thiệu & nguồn dữ liệu</Link>
          <Link href="/practice" className="hover:text-foreground">Luyện tập</Link>
        </nav>
      </div>
    </footer>
  );
}

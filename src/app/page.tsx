import { Suspense } from "react";
import { ApiStatus, StatusPill } from "@/components/api-status";

const levels = [
  { level: "N5", name: "Sơ cấp 1", desc: "Hiragana, Katakana và các mẫu câu cơ bản" },
  { level: "N4", name: "Sơ cấp 2", desc: "Hội thoại hằng ngày, ngữ pháp nền tảng" },
  { level: "N3", name: "Trung cấp", desc: "Đọc hiểu đoạn văn, nghe hội thoại tự nhiên" },
  { level: "N2", name: "Trung cao cấp", desc: "Báo chí, văn bản công việc thông dụng" },
  { level: "N1", name: "Cao cấp", desc: "Văn bản trừu tượng, tốc độ nghe thực tế" },
];

const sections = ["文字・語彙", "文法", "読解", "聴解"];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Suspense fallback={<StatusPill color="bg-zinc-400" label="Đang kiểm tra API…" />}>
          <ApiStatus />
        </Suspense>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          GODA JLPT
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Luyện đề thi năng lực tiếng Nhật JLPT từ N5 đến N1.
        </p>
        <ul className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <li
              key={section}
              lang="ja"
              className="rounded-md bg-zinc-100 px-2.5 py-1 text-sm dark:bg-zinc-900"
            >
              {section}
            </li>
          ))}
        </ul>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {levels.map(({ level, name, desc }) => (
          <div
            key={level}
            className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
          >
            <span className="text-3xl font-bold">{level}</span>
            <span className="font-medium">{name}</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{desc}</span>
          </div>
        ))}
      </section>
    </main>
  );
}

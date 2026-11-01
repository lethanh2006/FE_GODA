"use client";

import Link from "next/link";
import { SearchBox } from "@/components/dictionary/search-box";

const SAMPLES = [
  { q: "学校", label: "学校" },
  { q: "trường học", label: "trường học" },
  { q: "sensei", label: "sensei" },
  { q: "cảm ơn", label: "cảm ơn" },
  { q: "điện thoại", label: "điện thoại" },
];

export function HeroSearch() {
  return (
    <div className="panel space-y-3 p-4">
      <p className="text-xs font-semibold text-muted">Tra từ: chữ Hán, kana, romaji, tiếng Việt hoặc âm Hán Việt</p>
      <SearchBox />
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <Link
            key={sample.q}
            href={`/tu-dien?q=${encodeURIComponent(sample.q)}`}
            className="chip min-h-8 border-transparent bg-subtle px-2.5 text-xs"
          >
            {sample.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

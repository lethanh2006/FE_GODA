"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface ColumnDatum {
  key: string;
  label: string;
  value: number;
  /** Dòng phụ trong tooltip. */
  detail?: string;
}

/**
 * Biểu đồ cột một series (vd số câu mỗi ngày). Cột ≤ 24px, đầu bo 4px, gốc vuông,
 * tooltip khi hover/focus, bảng ẩn cho trình đọc màn hình.
 */
export function ColumnChart({
  data,
  height = 140,
  unit,
  title,
}: {
  data: ColumnDatum[];
  height?: number;
  unit: string;
  title: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = niceCeil(max);
  const current = active !== null ? data[active] : null;

  return (
    <figure className="w-full">
      <div className="relative flex gap-2">
        <div className="flex w-8 flex-col justify-between text-right text-[11px] text-muted tabular-nums" style={{ height }}>
          <span>{niceMax}</span>
          <span>{(niceMax / 2).toLocaleString("vi-VN")}</span>
          <span>0</span>
        </div>
        <div className="relative flex-1" style={{ height }}>
          <div className="absolute inset-x-0 top-0 border-t border-border" aria-hidden />
          <div className="absolute inset-x-0 top-1/2 border-t border-border" aria-hidden />
          <div
            className="absolute inset-0 flex items-end gap-0.5 border-b border-border"
            onMouseLeave={() => setActive(null)}
            role="img"
            aria-label={title}
          >
            {data.map((d, i) => (
              <button
                key={d.key}
                type="button"
                className="group flex h-full min-w-0 flex-1 items-end justify-center outline-none"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${d.label}: ${d.value} ${unit}`}
              >
                <span
                  className={cn(
                    "block w-full max-w-6 rounded-t-[4px] transition-colors",
                    d.value > 0 ? "bg-primary" : "bg-transparent",
                    active !== null && active !== i && d.value > 0 && "opacity-50",
                    "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary",
                  )}
                  style={{ height: `${(d.value / niceMax) * 100}%` }}
                />
              </button>
            ))}
          </div>
          {current && active !== null && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"
              style={{ left: `${((active + 0.5) / data.length) * 100}%` }}
            >
              <p className="font-medium">{current.label}</p>
              <p className="text-muted">
                {current.value} {unit}
                {current.detail ? ` · ${current.detail}` : ""}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-1 flex justify-between pl-10 text-[11px] text-muted">
        <span>{data[0]?.label}</span>
        <span>{data.at(-1)?.label}</span>
      </div>
      {/* Bảng không co về 1px như phần tử thường nên bọc trong div sr-only để không gây tràn ngang. */}
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <tbody>
            {data.map((d) => (
              <tr key={d.key}>
                <th scope="row">{d.label}</th>
                <td>
                  {d.value} {unit}
                  {d.detail ? ` (${d.detail})` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function niceCeil(value: number): number {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 2.5, 5, 10];
  for (const step of steps) {
    if (step * magnitude >= value) return step * magnitude;
  }
  return 10 * magnitude;
}

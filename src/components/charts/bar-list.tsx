import { ProgressBar } from "@/components/ui/feedback";

export interface BarListItem {
  key: string;
  label: React.ReactNode;
  /** 0–100. */
  percent: number | null;
  /** Giá trị hiển thị ở đầu thanh, vd "72% · 18/25". */
  valueLabel: string;
  action?: React.ReactNode;
}

/** Danh sách thanh ngang một series (vd độ chính xác theo dạng bài). Nhãn và giá trị dùng màu chữ, không dùng màu dữ liệu. */
export function BarList({ items }: { items: BarListItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.key} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{item.label}</span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="text-muted tabular-nums">{item.valueLabel}</span>
              {item.action}
            </span>
          </div>
          <ProgressBar value={item.percent ?? 0} />
        </li>
      ))}
    </ul>
  );
}

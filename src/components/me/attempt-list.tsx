import Link from "next/link";
import { LevelBadge, Badge } from "@/components/ui/badge";
import { formatDateTime, formatDuration, formatPercent } from "@/lib/format";
import type { AttemptListItem } from "@/lib/types";

export function AttemptList({ items }: { items: AttemptListItem[] }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const done = item.status === "SUBMITTED";
        return (
          <li key={item.id}>
            <Link
              href={done ? `/attempts/${item.id}/result` : `/attempts/${item.id}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm hover:bg-subtle"
            >
              <LevelBadge level={item.level} />
              <span className="min-w-0 flex-1 truncate font-medium">{item.title}</span>
              <Badge tone={item.mode === "EXAM" ? "primary" : "neutral"}>{item.mode === "EXAM" ? "Thi thử" : "Luyện tập"}</Badge>
              {done ? (
                <span className="tabular-nums">
                  {item.correctCount}/{item.totalCount} · {formatPercent(item.scorePercent)}
                </span>
              ) : (
                <Badge tone="warning">Đang làm</Badge>
              )}
              <span className="text-right text-xs text-muted sm:w-44">
                {done ? `${formatDuration(item.timeSpentSeconds)} · ` : ""}
                {formatDateTime(item.submittedAt ?? item.startedAt)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

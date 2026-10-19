import { apiFetch } from "@/lib/api";

type HealthResponse = {
  status: "ok" | "degraded";
  database: "up" | "down";
  timestamp: string;
};

export async function ApiStatus() {
  const health = await apiFetch<HealthResponse>("/health", {
    cache: "no-store",
  }).catch(() => null);

  const label = !health
    ? "API chưa kết nối"
    : health.database === "up"
      ? "API & database đang hoạt động"
      : "API chạy, database chưa kết nối";
  const color = !health
    ? "bg-red-500"
    : health.database === "up"
      ? "bg-emerald-500"
      : "bg-amber-500";

  return <StatusPill color={color} label={label} />;
}

export function StatusPill({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorNotice, Skeleton } from "@/components/ui/feedback";
import { Segmented, Switch } from "@/components/ui/switch";
import { useStartAttempt } from "@/lib/attempts";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { isLevel, LEVELS, QUESTION_TYPES, SKILL_GROUPS } from "@/lib/jlpt";
import type { Catalog, JlptLevel, PracticeFocus, QuestionType, SkillGroup } from "@/lib/types";

const COUNTS = [10, 20, 30, 50];
const FOCUS: { value: PracticeFocus; label: string; hint: string; auth?: boolean }[] = [
  { value: "smart", label: "Thông minh", hint: "Ưu tiên câu chưa làm, rồi tới câu từng làm sai." },
  { value: "random", label: "Ngẫu nhiên", hint: "Chọn ngẫu nhiên trong ngân hàng câu hỏi." },
  { value: "unseen", label: "Câu mới", hint: "Chỉ câu bạn chưa từng làm.", auth: true },
  { value: "mistakes", label: "Câu sai", hint: "Chỉ câu lần gần nhất bạn làm sai.", auth: true },
  { value: "bookmarks", label: "Đã lưu", hint: "Chỉ câu bạn đã lưu.", auth: true },
];

export function PracticeBuilder() {
  const params = useSearchParams();
  const { user } = useAuth();
  const { data: catalog, error: catalogError } = useSWR<Catalog>("/catalog");
  const { start, pending, error } = useStartAttempt();

  const initialLevel = params.get("level");
  const initialType = params.get("type") as QuestionType | null;
  const [level, setLevel] = useState<JlptLevel>(
    initialLevel && isLevel(initialLevel) ? (initialLevel.toUpperCase() as JlptLevel) : "N5",
  );
  const [types, setTypes] = useState<QuestionType[]>(initialType && QUESTION_TYPES[initialType] ? [initialType] : []);
  const [count, setCount] = useState(20);
  const [focus, setFocus] = useState<PracticeFocus>("smart");
  const [instant, setInstant] = useState(true);
  const [timed, setTimed] = useState(false);
  const [minutes, setMinutes] = useState(20);

  const available = useMemo(
    () => catalog?.levels.find((l) => l.level === level)?.questionTypes ?? [],
    [catalog, level],
  );
  const selectedCount = (types.length ? available.filter((t) => types.includes(t.type)) : available).reduce(
    (sum, t) => sum + t.count,
    0,
  );
  const focusMeta = FOCUS.find((f) => f.value === focus)!;

  const toggleType = (type: QuestionType) =>
    setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <Card className="space-y-3 p-5">
          <p className="text-sm font-medium">Cấp độ</p>
          <div className="grid grid-cols-5 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLevel(l);
                  setTypes([]);
                }}
                className={cn(
                  "h-11 rounded-lg border text-sm font-bold transition-colors",
                  l === level ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-subtle",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Dạng bài</p>
            <button type="button" className="text-xs text-primary hover:underline" onClick={() => setTypes([])}>
              {types.length ? "Bỏ chọn (luyện tất cả)" : "Đang chọn: tất cả dạng"}
            </button>
          </div>
          {catalogError && <ErrorNotice message="Không tải được danh sách dạng bài." />}
          {!catalog && !catalogError && <Skeleton className="h-40" />}
          {catalog &&
            (Object.keys(SKILL_GROUPS) as SkillGroup[]).map((group) => {
              const groupTypes = available.filter((t) => QUESTION_TYPES[t.type].group === group);
              if (!groupTypes.length) return null;
              return (
                <div key={group} className="space-y-2">
                  <p className="text-xs text-muted">
                    <span className="jp">{SKILL_GROUPS[group].nameJa}</span> · {SKILL_GROUPS[group].nameVi}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {groupTypes.map(({ type, count: n }) => {
                      const active = types.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleType(type)}
                          aria-pressed={active}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                            active ? "border-primary bg-primary-soft" : "border-border hover:bg-subtle",
                          )}
                        >
                          <span className="jp block font-medium">{QUESTION_TYPES[type].nameJa}</span>
                          <span className="block text-xs text-muted">
                            {QUESTION_TYPES[type].nameVi} · {formatNumber(n)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card className="space-y-5 p-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">Số câu</p>
            <Segmented value={count} onChange={setCount} options={COUNTS.map((c) => ({ value: c, label: c }))} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Chọn câu</p>
            <div className="flex flex-wrap gap-1.5">
              {FOCUS.map((f) => {
                const locked = f.auth && !user;
                return (
                  <button
                    key={f.value}
                    type="button"
                    disabled={locked}
                    onClick={() => setFocus(f.value)}
                    title={locked ? "Cần đăng nhập" : f.hint}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-40",
                      focus === f.value ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-subtle",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted">{focusMeta.hint}</p>
          </div>
          <Switch
            checked={instant}
            onChange={setInstant}
            label="Xem đáp án ngay"
            description="Hiện đúng/sai và giải thích sau mỗi câu."
          />
          <Switch checked={timed} onChange={setTimed} label="Giới hạn thời gian" />
          {timed && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="number"
                min={1}
                max={240}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, Math.min(240, Number(e.target.value) || 1)))}
                className="h-9 w-20 rounded-lg border border-border bg-card px-2 outline-none focus:border-primary"
              />
              phút
            </label>
          )}
          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs text-muted">
              {level} · {types.length ? `${types.length} dạng` : "tất cả dạng"} · {formatNumber(selectedCount)} câu trong ngân hàng
            </p>
            <Button
              size="lg"
              className="w-full"
              disabled={pending !== null || !catalog}
              onClick={() =>
                start({
                  kind: "practice",
                  level,
                  types: types.length ? types : undefined,
                  count,
                  focus,
                  instantFeedback: instant,
                  timeLimitMinutes: timed ? minutes : undefined,
                })
              }
            >
              {pending ? "Đang tạo bài…" : `Bắt đầu ${count} câu`}
            </Button>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        </Card>
      </aside>
    </div>
  );
}

"use client";

import { ArrowRight, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import useSWR from "swr";
import { cn } from "@/lib/cn";
import { meaningLine, type WordSummary } from "@/lib/vocab";

const DEBOUNCE_MS = 200;

/** Ô tra từ dùng chung ở trang chủ và trang từ điển: gợi ý khi gõ, Enter để xem toàn bộ kết quả. */
export function SearchBox({
  initial = "",
  autoFocus,
  className,
  placeholder = "学校, gakkou, trường học, học hiệu…",
}: {
  initial?: string;
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLFormElement>(null);
  const listId = useId();

  // Đổi trang kết quả (?q=) thì ô nhập hiện đúng từ đang tra.
  const [syncedInitial, setSyncedInitial] = useState(initial);
  if (syncedInitial !== initial) {
    setSyncedInitial(initial);
    setValue(initial);
  }

  useEffect(() => {
    const timer = setTimeout(() => setQuery(value.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  const { data } = useSWR<WordSummary[]>(
    open && query ? `/dictionary/search?limit=6&q=${encodeURIComponent(query)}` : null,
    { keepPreviousData: true },
  );
  const suggestions = open && query ? (data ?? []) : [];

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const go = (target: string) => {
    setOpen(false);
    router.push(target);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const pick = suggestions[active];
    if (pick) return go(`/tu-dien/${pick.id}`);
    const q = value.trim();
    if (q) go(`/tu-dien?q=${encodeURIComponent(q)}`);
  };

  const onKey = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") setOpen(false);
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  };

  return (
    <form ref={box} role="search" onSubmit={submit} className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-card py-1.5 pr-1.5 pl-5 shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_7%,transparent)] transition-shadow focus-within:border-primary/50 focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_14%,transparent)]">
        <Search className="size-5 shrink-0 text-muted" aria-hidden />
        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Tra từ tiếng Nhật"
          aria-expanded={suggestions.length > 0}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          role="combobox"
          autoComplete="off"
          lang="ja"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
        />
        {value && (
          <button
            type="button"
            aria-label="Xoá nội dung"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-foreground"
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
        <button
          type="submit"
          aria-label="Tra từ"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_3px_0_0_color-mix(in_srgb,var(--primary)_62%,#000)] transition-transform active:translate-y-[2px] active:shadow-[0_1px_0_0_color-mix(in_srgb,var(--primary)_62%,#000)]"
        >
          <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul id={listId} role="listbox" className="panel absolute inset-x-0 top-full z-20 mt-2 overflow-hidden py-1 text-left">
          {suggestions.map((word, index) => (
            <li key={word.id} id={`${listId}-${index}`} role="option" aria-selected={index === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => go(`/tu-dien/${word.id}`)}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left",
                  index === active && "bg-subtle",
                )}
              >
                <span className="jp shrink-0 text-base font-semibold">{word.word}</span>
                {word.reading !== word.word && <span className="jp shrink-0 text-sm text-muted">{word.reading}</span>}
                <span className="min-w-0 flex-1 truncate text-sm text-muted">{meaningLine(word)}</span>
                {word.level && <span className="shrink-0 text-xs font-semibold text-primary">{word.level}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

/** Minh hoạ trang chủ: thẻ học và con dấu 合 (合格 — đỗ), vẽ bằng CSS để không cần ảnh. */
export function HeroArt() {
  return (
    <div className="relative mx-auto h-[23rem] w-full max-w-md" aria-hidden>
      <div className="absolute top-2 right-2 size-72 rounded-full bg-primary/10" />
      <div className="absolute top-16 right-14 size-40 rounded-full border-[14px] border-primary/10" />

      <div className="panel absolute top-6 left-4 w-56 -rotate-6 p-5">
        <p className="eyebrow">Từ vựng N5</p>
        <p className="jp mt-2 text-5xl font-bold">学校</p>
        <p className="jp mt-1 text-muted">がっこう</p>
        <p className="mt-2 text-sm font-semibold text-hanviet">HỌC HIỆU</p>
        <p className="mt-1 text-sm">trường học</p>
      </div>

      <div className="panel absolute top-36 right-0 w-60 rotate-3 p-5">
        <div className="flex items-center justify-between">
          <p className="jp text-sm font-semibold">問題 1</p>
          <p className="rounded-lg bg-subtle px-2 py-0.5 font-mono text-xs text-muted">18:42</p>
        </div>
        <p className="jp mt-2 text-sm leading-7">
          この<span className="underline decoration-2 underline-offset-4">荷物</span>を運んでください。
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
          <span className="jp rounded-lg border border-success bg-success-soft px-2 py-1.5">にもつ</span>
          <span className="jp rounded-lg border border-border px-2 py-1.5">にもの</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-10 flex size-20 -rotate-12 items-center justify-center rounded-2xl border-4 border-primary font-serif-jp text-4xl font-semibold text-primary">
        合
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** Gấu trúc ninja. Mỗi bước là [khung hình, thời gian giữ tính bằng ms]. */
const SEQUENCES = {
  home: [[0, 700], [1, 150], [2, 280], [1, 150], [3, 220], [0, 400]],
  login: [[0, 700], [1, 170], [2, 260], [3, 210]],
  register: [[0, 850], [1, 180], [2, 260], [3, 200]],
} as const;

const FRAMES = [1, 2, 3, 4];

export function Mascot({ animation, className }: { animation: keyof typeof SEQUENCES; className?: string }) {
  const sequence = SEQUENCES[animation];
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const play = (current: number) => {
      timer = setTimeout(() => {
        const next = (current + 1) % sequence.length;
        setStep(next);
        play(next);
      }, sequence[current][1]);
    };
    // Đợi đủ các khung để lúc đổi khung không bị nháy trống.
    const images = [...(ref.current?.querySelectorAll("img") ?? [])];
    void Promise.all(images.map((image) => image.decode().catch(() => undefined))).then(() => {
      if (!stopped) play(0);
    });
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [sequence]);

  return (
    <div ref={ref} className={cn("relative aspect-square", className)} aria-hidden="true">
      {FRAMES.map((frame, index) => (
        <Image
          key={frame}
          src={`/mascot/${animation}/frame-0${frame}.webp`}
          alt=""
          width={627}
          height={627}
          unoptimized
          loading="eager"
          draggable={false}
          className={cn(
            "pointer-events-none absolute inset-0 size-full object-contain select-none",
            index === sequence[step][0] ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}

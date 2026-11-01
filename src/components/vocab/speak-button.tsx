"use client";

import { Volume2 } from "lucide-react";
import { cn } from "@/lib/cn";

/** Đọc tiếng Nhật bằng giọng có sẵn của trình duyệt (như phần Nghe hiểu). */
export function speakJapanese(text: string) {
  if (!("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.9;
  const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ja"));
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

export function SpeakButton({ text, className, label = "Nghe phát âm" }: { text: string; className?: string; label?: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        speakJapanese(text);
      }}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted transition-colors hover:border-primary/30 hover:text-primary",
        className,
      )}
    >
      <Volume2 className="size-[18px]" aria-hidden />
    </button>
  );
}

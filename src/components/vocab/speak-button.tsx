"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { japaneseSpeechText } from "@/lib/deck-games";

export function stopJapanese() {
  if (typeof window !== "undefined" && "speechSynthesis" in window)
    window.speechSynthesis.cancel();
}

/** Đọc bằng giọng Nhật trên thiết bị; chỉ gọi từ thao tác của người học. */
export function speakJapanese(text: string, onError?: () => void): boolean {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    onError?.();
    return false;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(japaneseSpeechText(text));
  utterance.lang = "ja-JP";
  utterance.rate = 0.9;
  const voice = synth
    .getVoices()
    .find((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ja"));
  if (voice) utterance.voice = voice;
  utterance.onerror = (event) => {
    if (event.error !== "interrupted" && event.error !== "canceled")
      onError?.();
  };
  try {
    synth.speak(utterance);
    return true;
  } catch {
    onError?.();
    return false;
  }
}

export function SpeakButton({
  text,
  className,
  label = "Nghe phát âm",
}: {
  text: string;
  className?: string;
  label?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="inline-flex shrink-0 flex-col items-center gap-2">
      <button
        type="button"
        title={label}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          setFailed(false);
          speakJapanese(text, () => setFailed(true));
        }}
        className={cn(
          "inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          className,
        )}
      >
        <Volume2 className="size-6" aria-hidden />
      </button>
      {failed && (
        <span
          role="status"
          className="max-w-44 text-center text-xs text-danger"
        >
          Chưa phát được âm thanh. Hãy bật giọng tiếng Nhật trên thiết bị rồi
          thử lại.
        </span>
      )}
    </span>
  );
}

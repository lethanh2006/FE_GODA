"use client";

import { Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { japaneseSpeechText } from "@/lib/deck-games";
import { createJapaneseSpeaker } from "@/lib/japanese-speech";
import { readSpeechPreferences } from "@/lib/speech-preferences";

let speaker: ReturnType<typeof createJapaneseSpeaker> | undefined;

export function stopJapanese() {
  speaker?.stop();
}

/** Chờ danh sách giọng và chỉ phát bằng một giọng Nhật cụ thể. */
export async function speakJapanese(
  text: string,
  onError?: () => void,
  signal?: AbortSignal,
): Promise<boolean> {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    onError?.();
    return false;
  }
  speaker ??= createJapaneseSpeaker(
    window.speechSynthesis,
    SpeechSynthesisUtterance,
  );
  const preferences = readSpeechPreferences();
  return speaker.speak(japaneseSpeechText(text), {
    voiceURI: preferences.voiceURI,
    rate: preferences.rate,
    onError,
    signal,
  });
}

export function SpeakButton({
  text,
  className,
  label = "Nghe phát âm",
  autoPlay = false,
}: {
  text: string;
  className?: string;
  label?: string;
  autoPlay?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const owner = useRef<AbortController | null>(null);
  const play = useCallback(() => {
    owner.current?.abort();
    const controller = new AbortController();
    owner.current = controller;
    void speakJapanese(
      text,
      () => {
        if (!controller.signal.aborted) setFailed(true);
      },
      controller.signal,
    ).then((started) => {
      if (started && !controller.signal.aborted) setFailed(false);
    });
  }, [text]);
  useEffect(() => {
    if (autoPlay) play();
    return () => owner.current?.abort();
  }, [autoPlay, play]);
  return (
    <span className="inline-flex shrink-0 flex-col items-center gap-2">
      <button
        type="button"
        title={label}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          setFailed(false);
          play();
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
          Chưa phát được giọng Nhật. Hãy cài giọng tiếng Nhật trên thiết bị hoặc
          bấm loa để thử lại.
        </span>
      )}
    </span>
  );
}

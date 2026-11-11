"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { japaneseVoices } from "@/lib/japanese-speech";
import {
  parseSpeechPreferences,
  saveSpeechPreferences,
  speechPreferencesSnapshot,
  type SpeechPreferences,
} from "@/lib/speech-preferences";
import { stopJapanese } from "./speak-button";

const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener("goda:speech-preferences", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("goda:speech-preferences", listener);
  };
};
const serverSnapshot = () => null;

export function useSpeechPreferences(): SpeechPreferences {
  const snapshot = useSyncExternalStore(
    subscribe,
    speechPreferencesSnapshot,
    serverSnapshot,
  );
  return useMemo(() => parseSpeechPreferences(snapshot), [snapshot]);
}

export function SpeechSettings() {
  const preferences = useSpeechPreferences();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[] | null>(null);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const update = () => setVoices(japaneseVoices(synth.getVoices()));
    synth.addEventListener("voiceschanged", update);
    // Một số trình duyệt tải danh sách giọng sau lần getVoices đầu tiên.
    const timer = setTimeout(update, 0);
    return () => {
      clearTimeout(timer);
      synth.removeEventListener("voiceschanged", update);
    };
  }, []);
  const update = (patch: Partial<SpeechPreferences>) => {
    stopJapanese();
    setStorageError(!saveSpeechPreferences({ ...preferences, ...patch }));
  };
  const selected = voices?.some(
    (voice) => voice.voiceURI === preferences.voiceURI,
  )
    ? preferences.voiceURI
    : "";
  const selectClass =
    "min-h-11 min-w-0 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  return (
    <details className="rounded-2xl border border-border bg-card px-4 py-3">
      <summary className="cursor-pointer rounded-lg py-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary">
        Giọng đọc & tự phát âm
      </summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
          Giọng tiếng Nhật
          <select
            className={selectClass}
            value={selected}
            onChange={(event) => update({ voiceURI: event.target.value })}
          >
            <option value="">Tự chọn giọng Nhật</option>
            {voices?.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Tốc độ nghe
          <select
            className={selectClass}
            value={preferences.rate}
            onChange={(event) => update({ rate: Number(event.target.value) })}
          >
            <option value={0.85}>Chậm · 0,85×</option>
            <option value={1}>Bình thường · 1×</option>
            <option value={1.1}>Nhanh · 1,1×</option>
          </select>
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium sm:col-span-2">
          <input
            type="checkbox"
            checked={preferences.autoPlay}
            onChange={(event) => update({ autoPlay: event.target.checked })}
            className="size-5 accent-primary"
          />
          Tự đọc khi mở hoặc chuyển thẻ
        </label>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Giọng đọc phụ thuộc thiết bị. Bạn có thể thử các giọng Nhật ở trên và
        luyện ở tốc độ bình thường.
      </p>
      {voices?.length === 0 && (
        <p role="status" className="mt-2 text-sm text-muted">
          Chưa tìm thấy giọng Nhật. Hãy cài giọng tiếng Nhật trong cài đặt giọng
          nói của thiết bị rồi tải lại trang.
        </p>
      )}
      {storageError && (
        <p role="status" className="mt-2 text-sm text-danger">
          Chưa lưu được lựa chọn. Hãy cho phép trang lưu dữ liệu trên thiết bị
          rồi thử lại.
        </p>
      )}
    </details>
  );
}

"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Role = "narrator" | "female" | "male";

interface ScriptLine {
  speaker: string | null;
  role: Role;
  text: string;
}

const NARRATOR = /^(ナレーター|ナレーション|N)$/;
const FEMALE = /女|母|妻|姉|妹|娘|おばあ|彼女|ママ|奥さん|店員A/;
const MALE = /男|父|夫|兄|弟|息子|おじい|パパ|店員B/;

/** Tách script「話者：lời thoại」thành từng dòng, đoán vai để chọn giọng đọc. */
export function parseScript(script: string): ScriptLine[] {
  const unknownRoles = new Map<string, Role>();
  return script
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([^：:「」]{1,12})[：:](.+)$/);
      if (!match) return { speaker: null, role: "narrator" as Role, text: line };
      const speaker = match[1].trim();
      const text = match[2].trim();
      let role: Role;
      if (NARRATOR.test(speaker)) role = "narrator";
      else if (FEMALE.test(speaker)) role = "female";
      else if (MALE.test(speaker)) role = "male";
      else {
        // Nhân vật không rõ giới tính: lần lượt gán nữ / nam để hai người nói khác giọng nhau.
        role = unknownRoles.get(speaker) ?? (unknownRoles.size % 2 === 0 ? "female" : "male");
        unknownRoles.set(speaker, role);
      }
      return { speaker: NARRATOR.test(speaker) ? null : speaker, role, text };
    });
}

function useJapaneseVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  // Trình phát chỉ render phía client (sau khi tải đề) nên kiểm tra window ở initializer là an toàn.
  const [status, setStatus] = useState<"loading" | "ready" | "unsupported">(() =>
    typeof window !== "undefined" && "speechSynthesis" in window ? "loading" : "unsupported",
  );

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => {
      const ja = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ja"));
      setVoices(ja);
      if (ja.length) setStatus("ready");
    };
    // Đọc danh sách giọng ở tick sau (một số trình duyệt có sẵn ngay, số khác báo qua voiceschanged).
    const initial = setTimeout(load, 0);
    window.speechSynthesis.addEventListener("voiceschanged", load);
    // Một số trình duyệt tải danh sách giọng chậm; quá 2 giây vẫn không có thì báo không hỗ trợ.
    const timer = setTimeout(() => setStatus((s) => (s === "loading" ? "unsupported" : s)), 2000);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      clearTimeout(initial);
      clearTimeout(timer);
    };
  }, []);

  const cast = useMemo(() => {
    // Ưu tiên giọng chất lượng tốt; espeak đọc tiếng Nhật rất kém nên chỉ dùng khi không còn giọng nào khác.
    const rank = (v: SpeechSynthesisVoice) =>
      /espeak/i.test(v.name)
        ? 0
        : /google|microsoft|kyoko|otoya|haruka|ichiro|ayumi|nanami|keita|sayaka|mizuki|hattori|o-ren|openjtalk/i.test(v.name)
          ? 2
          : 1;
    const sorted = [...voices].sort((a, b) => rank(b) - rank(a));
    const best = sorted.filter((v) => rank(v) === rank(sorted[0] ?? v));
    const isMale = (v: SpeechSynthesisVoice) => /otoya|ichiro|keita|daichi|naoki|hattori|male|男性/i.test(v.name) && !/female/i.test(v.name);
    const male = best.find(isMale);
    const female = best.find((v) => !isMale(v)) ?? best[0];
    const narrator = best.find((v) => v !== male && v !== female) ?? female;
    return {
      female: { voice: female, pitch: female && female !== male ? 1.1 : 1.4 },
      // Không có giọng nam riêng thì dùng cùng giọng nhưng hạ cao độ.
      male: { voice: male ?? female, pitch: male ? 1 : 0.6 },
      narrator: { voice: narrator, pitch: narrator === female ? 0.9 : 1 },
    } satisfies Record<Role, { voice: SpeechSynthesisVoice | undefined; pitch: number }>;
  }, [voices]);

  return { status, cast };
}

const RATES = [0.8, 1, 1.2];

const isLinuxDesktop = () =>
  typeof navigator !== "undefined" && /Linux/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent);

/**
 * Phát bài nghe bằng giọng đọc tiếng Nhật của trình duyệt (Web Speech API).
 * `spokenOptions`: các lựa chọn được đọc to sau script (như 即時応答 trong đề thật).
 */
export function ListeningPlayer({
  script,
  spokenOptions,
  showTranscript,
  className,
}: {
  script: string;
  spokenOptions?: string[];
  showTranscript: boolean;
  className?: string;
}) {
  const { status, cast } = useJapaneseVoices();
  const lines = useMemo(() => {
    const parsed = parseScript(script);
    const options = (spokenOptions ?? []).map((option, i) => ({
      speaker: null,
      role: "narrator" as Role,
      text: `${i + 1}。${option}`,
    }));
    return [...parsed, ...options];
  }, [script, spokenOptions]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [forceTranscript, setForceTranscript] = useState(false);
  const runId = useRef(0);

  const stop = useCallback(() => {
    runId.current++;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
  }, []);

  // Dừng đọc khi rời câu hỏi / trang. Nơi dùng đặt key theo câu hỏi để trạng thái được làm mới.
  useEffect(() => stop, [stop]);

  const playFrom = useCallback(
    (start: number) => {
      if (status !== "ready") return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const id = ++runId.current;
      setPlaying(true);

      const speak = (i: number) => {
        if (runId.current !== id) return;
        if (i >= lines.length) {
          setPlaying(false);
          setIndex(0);
          return;
        }
        setIndex(i);
        const line = lines[i];
        const utterance = new SpeechSynthesisUtterance(line.text);
        const { voice, pitch } = cast[line.role];
        if (voice) utterance.voice = voice;
        utterance.lang = "ja-JP";
        utterance.pitch = pitch;
        utterance.rate = rate;
        utterance.onend = () => setTimeout(() => speak(i + 1), 350);
        utterance.onerror = () => {
          if (runId.current === id) setPlaying(false);
        };
        synth.speak(utterance);
      };
      speak(start);
    },
    [status, lines, cast, rate],
  );

  const transcriptVisible = showTranscript || forceTranscript;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            <span className="jp">聴解</span> <span className="font-normal text-muted">· Bài nghe</span>
          </p>
          <p className="text-xs text-muted">
            {status === "loading" && "Đang tải giọng đọc…"}
            {status === "ready" && (playing ? `Đang phát ${index + 1}/${lines.length}` : `${lines.length} câu thoại`)}
            {status === "unsupported" && "Không có giọng đọc tiếng Nhật"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {RATES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRate(r);
                if (playing) stop();
              }}
              className={cn(
                "rounded-md px-2 py-1 text-xs tabular-nums",
                rate === r ? "bg-primary-soft font-semibold text-primary" : "text-muted hover:bg-subtle",
              )}
              title="Tốc độ đọc"
            >
              {r}×
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => playFrom(0)}
            disabled={status !== "ready"}
            className="rounded-full p-2 text-muted hover:bg-subtle hover:text-foreground disabled:opacity-40"
            title="Nghe lại từ đầu"
          >
            <RotateCcw className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => (playing ? stop() : playFrom(index))}
            disabled={status !== "ready"}
            className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-40"
            aria-label={playing ? "Tạm dừng" : "Phát"}
          >
            {playing ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
          </button>
        </div>
      </div>

      {status === "ready" && (
        <div className="mt-3 h-1.5 rounded-[4px] bg-primary-soft">
          <div
            className="h-full rounded-r-[4px] bg-primary transition-[width]"
            style={{ width: `${playing ? ((index + 1) / lines.length) * 100 : 0}%` }}
          />
        </div>
      )}

      {status === "unsupported" && (
        <div className="mt-3 flex flex-wrap items-start gap-2 rounded-lg bg-warning-soft p-3 text-sm text-warning">
          <span className="flex-1">
            Trình duyệt chưa có giọng đọc tiếng Nhật. Chrome / Edge / Safari trên Windows, macOS, Android, iOS đều có sẵn.
            {isLinuxDesktop() && (
              <>
                {" "}Trên Linux: dùng Firefox, hoặc mở Chrome với cờ <code>--enable-speech-dispatcher</code> (cần cài
                speech-dispatcher và giọng open-jtalk).
              </>
            )}
          </span>
          {!transcriptVisible && (
            <button type="button" className="font-medium underline" onClick={() => setForceTranscript(true)}>
              Đọc script thay thế
            </button>
          )}
        </div>
      )}

      {transcriptVisible ? (
        <details className="mt-3" open={forceTranscript}>
          <summary className="cursor-pointer text-sm text-muted hover:text-foreground">Script (スクリプト)</summary>
          <div className="jp mt-2 space-y-1 rounded-lg bg-subtle/60 p-3 text-sm">
            {lines.map((line, i) => (
              <p key={i} className={cn(playing && i === index && "font-semibold text-primary")}>
                {line.speaker && <span className="mr-1 text-muted">{line.speaker}：</span>}
                {line.text}
              </p>
            ))}
          </div>
        </details>
      ) : (
        <p className="mt-3 text-xs text-muted">Script sẽ hiện sau khi xem đáp án hoặc nộp bài.</p>
      )}
    </div>
  );
}

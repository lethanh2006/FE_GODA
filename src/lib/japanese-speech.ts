/** Chỉ chọn giọng Nhật; không để trình duyệt tự dùng giọng mặc định khác ngôn ngữ. */
export function japaneseVoices(
  voices: readonly SpeechSynthesisVoice[],
): SpeechSynthesisVoice[] {
  return voices.filter((voice) =>
    /^ja(?:-|$)/i.test(voice.lang.replaceAll("_", "-")),
  );
}

export function preferredJapaneseVoice(
  voices: readonly SpeechSynthesisVoice[],
  voiceURI?: string,
): SpeechSynthesisVoice | undefined {
  const available = japaneseVoices(voices);
  return (
    available.find((voice) => voice.voiceURI === voiceURI) ??
    available.find((voice) => !voice.localService) ??
    available[0]
  );
}

export interface JapaneseSpeechOptions {
  voiceURI?: string;
  rate?: number;
  onError?: () => void;
  signal?: AbortSignal;
}

type SpeechEngine = Pick<
  SpeechSynthesis,
  "getVoices" | "speak" | "cancel" | "addEventListener" | "removeEventListener"
>;

/** Bộ điều khiển dùng chung để việc chuyển thẻ hủy cả âm thanh và yêu cầu đang chờ tải giọng. */
export function createJapaneseSpeaker(
  synth: SpeechEngine,
  Utterance: new (text: string) => SpeechSynthesisUtterance,
  voiceTimeout = 2000,
) {
  let generation = 0;
  let cancelWaiting: (() => void) | undefined;
  let detachAbort: (() => void) | undefined;
  const stop = () => {
    generation++;
    detachAbort?.();
    detachAbort = undefined;
    cancelWaiting?.();
    synth.cancel();
  };
  const waitForVoices = () =>
    new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const finish = (voices: SpeechSynthesisVoice[]) => {
        clearTimeout(timer);
        synth.removeEventListener("voiceschanged", check);
        if (cancelWaiting === cancel) cancelWaiting = undefined;
        resolve(voices);
      };
      const cancel = () => finish([]);
      const check = () => {
        const voices = japaneseVoices(synth.getVoices());
        if (voices.length) finish(voices);
      };
      cancelWaiting = cancel;
      synth.addEventListener("voiceschanged", check);
      const timer = setTimeout(() => finish([]), voiceTimeout);
      check();
    });
  const speak = async (
    text: string,
    options: JapaneseSpeechOptions = {},
  ): Promise<boolean> => {
    stop();
    const request = generation;
    if (!text.trim() || options.signal?.aborted) return false;
    const abort = () => {
      if (request === generation) stop();
    };
    const detach = () => options.signal?.removeEventListener("abort", abort);
    options.signal?.addEventListener("abort", abort, { once: true });
    detachAbort = detach;
    try {
      let voices = japaneseVoices(synth.getVoices());
      if (!voices.length) voices = await waitForVoices();
      if (request !== generation) return false;
      const voice = preferredJapaneseVoice(voices, options.voiceURI);
      if (!voice) {
        detach();
        options.onError?.();
        return false;
      }
      const utterance = new Utterance(text);
      utterance.lang = "ja-JP";
      utterance.voice = voice;
      utterance.rate = options.rate ?? 1;
      utterance.onend = detach;
      utterance.onerror = (event) => {
        detach();
        if (
          request === generation &&
          event.error !== "interrupted" &&
          event.error !== "canceled"
        )
          options.onError?.();
      };
      synth.speak(utterance);
      return true;
    } catch {
      detach();
      if (request === generation) options.onError?.();
      return false;
    }
  };
  return { speak, stop };
}

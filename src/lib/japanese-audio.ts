import type { JapaneseSpeechOptions } from "./japanese-speech";

type AudioPlayer = Pick<
  HTMLAudioElement,
  | "play"
  | "pause"
  | "load"
  | "removeAttribute"
  | "playbackRate"
  | "onerror"
  | "onended"
>;

/** One shared player; stopping also settles any pending play() on mobile. */
export function createJapaneseAudioSpeaker(
  createAudio: (src: string) => AudioPlayer,
) {
  let cancel: (() => void) | undefined;
  const stop = () => {
    cancel?.();
    cancel = undefined;
  };
  const speak = (
    src: string,
    options: JapaneseSpeechOptions = {},
  ): Promise<boolean> => {
    stop();
    if (!src || options.signal?.aborted) return Promise.resolve(false);
    return new Promise((resolve) => {
      let active = true;
      let audio: AudioPlayer | undefined;
      const cleanup = () => {
        if (!active) return;
        active = false;
        options.signal?.removeEventListener("abort", cleanup);
        if (cancel === cleanup) cancel = undefined;
        if (audio) {
          audio.onerror = null;
          audio.onended = null;
          audio.pause();
          audio.removeAttribute("src");
          audio.load();
        }
        resolve(false);
      };
      const fail = () => {
        if (!active) return;
        cleanup();
        options.onError?.();
      };
      cancel = cleanup;
      options.signal?.addEventListener("abort", cleanup, { once: true });
      try {
        audio = createAudio(src);
        audio.playbackRate = options.rate ?? 1;
        audio.onerror = fail;
        audio.onended = cleanup;
        // Call play synchronously in the tap handler to preserve user activation.
        void audio.play().then(() => {
          if (active) resolve(true);
        }, fail);
      } catch {
        fail();
      }
    });
  };
  return { speak, stop };
}

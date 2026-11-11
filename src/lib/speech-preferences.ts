export interface SpeechPreferences {
  voiceURI: string;
  rate: number;
  autoPlay: boolean;
}
export const SPEECH_PREFERENCES_KEY = "goda.japanese-speech.v1";
export const DEFAULT_SPEECH_PREFERENCES: SpeechPreferences = {
  voiceURI: "",
  rate: 1,
  autoPlay: true,
};
export const SPEECH_RATES = [0.85, 1, 1.1] as const;

export function parseSpeechPreferences(
  value: string | null,
): SpeechPreferences {
  try {
    const parsed: unknown = JSON.parse(value ?? "null");
    if (!parsed || typeof parsed !== "object")
      return DEFAULT_SPEECH_PREFERENCES;
    const data = parsed as Partial<SpeechPreferences>;
    return {
      voiceURI: typeof data.voiceURI === "string" ? data.voiceURI : "",
      rate: SPEECH_RATES.some((rate) => rate === data.rate) ? data.rate! : 1,
      autoPlay: typeof data.autoPlay === "boolean" ? data.autoPlay : true,
    };
  } catch {
    return DEFAULT_SPEECH_PREFERENCES;
  }
}

export function speechPreferencesSnapshot(): string | null {
  try {
    return window.localStorage.getItem(SPEECH_PREFERENCES_KEY);
  } catch {
    return null;
  }
}

export function readSpeechPreferences(): SpeechPreferences {
  return parseSpeechPreferences(speechPreferencesSnapshot());
}

export function saveSpeechPreferences(preferences: SpeechPreferences): boolean {
  try {
    window.localStorage.setItem(
      SPEECH_PREFERENCES_KEY,
      JSON.stringify(preferences),
    );
    window.dispatchEvent(new Event("goda:speech-preferences"));
    return true;
  } catch {
    return false;
  }
}

# Deck pronunciation and furigana implementation plan

Goal: read each flashcard automatically on entry and card changes, display Japanese ruby at the front, and correct voice loading/selection and sentence preparation.

- [x] Keep sentence kanji when stripping furigana markup; remove optional grammatical parentheses from spoken words. BE tests cover word readings and sentence text. Front ruby uses provided markup, falling back to full-term ruby with known reading only.
- [x] Add a testable browser speech controller: select only Japanese voices, wait for asynchronous voice loading, prefer saved voice then remote/natural Japanese voices, normal rate by default, cancel old pending and active speech on navigation. Give actionable errors instead of using a non-Japanese default voice.
- [x] Add deck speech settings for Japanese voice, rate, autoplay toggle. Autoplay from card changes, manual playback remains available. Never autoplay the listening quiz answer. Tests cover delayed voices, cancellation/race, unsupported Japanese voices, settings and sentence processing.
- [x] Run BE/FE checks and browser QA for ruby, autoplay once per card, navigation cancellation, settings and mobile layout. Review and commit; use the existing BE-first production deployment flow.

Scope: use browser voices without starting a paid service unless the user selects that option. Device voices vary; this change does not certify synthesized audio as JLPT exam recordings. Preserve current unrelated backend scripts/ai/rank-rule.ts.


Verification:
- User selected improvements to device voices without paid services.
- BE: 87 tests, build and lint pass. Sentence output test watched fail with kana-only output, then pass with original kanji context.
- FE: 17 tests, lint and production build pass. Speaker tests cover delayed voice loading, Japanese-only selection, cancellation, abort ownership, speed and failures; settings parsing and front ruby are covered.
- Browser QA against production Next build with mocked account/deck/engine: one utterance on entry and each transition, front ruby for whole-word fallback and segmented markup, explicit Japanese voice/rate, preserved preferences after reload, autoplay off keeps manual playback available, raw Japanese sentence keeps kanji, delayed voices speak only latest card, missing Japanese voice never uses English, one-card shuffle replays same word.
- 390px layout has no horizontal overflow. axe-core scoped audit reports 0 violations. No application runtime errors after final flows.
- Review fixes: AbortSignal owns each button's manual/autoplay speech and removes pending lookup on unmount; shuffle changes playback key even when the card ID is unchanged. New abort regression watched fail, then pass. No deferred findings.
- Actual accent/naturalness was not audited by listening to headless speech. This update fixes selection/text/playback; available voice quality remains device-dependent. MDN references: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices and https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event.

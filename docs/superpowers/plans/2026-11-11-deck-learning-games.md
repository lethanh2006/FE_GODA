# Deck learning games implementation plan

**Goal:** Japanese-first flashcards, pronunciation for words/examples, and a lesson activity picker with matching and listening practice.
**Architecture:** Keep Next.js/SWR and NestJS deck ownership checks. Add speech-ready strings to card responses and a validated practice completion endpoint; reuse existing FSRS enrollment without schema changes. Browser speech synthesis provides Japanese audio.
**Tech stack:** Next.js 16 / React 19 / Tailwind 4, NestJS / TypeORM / Vitest.

## Requirements and choices
- Lesson opens an activity picker: flashcards, matching Japanese to Vietnamese, listening and choosing Vietnamese meaning.
- Always show Japanese before flipping; Vietnamese and examples appear on reverse. Bigger responsive cards and typography, existing GODA colors.
- Matching uses batches of up to five cards; listening offers up to four distinct meanings. Duplicate meanings are equivalent answers.
- Every card must be covered before a game can enroll the deck in review. Server validates ownership, distinct card coverage and answer membership. Existing learned endpoint remains for flashcards.
- Empty decks show a useful return action. One-card decks support flashcards/matching; listening needs two distinct meanings.
- Speech strips furigana markup, uses Japanese readings and gives a visible failure message when unavailable. No audio autoplay.

## Tasks
- [x] BE: add speech text, validated practice DTO/controller/service and tests for complete/incorrect/duplicate/foreign/empty submissions and ownership. Run focused tests, build and lint; commit independently.
- [x] FE: shared game helpers and tests, enlarged Japanese-first card with word/example playback, activity picker and matching/listening components, truthful save/retry state. Check keyboard interactions and narrow layouts.
- [x] Verify FE lint/build and helper tests; browser exercise activities, audio payloads, errors and mobile layout. Review final diffs; commit FE.

## Review focus
- Duplicate meaning labels must not penalize a semantically correct choice.
- Unknown/duplicate/missing card IDs must not enroll progress.
- Empty decks and one-card decks must not crash or create invalid options.
- Network errors must retain results for retry without reporting a saved completion.
- Space on an audio/navigation button must activate only that button; no audio side effects inside React state updaters.

## Progress
- Initial checkout: frontend clean, backend has unrelated untracked scripts/ai/rank-rule.ts; leave it untouched.

- BE verification: 87 tests / 13 files pass, Nest build and type-aware lint pass; committed as e30e07a.
- FE verification: helper tests 4/4, ESLint and production build pass.
- Browser verification against local Next production server + real Nest API/Postgres with a disposable test account: Japanese-only front; full example speech payload `ダイエットはたぶんしっぱいするだろう。`; audio Space does not flip; arrows work after flip; focus follows visible face; mobile 390px has no horizontal overflow.
- Matching: incorrect choice feedback, 7 cards in 5+2 pairs, 8 cards in 5+3; completion saved via API. Listening: 7 questions, wrong-choice retry, speech canceled on each advance; POST and background GET network failures retain answers, retry saves, completion stays visible after SWR refresh.
- Stale-content test: import an eighth card while matching is active; reconnect revalidates detail but current game stays at seven cards, server rejects obsolete completion, choosing a new activity loads all eight cards and can complete successfully.
- Empty deck shows return action; one-card deck disables listening and flashcard completion saves correctly.
- Audio QA intercepted utterances to verify text/language and error handling; actual voice quality depends on the installed Japanese voice and was not assessed in headless Chrome.
- Review addressed: native Space vs arrow shortcuts; cancellation on question change; per-activity content snapshot; refresh content after save failure; preserve SWR cache during refresh; background detail failures retain session data. No deferred review findings.
- One-card matching also completes successfully. axe-core audits on activity picker, matched board and completion: zero violations; no browser runtime errors. Disposable local QA data removed after verification.

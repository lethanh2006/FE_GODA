# Flashcard Self-Rating Implementation Plan

> **For agentic workers:** Execute inline with the existing project tools; request an independent final code review.

**Goal:** Grade flashcards and repeatedly study difficult cards, then push directly for production deployment as requested.
**Architecture:** Pure round transitions and latest ratings drive the existing deck learning and result screens. No new dependencies or API changes.
**Tech Stack:** Next.js 16, React 19, TypeScript, Node test runner.
**Spec:** docs/superpowers/specs/2026-11-25-flashcard-self-rating-design.md

## Global Constraints

- Preserve Japanese-first cards, speech settings, shuffle, viewport layout, matching/listening and API completion saving.
- Only ✓/✕ advances; reveal the answer before rating.
- Isolate work from unrelated local changes and push only this change on top of origin/master.

## Review Focus

- One-card and all-unremembered rounds can finish and repeat indefinitely.
- A later correct rating removes a card from the difficult subset; prior remembered cards stay excluded.
- Backtracking overwrites a previous rating without duplicate counts; shuffle does not drop cards.
- Save failure leaves retry and review choices available.
- Mobile controls fit; Space keeps native button behavior, shortcut typing/modifiers are ignored.

## Task 1: Round state and learning UI

- [x] Add failing tests in tests/flashcard-session.test.mjs for immutable ratings, last-card completion, latest-rating replacement, subset repeats and empty input.
- [x] Implement src/lib/flashcard-session.ts and run `pnpm test:decks`.
- [x] Update deck-session.tsx and activity copy with reveal-gated ✓/✕, counts and round/subset replay. Update README.
- [x] Run lint, build, and browser checks with a local mocked API for mixed ratings, subset repeats, keyboard navigation, single-card decks, save errors and mobile bounds.
- [ ] Review the diff, address defects, commit, push HEAD:master without force, and verify the resulting production deployment.

## Validation record

- Observed missing-helper test failure before implementation; 29/29 tests pass after implementation.
- ESLint passes with no warnings. Next.js production build passes.
- Independent read-only reviewer: no actionable findings.
- Browser: reveal-gated ratings; revising an earlier ✕ to ✓; three-card round to one-card difficult subset; repeated ✕ retains that subset and later ✓ removes it; native Space activates the focused grade button; repeat-all resets ratings; shuffled round visits every ID; all-✕ round keeps all cards available to repeat.
- Aborting completion save shows retry and both study choices. Restoring network and retrying confirms saved state without losing ratings.
- Expanded speech settings at 320×568 and 375×667 retain card heights of 156px and 153px, both grade controls within the viewport, and no horizontal overflow.

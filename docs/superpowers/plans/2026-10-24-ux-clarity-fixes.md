# UX Clarity Fixes Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Track actual results here and in CONTINUE.md.

**Goal:** Implement the approved UX review with next-action/time-control clarity first.
**Architecture:** Keep simulation and save schema intact. App owns transient choice feedback, focus requests and persistence status; existing views render accessible state and guidance. Shared landscape rendering serves an optimized original asset.
**Tech Stack:** React 19, TypeScript, Vite, plain CSS, lucide-react, Vitest/RTL, existing npm dependencies.
**Spec:** `docs/superpowers/specs/2026-10-24-ux-clarity-fixes.md`

## Global constraints

- Preserve seeded simulation, saves, pending choices and hidden-tab behavior.
- No dependency upgrades, publishing, storage clearing or main-branch implementation.
- Work on `codex/ux-clarity-fixes` from fetched `origin/main`; user merges its PR manually.
- User approval of the completed review authorizes these fixes. Routine interaction details are implementation decisions; no new design-approval round is needed.

## Review focus

- Repeated save failures and recovery must preserve the newest in-memory choice/focus/study.
- Failed load with unreadable stored data must never retry by overwriting it with empty state.
- Manual outcomes must reflect actual risk/capped-stat results, not promised choice descriptions.
- Timed and automatic choices must not steal focus or announce every tick; hidden pages stay inert.
- Navigation, archive previews, new lives and ending transitions must not show another life's outcome or an invalid heading target.

## Task 1: Play loop and persistence recovery

Files: `src/App.tsx`, `src/App.test.tsx`, `src/components/LifeView.tsx`, new `src/components/ChoiceOutcome.tsx` if useful.
Interfaces: transient outcome contains actual title/text and change labels derived from before/after Life; never persisted. Views accept optional outcome/watch-state props. App supplies latest-data save retry and guarded load retry.

- [x] Add failing RTL tests for review-choice focus, in-place actual outcome/continue, page focus, retry save/latest state, repeated failure and load retry preserving data.
- [x] Run focused tests and inspect intended failures (five App and two component failures before implementation).
- [x] Implement current-state/next-step guidance, feedback/focus and safe retry paths.
- [x] Run focused tests and existing playback tests; resolve failures.

## Task 2: Supporting views and responsive presentation

Files: `src/components/{LifeView,Progression,NewLife,Archive,WorldView}.tsx`, `src/styles.css`, component tests.
Interfaces: storage status passed from App; optional spellbook navigation callback; fixed character spellbook anchor. Mobile region list remains the existing source of selection.

- [x] Add failing tests for truthful storage assurances and ended timeline. One-h1, archive return and direct study navigation are verified in the browser instead of redundant copy/markup tests.
- [x] Run focused component tests and inspect expected failures.
- [x] Implement supporting flows/copy and responsive CSS, preserving identity and desktop controls.
- [x] Verify component tests and full `npm test` (50 passed across seven files).

## Task 3: Asset, browser verification and delivery

Files: reusable landscape component, original WebP derivative, ASSETS.md, PRODUCT.md, DESIGN.md, app README, checkpoint.

- [x] Encode original PNG to WebP, inspect it and record dimensions/bytes/provenance; use a picture fallback in existing scene/opening/birth views.
- [x] Run full `npm test` and `npm run build` (final: 51 tests; TypeScript/Vite passed).
- [x] Batch browser QA on desktop and 390/320px phone, plus failed storage and ending; fix observed issues once and confirm.
- [x] Independent whole-branch review, address important findings with meaningful tests, update documentation/checkpoint and this ledger.
- [x] Inspect full diff, references, untracked files and `git diff --check`; fetch for freshness, commit/push and PR to main.

## Progress ledger

- Setup: clean branch created from fetched origin/main; account windows 88% five-hour / 67% weekly remaining. No nested AGENTS.md.
- Ruling: use the required task branch in the shared checkout rather than introduce a worktree; repository workflow and clean start already supply isolation for this task.
- Ruling: preserve timed playback after manual choices and show a persistent outcome until the next decision; this fixes feedback without changing simulation pacing or adding a mandatory confirmation step.
- Pre-flight: Task 2 consumes App outcome/storage callbacks from Task 1; keep optional/defaulted component props for independent existing callers. Task 3 changes only image presentation and documentation.
- Tasks 1–2: seven new behavior tests failed for the reviewed missing behavior before implementation, then passed. Full suite subsequently reached 50 passing tests; production build passed. Two test-fixture errors (quest ID and RNG seed) were corrected against the real event catalogue/generator without changing simulation code.
- Ruling: use browser evidence for simple archive-label, heading-semantic and spellbook-target changes; behavior tests cover the state/recovery boundaries. This avoids tests that mirror wording or framework forwarding.
- Asset: 1881×836 original PNG 3,293,374 bytes; same-size quality-90 WebP 554,172 bytes (83.2% smaller), visually inspected. Source PNG retained.
- Independent review `/root/ux_fix_review`: no Important/Critical issue. One minor false implication that an older archived life was unsaved during a global write failure; fixed with wording about latest progress.
- Browser first pass: desktop, 390px and 320px; 44px utility controls; mobile Help; decision/outcome focus; actual deltas; spellbook deep link; repeated failed write then recovery and real-app reload; failed read then retry; 114-year retrospective/archive with one h1 and no future squares; readable 61px region-list controls; optimized image currentSrc confirmed. No overflow or captured console warning/error on inspected paths.
- Browser correction: focusing a heading already near the viewport bottom did not bring its choices into view. Explicit scroll-to-heading now places decision/outcome at a 24px reading offset; confirmed on phone.
- Final functional correction: Space on a native spell summary started playback under the original tag-name guard. Added a regression that failed, changed the guard to exclude interactive ancestors (including summary/link/editable content), then passed all 51 tests and build. Confirmed on a fresh browser page that Space toggles the disclosure while Play time remains paused; a stale hot-refreshed page was discarded before confirmation.
- Final QA: automatic play advanced through childhood with safe choices, Pause and real-app reload restored paused/manual defaults, Escape restored the collapsed menu toggle. Desktop handoff screenshot saved, viewport reset, QA tab closed, preview stopped and fixture source removed. No original-player storage was touched.
- Documentation: PRODUCT/README/DESIGN/ASSETS updated; design sidecar retains all 11 existing previews and adds interaction guidance metadata. Checkpoint records implementation scope, review, verification, usage and delivery next step.
- Delivery: `91b52b3` pushed on `codex/ux-clarity-fixes`; [PR #3](https://github.com/ny147/1-in-mushoku-tensei/pull/3) targets `main`. Fresh origin/main is contained, required checks passed, no blockers. This ledger/checkpoint follow-up uses the same PR. User merges manually; no deployment performed.

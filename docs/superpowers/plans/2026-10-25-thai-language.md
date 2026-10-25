# Thai Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let new lives run entirely in English or Thai, retaining their selected language without changing existing English saves or seeded outcomes.

**Architecture:** Persist an optional language on each life, defaulting missing values to English. Explicit catalogues translate React presentation and narrative references captured with new history entries; the engine retains its canonical values and deterministic rules. A separate preference supplies the next new-life form's default without touching game-save recovery.

**Tech Stack:** Existing React 19, TypeScript, Vite, plain CSS, Vitest and React Testing Library; npm and the existing lockfile. No new runtime translation dependency.

**Spec:** [Approved design](../specs/2026-10-25-thai-language-design.md).

## Global Constraints

- Choose English or Thai when creating a life; no language switch inside a life.
- Existing lives and archives remain English. Missing language metadata means English.
- Preserve stable event/choice/spell IDs, flags, random state, pending decisions and canonical rule comparisons.
- Preserve player names exactly; use Arabic digits in both languages.
- Keep the storage key and outer save version compatible; never clear browser storage.
- Preserve the illustrated chronicle and existing English fonts; add licensed self-hosted Thai coverage.
- Run npm commands from `six-faced-life/`; use isolated browser QA, never the player's port 5173 storage.
- Deliver through the existing draft PR #7 on `codex/thai-language`, targeting `main`; the user merges manually. No deployment.

## Review Focus

- A Thai form preview canceled over an English life must leave that life and its saved payload unchanged (Task 4).
- Mixed-language archive navigation must restore the active language after reading a retrospective (Task 4).
- Past spell, career and travel entries must use captured event-time values after later state changes (Task 3).
- Blocked preference storage must not mask a failed game save or trigger an empty replacement (Tasks 1 and 4).
- Long Thai text, combining marks and keyboard focus must remain readable at 320px without overflow (Tasks 5 and 6).

## File Responsibilities and Interfaces

- `src/game/types.ts`: `Language = "en" | "th"`, optional `Life.language`, and optional `Entry.message: NarrativeMessage`. `NarrativeMessage` contains a bounded `key` and optional scalar `params: Record<string, string | number>`.
- `src/game/narrative.ts` (new): pure reference builders for birth, annual entries, choices, learning, farewells and endings; snapshots values before later state changes. No React, browser API, translation catalogue, or random calls.
- `src/game/engine.ts`: `createLife(options)` accepts optional `language`; history creation includes presentation references without changing canonical English fields or simulation rules.
- `src/game/storage.ts`: validate optional language/reference metadata while accepting old saves untouched.
- `src/i18n/locale.ts` (new): `languageOf(life: Pick<Life, "language"> | null | undefined): Language`, `readLanguagePreference(storage: StorageLike): Language`, `writeLanguagePreference(storage: StorageLike, language: Language): boolean`; preference key `six-faced-life.language`.
- `src/i18n/messages.ts` (new): English/Thai UI catalogue; `translate(language: Language, key: string, params?: Record<string, string | number>, fallback?: string): string`. Complete messages own their grammar.
- `src/i18n/world.ts` (new): ID-based race, region, focus, school, spell, rank and career presentation; canonical biography labels have explicit translations.
- `src/i18n/story.ts` (new): `decisionText(decision: Decision, life: Life, language: Language): Decision` returns presentation-only event/choice text; `entryText(entry: Entry, language: Language): { title: string; text: string }` resolves captured references. Unknown references preserve original title/text. Never feed a localized decision into the engine.
- `src/i18n/context.tsx` (new): `LanguageProvider` and `useI18n(): { language: Language; t: (key: string, params?: Record<string, string | number>, fallback?: string) => string }`, with English default for existing standalone component tests.
- Existing `App.tsx`, components and `styles.css`: explicit translated rendering, language ownership, form and font integration; no DOM replacement or simulation mutation.
- `public/assets/`, `ASSETS.md`, `README.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`: font provenance and implemented feature documentation.

## Task 1: Persistent Language and Safe Preference Boundary

Files: `src/game/types.ts`, `src/game/engine.ts`, `src/game/storage.ts`, new `src/i18n/locale.ts`, `src/game/storage.test.ts`, new `src/i18n/locale.test.ts`.

- [x] Add failing tests: a new Thai life retains `language: "th"` through save/reload; an old life without language remains byte-for-byte unchanged on disk and reads as English; invalid `"xx"`, null and prototype-key language values report recovery without overwriting the raw payload; mixed-language archives round-trip.
- [x] Add failing preference tests: invalid/missing/throwing reads return `"en"`; throwing writes return false; only `six-faced-life.language` is read/written, never `SAVE_KEY`.

Core round-trip assertions (inside a test using the existing memory storage helper):
```ts
const life = beginLife(createLife({ seed: 90, language: "th" }));
expect(saveGame(storage, { version: 1, active: life, archive: [] })).toBe(true);
expect(loadGame(storage).data.active).toEqual(life);
expect(languageOf(loadGame(storage).data.active)).toBe("th");
```

- [x] Run `npm test -- src/game/storage.test.ts src/i18n/locale.test.ts`; confirm the new assertions fail for missing behavior.
- [x] Implement the declared language interfaces. Omitted `createLife` language stays compatible with existing callers; `languageOf` supplies the English default without rewriting legacy lives.
- [x] Rerun the same tests, inspect passing output, then commit only these task-owned files.

## Task 2: Complete Translation Catalogues

Files: new `src/i18n/messages.ts`, `src/i18n/world.ts`, `src/i18n/story.ts`, `src/i18n/context.tsx`, new `src/i18n/catalogues.test.ts`.

- [x] Write failing catalogue tests enumerating all 55 events, every available choice ID across six regions/five races/five schools/five working careers and all promotion levels, all 30 spells, domain labels, and the UI key inventory. Every authored field must resolve nonempty Thai text instead of a missing-key or English fallback.
- [x] Include generated travel, study, promotion and recommit choices; assert parameter values survive interpolation and player names are not translated.
- [x] Run `npm test -- src/i18n/catalogues.test.ts`; inspect failure before catalogue implementation.
- [x] Implement complete-message Thai translations, ID-based domain lookups and language context. Keep authored Thai prose and a consistent world-name glossary; preserve numbers, costs, signs, requirements and ranks. Do not translate domain values used in conditions.
- [x] Rerun catalogue tests and commit. Review prose for natural Thai and consistency rather than relying only on nonempty-string assertions.

## Task 3: Translate New Chronicle Entries Without Changing Outcomes

Files: new `src/game/narrative.ts`, `src/game/types.ts`, `src/game/engine.ts`, `src/game/storage.ts`, `src/i18n/story.ts`, new `src/game/narrative.test.ts`, `src/game/storage.test.ts`.

- [ ] Add failing tests for localized birth, all eight annual focuses, infant years, successful/risky choices, spell learning from both sources, family farewells and each ending cause/legacy. Change region/career/study after an entry and assert its Thai rendering retains the original values.
- [ ] Test unknown reference fallback to the saved title/text; invalid key/params shapes, arrays, excessive lengths/counts and nonfinite numbers must preserve unreadable raw saves through existing recovery. Bounds: key 160 characters, at most 20 scalar parameters, string values at most 500 characters, finite numeric values.
- [ ] Compare complete same-seed lives across English/Thai actions after removing only `language`; random state, histories, references, progression, pending choices and endings must match. Confirm legacy entries remain English and readable.
- [ ] Run `npm test -- src/game/narrative.test.ts src/game/storage.test.ts`; confirm red results, then implement pure reference capture and rendering. For learned spell lists capture stable spell IDs as a bounded scalar representation, not later study state.
- [ ] Rerun targeted tests plus `npm test -- src/game/engine.test.ts src/game/progression.test.ts`; inspect results and commit.

## Task 4: New-Life Selection and Full Interface Integration

Files: `src/App.tsx`, `src/components/NewLife.tsx`, `LifeView.tsx`, `Progression.tsx`, `ChoiceOutcome.tsx`, `Archive.tsx`, `WorldView.tsx`, `WorldMap.tsx`, `Landscape.tsx` as needed; `src/App.test.tsx` and affected component tests.

- [ ] Add failing RTL tests for `Language / ภาษา`, Thai form preview before creation, explanatory fixed-language text, Thai creation and reload, English defaults, preference restoration, explicit replacement confirmation, and canceling without changing the old save.
- [ ] Add mixed-archive tests: list language labels, open a Thai retrospective over an English active life and return; assert whole-view language/document `lang` restoration. Also test no-active-life navigation.

Pin the preview boundary in RTL after opening the form over an English life:
```ts
const before = window.localStorage.getItem(SAVE_KEY);
fireEvent.change(screen.getByLabelText("Language / ภาษา"), { target: { value: "th" } });
expect(document.documentElement.lang).toBe("th");
expect(window.localStorage.getItem(SAVE_KEY)).toBe(before);
```

- [ ] Add Thai choice/outcome/focus, help/world, spellbook, pending-decision reload and storage retry assertions. Preference failure must not affect visible game-save recovery. Preserve Space guarding, hidden-tab pause and focus targets.
- [ ] Run `npm test -- src/App.test.tsx src/components`; verify failures, then integrate translations with context. Extend `NewLife.onCreate` to pass the language; App owns draft, active and preview language precedence. Keep announcements and actual choice deltas localized, including outcome feedback already displayed.
- [ ] Translate all static/parameterized JSX, accessible names, titles, errors and image alternatives explicitly; retain canonical data in callbacks and save operations. Keep full messages together rather than translating fragments.
- [ ] Rerun the same tests; inspect results and commit.

## Task 5: Thai Typography and Documentation

Files: `src/styles.css`, licensed Thai font files/licenses under `public/assets/`, `ASSETS.md`, `README.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`.

- [ ] Verify font provenance from the font project's primary source and license before adding self-hosted narrative/control coverage. Retain existing assets and licenses; no runtime font CDN.
- [ ] Scope Thai font/line-height/tracking rules with document `lang`; avoid clipping combining marks or applying English uppercase tracking. Let controls/status/choice text wrap and preserve 44px utility targets.
- [ ] Update docs to describe only actual implemented behavior, language ownership, legacy compatibility, separate preference storage, and font credits. Update design sidecar consistently.
- [ ] Run `npm test` and `npm run build`; inspect complete output, then commit task-owned code/assets/docs.

## Task 6: Whole-Flow Verification, Review and Delivery

Files: targeted fixes/tests as needed, this ledger, `CONTINUE.md`; existing PR #7.

- [ ] Check usage before expensive verification. Use an isolated preview port and exercise Thai and English opening/birth/decision/outcome/study/spellbook/help/world/reload/ending/archive; test cancel/replacement and mixed-language archive navigation.
- [ ] Inspect desktop and 390px/320px layouts, keyboard focus/menu/Space controls, combining marks, font loading, console errors, horizontal overflow and failed save/retry. Keep the player's port 5173 and browser storage intact.
- [ ] Conduct a fresh whole-branch review of fixed-language ownership, translated story variants, metadata bounds, seeded parity, recovery and catalogue completeness. Fix important findings; rerun affected checks after fixes.
- [ ] Run final `npm test`, `npm run build` and `git diff --check` when justified by the latest changes. Review the complete task diff including added files; record only checks actually run.
- [ ] Fetch/prune, report whether `origin/main` advanced without automatically integrating it, update this ledger and CONTINUE.md with exact results/limitations, commit/push explicit task-owned files, and update PR #7. Mark ready only after required verification passes; user merges manually.

## Progress Ledger

- 2026-10-25: The user approved both the design and plan, selected native execution, and explicitly reminded the agent to maintain save points. Do not ask for design, plan, or execution-method approval again.
- Pre-flight: Task 1 produces `Language`, optional `Life.language` and separate preference helpers for Tasks 2/4; no conflicts. Tasks 2/3 produce presentation-only decision/history text consumed by Task 4; narrative types and validation belong together in Task 3. Task 4 document-language ownership supplies Task 5 typography selectors; no conflict.
- Ruling: Continue on the existing required task branch and use this tracked progress ledger plus CONTINUE.md, rather than creating a worktree or a competing checkpoint — the repository workflow and approved plan already specify these locations.
- Ruling: Introduce `NarrativeMessage`/`Entry.message` together with validation in Task 3, not as unused/unvalidated fields in Task 1 — keeps each persistence change bounded and testable. No Task 2 implementation has started.
- Task 1: complete, base `47d25cc`, implementation commit `cc2079f`. RED: targeted run observed 11 failing persistence assertions, nine passing existing/legacy tests, and the expected missing new locale module. GREEN: the same command passed 32 tests across two files. Initial sandbox run failed before tests at esbuild spawn EPERM; authorized reruns executed normally.
- Verification after formatting: `npm test` passed all 75 tests across eight files; `npm run build` passed TypeScript/Vite; complete six-file Task 1 diff and both new files reviewed; staged `git diff --check` passed. No browser QA yet because there is no new UI, and the translation feature remains incomplete.
- Save point observed 2026-10-25 11:47:34 Asia/Bangkok (04:47:34 UTC): five-hour 9% remaining, resetting October 25 at 14:52:47; weekly 42% remaining, resetting October 31 at 10:39:46. Save this verified milestone before substantial catalogue work. Keep PR #7 draft.
- Next: resume the same branch, inspect CONTINUE.md and usage, fetch/prune; start Task 2 by creating `six-faced-life/src/i18n/catalogues.test.ts` and running `npm test -- src/i18n/catalogues.test.ts` from the app. Do not redo Task 1. No further user approval is needed to continue the plan.

- Task 2: complete on resumption; catalogue RED observed missing messages module, then coverage exposed missing event categories; GREEN passed four catalogue tests including all generated branches, domains, 30 spells, childhood/high-risk/instruction thresholds. TypeScript/Vite build passed. Upstream advanced to ae9a2d1; no merge/rebase performed. Next: Task 3 narrative-reference tests.

# Swordsmanship Styles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give expanded lives three retained sword styles, meaningful selected-style event choices, and paid year-long mentorship with manual guaranteed promotion trials.

**Architecture:** Add an authoritative versioned sword ledger under expanded
state. Pure domain modules own learning, qualification queries, migration,
mentorship and authored event approaches; existing engine boundaries own time,
choice transactions and seeded RNG. Keep compatibility fields paired, legacy
rules frozen, and old completed records immutable.

**Tech Stack:** Existing React, TypeScript, Vite, Vitest/RTL, plain CSS and npm;
Node.js 22.12+ or supported Node.js 24; no new dependencies.

**Spec:** [Approved design](../specs/2026-10-29-swordsmanship-styles-design.md).

## Global Constraints

- Scope: new and active **expanded-1** lives; no tactical combat or deployment.
- Sword God, Water God, North God: practice one at a time; switching is free
  **between events only**. Jobs use the strongest learned style; events use only
  the currently selected style. Never sum styles or combine their XP and ceilings.
- Practice opens at age **5**; mentors at **8**; existing travel minimum **18**.
  Retain XP thresholds **0, 35, 110, 260, 560, 1000, 1800**. Self-practice reaches
  **Advanced**. Saint+ requires consecutive promotions, paid mentorship, **one
  full simulated year of eligible elapsed practice**, then a manual guaranteed
  trial. Retain aura impairment's **Advanced** ceiling.
- Fees: **16/32/64/128 silver** for Saint/King/Emperor/God. Sword God mentors:
  **Asura**; Water God: **Millis**; North God: **Demon Continent**. Original game
  teachers and balance, not canon appointments or Seven Great Powers titles.
- Keep sword talent **+25%**, fractional XP and existing factor stacking;
  preserve all RNG streams during migration, selection, quotes and rendering.
- Never clear browser storage or use the player's **5173** save for destructive
  QA; use isolated **5174**. Preserve immediate persistence, recoverable storage
  failures, English/Thai, pause-on-decision and existing Play/Pause behavior.
- Continue **`codex/swordsmanship-styles`**, existing **draft PR #18**, base
  **`main`**. Follow root AGENTS.md fetch/usage/verification rules; stage only
  task-owned files. User merges manually; no auto-merge, publishing or new service.

## Review Focus

- Missing versus malformed optional sword state, including an ended active life:
  migrate only live old records; keep corrupt data recoverable (Task 2).
- A course partially completed before migration or spread across styles:
  each milestone contributes once, with no duplicated skill floor (Task 3).
- Fractional birthdays, capped tick overshoot and explicit year/decision advances:
  credit only actual eligible simulated time, never a whole birthday (Task 5).
- Ready trials competing with history events, a full queue, deferral or reload:
  retain one durable manual trial, with no repeated charge or promotion (Task 5).
- A high-XP weakly instructed style, a lower-XP high-ranked style and a switched
  novice style: pair requirements per track and use the correct query (Tasks 1/3).

## File map and shared contracts

All source paths below are relative to `six-faced-life/`; plan/spec/checkpoint
paths are relative to the repository root. New modules stay beside expanded
domain code, avoiding a rewrite of `src/App.tsx` or the existing engine.

| Files | Responsibility |
| --- | --- |
| `src/game/expanded/sword-state.ts` | Types, empty ledger, rank/read queries, selection, grants, compatibility synchronization |
| `src/game/expanded/sword-migration.ts` | Active-only migration, one-time allocation, course credit initialization, saved-offer compatibility |
| `src/game/expanded/sword-validation.ts` | Strict optional-state and decision-snapshot validation |
| `src/game/expanded/sword-mentors.ts` | Teacher registry, quotes, payment, training credit, abandon/promotion transactions |
| `src/game/expanded/sword-events.ts` | First selection, mentor/trial decisions, authored service/assignment approaches |
| `src/i18n/sword.ts` | Shared EN/TH style, mentor, trial, requirements and outcome copy |
| `src/components/SwordProgress.tsx` | Selection, per-style progress and mentorship status in existing UI |
| Existing engine, storage, careers, courses, effects, summary, app and views | Integration through the contracts below |

Use stable IDs `sword-god`, `water-god`, `north-god`; map recognized old display
names only at compatibility boundaries. `SwordRank` is the existing 0..6 rank
index; `AdvancedSwordRank` is 3..6. New `ExpandedState.swords?: SwordState`:

```ts
type SwordStyle = "sword-god" | "water-god" | "north-god";
type SwordRank = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type AdvancedSwordRank = 3 | 4 | 5 | 6;
interface SwordTrack { xp: number; cap: SwordRank }
interface SwordMentorship {
  style: SwordStyle; target: AdvancedSwordRank; fee: number;
  progress: number; deferred: boolean;
}
interface SwordState {
  version: 1;
  selected: SwordStyle | null;
  tracks: Record<SwordStyle, SwordTrack>;
  legacy: SwordTrack | null;
  compatibilityDecision: Decision | null;
  compatibilityStudy: MagicSchool | null; // captured context for old pending offers
  courseCredit: Record<OrdinaryRole, number>;
  mentorship: SwordMentorship | null;
  completed: Record<SwordStyle, Partial<Record<AdvancedSwordRank, number>>>;
}
```

`completed` values are actual completion world years, not an invented history
for grandfathered ranks. `fee` in an active mentorship means already paid;
absence of a mentorship means no enrollment. Trial-ready means `progress === 1`.
Do not store derivable selected rank, paused reason, or quoted affordability.
Domain mutation helpers operate on a transaction-owned clone; public UI entry
points return a cloned Life or the original identity for a rejected action.

## Task 1: Authoritative style ledger and guarded selection

**Files:** create `src/game/expanded/sword-state.ts` and `src/game/expanded/sword-state.test.ts`;
modify `src/game/expanded/types.ts`, `src/game/expanded/origins.ts`, `src/game/engine.ts`.

**Interfaces:** produces `emptySwordState(): SwordState`,
`swordRank(track: SwordTrack): SwordRank`,
`selectedSwordTrack(l: ExpandedLife): SwordTrack | null`,
`bestSwordTrack(l: ExpandedLife): SwordTrack | null`,
`swordMeets(l: ExpandedLife, xp: number, cap: SwordRank, mode: "career" | "event"): boolean`,
`grantSwordXp(l: ExpandedLife, amount: number): void`,
`syncSwordCompatibility(l: ExpandedLife): void`, and facade
`selectSwordStyle(l: Life, style: SwordStyle): Life`.

- [ ] Write failing `sword-state.test.ts` cases named `keeps_three_independent_tracks`,
  `locks_selection_during_pending_or_queued_decisions`, `does_not_mix_requirements`,
  and `never_sums_tracks`: assert all new caps 2, all XP 0; Sword 110/2 plus Water
  35/4 does not meet a career 110/4 requirement; Sword 30 plus Water 30 does not
  meet XP 35; switching preserves both tracks, RNG, focus and age; invalid IDs,
  under-age, ended and legacy-rule selection return the original Life.

  ```ts
  expect(swordRank({ xp: 1800, cap: 2 })).toBe(2);
  expect(swordMeets(mixedTracks, 110, 4, "career")).toBe(false);
  expect(selectSwordStyle(pendingLife, "water-god")).toBe(pendingLife);
  ```
- [ ] Run `npm.cmd test -- --maxWorkers=2 src/game/expanded/sword-state.test.ts`;
  observe the new missing interfaces/behavior fail, without treating a syntax
  error as meaningful RED evidence.
- [ ] Implement the interfaces. Rank uses existing `RANK_XP`; order the paired
  compatibility mirror by rank, XP, then stable ID. Career queries consider
  each single track plus an unassigned legacy bundle; event queries use selected
  track, with only Task 2's captured pending-offer compatibility fallback.
  Allocate a legacy bundle on initial selection once; retain cap at least 2 and
  preserve higher old caps. Negative grants cannot reduce XP; positive grants
  retain fractions. New births initialize the ledger without RNG draws.
- [ ] Run focused tests and existing origins/legacy-compatibility tests; verify
  byte-equivalent birth RNG/family fields apart from the new ledger, cap-limited
  ranks with banked XP, and immutable rejected selection.
- [ ] Commit only this task's files: `feat: add independent sword style progression`.

## Task 2: Save migration and pending-offer compatibility

**Files:** create `src/game/expanded/sword-migration.ts`, `src/game/expanded/sword-validation.ts`,
`src/game/expanded/sword-migration.test.ts`; modify `src/game/expanded/validation.ts`,
`src/game/storage.ts`, `src/game/expanded/events.ts`; extend `src/game/storage.test.ts` and
`src/game/storage-codec.test.ts` where their existing assertions apply.

**Interfaces:** consumes Task 1 types/queries; produces
`migrateSwordState(l: ExpandedLife, offered: Decision | null): ExpandedLife` and
`validateSwordState(value: unknown, l: ExpandedLife): boolean`. The facade from
Task 1 performs one-time bundle allocation. Existing `loadGame` composes this
after education/talent migration, only for non-ended active expanded lives.

- [ ] Add failing cases `preserves_old_pending_instruction_and_rng`,
  `allocates_unassigned_progress_once`, `rejects_malformed_present_state`, and
  `leaves_ended_active_and_archives_unchanged`. Start from an old-shaped fixture
  with no sword ledger, XP 560, cap 4, a pending instruction, a queued service
  event, partial-year progress and nonzero debt. Assert preserved IDs, effects,
  cost, history/RNG and coins; known Water God maps to Water only; unknown school
  remains an unassigned bundle; repeated migration/allocation gives no extra XP.
  Reject NaN, negative/overflow XP, invalid IDs/caps/progress, inconsistent paid
  mentorship/completions and mismatched compatibility snapshot pending IDs.

  ```ts
  expect(migrateSwordState(endedActive, null)).toBe(endedActive);
  expect(loadGame(corruptStorage).error).not.toBeNull();
  expect(corruptStorage.getItem(SAVE_KEY)).toBe(originalCorruptRaw);
  ```
- [ ] Run `npm.cmd test -- --maxWorkers=2 src/game/expanded/sword-migration.test.ts
  src/game/storage.test.ts src/game/storage-codec.test.ts` (one shell command,
  joining this displayed wrap with a space); inspect expected new failures.
- [ ] Implement active-only nonrandom migration. Capture `getExpandedDecision`
  against the old-shaped record **before** adding the ledger; keep the old
  generator branch for absent ledgers so load-time `isLife` still accepts saved
  pending decisions. Store its plain-data Decision once, with bounded validated
  choice fields and known event/choice IDs. Return that snapshot only while it
  matches current pending; discard it when that decision resolves, never when
  an event with the same ID recurs later. No source data is overwritten on error.
- [ ] Initialize course credits from saved course units and existing talent
  multiplier without awarding XP. Honor captured generic sword instruction once
  using its original cap-increase rule, including above Advanced; preserve other
  captured actions' old stakes. Withhold new style options until allocation and a
  newly opened event. Ended records with absent ledger remain absent, including
  ended active copies that existing other migrations currently visit.
- [ ] Run the focused command again plus `src/game/expanded/validation.test.ts`; inspect
  invalid-data recovery, codec round-trip and deep equality for old snapshots.
- [ ] Commit task-owned files: `feat: migrate sword progress without rewriting saved choices`.

## Task 3: Learning, course entitlement, careers and challenge consumers

**Files:** modify `src/game/expanded/sword-state.ts`, `src/game/expanded/engine.ts`, `src/game/expanded/training.ts`,
`src/game/expanded/careers.ts`, `src/game/expanded/politics.ts`, `src/game/expanded/genetics.ts`;
create `src/game/expanded/sword-learning.test.ts`; extend existing talent-learning,
training, careers and politics tests. Use Task 1 helpers for all sword consumers.

**Interfaces:** consumes `grantSwordXp`, `swordMeets`, `selectedSwordTrack`,
`syncSwordCompatibility`; adds `creditSwordCourse(l: ExpandedLife,
role: OrdinaryRole, cumulativeTarget: number): void` in `sword-state.ts`.
Existing public career/challenge signatures stay unchanged.

- [ ] Write failing cases `credits_only_selected_style`, `stacks_talent_once`,
  `cannot_farm_course_milestones_by_switching`, `qualified_job_survives_switch`,
  and `challenge_uses_selected_style`. Assert annual 9 -> 11.25 with sword talent,
  factor stacking 9 * 1.25 * 1.15, choice 12 -> 15, job 5 -> 6.25; other tracks
  and magic learning unchanged. A 30-XP six-unit course at 2/4/6 units has
  cumulative targets 10/20/30: switching each year yields 10 to each selected
  track, total 30, not 60; repeat-year/reload/completed calls give zero extra.
  Test pre-migration partial/completed courses and boosted target 37.5 too.

  ```ts
  expect(talentedAnnual.expansion.swords?.tracks["sword-god"].xp).toBe(11.25);
  expect(splitCourse.expansion.swords?.courseCredit.swordsman).toBe(30);
  expect(titleEligible(switchedNovice, 7)).toBe(false);
  ```
- [ ] Run `npm.cmd test -- --maxWorkers=2 src/game/expanded/sword-learning.test.ts`;
  record the meaningful failures before replacing the existing generic grants.
- [ ] Route focus, choices, job gains and course milestones through the selected
  style or unassigned old bundle. Credit `min(newTarget - priorCredit,
  max(0, newTarget - selectedXp))`, clamped nonnegative, then consume the
  cumulative entitlement even when the selected style already exceeds its floor.
  Preserve normal course tuition, attendance, completion and guaranteed manual
  placement: its existing certificate route must still work if practice was
  split across styles. Ordinary direct job applications still query one qualified
  learned style; do not revoke completed-course placement or earned occupation.
- [ ] Replace sword-based career/title/factor-observation consumers deliberately.
  Title eligibility uses paired magic XP/cap **or** paired selected sword XP/cap;
  do not borrow an instruction ceiling from another track. Retain magic's
  existing valid path, reputation/age/feats requirements and the title chance
  formula with selected sword XP in place of generic sword XP. General sword
  stats and observed talent/factor signs use max single-style XP while preserving
  saved stat floors; selecting a novice must not erase already observed signs.
- [ ] Run new tests plus existing talent-learning/training/careers/politics tests.
  Update direct aggregate-only **test fixtures** to initialize authoritative
  tracks when testing new lives; keep explicit old-save fixtures old-shaped.
  Search `swordXp|swordCap|training.school` across `src/` and classify every
  remaining access as frozen legacy, compatibility, presentation or migrated
  domain query; no active expanded grant may write only the mirror.
- [ ] Commit task-owned files: `feat: route sword learning and requirements through styles`.

## Task 4: Mentor quotes, payment and promotion transactions

**Files:** create `src/game/expanded/sword-mentors.ts` and
`src/game/expanded/sword-mentors.test.ts`; extend sword validation as needed.

**Interfaces:** consumes Task 1 state; produces
`quoteSwordMentor(l: ExpandedLife): SwordMentorQuote | null`, where quote contains
`style`, `target`, `region`, `fee`, `requirements: Requirement[]`;
`enrollSwordMentor(l: ExpandedLife, quote: SwordMentorQuote): boolean`,
`creditSwordMentorship(l: ExpandedLife, elapsed: number): void`,
`swordMentorPauseReason(l: ExpandedLife): string | null`,
`abandonSwordMentorship(l: ExpandedLife): boolean`, and
`completeSwordTrial(l: ExpandedLife): boolean`.

- [ ] Add failing parameterized quotes for three regions and fees 16/32/64/128.
  Assert age 7, missing selected style, wrong region, insufficient XP/prior rank,
  aura impairment, existing mentorship and insufficient funds block enrollment.
  A valid Saint enrollment deducts exactly 16 once; a stale/reused quote is a
  no-op; canceling a quote costs zero; no reserve/loan/family-fund transfer occurs.
  Test matching-region/sword-focus progress +0.25, pause for another style,
  rest/travel/university/unpaused career course, and retained progress/fee on
  resumption. Abandon forfeits time/fee but retains all XP and ranks.

  ```ts
  expect(quoteSwordMentor(localAdvanced)?.fee).toBe(16);
  expect(enrollSwordMentor(localAdvanced, saintQuote)).toBe(true);
  expect(localAdvanced.coins).toBe(coinsBefore - 16);
  expect(enrollSwordMentor(localAdvanced, saintQuote)).toBe(false);
  ```
- [ ] Run `npm.cmd test -- --maxWorkers=2 src/game/expanded/sword-mentors.test.ts`
  and inspect the new failures.
- [ ] Implement registry and transactions using fresh quote comparison and
  mutation only after all checks pass. Quote the next **locked ceiling**, rather
  than charging again for a grandfathered cap not yet reached through XP. Check
  the actual prior rank and next target XP before enrollment; cap 6 has no quote.
  Enrollment does not silently change focus;
  the quote/status explains sword focus. Only one enrollment, even while paused.
  Positive finite eligible elapsed time accumulates to 1; all other time is zero.
  At trial completion recheck style/location/XP/prior rank/readiness; increase
  that track's ceiling by exactly one, save completion world year, clear enrollment
  and sync compatibility. No RNG, injury, death, repeat payment or skipped ranks.
- [ ] Run focused tests, including banked XP 1800 promoting cap 2 -> 3 only,
  repeated trial no-op, cap 6 with no further quote, and aura-impaired cap 2
  blocked even with enough XP/silver. Validate saved paid/paused/ready states.
- [ ] Commit task-owned files: `feat: add paid sword mentors and guaranteed promotion rules`.

## Task 5: Actual training time, durable manual trials and activity routing

**Files:** create `src/game/expanded/sword-events.ts` and
`src/game/expanded/sword-training-events.test.ts`; modify `src/game/expanded/engine.ts`,
`src/game/expanded/events.ts`, `src/game/expanded/activities.ts`, `src/game/expanded/balance.ts`,
`src/game/simulation.ts` only if manual gating needs it; extend activities tests.

**Interfaces:** consumes Tasks 1/2/4; produces
`swordDecision(l: ExpandedLife): Decision | null`,
`applySwordChoice(l: ExpandedLife, id: string): boolean`, and
`queueReadySwordTrial(l: ExpandedLife): void`. Register known events
`expanded.sword-mentor`, `expanded.sword-trial`, `expanded.sword-abandon` and
activity `sword-mentor`. New first-selection actions use
`expanded.practice.sword-god|water-god|north-god` (initial selection only).

- [ ] Add failing `credits_elapsed_time_not_birthdays` with enrollment at age
  30/progress .9: the next .1-year tick gives .1 training, not 1. Test a .25 tick
  at progress .9 credits only the consumed .1, since current annual advancement
  discards overshoot. Test explicit `year` from progress .75 credits .25, and
  `decision` credits each actually consumed annual segment until a decision/death.
  Add `trial_survives_full_queue_defer_and_reload` with a full 16-entry queue:
  ready state remains, adds at most one trial after capacity opens, preserves
  history order, and a deferred trial waits for manual reopening.

  ```ts
  expect(advanceExpanded(birthdayEdge, "tick", 0.1)
    .expansion.swords?.mentorship?.progress).toBeCloseTo(0.1);
  expect(canAutoChoose(readyTrial)).toBe(false);
  ```
- [ ] Run `npm.cmd test -- --maxWorkers=2 src/game/expanded/sword-training-events.test.ts
  src/game/expanded/activities.test.ts` as one command; observe failures.
- [ ] In `advanceExpanded`, account for each actual consumed time segment using
  its pre-segment eligibility, then perform existing year work and enqueue a
  ready trial only after existing due decisions. No credit for pending/dead/
  invalid ticks or suspended playback; death clears transient trial work.
  Queue only when selected style/location match, not deferred, and no duplicate
  pending/queued trial; preserve progress if capacity is full. Midyear readiness
  may enter the next normal tick decision boundary without advancing extra time.
- [ ] Route mentorship decisions through the existing choice transaction. The
  enrollment choice displays cost but skips the generic pre-deduction because
  `enrollSwordMentor` owns its atomic charge; all unrelated cost paths remain.
  Deferral sets `deferred=true`; seeking a ready local mentor opens the trial
  without payment. Abandon uses a separate confirm/leave decision explaining
  forfeiture. Redirect **new** generic sword instruction to the mentor menu,
  preserving Task 2's saved-offer exception and ordinary magic instruction.
- [ ] Integrate explicit first selection in safe practice or before confirming
  sword-bearing course enrollment; no initial selection in a dangerous pending
  event. The safe practice choice initializes the style inside its validated
  choice transaction only when no style/bundle has been selected; it does not
  call or weaken the facade's pending-event switching guard. Make initial
  selection, teacher commitments and all trials manual in
  Watch mode. Test stale action IDs, direct calls while pending and reload with
  a captured old instruction: its original cap increase happens once, while a
  newly opened instruction cannot bypass the training year.
- [ ] Run focused tests plus existing expanded engine/integration/manual-mode
  tests; verify both public immutable transitions and in-place helper guards.
- [ ] Commit task-owned files: `feat: schedule sword mentorship and manual chronicle trials`.

## Task 6: Selected-style event approaches and accurate effects

**Files:** extend `src/game/expanded/sword-events.ts`; create
`src/game/expanded/sword-approaches.test.ts`; modify `src/game/expanded/events.ts`,
`src/i18n/expanded-choice-effects.ts`, `src/i18n/choice-changes.ts`;
extend `src/i18n/choice-effects.test.ts` and `src/components/ChoiceOutcome.test.ts`.

**Interfaces:** adds `swordApproach(l: ExpandedLife, event: "service" | "assignment"):
SwordApproach | null` and `applySwordApproach(l: ExpandedLife, event:
"service" | "assignment", style: SwordStyle): string | null` in `sword-events.ts`.
`SwordApproach` exposes style, risk, reward, reputation, serviceCredit, obligation
reduction and trust; keep read-only previews independent of mutation and RNG.

- [ ] Write failing seeded tests for each new choice
  `expanded.service.<style>` / `expanded.assignment.<style>`, gated by selected
  rank >=2 and existing service eligibility. Pin Sword God risk .10/.05 and
  reward 40/30; Water God .05/.025 and 30/20; North God risk 0 and reward 10/6.
  Full success gives reputation +8 and normal service/feat credit, with assignment
  obligation -3/trust +10. Scouting gives none of these except assignment
  obligation -1; service exposure records support. Test risk boundary draws,
  fatal outcomes with no success reward, safe scouting with unchanged RNG, and
  selected novice plus an unselected master providing no special option.

  ```ts
  expect(swordApproach(advancedWater, "service"))
    .toMatchObject({ risk: 0.05, reward: 30 });
  expect(scouted.rng).toBe(beforeScouting.rng);
  ```
- [ ] Run `npm.cmd test -- --maxWorkers=2 src/game/expanded/sword-approaches.test.ts
  src/i18n/choice-effects.test.ts` as one command and observe failures.
- [ ] Add actions without renaming baseline accept/later IDs. Keep reward effects
  inside the action after the single risky draw, rather than generic pre-awarded
  `coins`; clamp obligations/stats/wealth under existing rules. Preserve service
  context cleanup and historical exposure. No rank-scaled/global hazard bonus;
  baseline probabilities, safe decline and other world decisions remain.
- [ ] Implement EN/TH Effects from the same approach descriptor; report actual
  per-style XP/rank/mentor changes rather than comparing only compatibility
  mirrors (which may not change when a weaker style improves). Suppress misleading
  generic sword-loss messages caused by mirror reordering. Previews disclose
  money/risk/obligations; results reflect actual death or success, not promises.
- [ ] Run new and existing effects/outcome/history tests; assert previews and
  renders change neither save objects nor RNG, and captured old pending decisions
  retain their original options/risk before allocation and resolution.
- [ ] Commit task-owned files: `feat: give sword styles distinct story approaches`.

## Task 7: Bilingual controls, status and factual completed records

**Files:** create `src/components/SwordProgress.tsx`,
`src/components/SwordProgress.test.tsx`, `src/i18n/sword.ts`; modify `src/App.tsx`,
`src/components/LifeView.tsx`, `src/components/OptionalActivities.tsx`,
`src/components/Archive.tsx`, `src/game/expanded/summary.ts`, `src/i18n/expanded.ts`,
`src/i18n/messages.ts`, `src/i18n/expanded-story-th.ts`, `src/styles.css` as needed;
extend `src/App.test.tsx`, summary and catalogue tests.

**Interfaces:** `SwordProgress({life, onSelect}: {life: ExpandedLife;
onSelect: (style: SwordStyle) => void})`; `swordStyleName(style: SwordStyle,
language: Language): string` and `swordMentorText(l: ExpandedLife,
language: Language): string[]` in `src/i18n/sword.ts`. Existing LifeView and
CharacterView receive `onSwordStyle` callbacks from App, persisted with its
existing active-life update path. OptionalActivities uses Task 5's activity ID.

- [ ] Add failing RTL cases for EN/TH initial allocation, all three ranks and
  selected state, disabled selector during pending/queued events on both views,
  paid/paused/ready mentor states, and keyboard trial outcome focus. Add App
  save/reload and failed-save recovery tests using isolated jsdom storage.
  Assert Watch never selects/allocates/enrolls/promotes, and there is no new
  Continue-to-next-decision shortcut. Add summary cases: three actual ranks and
  completion years for new lives, no inferred fields or mutated old snapshots.

  ```tsx
  expect(screen.getByRole("combobox", { name: "Practice style" })).toBeDisabled();
  expect(screen.queryByRole("button", { name: /Continue to next decision/i }))
    .not.toBeInTheDocument();
  ```
- [ ] Run `npm.cmd test -- --maxWorkers=2 src/components/SwordProgress.test.tsx
  src/App.test.tsx src/game/expanded/summary.test.ts` as one command; inspect RED.
- [ ] Implement using current paper/ink typography, native controls and compact
  disclosures. Use a native select labeled **Practice style** (Thai:
  **รูปแบบวิชาดาบที่ฝึก**) for existing selections. For unassigned legacy progress,
  explain the one-time transfer;
  between-event initial selection/allocation goes through the facade, not a
  random choice. First sword-focus interaction requests selection before applying
  focus; an existing choice is never overwritten. Keep callbacks immutable and
  persistence immediate. Explain lock/paused reasons and paid fee explicitly.
- [ ] Add original bilingual scenes for three schools and four promotion ranks,
  shared labels/requirements and dynamic event text/risk wording. Extend factual
  new summaries without reconstructing facts in old ended lives. Update archive
  rank rendering to use new tracks when present and old display when absent;
  never expose only the strongest mirror as all-style progress.
- [ ] Run focused RTL/catalogue/summary tests and the appropriate React quality
  review after editing multiple TSX components. Check existing mobile reading
  order, accessible names/focus, reduced-motion rules and no new visual theme.
- [ ] Commit task-owned files: `feat: present sword styles and mentorship in English and Thai`.

## Task 8: Integrated verification, documentation and same-PR delivery

**Files:** create `src/game/expanded/sword-integration.test.ts`; extend relevant existing
tests only where behavior changed; update `PRODUCT.md`, `README.md`, `DESIGN.md`,
`.impeccable/design.json`, root `CONTINUE.md`, this plan's ledger, and approved
spec status only as supported by actual completion.

**Interfaces:** consumes Tasks 1-7 through public `createLife`, `beginLife`,
`selectSwordStyle`, `choose`, `advance`, `openActivity`, `loadGame`, `saveGame`;
test whole transactions, not private helper implementations.

- [ ] Add an end-to-end seeded regression fixture: old pending instruction
  -> resolve preserved offer -> allocate one style -> switch/train a second ->
  apply for a job through retained strongest skill -> local paid mentorship ->
  interrupted/restored eligible year -> deferred/reloaded manual trial -> one
  promotion -> real style approach outcome -> immutable completed archive.
  Explicitly cover one surviving ordinary character plus an aura-impaired one,
  the unchanged valid magic challenge path, and unchanged frozen legacy fixture.
  Record its actual first result. If earlier tasks already make it pass, report
  that; if it exposes missing integration, observe RED before fixing that gap.

  ```ts
  expect(loadGame(roundTripStorage).data.archive[0]).toEqual(completedLife);
  expect(completedLife.expansion.swords?.completed["sword-god"][3])
    .toBe(trialCompletionWorldYear);
  ```
- [ ] Resolve integration failures with focused reruns. From `six-faced-life/`,
  run **`npm.cmd test -- --maxWorkers=2`** and **`npm run build`**; require exit 0
  and inspect counts/build output. Do not invent lint/typecheck/e2e scripts or
  claim tests before running them. Broaden again only after a new change/failure.
- [ ] Reuse an isolated preview or start `npm run dev -- --port 5174` as needed.
  Inspect desktop and 360px mobile, keyboard, EN/TH, console/overflow, pause/Play/
  Watch, pending locks, persisted allocation and switching, money/quoted Effects,
  mentoring while paid work continues, pause on focus/travel, a full trial cycle
  and reload. Verify a ready trial does not require a continuation shortcut.
  Do not touch 5173 storage or change app sources merely to create QA fixtures.
- [ ] Update documentation with implemented behavior and actual evidence; record
  any failing/unavailable check and exact next command in CONTINUE/this ledger.
  Obtain the execution method's whole-branch review and fix required findings;
  do not silently treat a review's untested area as verification.
- [ ] Review complete diff/new files and `git diff --check`; commit task files,
  push the explicit existing branch, fetch origin/prune and report freshness.
  Update **PR #18**, base **main**; keep draft if any required check is blocked
  or incomplete. Only mark ready when required checks pass. Attach the PR to
  this chat, report limitations and user-manual merge; do not deploy or merge.

## Progress ledger and execution handoff

- **Execution complete, 2026-10-29:** Tasks 1–8 implemented inline on the existing
  branch/PR. The original per-step checkboxes retain the planning checklist;
  the evidence below is the execution record, superseding the historical handoff.
- **Tasks 3/4:** Learning RED→GREEN; 48/48 learning/talent/training/career/politics
  tests passed. Mentor missing-module RED→GREEN, 7/7 quote/payment/pause/promotion
  tests passed. Commits 671d51c and 79479d9 follow ledger/migration commits.
- **Tasks 5/6:** Real consumed segments, durable queued/deferred trials, manual
  first selection and course quote selection, old instruction exception and new
  mentorship routing implemented. Style approach RED→GREEN; original accept/
  decline IDs retained. Safe scouting consumes no RNG; full service preserves
  existing historical exposure and feats. Remaining sword mirror writes are
  compatibility/absent-ledger paths; active learning uses the selected ledger.
- **Task 7:** EN/TH native selector, all-style progress, paid/paused/ready status,
  original trial scenes and actual completed-year summaries. RTL tests cover
  locks, bilingual labels, immediate save/reload and failed-save retry. Existing
  skill panel mismatch and missing summaries were reproduced RED→GREEN.
- **Task 8 verification:** `npm.cmd test -- --maxWorkers=2` passed **345/345 in
  53 files**, 76.10s. `npm.cmd run build` passed (existing >500kB advisory).
  Last Thai instruction copy adjustment additionally passed 6/6 focused tests
  and a fresh production build. Full logs are ignored under `.sites-workflow/`.
  The public old-offer→allocation→mentorship→pause/reload→deferred trial→promotion
  →style assignment→immutable archive integration passed on its first run;
  the low old-cap regression then failed before its fix and passed afterward.
- **Independent final review:** three Important findings, no Critical. Each
  reproduced RED→GREEN: pending-offer validation after public study change;
  weaker selected-style sword-stat preview; historical cross-path title offers.
  The offer test also reproduces/resolves its original mage appointment after
  changing study. Regraded impossible saved enrollment as required save-validation
  work, reproduced RED→GREEN, and rejected missing selection/target XP. No deferred
  review findings remain. React quality pass checked hooks, native labels,
  immutable event updates, stable keys and read-only rendering; no dependencies.
- **Ruling (refines snapshot ruling below):** keep a bounded captured
  `compatibilityStudy` alongside the old offer, validate against that original
  context and use it when resolving its career appointment. Preserve old title
  eligibility/chance only for absent ledgers and the captured offer. New offers
  use paired selected-style paths. This preserves legitimate pending-study changes
  without weakening snapshot validation; cost if wrong: rejecting or changing an
  old offer, covered by the new public-flow regressions.
- **Browser QA:** isolated 5174 only; 1280 desktop and 360 mobile, native keyboard,
  EN switching persisted on reload; selector locked during mentor quote/trial;
  enrollment charged 16 once; farmer remained employed; consumed year placed an
  ordinary practice event before its ready trial; Watch/manual trial survives
  reload; Enter completes trial and focuses `outcome-heading`. No horizontal
  overflow in either layout. Thai ready trial and its original scene inspected.
  Earlier disposable fixture had an invalid peak-wealth value and was corrected;
  Vite briefly cached an empty module during formatter writes, fixed by restarting
  isolated server. Neither was an application defect. Player 5173 untouched.
- **Delivery:** update existing PR #18 targeting main; user merges manually.
  No publishing, auto-merge, branch deletion, or upstream integration.

### Historical planning and early execution notes

- **Execution 2026-10-29:** User requested implementation of PR #18; proceeding
  inline on its clean existing branch. Fetch succeeded; zero behind origin/main.
  Usage: 79% five-hour / 58% weekly remaining. Existing task branch is the
  authorized workspace; no worktree or new execution-choice approval needed.
- **Pre-flight:** Tasks 1→2 share ledger/selection/snapshot types; 1/2→3 share
  grants/course entitlement; 1→4 shares cap/rank; 2/4→5 shares saved offers,
  mentorship and queue; 3/5→6 shares selected eligibility; 1–6→7/8 shares facade,
  localization and persistence. Contracts agree; review focus retained.
- **Task 1 complete:** 0b6c8db. Missing-module RED, then 8/8 ledger, origins
  (10,000 seeds), frozen legacy (200 lives) tests passed. Test startup needs
  sandbox escalation for esbuild spawn EPERM; escalation succeeded.
- **Task 2:** Migration/strict snapshot validation implemented; 28/28 migration,
  storage, codec and validation tests pass after missing-module RED. Captured
  sword-instruction transaction is integrated in Task 5 with choice routing.
- **Ruling:** Use canonical old decision comparison to validate saved snapshots
  rather than maintaining a second choice schema — rejects injected effects and
  preserves complete old offers; cost if wrong: valid old offers could be refused
  if the absent-ledger generator changes, which must remain frozen.

- **2026-10-29:** User approved the design, including its proposed fees,
  teacher regions and event balance. This plan is a documentation deliverable;
  all implementation checkboxes above are deliberately unchecked.
- **Setup:** existing branch `codex/swordsmanship-styles`, draft PR #18 targeting
  main; resumed fetch succeeded, `origin/main bdc32a0` is contained. Continue
  here, with no fresh task branch, automatic merge/rebase or worktree bypass.
- **Plan self-review:** checked design coverage, module/interface names, task
  dependencies and five Review Focus cases. Existing course placement guarantees
  and pending-offer grandfathering are retained, and fractional-time accounting
  uses consumed simulation segments. No implementation checks are claimed.
- **Usage at planning resume:** 87% five-hour and 60% weekly remaining; resets
  2026-10-29 23:39 and 2026-11-04 13:44 Asia/Bangkok. Recheck before implementation.
- **Next:** user reviews this concrete plan and chooses execution method under
  the writing-plans workflow. Recommend **native execution** because tasks share
  the same ledger/events/storage interfaces; one implementer can carry that
  context through the eight tasks, followed by independent whole-branch review.
  This recommendation is not a user-confirmed execution choice. No gameplay
  implementation, dependency installation, browser save operation or deployment
  is authorized merely by this plan's delivery.

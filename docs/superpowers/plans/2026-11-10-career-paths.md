# Six Career Paths Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace twelve competing job choices with six distinct career journeys,
including professional/academic magic branches and F → D → B → S adventuring.

**Architecture:** Add a versioned career-path ledger alongside the existing
expanded occupation records. Keep occupation identifiers for courses, finance,
history and artwork, but derive new titles, progression and pay from a small node
catalogue. Integrate work through the existing annual engine and manual decisions;
preserve old pending decisions by delaying activation until their queue clears.

**Tech Stack:** React 19, TypeScript, Vite, plain CSS, Vitest/RTL; no new dependency.

**Spec:** [Six career paths design](../specs/2026-11-10-career-paths-design.md).

**Status:** Implemented for human review2026-11-11; see the execution ledger below.

**Historical planning status:** Requested implementation plan, 2026-11-10.
The request to create this plan authorizes planning from the design, not application
implementation. All numeric values and migration choices below are proposed
implementation defaults for review. Continue documentation delivery in
`codex/career-paths-design`, [PR #23](https://github.com/ny147/1-in-mushoku-tensei/pull/23),
base main. The user merges manually.

## Global Constraints

- "Adventuring has only F, D, B, and S ranks."
- "Retain one paid primary role."
- "Legacy lives retain original rules and seeded futures."
- "Completed lives and archives retain their actual historical facts and wording."
- "Rendering/listing careers consumes no RNG."
- "Keep ordinary beginner access reliable, working age fifteen, existing paid full-time/part-time training, and optional interest-free education finance."
- Preserve university readiness, scholarships, probation and degree requirements;
  Knight/Professor appointment conditions and yearly vacancies remain real.
- Preserve sword disciplines, instruction caps, talent learning, skills, money,
  prior work, course reserves, debt, pending offers and immediate persistence.
- New consequential career decisions stay manual in Watch mode; hidden tabs and
  pending decisions pause playback. Opening a menu changes no work/reward state.
- Maintain warm-paper/forest-ink UI, EN/TH, explicit requirements, keyboard focus,
  reduced motion and mobile reading order. No new artwork or visual redesign.
- Node.js 22.12+ or supported Node 24; use existing npm lockfile. App commands run
  in `six-faced-life/`. No tactical combat, daily simulation, parties, business
  simulator, new backend/services, publishing, or unsolicited dependency upgrades.
- QA uses isolated saves/port 5174; preserve the player's port-5173 browser save.

## Review Focus

1. Reload during an old queued appointment/course offer: original terms and funding
   survive; no conversion until the queue is empty (Task 2).
2. Work year ending with course completion, graduation, dismissal or death: pay
   and career credit follow actual attendance once, never a newly unlocked role
   retroactively (Tasks 3 and 4).
3. Switching branches or reopening a work decision repeatedly in one year: no
   duplicate milestone, request credit, cash reward or negative balance (Task 4).
4. Existing Teacher without a recorded discipline: no fabricated specialization
   or academic achievement; earned salary remains intact (Tasks 2 and 6).
5. Valid-looking malformed/future-version ledger, forged node/action or inherited
   prestige: reject corrupt data visibly; do not manufacture qualifications or
   bypass vacancies on a new appointment (Tasks 2 and 5).

## Before execution

- [ ] Obtain review of this plan and execution method. Native execution is
  recommended: all eight tasks share the same ledger and compatibility boundary;
  use an independent whole-branch review after integration.
- [ ] Recheck usage windows; read root `AGENTS.md`, `CONTINUE.md`, spec and this
  ledger. Inspect `git status --short --branch`, branch and task PR state.
- [ ] Fetch origin; stop on failure. Continue the existing task branch/PR if open.
  If documentation was merged, require clean status and create
  `codex/career-paths` from freshly fetched `origin/main`, then a new implementation
  PR to main. Do not integrate upstream automatically or use a worktree to bypass
  the repository's clean-start requirement.
- [ ] Read relevant files below and run baseline `npm test` and `npm run build`.
  Install with `npm ci` only if needed. Record actual results in the progress ledger.
- [ ] Keep the implementation PR draft until all acceptance checks pass. Stage
  only task-owned files, commit each deliverable, and update the same PR.

## Files and responsibilities

All paths below are relative to `six-faced-life/` unless prefixed `docs/` or root.

| File | Responsibility |
| --- | --- |
| `src/game/expanded/career-catalogue.ts` (new) | Six paths, branch/node IDs, title keys, pay and gates |
| `src/game/expanded/career-state.ts` (new) | Ledger types and empty-state factory |
| `src/game/expanded/career-paths.ts` (new) | Read-only requirements, transitions, pay, retained unlocks |
| `src/game/expanded/career-migration.ts` (new) | Safe-point activation and inherited recognition |
| `src/game/expanded/career-validation.ts` (new) | Optional/strict versioned ledger validation |
| `src/game/expanded/career-work.ts` (new) | Annual credit, bounded manual projects/contracts |
| `src/game/expanded/career-events.ts` (new) | Six-path menus, detail/work/promotion decisions |
| `src/i18n/careers.ts` (new) | Original EN/TH live titles, requirements and narrative |
| `src/components/CareerPaths.tsx` (new) | Active path, next milestone, branch disclosures |
| `src/game/expanded/types.ts`, `origins.ts`, `validation.ts` | Optional ledger and new-life initialization |
| `src/game/expanded/careers.ts`, `engine.ts`, `economy.ts` | Delegate new careers; preserve absent-ledger compatibility |
| `src/game/expanded/events.ts`, `activities.ts`, `balance.ts` | Dispatch, manual controls, stable event allowlists |
| `src/game/expanded/training.ts`, `training-events.ts`, `education-access-state.ts` | Original courses/finance; group browsing, teaching specialization and placement sync |
| `src/game/storage.ts`, `simulation.ts` | Validation/activation, current title, save restoration |
| `src/components/ExpandedDetails.tsx`, `EducationProgress.tsx`, `OptionalActivities.tsx`, `src/styles.css` | Integrate path reading, activity labels and training disclosures |
| `src/i18n/current-requirements.ts`, `expanded-choice-effects.ts`, `choice-changes.ts` | Visible costs, effects and actual outcomes |
| `src/game/expanded/summary.ts`, `src/components/life-scene/model.ts` | Factual new records and existing outfit mappings |
| `src/game/expanded/career-*.test.ts`, component/i18n tests | Focused rules, migration, flow and presentation coverage |
| `src/game/storage.test.ts`, `src/App.test.tsx` | Reload/recovery, playback and persistence integration |

Do not rename existing occupations, course purposes or historical translation keys.
Keep rules in `src/game/`; views format read-only data. Reuse existing `Requirement`,
`Choice`, `Decision`, `Language`, `Occupation` and seeded-random helpers.

## Domain contract and proposed balance

### Ledger and compatibility

Add `ExpandedState.careerPaths?: CareerPathState`, version 1. Export the types from
`career-state.ts`; the catalogue owns the literal ID unions. Persist:

- `active: CareerNodeId | null` (null for child/student/retired),
  `earned: Partial<Record<CareerNodeId, { year: number | null; source: 'earned' | 'inherited' }>>`.
- `work: Record<CareerBranchId, { years: number; units: number; milestones: number }>`;
  `requests: number`; `lastWorkYear: number`; `lastProjectYear: number`.
- `payFloor: Partial<Record<Occupation, number>>`, populated only by migration
  from existing base pay plus earned increments; never a global salary floor.
- `selection: CareerPathId | null` for the saved path-detail decision;
  `teaching: 'magic' | 'sword' | null` for newly chosen teaching work. A null value
  never asserts what an old teacher taught.
- `teacherCourse: { kind:'magic'|'sword'; school:MagicSchool|null } | null` freezes
  a new Teacher course's discipline (magic requires a school; sword requires null).
  Existing unspecified courses keep null and their original training rules.
- `recent: { year: number; node: CareerNodeId; code: string; units: number }[]`,
  bounded to 64 factual work/promotion entries; never used as the only gate counter.

Path IDs: `livelihood`, `trade`, `martial`, `adventure`, `magic`, `healing`.
Branch IDs: `everyday`, `farming`, `trade`, `sword`, `guard`, `knight`, `adventure`,
`mage`, `academic`, `instructor`, `healer`, `cleric`.
`teacher-unspecified` is an inherited compatibility node, not a seventh path.
Its path is null and bookkeeping branch is `instructor`; this assigns no historical
teaching discipline. `emptyCareerPaths(year)` initializes year guards to year−1,
all counters0 and active/selection/course/teaching null. Migration overrides both
year guards to the current year: it gives no retroactive annual credit or second
project in the activation year, whose earlier work is not fully recorded.

Keep original `career.records`, timeline and `life.career` mirror. Existing
`applyCareerYear` still updates historical work XP/years/reputation and existing
skill effects once. Its old automatic eligibility is superseded for ledger lives;
old `promote` remains only for absent-ledger compatibility. New titles need no
new `Occupation` members. Apprentices/Trainees are course states with the existing
24-silver stipend, not extra paid occupations.

### Nodes and salary

Catalogue IDs below are exact. All pay is annual silver before costs. Arrows within
a row define predecessor nodes. Every branch retains its furthest earned node;
re-entry does not erase it. `laborer` permits a voluntary transition to `farmhand`
but never automatic farming. Qualified direct applicants and completed courses can
enter the first ordinary node of any branch without following another branch.

| Branch | Node IDs: title (underlying occupation, pay) |
| --- | --- |
| everyday | `laborer`: Laborer (`laborer`, 18) |
| farming | `farmhand`: Farmhand (`farmer`, 20) → `farmer`: Farmer (`farmer`, 28) → `farm-steward`: Farm Steward (`farmer`, 52) |
| trade | `trade-assistant`: Trade Assistant (`merchant`, 24) → `merchant`: Merchant (`merchant`, 30) → `established-merchant`: Established Merchant (`merchant`, 48) → `trade-leader`: Trading House Leader (`merchant`, 62) |
| sword | `swordsman`: Swordsman (`swordsman`, 34) → `senior-swordsman`: Senior Swordsman (`swordsman`, 52) |
| guard | `guard`: Guard (`guard`, 28) → `guard-captain`: Guard Captain (`guard`, 60) |
| knight | `sworn-service`: Sworn service (`guard`, 36) → `knight`: Knight (`knight`, 45) → `knight-commander`: Knight Commander (`knight`, 77) |
| adventure | `adventure-f` → `adventure-d` → `adventure-b` → `adventure-s`: F/D/B/S Adventurer (`adventurer`, 32/40/50/64) |
| mage | `mage`: Practicing Mage (`mage`, 38) → `senior-mage`: Senior Mage (`mage`, 56) → `master-practitioner`: Master Practitioner (`mage`, 70) |
| academic | `magic-teacher`: Magic Teacher (`teacher`, 28) → `researcher`: Researcher (`teacher`, 46) → `professor`: Professor (`professor`, 60) |
| instructor | `sword-instructor`: Sword Instructor (`teacher`, 28); selectable inside Martial service |
| healer | `healer`: Healer (`healer`, 30) → `senior-healer`: Senior Healer (`healer`, 48) → `clinic-leader`: Clinic Leader (`healer`, 62) |
| cleric | `cleric`: Cleric (`cleric`, 28) → `senior-cleric`: Senior Cleric (`cleric`, 60) |
| inherited only | `teacher-unspecified`: Teacher (`teacher`, 28); retains the old record and selected-role pay floor |

The extra Senior Swordsman node is an author proposal to give independent sword
employment advancement without forcing institutional service. Laborer's proposed
18-silver pay covers basic adult necessities; other first-node pay/fees remain
near the current economy. Do not claim these values are canon or user-approved.

Income for ledger lives: full-time active training overrides wages at 24; university
and minors earn zero annual employment income. Otherwise use
`max(node.pay, payFloor[currentOccupation] ?? 0)` plus existing +6 for work focus.
Course pauses, necessities, dependants and interest-free surplus repayments retain
their current accounting. Never add annual salary as a manual project reward.

### Entry, branching and promotions

- Ordinary entry uses existing `careerRequirements` and starter fees: Merchant 10,
  Adventurer 5; others zero. Qualified applicants do not need an apprenticeship.
  Completed-course funded placement keeps its existing health/funding checks and
  guaranteed entry. A direct guard need not first work as Swordsman.
- Magic Teacher adds selected-school magic XP ≥25 to existing teacher knowledge
  25/reputation 5; Sword Instructor uses one qualified sword style ≥25 instead.
  New Teacher course quotes explicitly save `teaching` selection. Existing quotes
  and placements with no discipline remain `teacher-unspecified` until the player
  chooses a qualified specialization; never infer it from current focus.
  Snapshot `teacherCourse` before a new quote and retain it through pauses,
  withdrawal and switches. It cannot change once Teacher units are positive.
  New magic-teaching courses substitute magic25 for sword25 and train only the
  frozen school; new sword courses retain sword25. Both keep6 units, tuition24,
  knowledge25 and reputation5. Keep old training-record `school:null` for Teacher;
  its new school lives only in `teacherCourse`. An old course with null metadata
  keeps original sword training and unspecified placement. Do not credit a second
  course or overwrite old completed units just to choose a teaching specialization.
- `sworn-service` needs Guard qualification plus service ≥1. First entry to Knight
  preserves sword XP150, service3, patron-or-reputation30, equipment120 and vacancy
  checks. Returning to Knight still checks appointment access. Researcher requires
  a degree and research≥1; Professor preserves degree, selected-school XP500,
  research2, five teacher years, reputation50 and vacancy checks.
- Second nodes normally need branch years≥2, units≥6, milestones≥1; third nodes
  years≥5, units≥16, milestones≥2; fourth nodes years≥10, units≥32, milestones≥3.
  Counters are cumulative within that branch, not reset per node. Two-node branches
  use the third-node gate for their terminal title. Knight Commander additionally
  needs five Knight years, service10, sword XP300 and reputation50.
- Units: one per actually worked eligible year, two with work focus; no annual
  milestone. Health dismissal receives no credit. Full-time training/university
  receive neither branch credit nor routine requests, including completion years.
  Part-time training keeps employment. Ordinary branches need no vacancy for
  promotions; Knight/Professor first appointment keeps seeded yearly availability.
- Core XP/caps remain independent; Master Practitioner also needs XP500 in one
  selected magic school, Clinic Leader healing XP150, Guard Captain single-style
  sword XP150, Senior Cleric trust30. No rank/cap is granted by promotion.
- Adventurer promotions use requests/skill instead of common branch counters:
  D needs12 completed requests and combat XP30; B40/150; S100/500. Combat skill is
  the maximum of one qualified sword style or one selected magic school, never
  the sum across styles/schools. F remains the entry even with large combat XP.
- Every new promotion is manual, shows all gates, and can be deferred indefinitely.
  Re-entry into an earned ordinary node restores it without repeating promotion
  work; a switch to a different underlying occupation still uses appointment
  requirements/fees. No repeat fee for promotion within the same occupation.

### Work and bounded projects

Routine employment pays once through the existing economy, then credits the ledger
once after survival. Each adventuring work year represents4 completed routine
requests (6 with work focus), included in wages. Existing job skill gains remain;
add the currently missing Swordsman sword gain at5 XP/year with talent multiplier.
Instructor work adds knowledge1/year using the academic talent multiplier.

One manual project may be resolved globally per world year. Opening/declining does
not consume it; acceptance does, even on failure. No project while university or
active full-time training; no project if jobless/minor/ended. Eligibility is checked
again on application. Stale/forged actions leave state unchanged. Rewards cannot
finance their own upfront cost; unaffordable options are disabled. Projects give
no extra branch years; successful ones give one milestone (cap1/project).

| Branch | Safe project: cost → result | Risk project: upfront cost; success chance → success / failure |
| --- | --- | --- |
| everyday/farming | Tools/seed:4 → milestone1, units2 | Harvest investment:8;75% → milestone1, units4, silver12 / no reward |
| trade | Local order:4 → milestone1, units2 | Caravan order:10;75% → milestone1, units4, silver16 / no reward |
| sword/guard/knight | Protection duty:0 → milestone1, units2, service1 | Dangerous escort:0;80% → milestone1, units4, silver8, service1 / health−5 |
| mage | Local commission:0 → milestone1, units2 | Complex commission:4;80% → milestone1, units4, silver10 / no reward |
| academic/instructor | Lesson:0 → milestone1, units2, teacher-year credit unchanged | Research:8;80% → milestone1, units4, research1 / no reward |
| healer/cleric | Community care:0 → milestone1, units2; cleric trust1 | Emergency care:4;80% → milestone1, units4, silver8 / no reward |
| adventure | Routine request:0 → milestone1, requests2 | Contract:0; F/D/B/S success90/85/80/75% → milestone1, requests4, silver4/8/12/16 / health−2/4/6/8 |

Academic Research requires degree + aggregate magic XP≥500, matching existing
research readiness; Sword Instructor has only the safe Lesson option. Inherited
unspecified teachers have Lesson only until choosing a specialization. Existing
random `expanded.research.accept` must share `lastProjectYear` and award at most
one research credit; for ledger lives it opens the same8-silver/80% project and
uses the same result handler (including research cap64 and existing research
reputation+10/feat only on success). Old outstanding offers resolve first under
compatibility. If the character is not actively academic, the old random research
activity retains its qualification but still uses the global project budget;
it awards no academic work units/years. Selection/listing never mutates that budget.
No project creates patronage, a degree, faction allegiance, magic instruction or
Seven Great Powers rank. Dangerous options disclose exact chance/cost/health loss;
they use one seeded draw on acceptance, zero on display, decline or safe work.
No new demotion, debt-for-failure, guild withdrawal or party system in this release.

### Migration policy

Validate old saves before activation. Missing ledger is valid; a present invalid
or unknown-version ledger is not silently replaced. Do not migrate ended lives.
If pending or queue is nonempty, keep the ledger absent and dispatch existing
handlers unchanged. Activate only after the old queue drains, or before the next
year/menu at a clean boundary. Keep this separate from existing sword migration:
its compatibility decision has precedence until resolved.

For each role actually evidenced by current employment, a timeline appointment,
or a nonzero work record, store its old pay entitlement and inherited recognition:

| Old role, level0/1/2/3 | Inherited nodes |
| --- | --- |
| laborer | laborer at every level |
| farmer | farmhand / farmer / farmer / farm-steward |
| merchant | trade-assistant / merchant / established-merchant / trade-leader |
| swordsman | swordsman / swordsman / senior-swordsman / senior-swordsman |
| guard | guard / guard / guard-captain / guard-captain |
| knight | knight / knight / knight / knight-commander |
| adventurer | adventure-f / adventure-d / adventure-b / adventure-s |
| mage | mage / mage / senior-mage / master-practitioner |
| teacher | teacher-unspecified at every level |
| professor | professor at every level |
| healer | healer / healer / senior-healer / clinic-leader |
| cleric | cleric / cleric / senior-cleric / senior-cleric |

Also retain predecessor recognition, with `year:null, source:'inherited'`; never
invent appointment dates or completed requests/projects. Actual branch years come
from recorded role years; units/milestones/requests start0. Preserve all raw old
records. Guard years cannot become Knight years; Teacher years stay in the raw
teacher record and are not assigned to a guessed branch. Qualification to keep an
existing role is distinct from future appointment access. Earned inherited rank
may exceed new request counts; next-rank gates remain visible and honest.

## Task 1: Catalogue, ledger and read-only requirements

**Files:** Create `src/game/expanded/career-catalogue.ts`, `career-state.ts`,
`career-paths.ts`, `career-paths.test.ts`; modify `src/game/expanded/types.ts`.

**Interfaces:** Export `CareerPathId`, `CareerBranchId`, `CareerNodeId`,
`CareerNode { id; path: CareerPathId|null; branch; occupation; pay; predecessor: CareerNodeId|null }`,
`CAREER_PATHS`, `CAREER_NODES`, `CareerPathState`,
`emptyCareerPaths(year:number):CareerPathState`,
`careerNode(l:ExpandedLife):CareerNode|null`,
`pathRequirements(l:ExpandedLife,node:CareerNodeId):Requirement[]`,
`pathIncome(l:ExpandedLife):number` (wages only, before work-focus +6).
`CAREER_PATHS` is a readonly array of `{id:CareerPathId;branches:readonly CareerBranchId[]}`;
`CAREER_NODES` is a readonly record keyed by `CareerNodeId`.

- [ ] Write tests for six exact path IDs, every node/role mapping, adventurer
  ranks exactly `['F','D','B','S']`, independent combat-school/style requirements,
  ordinary access and all numeric boundary values above. Assert read-only calls
  preserve `JSON.stringify(l)` and `l.rng`.
  Pin catalogue order with
  `expect(CAREER_PATHS.map(p=>p.id)).toEqual(['livelihood','trade','martial','adventure','magic','healing'])`;
  pin pay with `expect(CAREER_NODES['adventure-s'].pay).toBe(64)`.
- [ ] Run `npm test -- src/game/expanded/career-paths.test.ts`; expect failure
  because the new catalogue/functions do not exist.
- [ ] Implement the interfaces and balance tables above. Catalogue contains
  stable keys, not translated historical prose; `pathRequirements` returns visible
  met/unmet requirements for predecessor, work counters, skill and prestige.
- [ ] Rerun the focused command; expect all tests PASS. Check pay floor belongs
  to current occupation: old Professor pay cannot carry into Laborer.
- [ ] Stage these five files explicitly and commit `feat: define six career path rules`.

## Task 2: Validation and lossless safe-point migration

**Files:** Create `src/game/expanded/career-migration.ts`, `career-validation.ts`,
`career-migration.test.ts`, `career-validation.test.ts`; modify
`src/game/expanded/validation.ts`, `src/game/storage.ts`, `src/game/storage.test.ts`.

**Interfaces:** Consume Task1; export
`validateCareerPaths(value:unknown,l:ExpandedLife):boolean`,
`activateCareerPaths(l:ExpandedLife):ExpandedLife` (immutable, idempotent; returns
the input when ineligible/pending/queued/ended/already activated).

- [ ] Write fixtures for all fifteen occupation states × levels0–3, both
  languages, old courses/reserves/debt/university, old pending+queued offers,
  sword compatibility decisions and missing teacher discipline. Assert unchanged
  RNG/history/raw role records/coins/finance; mapped recognition and exact old pay
  floor; inherited request count0. Activation twice equals activation once.
- [ ] Write storage regressions: missing ledger loads; NaN/negative/fractional
  counters, >64 recent entries, unknown version/node and mismatched active
  node/role fail visibly without overwriting source storage. Ended active lives
  and archives remain byte-equivalent after load/save; use existing memory storage.
- [ ] Run `npm test -- src/game/expanded/career-migration.test.ts src/game/expanded/career-validation.test.ts src/game/storage.test.ts`; expect new assertions FAIL.
- [ ] Implement bounded validation: nonnegative integer counters≤1,000,000;
  world-year guards from birthYear−1 through current year; pay floors finite
  0–1,000,000 for real paid occupations; valid earned keys/source/year, branch
  keys exactly catalogue branches, teacher-course discipline/school consistency,
  active-node recognition and recent node/code bounds. Unknown versions
  fail rather than reset. Child/student/retired must have active null.
- [ ] Call activation after existing education/talent/sword migrations in
  `loadGame`; absent-ledger pending lives continue to use the unmodified old
  decision builder. Preserve allowlisting and old validation behavior. Test old
  decisions before/after save rather than trusting only ledger equality.
  Call ledger validation from `isLife` after base life/expansion checks have
  established shape; do not cast a partial expansion into a complete life inside
  `validateExpansion`. Pin `expect(activateCareerPaths(oldPending)).toBe(oldPending)`
  and `expect(loadGame(corruptLedgerStorage).error).not.toBeNull()`.
- [ ] Rerun the focused command; expect PASS. Commit only listed files:
  `feat: preserve careers through versioned path migration`.

## Task 3: Appointment, promotion and income integration

**Files:** Modify `src/game/expanded/career-paths.ts`, `careers.ts`, `origins.ts`,
`engine.ts`, `economy.ts`, `training.ts`; create `career-integration.test.ts`;
update `careers.test.ts`, `training.test.ts`, `economy.test.ts` as needed.

**Interfaces:** Export `enterCareerNode(l:ExpandedLife,node:CareerNodeId,
funding?:'reserved-training'):boolean`, `promoteCareerNode(l:ExpandedLife,
node:CareerNodeId):boolean`, and `syncCareerNode(l:ExpandedLife):void`.
These mutate a domain-owned clone, return false without partial mutation when
rejected, and preserve raw record history. Keep existing `appoint` and
`careerIncomeExpanded` signatures as compatibility entry points.

- [ ] Write tests: direct entry/course placement to every ordinary branch;
  funded fees consumed once; prestige requirements+vacancy enforced; re-entry
  preserves recognition; manual promotion/defer; retirement, university and
  health dismissal set active null without losing unlocks. Exact income assertions:
  Laborer18; F32; work-focused F38; full-time training24; university0; old level3
  Professor92 preserved while still Professor and not after switching to Laborer.
- [ ] Run `npm test -- src/game/expanded/career-integration.test.ts src/game/expanded/careers.test.ts src/game/expanded/training.test.ts src/game/expanded/economy.test.ts`; expect new assertions FAIL.
- [ ] Initialize ledger for new lives only after complete origins construction.
  Delegate pay/promotions for ledger lives; keep absent-ledger legacy expanded
  paths. Ordinary direct/course entry maps to first node or highest already-earned
  compatible node. New teaching selections qualify explicitly. Route every old
  appointment caller through node sync so training, random work, retirement,
  university and dismissal cannot leave a stale active node.
- [ ] At the end of a choice, activate only after old queue drains; before an
  eligible annual transition activate at its clean boundary. No view mutation.
  Keep appointment costs owned in one place; exclude new career actions from
  `chooseExpanded` generic fee deduction when their domain transition charges it.
- [ ] Rerun focused tests; expect PASS, with no double +6 or extra course-year
  wages. Commit `feat: integrate career nodes with employment and income`.

## Task 4: Distinct yearly work and manual projects

**Files:** Create `src/game/expanded/career-work.ts`, `career-work.test.ts`;
modify `careers.ts`, `engine.ts`, `events.ts`, `education-finance.ts` only if
needed to include project money in existing surplus accounting (no new debt rule).

**Interfaces:** Export `creditCareerWork(l:ExpandedLife,year:number,
attendance:{fullTime:boolean;university:boolean}):void`,
`careerProject(l:ExpandedLife,kind:'safe'|'risk'|'research'):CareerProjectQuote|null`,
`applyCareerProject(l:ExpandedLife,kind:'safe'|'risk'|'research'):boolean`;
`CareerProjectQuote { branch; cost; successChance; success:{units;milestones;requests;silver;service;trust;research}; failureHealth:number }`.
Zero fields are explicit; eligibility and exact table above are the single source.
`research` explicitly selects the academic research project even for a qualified
nonacademic worker; academic `risk` aliases it. Award branch units/milestones only
to a currently academic worker; other branches receive only the research result.

- [ ] Write tests for each project row, threshold gates, safe/no-draw versus risk/
  one-draw outcomes using known seeds. Assert upfront affordability, failure cost,
  health loss, actual skill talent multipliers, research/teacher-year separation,
  routine requests4/6 and annual wages unaffected by request credit.
- [ ] Add Review Focus cases: same-year repeat/reload/switch cannot duplicate
  work/project; full-time course ending this year and university graduation get no
  retroactive work credit; part-time gets one credit; dismissal/death none.
- [ ] Run `npm test -- src/game/expanded/career-work.test.ts src/game/expanded/education-integration.test.ts`; expect new behavior FAIL.
- [ ] Capture attendance before training/education updates. After survival and
  actual employment checks call yearly credit once; retain existing career raw
  XP/service/magic gains once. Persist `lastWorkYear` even when branch changes.
  Respect integer bounded counters; no passive milestone. Record factual work.
- [ ] Implement project table and shared project-year guard, including the old
  random research route on ledger lives. Fatal health loss uses existing ending
  handling; update economy peak and actual outcome feedback through normal choice
  flow. Do not re-run annual accounting when resolving a project.
- [ ] Rerun focused tests; expect PASS. Commit `feat: add distinct career work and contracts`.

## Task 5: Six-path decisions and grouped education

**Files:** Create `src/game/expanded/career-events.ts`, `career-events.test.ts`,
`src/i18n/careers.ts`; modify `events.ts`, `activities.ts`, `balance.ts`,
`training-events.ts`, `training.ts`, `education-access-state.ts`,
`src/components/OptionalActivities.tsx`, `src/game/storage.ts`,
`src/i18n/current-requirements.ts`, `expanded-choice-effects.ts`, `choice-changes.ts`.

**Interfaces:** Export `careerDecision(l:ExpandedLife):Decision|null`,
`applyCareerChoice(l:ExpandedLife,id:string):boolean`,
`careerNodeText(id:CareerNodeId,language:Language):string`,
`careerPathText(id:CareerPathId,language:Language):string`.
Add exact event IDs `expanded.career-path` and `expanded.career-work`; new root
`expanded.career` offers six `path-<id>` choices, `work` when eligible, and `later`.
Selecting saves `selection` and queues `career-path`; detail actions are
`enter-<node>`, `promote-<node>`, `train-<occupation>`, `teach-magic`, `teach-sword`,
`back`, `later`. Work actions are `safe`, `risk`, `later`.

- [ ] Test exactly six root path choices, branch details and missing requirements;
  S is terminal with no invisible ranks; path browsing cannot promote or consume
  RNG. Test all IDs/allowlists through save/reload and `canAutoChoose === false`.
- [ ] Test training from each path reuses old quote/purpose/reserves and makes
  Teacher specialization explicit. Old pending absent-ledger training decisions
  retain old IDs, descriptions, fee and qualification. Reject forged node IDs,
  cross-path selection, stale work, and forged prestige without partial mutation.
  Magic-teaching training raises only its frozen school; switching current study
  cannot redirect course credit, including after withdrawal/reload/resume.
- [ ] Run `npm test -- src/game/expanded/career-events.test.ts src/game/expanded/activities.test.ts src/game/expanded/training-events.test.ts src/game/storage.test.ts`; expect new cases FAIL.
- [ ] Dispatch new career builders before generic expanded copy only for ledger
  lives. Set `requiresManual:true` on all new career/training consequence menus;
  add IDs to event/storage/optional-activity allowlists. Existing `work` event's
  direct Farmer/Laborer choices remain reliable and synchronize nodes.
- [ ] Group new training browsing by selected path, retaining ten existing course
  definitions and fees; do not delete completed hidden courses or reserved funds.
  Extend `quoteTraining`/`applyTrainingYear` using the frozen teacher-course metadata
  above without changing financial purpose keys or relaxing old record validation.
  Add a manual Career work optional activity to open `expanded.career-work`, with
  availability checks matching the domain. All navigating choices save/pause via
  existing App activity callbacks; no separate UI-side mutation API.
- [ ] Author original EN/TH labels/outcomes. Previews show silver, probabilities,
  milestone/request counters, prestige vacancies, and no-change deferral. Format
  actual outcomes from before/after values; avoid speculative success claims.
- [ ] Rerun focused tests; expect PASS. Commit `feat: expose six career journeys and grouped training`.

## Task 6: Career reading, historical summaries and artwork compatibility

**Files:** Create `src/components/CareerPaths.tsx`, `CareerPaths.test.tsx`,
`src/i18n/careers.test.ts`; modify `ExpandedDetails.tsx`, `EducationProgress.tsx`,
`src/styles.css`, `src/game/simulation.ts`, `src/game/expanded/summary.ts`,
`summary.test.ts`, `src/components/life-scene/model.ts`, `model.test.ts`.

**Interfaces:** `CareerPaths({life}:{life:ExpandedLife}):React.JSX.Element`;
consume Tasks1/5 read helpers. Existing `CareerProgress` continues to choose the
expanded/legacy reader. `simulation.careerTitle(life)` uses node text only for
ledger lives; absent-ledger and ended historical readers retain their old route.

- [ ] Write RTL EN/TH assertions for active title/path/pay, next requirements,
  deferral guidance, six branch disclosures, full-time stipend, inherited-rank
  explanation and unspecified teacher label. Native disclosures keep state through
  playback; child/student/retired never show an active employed title.
- [ ] Write summary regressions: new completed lives record actual node/work
  history, inherited recognition has no invented contracts, old completed summary
  objects/prose are identical. Test every new node maps to its underlying outfit
  without changing focus/earned-rank override or adding asset categories.
- [ ] Run `npm test -- src/components/CareerPaths.test.tsx src/components/ExpandedDetails.test.tsx src/i18n/careers.test.ts src/game/expanded/summary.test.ts src/components/life-scene/model.test.ts`; expect new cases FAIL.
- [ ] Replace the flat twelve-role requirements disclosure with six readable
  grouped paths and next-node requirements. Keep debt/course details and old work
  records accessible; use existing chronicle actions for changes. Render inherited
  unknown teaching honestly. Reuse existing CSS/tokens and native details/buttons.
- [ ] Keep old narrative catalogue entries unchanged. Store actual node/title
  facts for new completed summaries; preserve unrecorded facts as unknown. Scene
  outfits continue to use `expansion.career.role`, not display-title parsing.
- [ ] Rerun focused tests; expect PASS. Commit `feat: present career paths and factual work histories`.

## Task 7: End-to-end save and gameplay regression

**Files:** Create `src/game/expanded/career-release.test.ts`; modify
`src/App.test.tsx`, `src/game/storage.test.ts`, `src/game/expanded/release.test.ts`,
`src/game/expanded/talent-learning.test.ts` where new assertions belong.

**Interfaces:** Exercise the production create/begin/advance/choose, optional
activity, load/save and App callbacks; do not duplicate rules in a test engine.

- [ ] Add seeded flows for each branch through starter training/direct entry,
  meaningful work, one promotion, branch switch, re-entry, save/reload and ending.
  Add a configured long-lived F→D→B→S fixture asserting one-rank manual steps,
  exact threshold boundaries and no credit for unworked years.
- [ ] Add both-language mixed legacy/expanded archives, old course completion
  placement during injury, unknown-teaching preservation, prestige re-entry with
  no vacancy, loaded old career offers and unchanged legacy seeded fixtures.
- [ ] Add App pause/pending/Watch/hidden-tab/reload and immediate-save assertions
  for path selection/work/promotion; storage read/write failure Retry behavior
  leaves source data intact. Assert negative/NaN counters cannot silently reset.
- [ ] Run `npm test -- src/game/expanded/career-release.test.ts src/App.test.tsx src/game/storage.test.ts`; expect new regression cases to fail against missing
  integration or earlier defects. Fix only demonstrated integration gaps.
- [ ] Run `npm test` and `npm run build`; expect all tests PASS and TypeScript/Vite
  success. Record any existing bundle advisory separately; no invented lint/e2e scripts.
- [ ] Commit task-owned test/fix files as `test: verify career journeys and save compatibility`.

## Task 8: Browser acceptance, documentation and delivery

**Files:** Create root `docs/verification/career-paths.md`; update root
`CONTINUE.md`, spec status and this progress ledger; update app `PRODUCT.md`,
`README.md`, `DESIGN.md`, `.impeccable/design.json` only to describe verified behavior.

- [ ] Start/reuse isolated QA5174. Use disposable fixtures, never clear player
  storage. Check EN desktop1280 and TH mobile390, plus EN mobile390/TH desktop1280
  for long labels, disclosures, button focus, requirements and horizontal overflow.
- [ ] Exercise six-path browsing, paid/part-time course, protected existing loan,
  safe/risky work, promotion/defer, F/D/B/S, mage/academic and healer/cleric branches,
  unknown teacher, dismissal, university and a completed archive. Reload after a
  pending choice and verify exact facts/costs; check console and storage recovery.
- [ ] Check keyboard order and focus after decisions, Watch-mode manual choices,
  hidden-tab suspension and reduced motion. Record observations/limits, not claims
  of untested assistive technology or OS settings.
- [ ] Independently review the whole branch against spec and this plan. Fix
  required findings with targeted failing regressions, then rerun relevant checks;
  run final `npm test` and `npm run build` after final code changes.
- [ ] Verify docs/local links, `git diff --check`, complete diff against freshly
  fetched origin/main and `git status --short --branch`. Report upstream movement;
  do not automatically merge/rebase. Preserve unrelated ignored QA/art sources.
- [ ] Update checkpoint with exact commits/PR, actual tests/browser results,
  remaining limitations, usage windows/time and next action. Commit only owned
  files, push explicit task branch, update PR base main, mark ready only with
  successful required checks. User merges manually; no auto-merge or publishing.

## Planning self-review and progress ledger

Planning self-review: all six paths map to catalogue/entry (Tasks1/3), meaningful
work (Task4), manual UI/education (Tasks5/6), preservation (Task2), seeded/reload
coverage (Task7), browser/docs/delivery (Task8). Review Focus conditions each have
explicit owning tests. New signatures/types/IDs above are proposed interfaces,
not claims that those files/functions already exist. The tasks are one coupled
career redesign, not independently deployed subsystem projects.

| Item | Status | Evidence |
| --- | --- | --- |
| Plan prepared and self-reviewed | Complete | Source paths, engine order, storage migration/validation and task interfaces inspected |
| Plan/numeric defaults approved for execution | Approved | User requested native implementation and later continuation |
| Baseline tests/build | PASS | 396/396; build PASS |
| Tasks1–8 | Complete | Final478/478, build PASS; browser/review evidence linked below |

Resume at the first unchecked execution step only after plan review. Preserve
completed evidence and log exact commits as tasks finish; use this ledger and
`CONTINUE.md` rather than a competing checkpoint.


## Execution completion — 2026-11-11

User approved native implementation. Tasks1–7 commits:4b18e6c,3456181,43b2563,
3692015,b6d946c,5d72f86,5127661. Review fixes and delivery follow in Git history.
Final478/478 tests and build PASS. [Verification](../../verification/career-paths.md)
records browser coverage, independent review, rulings and deferred minor. Original
checkboxes above preserve the planning brief; completion evidence is this ledger,
the verification record and task commits. No publishing or automatic merge.

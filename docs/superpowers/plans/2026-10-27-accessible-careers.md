# Accessible Careers and Education Finance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give ordinary expanded-life characters reliable career entry through direct qualification or paid training, with voluntary interest-free education finance.

**Architecture:** Extend the existing expanded career, education and optional-activity flows. Add pure training and education-finance modules with bounded saved records, one attendance owner per year, and explicit funding transactions; retain the existing engine, decision panel and bilingual chronicle.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, plain CSS, Vitest and React Testing Library; browser localStorage, with no new dependencies.

**Spec:** [Accessible careers, training, and education finance](../specs/2026-10-26-accessible-careers-design.md).

**Status:** Plan for review, requested on 2026-10-27 for [PR #12](https://github.com/ny147/1-in-mushoku-tensei/pull/12). No product implementation is included. The request authorizes planning from the design; its proposed balance values remain proposals, carried below as the implementation baseline for review. Internal allocation/schema choices below are author decisions delegated by the design, not additional user-confirmed requirements.

## Global Constraints

- Applies to new and existing **expanded-1** lives.
- Frozen **legacy-1** lives retain their original engine and draw order; do not silently convert them.
- Existing completed-life snapshots remain immutable.
- Keep deterministic simulation logic in `src/game/`.
- Full-time training qualifies an ordinary beginner in **2–3 game years**; part-time takes **4 or 6 years**.
- Borrowing always requires explicit player acceptance, showing purpose, exact principal, funding breakdown, and repayment terms.
- Repayment is **10% of positive annual earned-income surplus**, rounded down but at least 1 coin when an integer surplus exists, capped by both actual surplus and outstanding principal.
- No interest, penalties, repossession, imprisonment, or compounding.
- Preserve pending decisions, pause on decisions, hidden-tab handling, queue priority, and manual consequential choices in Watch mode.
- No dependency upgrades, new server, publication, source uploads, browser save reset, billing action, or main-branch integration is part of this work.
- Use Node.js 22.12+ or supported Node.js 24. Run npm commands from `six-faced-life/`; protect player storage on port 5173 and use isolated QA port 5174.
- Continue on `codex/accessible-career-design` and update PR #12 targeting `main`. Fetch before resumption and final handoff; never automatically merge/rebase an advancing main. User merges manually.

## Review Focus

1. Old saves with pending career/university choices and absent versus malformed finance fields must load without inventing debt or overwriting unreadable storage (Tasks 1, 6).
2. Injured graduates, a changed magic-study selector, and interrupted attendance must retain usable qualification and show the actual placement blocker (Tasks 2, 4, 6).
3. Funding withdrawal after partial consumption, repayment before withdrawal, and repeated course switching must never turn borrowed reserves into cash (Tasks 3, 4).
4. Graduation, death, competing historical decisions and reload in the final training year must not duplicate stipend, progress, tuition or placement (Tasks 4, 6).
5. Tiny surplus, dependants, large old savings and simultaneous loan purposes must share one affordable repayment ceiling and keep necessities funded (Tasks 3, 5).

## Source map and implementation decisions

All source paths below are relative to `six-faced-life/`. Existing entry points inspected at branch HEAD `f1c0ac0`, with `origin/main` at `c88743a`:

| Files | Responsibility |
| --- | --- |
| `src/game/expanded/types.ts`, `origins.ts`, `validation.ts`; `src/game/storage.ts` | Saved training/finance types, initialization, validation and compatible loading |
| New `src/game/expanded/career-access.ts` | Ordinary role catalogue, lower requirements and shared starter fees |
| `src/game/expanded/careers.ts`, `events.ts` | Actual appointments, retained career records and prestigious vacancies |
| New `src/game/expanded/training.ts` | Quotes, attendance, progress, curriculum, mode changes and qualification |
| New `src/game/expanded/education-finance.ts` | Cost reservation, debt, consumption, refund, repayment and death closure |
| `src/game/expanded/education.ts`, `economy.ts`, `engine.ts` | University funding, annual income/necessities, ordered integration |
| `src/game/expanded/activities.ts`, `balance.ts`; new `training-events.ts` | Manual activity routing, stable IDs and training/finance decisions |
| `src/game/simulation.ts`; `src/App.tsx` | Watch boundary and existing persistence/playback integration |
| `src/i18n/expanded.ts`, `expanded-story-th.ts`, `messages.ts` | Requirements, decisions, facts, control labels and EN/TH copy |
| New `src/components/EducationProgress.tsx`; `ExpandedDetails.tsx`, `LifeView.tsx`, `OptionalActivities.tsx`, `styles.css` | Compact progress/finance display, controls and decision integration |
| `src/game/expanded/summary.ts`; `src/components/Retrospective.tsx` | New factual training/debt outcomes, preserving stored old summaries |

### A. Entry catalogue and curriculum

Export `ORDINARY_ROLES` as the ten-role readonly tuple below and `OrdinaryRole = (typeof ORDINARY_ROLES)[number]`. Export `ordinaryEntry(role: OrdinaryRole): CourseDefinition`; its definition contains `units: 4 | 6`, `tuition: number`, `starterFee: number`, and numeric targets below. Direct requirements and course targets must use this single catalogue.

| Role | Units | Tuition / starter fee | Direct requirements after age 15; course targets |
| --- | --- | --- | --- |
| laborer | 4 | 0 / 0 | No skill requirements |
| farmer | 4 | 0 / 0 | Health 20 |
| merchant | 4 | 16 / 10 | Knowledge 10; direct capital 10 |
| guard | 4 | 16 / 0 | Sword XP 20 |
| adventurer | 4 | 16 / 5 | Health 30; sword or aggregate magic XP 15; direct capital 5 |
| swordsman | 6 | 24 / 0 | Sword XP 30; sword cap 1 |
| mage | 6 | 24 / 0 | Selected discipline XP 30; magic cap 1 |
| healer | 6 | 24 / 0 | Healing discipline XP 25 |
| cleric | 6 | 24 / 0 | Healing XP 25; knowledge 20; trust 10 |
| teacher | 6 | 24 / 0 | Knowledge 25; selected discipline or sword XP 25; standing reputation 5 |

Curriculum allocation: after each participating year's units, top up each target to `ceil(target * earnedUnits / requiredUnits)` if below that milestone. Never lower a value already above it. This yields deterministic year-one/year-two sword milestones 10/20 for guard and 10/20/30 for swordsman, independent of focus or genetics. Adventurer and teacher courses use sword XP for their alternative skill target. Physical courses (farmer, guard, adventurer, swordsman) prepare health to 20, 20, 30, 20 respectively. Apply health preparation after ordinary annual health decay, before survival checks; subsequent injury still matters. Award only cap 1 where required; never advance existing caps or bypass advanced aura limits. Add actual magic discipline gains to aggregate magic XP exactly once and synchronize spells through the existing learning helper.

Mage records lock the quoted discipline at first enrollment, across pauses/switches and later selector changes. Healer/cleric always train healing. Other courses store `school: null`. The ten saved role records therefore stay bounded; a completed mage course cannot be repeated for free training in four other disciplines. Placement checks its locked discipline, while ordinary direct applications use current study.

### B. Saved state and bounded interfaces

Add optional compatibility fields to `ExpandedState`, populated for new lives:

```ts
training?: {
  version: 1;
  active: OrdinaryRole | null;
  mode: "full-time" | "part-time";
  paused: boolean;
  selection: { role: OrdinaryRole; mode: TrainingMode } | null;
  lastYear: number; // world year, initial birthYear - 1
  records: Record<OrdinaryRole, {
    units: number; // integer 0..course units
    school: MagicSchool | null;
    completedYear: number | null;
    placementAccepted: boolean;
  }>;
};
finance?: {
  version: 1;
  lastYear: number;
  lastConsumptionYear: number;
  lastRepayment: number;
  pauseReason: "none" | "no-surplus" | "university" | "hardship" | "ended";
  purposes: Partial<Record<EducationPurpose, FundingRecord>>;
};
```

Name the objects above `TrainingState` and `EducationFinance`; define `TrainingMode = "full-time" | "part-time"`. Initialize selection to null and both finance year guards to `birthYear - 1`. `EducationPurpose = OrdinaryRole | "university"`; at most eleven own keys. `FundingRecord` has lifetime `borrowed`, `repaid`, `cancelled`, `balance`, `closedUnpaid` counters and `reserved: { family: number; personal: number; loan: number }`. All monetary fields are finite nonnegative integers at most 1,000,000, with `borrowed === repaid + cancelled + balance + closedUnpaid`; reserve loan cannot exceed balance. Completion does not erase debt. At death, balances move to `closedUnpaid` and never to descendants. Returning unused borrowed reserves counts as cancellation, not an income repayment.

Optional fields support historical archives and existing in-memory fixtures, not silent correction of invalid values. `migrateEducationAccess(life: ExpandedLife): ExpandedLife` clones and fills absent fields only on a validated active life. Helpers treat absent fields as empty and initialize on their first valid mutation. Present `null`, partial objects, future versions or inconsistent records fail validation. Preserve old completed objects and summary text; do not run active-life migration across the archive.

One active course may be paused; university admission requires explicit course withdrawal first. Switching to another course refunds unused reserves, keeps earned units, and obtains a fresh quote for only remaining tuition. Completed courses are not enrollable again. Qualification survives acceptance/dismissal and permits later reappointment, with no repeated skill/fee reward. Completed merchant/adventurer starter-fee escrow can remain in its purpose record until first placement; it does not count as simultaneous attendance. If explicitly refunded before placement, a later quote must fund the fee again before it is reserved, never waive or duplicate it.

### C. Funding, withdrawal and annual order

`EducationQuote` contains `purpose`, `admission`, `travel`, `tuition`, `living`, `starterFee`, `total`, `family`, `personal`, `loan`, `remainingUnits` and `school`. Allocate available family funds first, then personal coins, then the uncovered amount as an optional loan. Show that this uses those contributions before acceptance. Quotes are pure and recomputed on acceptance; reject stale or declined quotes without mutation. Offer a no-loan acceptance only when `loan === 0`, otherwise an explicitly labeled borrowing choice. Scholarships quote zero player cost and zero debt.

Reserve all accepted costs immediately, deducting only family/personal contributions from their owners. Loan money enters provider escrow, never coins. Consume family, then personal, then loan reserves in that order. A paid course consumes 4 coins per unit, capped by remaining tuition, leaving its 10/5 starter fee reserved. Free courses consume zero. University consumes admission 80 plus regional travel 40/90/120 at enrollment, then 58 per attended year: tuition 40 plus necessities 18, including probation years. The reserve is 232 initially. After exhaustion retain existing unfunded attendance/withdrawal behavior; never silently borrow again. Scholarships keep covering their existing necessary costs. Existing enrolled students keep their saved budget and funding treatment with no retrospective debt or reconstructed payer history.

On withdrawal or course switch, return every unused loan coin directly against that purpose's outstanding balance (`cancelled += refund`, `balance -= refund`), then personal reserves to coins and family reserves to family funds; consumed money is never refunded. Example: total 24 funded family 4, personal 4, loan 16, after one full-time year consume 8, leaving loan 16. Withdrawal cancels 16 debt, returns no cash. With loan-only funding 24, one year consumes 8: withdrawal cancels 16 and leaves debt 8. If the debt was partly repaid already, unspent loan reserve remains protected from repayment, so `balance >= reserved.loan` still holds. Repayment can only pay consumed principal (`balance - reserved.loan`).

Annual integration captures attendance at the start of the year so graduation cannot also pay a job that year:

1. Apply existing focus and skill gains, capture full-/part-time/university attendance, then compute economy using that snapshot.
2. Full-time course pays exactly 24, without job wages or the work-focus bonus. Part-time/paused/no course uses existing eligible job wages and bonus; part-time has no stipend. Full-time retains appointment and work records but skips their annual XP, years, service and reputation. Preserve existing health dismissal independently, including during full-time attendance.
3. Pay actual necessities/dependants/education; consume reserved education only once. University provider funding covers costs directly, with no spendable grant remainder. Preserve ordinary other expenses such as exploration.
4. Apply annual health decay, then participating course units and curriculum; check survival. A death may retain that year's actually earned units but must not leave an actionable placement.
5. For survivors run education completion, eligible career advancement, family, politics and history. Training completion records qualification once, clears active attendance and offers placement after higher-priority decisions. Do not force a job switch or erase a qualification when a transient offer is skipped.
6. Repay once using the captured attendance, actual earned income and actual costs. Compute `surplus = max(0, floor(earnedIncome - (18 + dependantCosts + necessaryEducationCosts)))`; cap by coins still available after all annual spending and consumed principal. Reserved tuition counts as necessary education cost for this calculation. Pause for university attendance or any unmet necessities/dependant costs. Apply `min(surplus, max(1, floor(surplus * .1)), repayableDebt)` once, allocating across purposes in catalogue order then university. Grants, reserve refunds and prior wealth are excluded from earned income. No positive integer surplus means zero repayment.
7. Close death obligations before `buildSummary`; preserve summary snapshot and ordinary queue draining. Persist `lastYear` guards so calling annual helpers twice cannot charge or advance twice.

## Tasks

### Task 1: Validated empty-state migration

**Files:** Modify `src/game/expanded/{types,origins,validation}.ts`, `src/game/storage.ts`; create `src/game/expanded/career-access.ts`, `src/game/expanded/education-access-state.ts` and `src/game/expanded/education-access-state.test.ts`; extend `src/game/expanded/validation.test.ts` and `src/game/storage.test.ts`.

**Interfaces:** Produce the types in B and the A catalogue declarations (`ORDINARY_ROLES`, `OrdinaryRole`, `CourseDefinition`, `ordinaryEntry`, `isOrdinaryRole`) needed to validate role keys/units. Produce `emptyTraining(birthYear: number): TrainingState`, `emptyFinance(birthYear: number): EducationFinance`, `migrateEducationAccess(life: ExpandedLife): ExpandedLife`. The catalogue/type dependency must not import the engine or event/i18n modules.

- [x] Write tests `migrates only absent active expanded fields` and `preserves pending choices and all RNG streams`: assert no debt/course, unchanged coins/age/occupation/history/pending/queue/rng/worldSeed/familyRng, no storage writes on load, and equal future results for equivalent restored states.
- [x] Add table-driven malformed-field tests: null, future version, NaN/infinity, negative/fractional money, unknown/prototype role, units beyond 4/6, duplicate/impossible completion, future lastYear, inconsistent debt/reserves, two attendance owners. Assert `loadGame(...).error !== null` and original stored bytes unchanged. Include a pending old university/career save and mixed legacy/expanded archive whose serialized completed objects stay equal.
- [x] Run `npm test -- src/game/storage.test.ts src/game/expanded/validation.test.ts src/game/expanded/education-access-state.test.ts`; confirm the new cases fail for the intended missing behavior.
- [x] Implement optional-field validation followed by active-only missing-field migration. New origins initialize both fields without drawing RNG. Existing university attendance gets empty finance, retaining its old budget and scholarship state.
- [x] Rerun the same command; require all cases pass. Stage only these files and commit `feat: preserve saves with education access state`.

### Task 2: Reliable ordinary direct appointments

**Files:** Modify `src/game/expanded/career-access.ts`, `careers.ts`, `events.ts`, `careers.test.ts`, `activities.test.ts` and `src/i18n/expanded.ts`.

**Interfaces:** Consume Task 1's catalogue and types. Extend `careerRequirements(l: ExpandedLife, role: Occupation, school?: MagicSchool): Requirement[]` with default current study. Keep `appoint(l, role): boolean` compatible; add an optional third `AppointmentOptions` argument with `school?: MagicSchool` and `funding?: "reserved-training"`. Reserved funding is valid only for a completed matching course with sufficient escrow; ordinary callers cannot waive fees. Implement that funded path in Task 4 after the finance module exists; this task implements direct appointments only.

- [x] Write boundary tables for every A requirement (one below/exact), age 14/15, all five magic disciplines, healer's healing track, and aura-impaired sword cap 1. Assert exact merchant/adventurer direct coin deltas `-10`/`-5`, once, without erasing prior work records.
- [x] Add `ordinary availability does not depend on world year or seed`: iterate seeds 1–100 and adult years, list decisions twice and assert eligible ordinary jobs enabled and unchanged RNG/state. Assert knight/professor retain prior requirements, fees, 10%/2% vacancy algorithms and promotion behavior. Existing current-role menu omission stays deliberate; courses must still be discoverable for other roles.
- [x] Run `npm test -- src/game/expanded/careers.test.ts src/game/expanded/activities.test.ts` and inspect expected failures.
- [x] Implement the A catalogue, shared starter fees and ordinary availability branch in `appointmentAvailable`. Preserve existing choice IDs, including `expanded.career.job-*`; update cost display and requirement descriptions from the same helpers.
- [x] Rerun those tests; commit `feat: guarantee qualified ordinary career entry` with explicit task-owned paths.

### Task 3: Provider reserves, refunds and affordable debt

**Files:** Create `src/game/expanded/education-finance.ts` and `.test.ts`; modify `src/game/expanded/validation.ts` only where the final ledger invariants require it.

**Interfaces:** Produce `quoteEducation(l: ExpandedLife, cost: EducationCost): EducationQuote`, `reserveEducation(l: ExpandedLife, quote: EducationQuote, borrow: boolean): boolean`, `consumeEducation(l: ExpandedLife, purpose: EducationPurpose, amount: number, annualYear?: number): boolean`, `refundEducation(l: ExpandedLife, purpose: EducationPurpose): void`, `repayEducationYear(l: ExpandedLife, year: EducationYear): void`, `closeEducationDebt(l: ExpandedLife): void`. Mutators follow existing expanded-module conventions; false means no partial mutation. `EducationCost` contains purpose, the five numeric cost components in C, `remainingUnits: number` and `school: MagicSchool | null` (university uses 0/null). Enrollment helpers must validate canonical remaining costs before passing a quote to the ledger. `EducationYear` contains `worldYear`, `earnedIncome`, `necessaryEducationCosts`, `dependantCosts` (numbers), `universityAttendance` and `unmetNeeds` (booleans). Annual consumption requires its world-year argument and guards `lastConsumptionYear`; enrollment/placement consumption has no annual argument and is guarded by its transaction state. `repayEducationYear` independently guards `lastYear`.

- [x] Write quote/accept/decline assertions: `family + personal + loan === total`, identical repeated quote and unchanged RNG/purse; explicit borrow required for a shortfall; changed funds invalidate the old quote; borrowed acceptance never increases coins. Test exact C refund examples, consumed fees, multiple purposes and repeated zero-reserve refunds.

  Representative loan-only withdrawal assertions after reserving 24 and consuming 8:

  ```ts
  refundEducation(life, "swordsman");
  expect(life.expansion.finance!.purposes.swordsman).toMatchObject({
    borrowed: 24, cancelled: 16, repaid: 0, balance: 8,
    reserved: { family: 0, personal: 0, loan: 0 },
  });
  expect(life.coins).toBe(0);
  ```

- [x] Pin repayment cases as `(income, necessaryCosts, expectedPayment)`: `(18,18,0)`, `(19,18,1)`, `(27,18,1)`, `(38,18,2)`, plus debt 1 caps payment to 1, current coins 0 caps to 0, and full-time university forces 0. Set old savings to 10000 with no income and assert unchanged. Add dependants, reserve-funded tuition, grant/refund income exclusion, two debts sharing one ceiling, outstanding reserved principal excluded, same-year double call and withdrawal after repayment.
- [x] Run `npm test -- src/game/expanded/education-finance.test.ts`; inspect intended failures.
- [x] Implement C's funding allocation, reserve consumption, cancellation, fixed repayment ordering and closure invariants. On death cancel unused borrowed reserves first, close remaining balance as unpaid, and do not turn unused funding into inheritance. Retain cumulative records for the summary.
- [x] Rerun tests; commit `feat: add voluntary education finance ledger`.

### Task 4: Paid training lifecycle and annual integration

**Files:** Create `src/game/expanded/training.ts`, `.test.ts`; modify `src/game/expanded/engine.ts`, `economy.ts`, `careers.ts`, `engine.test.ts`, `economy.test.ts` and `src/game/progression.ts` only if shared spell synchronization needs extraction.

**Interfaces:** Produce `quoteTraining(l: ExpandedLife, role: OrdinaryRole, mode: TrainingMode): TrainingQuote`, `enrollTraining(l: ExpandedLife, quote: TrainingQuote, borrow: boolean): boolean`, `setTrainingMode(l: ExpandedLife, mode: TrainingMode): boolean`, `pauseTraining(l: ExpandedLife, paused: boolean): boolean`, `withdrawTraining(l: ExpandedLife): boolean`, `applyTrainingYear(l: ExpandedLife): void`, `placementRequirements(l: ExpandedLife, role: OrdinaryRole): Requirement[]`, `acceptTrainingPlacement(l: ExpandedLife, role: OrdinaryRole): boolean`. `TrainingQuote` extends `EducationQuote` with mode, remaining years and income description; remaining years is `ceil(remainingUnits / (mode === "full-time" ? 2 : 1))`. Placement uses B qualification, A locked school and current health 20/30 for physical roles, charges reserved starter fee once, and retains the earned qualification.

- [x] Add parameterized zero-skill tests for ten roles, both modes, no rare traits, and focus `bonds`: assert completion after 2/3 or 4/6 participating years, all role targets and cap/spell outcomes, and successful manual placement. Use controlled surviving fixtures for the duration assertion; separate real seeded survival tests must retain hazards.
- [x] Add assertions for full-time income 24 versus original farmer pay 20, no work bonus/old career years; part-time retains normal wages/advancement. Verify paused attendance restores ordinary pay, retains progress and consumes no tuition. Include jobless part-time quote, mode switch after odd units, withdrawal/reentry without tuition duplication, course switch preserving each record, no completed-course replay, and no skill reduction for experienced applicants.
- [x] Test a completed adventurer at health 19 retains qualification and escrow through reload and refusal; at health 30 accepts once with no second fee. Test mage water enrollment followed by fire study still places using the trained water track. Test ordinary physical health dismissal while attending, degree/prestige never awarded by training, final-year death and survival risk still applied.
- [x] Run `npm test -- src/game/expanded/training.test.ts src/game/expanded/engine.test.ts src/game/expanded/economy.test.ts`; inspect intended failures.
- [x] Implement A/B/C, taking the yearly attendance snapshot before completion. Extract a narrowly shared spell-sync helper if needed; do not route locked-school gains into the newly selected school. Keep survival RNG calls and unrelated history order intact; isolate health dismissal from paid career-year advancement. Completed qualification is durable state, not only a queued offer.
- [x] Rerun tests; commit `feat: add paid ordinary career apprenticeships`.

### Task 5: University loans without academic bypass

**Files:** Modify `src/game/expanded/education.ts`, `economy.ts`, `engine.ts`, `education.test.ts`, `economy.test.ts`.

**Interfaces:** Preserve `educationRequirements(l): Requirement[]` including the displayed funding requirement. Add `universityQuote(l: ExpandedLife): EducationQuote`; extend `enrollUniversity(l: ExpandedLife, funding?: { quote: EducationQuote; borrow: boolean }): boolean`. The old no-argument path remains available only when existing funds/scholarship suffice. Funding acceptance may satisfy funding, never age/knowledge/readiness. `applyEducationYear` continues using four successful years and existing probation rules.

- [x] Write poor ready no-talent cases in ordinary/demon/begaritt regions: quotes total 352/432/402, loan exactly uncovered amount, successful voluntary admission with zero spendable loan cash; decline leaves everything unchanged. Assert age 14, knowledge 39 and absent readiness still refuse with credit available.
- [x] Test scholarship admission with zero debt and unchanged actual support, existing enrolled save with budget 174 remains debt-free, explicit course withdrawal before admission, no stipend and university support stacking, and four successful years versus probation consumption/withdrawal. Pin admission/travel nonrefundability and remaining 58-year reserve refunds, with old unfunded-budget behavior preserved after four attendance years.
- [x] Run `npm test -- src/game/expanded/education.test.ts src/game/expanded/economy.test.ts`; inspect intended failures.
- [x] Implement provider-funded university enrollment and annual consumption through Task 3, maintaining `education.budget` as the remaining university reserve mirror for new financed enrollments. Validate its sum against finance reserves when a new university funding record exists; leave grandfathered budgets independent. Refund unused reserves on withdrawal/graduation; repayment remains paused through the final attended year.
- [x] Rerun tests; commit `feat: fund university through optional education loans`.

### Task 6: Manual decisions, accessible controls and bilingual recovery

**Files:** Create `src/game/expanded/training-events.ts`, `.test.ts`, `src/components/EducationProgress.tsx`, `.test.tsx`; modify `src/game/expanded/{events,activities,balance}.ts`, `src/game/simulation.ts`, `src/game/storage.ts`, `src/components/{ExpandedDetails,LifeView,OptionalActivities}.tsx`, `src/App.tsx` as needed, `src/styles.css`, `src/i18n/{expanded,expanded-story-th,messages}.ts`; extend existing activity, storage, i18n, component and App tests.

**Interfaces:** Add activity `training` with stable event `expanded.training`. Use Task 1's validated `selection` to persist the quote being viewed. Use `expanded.training-quote` for funding confirmation and `expanded.training-placement` for completed offers. Export `trainingDecision(l: ExpandedLife): Decision | null` and `applyTrainingChoice(l: ExpandedLife, id: string): boolean`; route before the generic expanded copy lookup. `EducationProgress({ life, onOpenTraining }: { life: ExpandedLife; onOpenTraining?: () => void })` renders existing compact rail/disclosure conventions; all mutations remain engine choices through App's existing saved update path.

- [x] Add decision tests for role selection, quote selection and funding: stable IDs `expanded.training.course-<role>`, `expanded.training-quote.full-time`, `.part-time`, `.enroll-funded`, `.enroll-loan`, `.back`, `.later`; management choices `expanded.training.pause`, `.resume`, `.withdraw`, `.mode-full-time`, `.mode-part-time`; placement `expanded.training-placement.accept-<role>`/`.later`. Mode selection recomputes the quote without enrolling. Add university `expanded.university.enroll-loan`, retaining `.enroll` and `.later`. Display exact loan amount before the loan choice. All training/university funding decisions require manual action even when queued randomly or restored, not only when optionalActivity is set.
- [x] Add storage tests round-tripping each new pending ID/selection/optional activity and matching queue; extend `validEventId`, validator allowlists and `getExpandedDecision` together. Old `expanded.career.job-*` and university choices must remain loadable; menu opening, quoting, pause/mode selection and reload consume zero time/RNG. Only advancing a year earns training.
- [x] Add App/component cases in EN and TH asserting target role, mode, remaining years, income replacement, all fee components/contributions/loan, direct requirements and visible training route. Include low-health placement reason, jobless part-time income warning, paused debt balance plus last repayment, clear academic blockers, and absence of the obsolete ordinary-vacancy advice. Test that all routes are reachable even when the target is still unqualified.
- [x] Add Watch/fake-timer tests: no enrollment, borrowing, mode switch or placement; pending story cannot be replaced; completion waits behind history decisions and remains available after decline/reload. Add immediate persistence and failed-write Retry save cases for enrollment, pause, mode, withdrawal and placement; load failure must not write empty state. Check focus moves to the existing decision heading and hidden tabs suspend progression.
- [x] Run `npm test -- src/game/expanded/training-events.test.ts src/game/expanded/activities.test.ts src/game/storage.test.ts src/components/EducationProgress.test.tsx src/components/ExpandedDetails.test.tsx src/i18n/expanded.test.ts src/i18n/catalogues.test.ts src/App.test.tsx`; inspect intended failures, then implement these exact routes and matching EN/TH copy. Add `selection` validation with Task 1's missing-state defaults. Guard fee handling so `chooseExpanded` and the finance ledger cannot both subtract a quote cost.
- [x] Rerun those tests; commit `feat: expose manual training and education finance choices`.

### Task 7: Factual endings and complete-flow verification

**Files:** Modify `src/game/expanded/summary.ts`, `summary.test.ts`, `integration.test.ts`, `release.test.ts`; extend `src/components/Retrospective.tsx` only if new stored section rendering needs it. Update app-relative `README.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, repository-root `CONTINUE.md`, and create repository-root `docs/verification/accessible-careers.md` only when implementation verification actually occurs.

**Interfaces:** Existing `buildSummary(l): CompletedSummary` stores actual completed roles, borrowed/repaid/cancelled/unpaid amounts in bilingual sections. Reuse existing section keys unless renderer changes are necessary. Old stored summaries remain byte-for-byte unchanged; no descendant ledger receives a debt.

- [ ] Add assertions for an unfinished course, completed but declined placement, accepted role, debt-free scholarship, partially repaid loan and death closure: summary reports only facts, both EN/TH amounts agree, repeated ending/archive does not recalculate the snapshot. Test large mixed archive codec round-trip and existing size/recovery limits.
- [ ] Add seeded engine flows for poor and comfortable farmers entering sword/mage work, an already-qualified direct applicant, each course/mode, poor ready university admission with credit, and scarce prestige remaining earned. Compare uninterrupted versus save/restored runs including final-year decisions and RNG; do not remove hazard draws to force full lifetimes to survive. Regression fixtures may control survival for bounded curriculum tests, while actual seeded integration fixtures use surviving seeds and record them.
- [ ] Run focused summary/integration/release tests; confirm failures, implement factual summary integration and fix only uncovered feature defects, then rerun. Run **`npm test`** and **`npm run build`**, inspect exit codes and results. No configured lint/typecheck/test:e2e script exists.
- [ ] Start isolated QA with `npm run dev -- --port 5174` (reuse if already running). In browser verify EN/TH, desktop and 360px phone, keyboard focus/disabled reasons/overflow/console, farmer-to-sword/mage, paid/part-time pause/mode changes, quoted borrowing and decline, injured placement recovery, university scholarship/loan/readiness rejection, repayment, reload, Watch and hidden-tab boundaries. Use only isolated saves; never clear 5173 storage. Record exact cases and failures, not a generic pass.
- [ ] Update product/setup/design/checkpoint documentation to reflect implemented and verified behavior only; preserve existing design-system previews. In the verification report record test/build output, browser evidence, fixtures/seeds, remaining risks and any environmental blockers. Update the progress ledger below and commit `feat: record training and finance life outcomes` with explicit task-owned files.
- [ ] Fetch `origin --prune` (OpenSSL retry if needed), inspect `git diff --check origin/main...HEAD`, complete task diff and status, and check whether `origin/main` is an ancestor. Do not synchronize automatically. Push explicitly to `codex/accessible-career-design`, update the existing PR #12 description to final scope/evidence, and keep it draft if checks are blocked/failing. User reviews and merges manually; publication remains separately authorized.

## Progress ledger and execution handoff

| Step | Status / evidence |
| --- | --- |
| Read PR/design and current integration points | Complete for planning at `f1c0ac0`; PR #12 is open/draft, base main, no review comments when inspected |
| Plan authored and self-reviewed | Documentation delivery only; see CONTINUE.md for commit and checks |
| Tasks 1–7 | Not started; every implementation checkbox remains unchecked |
| Product verification | Not run for this documentation-only plan; future requirements are above |

Recommended execution: task-by-task implementation because storage, reserves and yearly integration share strict invariants. Before implementation, review the proposed balance baseline and this plan and choose native or subagent execution; no execution method is implied by requesting the plan. On resumption inspect Git, fetch, check usage and read this ledger/CONTINUE.md. Preserve completed work and update this ledger after each bounded task. Update the same PR rather than creating a second delivery branch/PR for this task.

### Execution record — 2026-10-27

User approved implementation of this plan and its baseline. Native execution continues on the existing PR branch as requested.

Pre-flight: Tasks 1→2 share catalogue/types; 1→3 share validated ledger; 2/3→4 share appointments/reserves; 3/4→5 share attendance; 1–5→6 share decision/state contracts; all→7 share summary/verification. Catalogue creation precedes validation, funded appointments wait for Task 4.

Ruling: Use the existing checkout/task branch rather than create a worktree — the user requested the same PR, repository rules require continuing this branch — no branch isolation beyond the dedicated task branch. Use this existing progress ledger instead of a competing scratch checkpoint.

Task 1: complete — new tests observed RED (7 failures), then 28/28 targeted storage/state/validation tests GREEN. Existing active saves migrate without writes; completed archives are not migrated.

Task 2: complete — new entry tests RED (9 missing-rule failures), then 36/36 career/access/activity tests GREEN. Updated the superseded ordinary-vacancy and merchant-fee assertions. Baseline suite passed 197/197 before implementation.

Task 3: complete — finance tests first failed for the absent module; provider ledger now passes 8/8 funding/refund/repayment cases. Repayment protects unspent borrowed reserves; unused loan money cancels principal.

Task 4: complete — missing training module observed RED; 22/22 training/engine/economy tests GREEN, including all ten careers in both modes, locked discipline, health-deferred restored placement and nonstacking wages.

Task 5: complete — 5 new university cases RED, then 25/25 university/education/economy/training cases GREEN. University fixtures now explicitly represent alive adults; funding requires a live player and cannot enroll a birth record.

Task 6: complete — manual UI tests observed RED before routing/controls; 58/58 activity/storage/i18n/component/App tests GREEN. Added EN/TH Watch/reload coverage. Consecutive same-panel pause/mode persistence regression was observed RED and fixed by immediately saving new choice-history entries. Follow-on choices focus the new decision heading.

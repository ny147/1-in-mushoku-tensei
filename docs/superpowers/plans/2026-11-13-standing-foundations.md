# Standing Foundations and Parental Debt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make wealth independent of noble/royal identity and give some new poor
households a complete, recoverable parental-debt story from childhood to adulthood.

**Architecture:** Add an optional versioned social ledger to expanded lives;
retain existing legal-standing fields and the absent-ledger compatibility path.
Keep household liability separate from voluntarily accepted personal debt, and
coordinate personal repayments with education loans through one annual budget.
Integrate manual decisions, factual EN/TH presentation and safe-point restoration.

**Tech Stack:** React 19, TypeScript, Vite, plain CSS, Vitest/React Testing Library;
existing seeded simulation and localStorage. No new dependencies or services.

**Spec:** [Standing: privileges, burdens, and family consequences](../specs/2026-11-13-standing-consequences-design.md).

**Status:** Implemented and verified for human review, 2026-11-14.
User approved carrying PR #27 documentation into the separate implementation
branch `codex/standing-foundations`; no main merge or publication authorized.
Historical planning context: the request to create a plan authorized a follow-up to
[PR #27](https://github.com/ny147/1-in-mushoku-tensei/pull/27), on
`codex/standing-impact-design`, base `main`. The subsequent user request approved
Stage 1 implementation, followed by explicit authorization to carry those documents
into this separate implementation branch. Stage 1 defaults below are the implemented
plan choices; later-stage builder proposals remain distinct from interview answers.

## Global Constraints

- "Wealth and Standing are independent."
- "Dynasty means membership in Asura's royal family, with a possible claim to the throne."
- "Earned nobles receive the same ordinary privileges and duties as born nobles."
- "Personal debt decisions begin at age 15, matching the existing personal-earnings/living-cost boundary."
- "Accepted debt has a fixed balance, no compounding interest, repayments from earnings left after basic living and dependant costs, and hardship pauses."
- "Neither ledger may spend the same surplus twice."
- "Keep `standing.title` for Seven Great Powers positions 5-7: it must never become a noble or royal title field."
- "Asura exile is permanent: no return and no pardon route." This constrains
  Stage 2; Stage 1 must not add a conflicting return/pardon mechanism.
- "Retain the earlier confirmed constraint: no added \"Continue to next decision\" button."
- Preserve pending choices/queues, random streams, history, qualification gates,
  source-aware education reserves, hidden-tab pauses and immediate persistence.
- New consequential choices remain manual in Watch mode. Rendering/quoting uses
  no RNG. Keep legacy lives and completed expanded snapshots factual and unchanged.
- Reuse paper/forest/gold styling, existing fonts/artwork, keyboard focus, reduced
  motion and mobile reading order; this is not a visual redesign.
- Node.js 22.12+ or supported Node 24; use npm and the existing lockfile. Commands
  run inside `six-faced-life/`. Preserve player saves on port 5173; QA uses 5174.
- No server, accounts, automatic merge, paid service, source upload or publication.

## Review Focus

1. Age 14→15 with work/university/history already due: debt responsibility is
   offered once and ahead of new spending commitments, without deleting another
   pending event (Tasks 3 and 5).
2. A year with both debt types, tuition reserves, dependants and a small purse:
   aggregate repayment never exceeds one affordable budget (Task 4).
3. Service interrupted by study, illness, relocation or a job change, including
   its final year: no extra wage, free training credit or duplicate debt reduction
   (Tasks 4 and 5).
4. Dead/absent parents or a household with zero assets: refusal affects only real
   people/property, and housing consequences change actual costs (Tasks 3 and 5).
5. Old queues, malformed ledgers and archives: validation precedes migration;
   no invented ancestry/liability, replayed deduction or silently repaired corrupt
   balance (Tasks 1, 2 and 7).

## Delivery sequence and scope

| Stage | Deliverable | Dependency and review boundary |
| --- | --- | --- |
| **1 — this detailed plan** | Identity, independent birth wealth, parental debt, shared repayments, service/refusal and EN/TH records | A complete playable release; eight tasks below |
| **2 — separate later plan** | K424/K425 allegiance/child household survival, dedicated fixed 80/20 world result, victory/defeat, captivity, permanent exile, crown relationship, opposition claimant and playable ruler | Build on the Stage 1 identity and financial ledger; specify arrival/age boundaries, all relocation guards, office income/public budget, stability and loss of office before code |
| **3 — separate later plan** | Local sponsorship/service across supported kingdoms and optional adult royal marriage | Extend Stage 2 duties without duplicate requests; specify provider refunds, qualification gates, title-loss escalation and family lineage before code |

Stage 2 must deliver the full crown path: a declared dynasty claimant leads the
20% opposition route, accession happens once, and the same life continues with
replacement salary and real kingdom decisions. Stage 3 must retain earned/born
noble parity and existing marriage eligibility. Nothing in this plan implements
succession, captivity, exile, governance, house sponsorship or political marriage.
Do not advertise those as available Stage 1 activities. Write each later stage's
plan against its then-current merged code and get review before implementing it.

This documentation follow-up updates existing PR #27. Actual Stage 1 code gets
its own clean `codex/standing-foundations` branch from freshly fetched
`origin/main`, and its own PR to `main`, as the design requires. If #27 has not
merged, wait for manual merge or obtain explicit branch-integration instructions;
do not automatically cherry-pick, merge or rebase it into the code branch.

## Before execution

- [ ] Review the design, this plan's proposed defaults and the execution method.
  Native execution is recommended because these tasks share annual accounting,
  validation and queue boundaries; review the integrated branch before delivery.
- [ ] Read root `AGENTS.md`, `CONTINUE.md`, the spec and this progress ledger;
  check usage, clean Git status/current branch, fetch/prune and inspect PR state.
- [ ] Establish the Stage 1 task branch as described above before any code edits.
  On resumption preserve its changes and update its existing PR; never bypass a
  dirty new-task start with a stash/worktree or edit on `main`.
- [ ] Read the current source paths below. Run baseline `npm test` and
  `npm run build`; use `npm ci` only if dependencies are missing/inconsistent.
- [ ] Keep the implementation PR draft until required checks pass; commit only
  task-owned files. Refresh usage before substantial verification and save progress
  in this ledger plus `CONTINUE.md` if any remaining window falls below 10%.

## Current integration points

At planning base `origin/main e7fa05b`, `expanded/origins.ts` forces noble wealth
to comfortable/extreme. Legal status already lives in `expansion.standing.status`;
the grant choice also writes `origin.patron`. Keep those existing grant facts,
but never rewrite `origin.status`, `origin.wealth` or ancestry after birth.

`applyEconomyYear()` returns `EducationYear`; `repayEducationYear()` currently
spends up to 10% of positive earned surplus after 18 basic costs, dependants and
necessary education. It runs near the end of `expanded/engine.ts`'s annual cycle,
after career/family processing. `loadGame()` validates before active-only
migrations; completed expanded lives bypass those migrations. `requiresManual`
is already supported by `Decision` and `canAutoChoose()`.

Keep the absent-social-ledger path's existing order, draw count and repayment
behavior. Do not refactor the whole engine or replace the existing event system.

## Files and responsibilities

Paths are relative to `six-faced-life/` unless starting with `docs/` or `CONTINUE.md`.

| File | Responsibility |
| --- | --- |
| `src/game/expanded/social-state.ts` (new) | Versioned identity, household, debt/service types and factories |
| `src/game/expanded/social-validation.ts` (new) | Strict optional-ledger and cross-field validation |
| `src/game/expanded/social-migration.ts` (new) | Safe-point active-only adoption without invented birth facts |
| `src/game/expanded/parental-debt.ts` (new) | Childhood support, responsibility, refusal, service and closure |
| `src/game/expanded/debt-budget.ts` (new) | One annual repayment cap and deterministic allocation |
| `src/game/expanded/social-events.ts` (new) | Responsibility/service-exit manual decisions and disclosure |
| `src/game/expanded/types.ts`, `origins.ts`, `balance.ts` | Optional ledger, new birth rolls/constants/event IDs |
| `src/game/expanded/education-finance.ts`, `economy.ts`, `engine.ts` | Budget integration, actual shelter/service resources, annual ordering and death |
| `src/game/expanded/events.ts`, `activities.ts`, `careers.ts`, `career-work.ts`, `src/components/OptionalActivities.tsx` | Dispatch, service controls, activity labels, one job and action guards |
| `src/game/expanded/validation.ts`, `src/game/storage.ts` | Validate before migration, preserve queues/archive/keys |
| `src/i18n/social.ts` (new), `expanded.ts`, `choice-changes.ts` | EN/TH identity, Effects, actual outcomes and stored narrative |
| `src/components/StandingDetails.tsx` (new), `ExpandedDetails.tsx`, `EducationProgress.tsx`, `src/styles.css` | Present identity, housing, commitments and combined debt disclosures |
| `src/game/expanded/summary.ts` | New-life factual debt/identity summaries without archive rewriting |
| Colocated `*.test.ts(x)`, `src/game/storage.test.ts`, `src/App.test.tsx` | Domain, restoration, UI and Watch/immediate-save regressions |
| `README.md` inside the app, `PRODUCT.md`, `DESIGN.md`, this plan, `CONTINUE.md` | Accurate behavior and execution evidence |

## Proposed defaults for review

These are builder choices, **not confirmed user-selected probabilities or prices**.
Put gameplay numbers in `expanded/balance.ts`; use integer silver throughout.

| Decision | Proposed implementation value |
| --- | --- |
| Ordinary nobility | Retain existing region/race noble chances |
| Royal branch | Among new Asura-born human nobles, 1/12 are an original unnamed Asura royal branch; no royal roll for other births |
| Wealth | Use existing `WEALTH[race]` distribution for everyone, independent of rank; retain existing `SUPPORT`, `PURSE`, `FAMILY_FUNDS` tables |
| New streams | Royal identity: `{ rng: (seed ^ 0x51a7e001) >>> 0 }`; debt: `{ rng: (seed ^ 0xdeb70001) >>> 0 }`; never write either back to personal/family/world streams |
| Parental debt | 30% of new poor origins; fixed initial 48 silver, one local creditor, tenancy security as collateral; non-poor origins and migrated lives get none |
| Childhood payment | Ages 1–14: at most 1 silver/year from household support; `min(balance, 1, max(0, support - 9))`, only with a living recorded parent in the original household; otherwise pause |
| Personal instalments | Use the existing aggregate 10% earned-surplus rule, minimum 1 when affordable; education purposes first in their current order, then accepted parental debt |
| Service | Local noncombat laborer contract, 12 debt credit per eligible elapsed year, `ceil(quotedBalance / 12)` years; last credit is capped to remaining balance |
| Service support | In kind: 18 basic necessities plus actual dependant necessities; replaces job cash pay, never enters purse and never counts as earned surplus |
| Service eligibility | Age 15+, alive, health ≥20, employed as laborer in the contracted region, no university or active full-time course; part-time study and ordinary focus are allowed |
| Early service exit | Retain completed credit; unpaid accepted balance becomes instalments, no fee or refusal strike; do not refund consumed necessities |
| Refusal | Never creates personal debt. Record loss of household tenancy security; if player still lives in that region, shelter costs +4/year for three subsequent annual cycles, then normal shelter resumes |
| Family consequence | For living parents still at that household only: record affected IDs, household relationship 50→35 and one −8 bonds effect if at least one is affected; no invented dead/absent relatives |
| Property/death | Never seize nonexistent assets or personal savings for household refusal; accepted debt closes unpaid at protagonist death and is not inherited |

The one-silver childhood deduction leaves food funding intact under the current
poor support of 10; it can worsen shelter/care and must be visible. It never
spends the child's purse/family education reserves. Household aid remains usable.
The refusal cost is a bounded replacement-housing burden, not a permanent homeless
state: a move away removes the player's surcharge; the historical household loss
remains. Show exact start/end years and affected people before refusal.

Service can be accepted even while temporarily unfit: appoint the ordinary
laborer role through existing gates if possible, then show the contract paused
until eligible. Do not withdraw existing study or refund its reserves implicitly.
Study pauses service rather than granting simultaneous service credit/stipend.
Changing region/job also pauses it; the player may return or explicitly exit.
No salary restoration is invented at completion: laborer remains the actual job,
with ordinary pay from the next year and retained prior qualifications available.

## Shared state and interfaces

In `social-state.ts`, export `SocialState` with `version: 1`,
`source: 'new-birth' | 'migrated'`, `activatedYear`, immutable `royalHouse:
'asura' | null`, `association: HouseAssociation | null`, `household: HouseholdState`
and `debt: ParentalDebt | null`. `ExpandedState.social?: SocialState` is optional
for compatibility. Current legal status remains solely `standing.status`.

`HouseAssociation` has `id: 'asura-local' | 'ranoa-local' | 'millis-local' |
'asura-royal'`, `region`, `source: 'birth' | 'earned' | 'inherited-record'` and
`since: number | null`. These represent original local-house contacts, not canon
appointments. Only current nobles have active association privileges; the royal
birth field survives any later revocation. Noble grants use current supported
kingdom, otherwise no invented local crown. No new commoner/royal caste enum.

`HouseholdState` stores original `home: RegionId`, up to two actual parent IDs,
`relationship: number` (0–100), `housing: 'unrecorded' | 'secure-tenancy' | 'security-lost'`,
`affectedParentIds: string[]`, and `housingLossYear: number | null`.
Use secure tenancy only for newly generated collateral; migrated and other
unrecorded property remains unrecorded, rather than inventing a rented home.
Use no new unlimited relationship or creditor collection.

`ParentalDebt` stores `initial`, `balance`, `childhoodPaid`, `personalPaid`,
`servicePaid`, `closedUnpaid` (all integer 0–1,000,000); `status:
'household' | 'accepted' | 'service' | 'refused' | 'settled' | 'closed'`;
`decisionYear`, `lastChildhoodYear`, `lastRepaymentYear`, `lastRepayment`, and
`pauseReason: 'none' | 'no-surplus' | 'hardship' | 'university' | 'service' |
'ended'`; `service: DebtService | null`. Null decision year means not yet chosen.
Store original liability/creditor identity explicitly (`creditorId: 'local-creditor'`,
`collateral: 'tenancy-security'`); do not imply an education loan was inherited.

`DebtService` stores quoted `acceptedBalance`, `region`, `startedYear`,
`requiredYears`, `completedYears`, `lastYear`, `endedYear: number | null` and
`endReason: 'completed' | 'exit' | 'death' | null`. Credit starts only in a later
world year than acceptance. The `balance` remains household liability after
refusal; it is excluded from personal totals/repayment and closed at death.

Conservation: `initial === balance + childhoodPaid + personalPaid + servicePaid
+ closedUnpaid`. Preserve a finished/declined contract for history; at most one
contract per life. Repaying before the decision sets `settled`, with no offer.
All annual guards use world years, bounded by birth/current year. Distinguish
`null` from `undefined`; unknown versions and inconsistent totals are invalid.

## Task 1: Social ledger, independent origins and strict validation

**Files:** Create `social-state.ts`, `social-validation.ts` and their colocated
tests; modify `types.ts`, `origins.ts`, `balance.ts`, `validation.ts`,
`src/game/storage.ts`, `origins.test.ts`, `validation.test.ts`.

**Interfaces:** Produce `createSocialState(life: ExpandedLife): SocialState` for
new births and `validateSocialState(value: unknown, life: ExpandedLife): boolean`
at the completed-life validation layer (like `validateCareerPaths`). All types
above live in `social-state.ts`; constants live in `balance.ts`.

- [x] Add failing cases `poor origins exist independently for commoner, noble and
  royal births`, `poor births may be debt-free`, `nonpoor births never owe parental
  debt`, `same seed produces same identity`, and `unknown or inconsistent social
  state fails isLife`. Replace the obsolete comfortable-only noble assertion in
  `origins.test.ts`; keep its 10,000-seed validation/race/year checks.
- [x] Run `npm test -- src/game/expanded/origins.test.ts src/game/expanded/social-state.test.ts src/game/expanded/social-validation.test.ts`;
  expect missing-ledger/old-wealth assertions to fail for the intended reasons.
- [x] Implement the schema and proposed birth constants. Keep existing ordinary
  noble roll; replace its wealth branch with `weighted(stream, WEALTH[race])`.
  Initialize social state after the actual parents exist. Use dedicated streams
  for royal/debt rolls. Retain current education/patron/legal-status privileges
  equally for poor and rich nobles; give dynasty no free mastery or extra salary.
- [x] Validate own keys/enums, years, conservation, living/current versus immutable
  facts, royal eligibility, house-region consistency, contract term/credit bounds
  and parent IDs. Validate missing state as compatibility; reject present `null`,
  unknown version, negative/fractional balances and forged future service credit.
  Include cross-checks for personal decision age ≥15 and closed debt at death.
- [x] Rerun focused tests plus `validation.test.ts`; expect PASS. Save/load new
  lives in both languages and verify neither new stream is copied to any existing
  RNG field. Commit `feat: add independent standing and household debt origins`.

## Task 2: Safe-point migration and earned-nobility parity

**Files:** Create `social-migration.ts`, `social-migration.test.ts`; modify
`src/game/storage.ts`, `src/game/storage.test.ts`, `engine.ts`, `events.ts`.

**Interfaces:** Produce `activateSocialState(life: ExpandedLife): ExpandedLife`,
returning the original object when ended/already initialized/pending/queued or
holding a sword compatibility decision; otherwise a cloned adopted life.
Produce `recordNobleAssociation(life: ExpandedLife): void` in `social-state.ts`.

- [x] Add failing tests `migration preserves all existing origin history and RNG`,
  `generic noble does not become royal`, `old pending and queued offers keep their
  original terms`, `activation happens once after final queued choice`, and
  `earned and born nobles have the same association lookup`. For migrated lives
  assert `debt === null`, `royalHouse === null`, and no retrospective deduction.
- [x] Run `npm test -- src/game/expanded/social-migration.test.ts src/game/storage.test.ts`;
  inspect intended failures.
- [x] Adopt only active expanded lives at a clear safe point after existing
  migrations in `loadGame()`, after queue draining in `chooseExpanded()`, and
  before advancement in `advanceExpanded()`. Set activation-year guards to the
  current year. Never migrate an archive or an ended active life.
- [x] Route the existing grant through `recordNobleAssociation()` only when social
  state exists; preserve old grant behavior otherwise. Retain original birth
  rank/wealth, debt, qualifications, `standing.title` and faction membership.
  Infer association only from recorded locations; missing past grant year stays
  unknown. Do not change fees/access based on birth noble versus earned noble.
- [x] Rerun focused tests; include invalid raw payload rejection before adoption
  and migration composed with sword/career activation. Commit
  `feat: migrate standing prospectively and retain earned noble rights`.

## Task 3: Childhood deductions, age-15 responsibility and real housing costs

**Files:** Create `parental-debt.ts`, `parental-debt.test.ts`; modify `economy.ts`,
`economy.test.ts`, `engine.ts`.

**Interfaces:** Produce `applyHouseholdDebtYear(life: ExpandedLife): number`
(mutates debt counters once, returns that year's support deduction),
`housingSurcharge(life: ExpandedLife, year: number): number` (read-only), and
`parentalResponsibilityDue(life: ExpandedLife): boolean`. Age-15 scheduling is
consumed in Task 5; these functions never draw randomness or push decisions.

- [x] Add failing table tests: support10/balance48 at age1 returns1, balance47,
  no purse change; repeated year returns0; support8 returns0; no living local
  parent returns0; ages0/15 return0; aid still adds12. Assert actual food/shelter/
  care values from `applyEconomyYear()`, not only changed text.
- [x] Add refusal housing tests: after decision at K420, surcharge4 in K421–423
  while at the household region, zero at K420/K424 or while away. Verify shelter
  unmet need rises when those4 cannot be paid, and no asset/saving is confiscated.
- [x] Run `npm test -- src/game/expanded/parental-debt.test.ts src/game/expanded/economy.test.ts`;
  inspect intended failures.
- [x] Implement household deduction from that year's support input, without
  permanently decrementing base `economy.support`. Apply shelter surcharge at the
  actual shelter payment, before optional spending. Return its cost in annual
  accounting for Task 4. Keep the absent-ledger economy exactly as before.
- [x] Mark responsibility due from age15 when household balance remains and no
  decision was made, even if parents died. Do not accelerate it, create a new
  liability when money falls, or rely on `seen`/bounded history as the debt ledger.
- [x] Rerun focused tests; assert no automatic personal payment below15 and no
  debt offer when childhood payments settled the balance. Commit
  `feat: apply household debt and bounded housing consequences`.

## Task 4: One repayment budget and a real creditor-service year

**Files:** Create `debt-budget.ts`, `debt-budget.test.ts`; extend `parental-debt.ts`
and tests; modify `education-finance.ts`, its tests, `economy.ts`, `engine.ts`,
`careers.ts`, `career-work.ts` and related tests.

**Interfaces:** Produce `repayDebtsYear(life: ExpandedLife, year: EducationYear): void`;
extend `EducationYear` with optional `additionalShelterCosts?: number` and
`creditorService?: boolean`. Extract `allocateEducationRepayment(life:
ExpandedLife, budget: number): number` in `education-finance.ts`: consume at most
the supplied budget in existing purpose order, update education counters/purse,
return actual spent; never include `reserved.loan` in repayable balance.

Produce `quoteDebtService(life: ExpandedLife): DebtServiceQuote | null`,
`debtServiceYear(life: ExpandedLife, year: number): DebtServiceYear`,
`creditDebtServiceYear(life: ExpandedLife, year: DebtServiceYear): void`, and
`closeParentalDebt(life: ExpandedLife): void` in `parental-debt.ts`.
`DebtServiceQuote` has `balance`, `region`, `requiredYears`, `annualCredit: 12`;
`DebtServiceYear` has `year`, `eligible`, `support`, `credit`, `pauseReason`.
Its `pauseReason` is `'none' | 'health' | 'study' | 'region' | 'occupation' |
'not-started' | 'ended'`; this is distinct from the repayment pause reason.
Snapshot eligibility before annual training/career/family changes; the same
snapshot drives in-kind support, wage replacement and subsequent debt credit.

- [x] Write failing accounting cases: income58/basic18 gives surplus40 and cap4;
  education eligible balance3 plus parental balance10 pays3+1 with coins reduced4.
  With purse2 pay only2; with zero surplus, unmet needs, university or service pay0.
  Additional housing4 reduces that surplus/cap. Reserved education loan5 is not
  repayable or spendable. A second call for the same year changes nothing.
- [x] Write failing service cases: accepted balance34 quotes three years; eligible
  years credit12/12/10 with no cash wage; acceptance-year credit0. Dependants are
  covered in kind; health19, university, full-time study, other region/job pause
  both service support and credit. Part-time coursework consumes its own funding
  and progresses once; service is not a free course/guard-service completion.
- [x] Run `npm test -- src/game/expanded/debt-budget.test.ts src/game/expanded/parental-debt.test.ts src/game/expanded/education-finance.test.ts`;
  inspect intended failures.
- [x] Preserve `repayEducationYear()` as the old compatibility wrapper. For social
  lives call `repayDebtsYear()` once at the existing annual repayment position.
  Compute `surplus=max(0,floor(earnedIncome-18-dependantCosts-necessaryEducationCosts-
  additionalShelterCosts))`; cap to purse, surplus and `max(1,floor(surplus*0.1))`
  only when surplus>0. Honor both ledgers' annual guards; update both even when
  payment pauses. Never recompute another full cap for the second creditor.
- [x] For eligible service years replace ordinary wages with zero cash income
  and the in-kind necessities before economy spends. Retain one laborer work
  record only; no parallel previous-role work, cash projects or assignment reward
  while serving. Read-only income/finance displays must describe that replacement.
  Override the annual work-focus +6 as well as base wages; an ordinary job
  promotion must not silently change the quoted service compensation. Apply
  completion after the year's work accounting, using the retained snapshot.
  A completion year's support remains funded, with ordinary wages resuming next
  year. A death before year completion grants no credit; close remaining balance
  through `finishExpanded()` before summary, preserving all payments/history.
- [x] Rerun focused tests and training/university/career-work regressions. Assert
  early exit/death retain credit and never transfer debt to children. Commit
  `feat: share affordable repayments and implement creditor service`.

## Task 5: Complete manual accept/service/refuse and service-exit flows

**Files:** Create `social-events.ts`, `social-events.test.ts`; extend
`parental-debt.ts`; modify `events.ts`, `activities.ts`, `balance.ts`, `engine.ts`,
`src/components/OptionalActivities.tsx`,
`src/game/simulation.ts` only if existing `requiresManual` integration needs it.

**Interfaces:** Produce `socialDecision(life: ExpandedLife): Decision | null`,
`applySocialChoice(life: ExpandedLife, id: string): boolean` in `social-events.ts`;
`acceptParentalDebt(life: ExpandedLife, route: 'instalments' | 'service' | 'refuse'):
boolean`, `exitDebtService(life: ExpandedLife): boolean` in `parental-debt.ts`.
Use event IDs `expanded.parental-debt`, `expanded.debt-service-exit`; choice IDs
`expanded.parental-debt.accept`, `.service`, `.refuse` and
`expanded.debt-service-exit.confirm`, `.keep`. Return false/no mutation for stale
or ineligible actions; domain transitions recheck eligibility independently of UI.

- [x] Add failing flows for all three routes through `getExpandedDecision()` and
  public `choose()`; `canAutoChoose()` must be false. Acceptance transfers only
  the remaining quoted balance; refusal leaves personal liability0; choosing
  twice has no effect. No route takes a generic `Choice.cost` then debits again.
- [x] Test age14→15 alongside work/university and a history event: retain history
  priority, insert debt responsibility immediately before age15 work/university,
  and deduplicate the queue. If another choice exists, preserve it until resolved;
  due state survives reload. Never recreate responsibility after refusal/settlement.
  Respect the existing 16-entry queue bound: if full, leave responsibility due in
  its ledger and enqueue at the next drain with space, before new spending offers.
- [x] Test parents dead, parents elsewhere, family compaction, and zero assets:
  resolve affected IDs from real records, never fabricate a parent or apply bonds
  loss twice. Test zero balance, stale contract quotes and service acceptance while
  study is active. Entry must disclose paused status, not silently cancel education.
- [x] Run `npm test -- src/game/expanded/social-events.test.ts src/game/expanded/activities.test.ts`;
  inspect intended failures.
- [x] Register dispatch/valid IDs and `requiresManual: true`. Implement exact
  route consequences, snapshot affected household members, and show costs/terms
  before each choice. Add an optional activity to review/exit an active service
  contract; confirm unpaid balance and already-earned credit before exit. Guard
  work/projects and saved actions at execution as well as menu construction.
  Use activity key `debt-service-exit` and add its EN/TH label to the exhaustive
  `Record<Activity, ...>` in `OptionalActivities.tsx`; opening it is read-only.
- [x] Rerun focused tests including blocked Watch choice and non-overwriting of
  unrelated pending choices. Commit `feat: add manual parental debt choices`.

## Task 6: Bilingual identity, debt disclosures and factual completed records

**Files:** Create `src/i18n/social.ts`, `social.test.ts`,
`src/components/StandingDetails.tsx`, `StandingDetails.test.tsx`; modify
`ExpandedDetails.tsx`, `EducationProgress.tsx`, `src/styles.css`,
`src/i18n/expanded.ts`, `choice-changes.ts`, `expanded/summary.ts`,
`expanded/engine.ts` and related tests.

**Interfaces:** Produce `StandingDetails({life, birth?}: {life: ExpandedLife;
birth?: boolean})` and `socialText(life: ExpandedLife, language: Language):
SocialPresentation` in `i18n/social.ts` (import `Language` from `game/types.ts`).
`SocialPresentation` provides `birthRank`, `currentStanding`, `royalAncestry`,
`association`, `housing`, `debt`, `commitment` strings. Export
`socialChoiceOutcome(before: ExpandedLife, after: ExpandedLife, choiceId: string,
language: Language): string | null` for actual outcomes and history.

- [x] Add failing EN/TH cases for poor noble, poor royal, earned noble with debt,
  child household liability, accepted instalments, paused/completed service and
  refusal. Assert birth versus present standing, ancestral house versus office,
  outstanding personal versus household debt, last repayment and remaining term.
- [x] Test Effects and actual outcomes for capped final service credit, bonds
  already at floor, absent parents and the housing expiry. Saved history must
  retain actual amounts/affected people after future balances change; do not
  reconstruct the past from current debt. Preserve original English fallback for
  unknown old narrative references.
- [x] Run `npm test -- src/i18n/social.test.ts src/components/StandingDetails.test.tsx src/game/expanded/summary.test.ts`;
  inspect intended failures.
- [x] Add the disclosure beside existing expanded facts; integrate combined
  repayment explanation with `EducationProgress` without relabeling household
  debt as a student loan. Retain compatibility presentation for absent social
  state. Show only usable Stage1 privileges (current patron/basic education/access),
  not crown income, sponsorship buttons or marriage offers that do not exist yet.
- [x] Wire EN/TH `Decision.localized` Effects/outcomes and bounded saved narrative
  parameters; add actual deltas to `choice-changes.ts`. Extend only newly built
  summaries, preserving old snapshots. Use existing disclosure/definition-list
  styling and focus order; no new Continue button or motion.
- [x] Rerun focused tests plus existing Effects/catalogue/summary tests. Commit
  `feat: explain standing and parental obligations in English and Thai`.

## Task 7: Seeded release, save restoration and playback regression gate

**Files:** Create `expanded/social-release.test.ts`; extend `src/game/storage.test.ts`,
`src/App.test.tsx` and the owning tests above. No production behavior beyond fixes
proven necessary by a failing regression.

**Interfaces:** Exercise public `createLife`, `beginLife`, `advance`, `choose`,
`loadGame`, `saveGame`, `archiveLife` and `canAutoChoose`; do not test only helpers.

- [x] Add paired uninterrupted/reloaded seeded flows at childhood deduction,
  age15 pending decision, accepted debt with education reserves, service pause/
  resume/completion, refusal expiry and death/archive. Compare all money/ledger
  fields, RNG, pending/queue, history and later decisions after the same inputs.
- [x] Add compatibility fixtures captured from the pre-change base: legacy life,
  old expanded queued university/grant/service choices and ended/archive records.
  Assert unchanged offers/facts/seeded compatibility futures and prospective-only
  adoption. Include a real save/write/read path and repeated migration.
- [x] Add malformed-state tests (unknown version, conservation violation, invalid
  parent reference, service paid ahead of completed years, impossible dates,
  personal decision before15). Preserve unreadable raw storage and visible retry
  behavior. Test missing versus malformed fields at each migration boundary.
- [x] Add App tests for Watch remaining paused on responsibility/service-exit,
  hidden-tab behavior, immediate save after each route, write failure and retry,
  and reload starting paused with the chosen route intact. Never clear real saves.
- [x] Run `npm test -- src/game/expanded/social-release.test.ts src/game/storage.test.ts src/App.test.tsx`;
  inspect new regressions RED before fixing and GREEN afterward. Then run
  full `npm test` and `npm run build`; expect exit0 for each. Record actual counts,
  duration and warnings; no invented lint/typecheck/e2e scripts. Commit
  `test: verify standing debt release and compatibility boundaries`.

## Task 8: Isolated browser verification, documentation and PR delivery

**Files:** Update app `README.md`, `PRODUCT.md`, `DESIGN.md` where behavior/copy
changes, this execution ledger and root `CONTINUE.md`; create
`docs/verification/standing-foundations.md` for concrete evidence. Keep screenshots,
fixtures, logs and browser backups ignored; do not add dependencies/hosting files.

- [x] Check usage and reuse/start an isolated QA server on5174. If the npm wrapper
  drops flags on this Windows environment, from the app use
  `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174`. Preserve the
  existing QA save before fixture changes and restore it afterward; never touch5173.
- [x] Inspect English/Thai at desktop1280 and narrow phone390 (also320 for overflow):
  poor noble/royal origin, child deductions, responsibility with all three routes,
  shared education repayments, service interruption/final year and housing recovery.
  Verify costs match actual purse/needs/history, no duplicate controls, readable
  mobile order and no horizontal overflow. Inspect console errors.
- [x] Exercise keyboard focus/choice activation, pending/manual Watch behavior,
  Play/Pause/hidden tab and reload across each route; check immediate persistence
  and failure recovery with isolated storage. Record what was actually observed,
  distinguishing automated coverage from manual QA and any unavailable check.
- [x] Review the whole diff against the spec, especially one-budget allocation,
  wage replacement, immutable birth facts, migration guards and future-stage
  exclusions. Fix required failures with targeted regressions; rerun required
  checks after code changes. Update docs with only implemented behavior/evidence.
- [x] Run `git diff --check`, review all tracked and new files and the full diff
  against `origin/main`, then commit task-owned docs/evidence. Fetch/prune before
  final handoff (retry OpenSSL on Schannel credential error); stop/report failure.
  Report if `origin/main` advanced; do not integrate it automatically.
- [x] Push explicitly `git push -u origin codex/standing-foundations`; create/update
  that stage's PR with base `main`. Keep draft if checks are failing/blocked;
  otherwise mark ready for human review. Link the PR, report checks/limitations,
  and state that the user merges manually. Do not merge, auto-merge, delete the
  branch or publish the playable site.

## Execution ledger

| Task | State | Verification / commit |
| --- | --- | --- |
| 1 — State/origins/validation | Complete | 6683d04; RED→GREEN41/4; task review approved |
| 2 — Migration/nobility parity | Complete | 08156c3; RED→GREEN103/6; independent review approved |
| 3 — Household/housing economy | Complete | b42977f; GREEN38/2; review approved runtime; fixture typing fixed08156c3 |
| 4 — Shared repayment/service | Complete | fa0ad95 +0859751; focused128/10+12/4, correction115/7; scoped review approved |
| 5 — Manual decisions | Complete | f4addb0; focused79/5 +TS PASS; independent review approved |
| 6 — EN/TH presentation/history | Complete | 19ecb74 +f4addb0 hook; scoped review approved; browser birth/adult probes clean |
| 7 — Release/restore/Watch tests | Complete | 5f8579f +211f964; final693/80 PASS |
| 8 — Browser/docs/delivery | Complete | 1ed99cc pushed; CI PASS; PR28 marked ready for manual review |

Planning self-review: stages and confirmed ages/odds mapped to the design;
Stage1 requirements assigned to tasks; named interfaces and review-focus cases
cross-checked against current expanded modules. Proposed birth/debt/service/
housing values and migration policy remain reviewable defaults. Application tests,
build and browser QA have not been run for this documentation-only planning task.


### Execution setup — 2026-11-13

Ruling: carry the three PR27 documentation commits into a new branch from fresh
origin/main — user explicitly approved after the unmerged-PR blocker was explained;
original PR27 and main are preserved. New branch codex/standing-foundations,
base e7fa05b; documentation commits 6e0742d, 2b1ed16, 6c96a36.
Ruling: use task-scoped implementers/reviewers under subagent-driven-development
because no execution method was explicitly selected; preserve this plan as the
single progress ledger and use ignored checkpoints/ for temporary review packages.
No new worktree or competing checkpoint is needed under repository instructions.
Baseline npm run build PASS (existing >500kB advisory); baseline npm test PASS493/70 (91.20s).
Usage start: 69% five-hour /37% weekly remaining, no low-capacity trigger.

Preflight task consistency:

| Task | Check | Result |
| --- | --- | --- |
| 1 | Types, origins, strict optional validation | New births only; old absence remains valid |
| 2 | Migration versus immutable birth facts | No debt/royal inference; safe-point adoption |
| 3 | Childhood payment versus age15 responsibility | Childhood ends before adult budget begins |
| 4 | Shared repayment versus service wages | One cap; in-kind service replaces cash |
| 5 | Manual actions versus queues | Responsibility retained until space; no overwrite |
| 6 | Current disclosures versus past history | Freeze actual outcomes; no archive rewriting |
| 7 | Test fixtures versus migration | Capture old absence/queues before migration |
| 8 | QA/delivery versus browser saves/main | Isolated5174; human merge; no publication |

Preflight shared interfaces (all tasks additionally share Global Constraints):

| Tasks | Shared contract | Finding/ruling |
| --- | --- | --- |
| 1→2,3,4,5,6,7 | SocialState / strict validator | Later lifecycle states must validate, including closed/refused |
| 1→8 | Birth constants in documented behavior | Document authored balance as such |
| 2→3,4,5,6,7,8 | Active-only ledger adoption | Existing queues resolve before new mechanics |
| 3→4,5,6,7,8 | Household costs / responsibility / housing | Additional shelter enters the same annual budget |
| 4→5,6,7,8 | Repayment/service snapshot | No duplicate generic choice debit; freeze start-of-year eligibility |
| 5→6,7,8 | Manual IDs and persisted actual choices | Activity label exhaustive map must be extended |
| 6→7,8 | Localized history/outcomes | Use existing narrative fallback; no future stage buttons |
| 7→8 | Full suite/build and evidence | Browser evidence complements automated restore coverage |

Task1 complete:6683d04; focused41/4 PASS; independent task review approved, no Critical/Important finding. Temporary ended-debtor closure awaits Task4 as planned.
Ruling: execute Tasks2/3 concurrently with explicit file ownership — Task2 owns engine/storage/events/social-state migration; Task3 owns new parental-debt helper and economy only, so no shared writes. Both consume reviewed Task1 interfaces.

Ruling: Task6 presentation can proceed against reviewed SocialState concurrently; its owner exports actual-outcome helpers for Task5 engine integration and does not edit engine/economy/state. No future stage actions. Task3 annual surcharge field is additionalShelterCosts, matching Task4.

Task3 complete:b42977f; focused38/2 PASS. Task review found Important test typing seen=[]; corrected to{} in08156c3 and22 parental-debt tests PASS in combined103/6. No other Important finding.
Task2 implemented08156c3, focused103/6 PASS; review pending. Ruling: replace birth-only knight family-fund checks by current standing for adopted social lives; real access parity requires quotes/requirements/debits all agree. Absent-ledger compatibility remains frozen.
Remote save attempt: Git push stalled in send-pack; retried HTTP1.1 with low-speed timeout and received curl28/unexpected disconnect. No remote branch observed yet; draft PR creation returned422 because branch absent. Preserve commits locally and retry delivery later, never pushmain.

Task2 complete08156c3: independent review approved no Critical/Important issue; shared nobleFamilyFunds applies to requirement, both quote paths and actual debit, preserving compatibility. Task4 started with account12%five-hour/28%weekly remaining; prioritize verification/save before exhaustion.

### Usage save point — 2026-11-13 21:54 Bangkok

Observed5%five-hour/27%weekly remaining; resets Nov14 00:10:42 /Nov16 19:12:06
Bangkok. Save-point trigger reached; no more substantial work this session.
Draft implementation PR28: https://github.com/ny147/1-in-mushoku-tensei/pull/28
Remote branch initially reached6adde5f despite GitHTTP response timeout; do not
assume a failed push means no update. Verify remote SHA through API/ls-remote.
Task6 UI commit19ecb74 reviewed approved, focused31/4PASS; Task5 still needs exact
engine hook from ignored checkpoints/standing-foundations/task6-report.md.
Two summary/death integration failures were known before Task4 closure work;
no post-Task4 fullsuite/build/browser check has been run. Do not claim those fixed
until actually checked.
Task4 bounded checkpoint reports50focused/4PASS; implementation incomplete:
read-only service eligibility must not reject already-accounted current years
(keep idempotence in credit method); assignment guards remain. Consult Task4
report and actual commit before proceeding. Tasks5/7/8 unstarted. Task4 and6 are
not complete release gates. Preserve player5173 and existing local hosting metadata.
Next on resumption: status/branch, fresh fetch, usage, read this ledger/CONTINUE and
Task4 report; fix service eligibility with failing regression, finish Task4 guards
and review; then manual choices/hook, integrated tests/build and isolatedbrowserQA.


Save-point verification at21:56: current `npm run build` PASS (TypeScript/Vite;
existing >500kB advisory), `npm test -- src/game/expanded/summary.test.ts` PASS7/1.
The two previously failing summary cases now pass after Task4 death closure.
Full post-change npm test and browser QA remain NOT RUN. Task6 scoped static
review19ecb74 approved, no Critical/Important finding. Task4 commit019faf8 is
explicitly incomplete and has not had independent task review.

Durable resume details (ignored reports may not exist on another checkout):
1. In debt-service.test.ts add RED querying annualIncomeExpanded/careerProject
   after an eligible credited year while service remains active; remove eligibility
   condition `year <= service.lastYear`, keeping idempotence in creditDebtServiceYear.
2. Add domain/menu guards for service/assignment/sword approach cash rewards in
   events.ts; inspect old research path. Test final service year, promotion, snapshot
   health crossing20/family changes, one laborer record, and both ledger annualguard
   directions. Run focused economy/training/university/career-work tests and review.
3. Task5 must add manual accept/service/refuse and exit transitions/queueing. Task6
   exports socialEffects(life,action,language), socialChoiceOutcome(before,after,id,
   language) and socialChoiceMessage(before,after,id,titleEn,titleTh). Engine after
   existing entry/localized handling must set record.text to full EN
   socialChoiceOutcome(...,'en') and record.message to socialChoiceMessage(...),
   before fatal override. Never use params.textEn alone: stored bilingual text is
   chunked into <=500-char fields, <=17 parameters; expandedEntryText joins chunks.
4. Current choices to implement: expanded.parental-debt.accept/service/refuse,
   expanded.debt-service-exit.confirm/keep. Effects must disclose actual current
   parents/housing term, costs and service pauses; requiresManual in Watch mode.
5. Finish Task6 history integration, Tasks7/8 tests/build/browserQA/review/docs.
   Keep draftPR28 until complete; manual user merge only, no publication.


### Resumed execution — 2026-11-14

User requested continuation. Start observed100%five-hour/26%weekly remaining;
clean branch5809f77, fresh fetch succeeded, remote task branch matched checkpoint,
origin/main e7fa05b still included (zero behind). Reused Task4 implementer context;
no completed Task1/2/3/presentation work repeated. Ignored port5174 source fixture
harness prepared at .openai/standing-qa/index.html; no browser save touched yet.
Isolated Vite5174 running; no5173 access. Native computer-use inventory only.

Ruling: keep final completed service year's read-only wage/project views in service
compensation until next world year, matching the already captured annual transaction.
When actual service credit is granted, mark existing careerPaths.lastProjectYear
for that year so later exit/completion cannot open a second paid work opportunity.
Paused attempts do not consume the project marker. This avoids inventing a new
save field or inferring credited service from mutable lastIncome and prevents
penalizing a genuinely paused exit year. Task4 implementer adds RED/GREEN cases.

Task4 complete: fa0ad95 initially focused128/10+12/4 and buildPASS. Independent
review found continuing-service health20→<20 after credit unlocked rewards because
read-only eligibility was recomputed. Ruling superseding the no-newfield preference:
add optional DebtService.lastCreditYear:number|null, set only on actual credit,
retain exact credited-year wage/reward guards through subsequent eligibility/exit.
Missing field stays backward-compatible; validate present values strictly. New
contracts initialize null. Corrected0859751 RED3/62→GREEN115/7, scoped review approved.
Its build attempt was blocked only by in-flight Task5 missing exports/activity;
rerun integrated build after Task5. Existing actual-credit project marker remains.

Browser preparation: native review rejected selecting a Facebook Chrome window as
outside scope. Safer alternative is fresh headless Chrome via Playwright installed
only in ignored .openai/standing-qa/runtime (no source package/lockfile changes).
Birth probes commoner/noble/royal desktop1280 and royalphone390 PASS4cases, no
console/page/resource errors or overflow. Inspected both screenshots: identity,
royal ancestry distinct from office, poor resources/debt readable. Harness adds
data-URL favicon to avoid QA-only404 noise; all evidence ignored in checkpoints/.
Fresh isolated context restored its prior QA save before closing. Player5173 and
existing Chrome profiles/tabs untouched. Remaining adult/Thai/persistence QA later.

Task5 and deferredTask6 hook completef4addb0: focused79/5 and TypeScriptPASS,
independent review approved no Critical/Important issue. Actual full English text
and bounded bilingual message stored before fatal handling; optional exit added
storage allowlist; queue policy keeps16offers/historypriority without losing due
responsibility. Scope ruling: unrelated existing age-jump career/challenge test
fixtures become absent-social compatibility lives so they do not fabricate unresolved
childhood debt; new actual-social release/App tests separately exercise due blockers.
Task7 owns exact fixture/test evidence. No production bypass of responsibility.
AdultEN browser probe displays all3quotedroutes at1280 with noerrors, screenshot
visually inspected. Further route/Thai/mobile/persistence QA running separately.

### Final implementation verification — 2026-11-14

Task7 commits5f8579f/211f964: new public-flow/storage/App cases passed; older
unrelated adult fixtures explicitly preserve compatibility and original assertions.
Initial fullsuite644PASS/40FAIL resolved via targeted102/15 GREEN; final fullsuite
693/80PASS(100.86s), buildPASS(existing bundle advisory), no failing check.
Whole-branch source review found two Important UI issues. One fixwave1132b5e
replaced raw path pay with service-aware compensation and explicit acceptance-year
timing, and quoted actual service region,18basic+dependant in-kind support and
fee-free exit before commitment EN/TH. Refusal names household region. Focused
RED8→GREEN72/5, TypeScriptPASS; scoped independent rereview all addressed.
Ruling: share the preexisting necessities calculation via debtServiceSupport to
keep quotes and actual annual support aligned; no eligibility or budget policy change.
Final real-browser rerun23+31PASS54, zero console/page/resource errors or overflow.
Added explicit visible zero-pay checks for every credited service year and required
preaccept terms. Visually inspected desktopbirth/adult, Thai320/390, creditedpay.
React/presentation checks: pure derived reads, stable keys/native controls, existing
focus/order/fonts/palette, no rendering RNG or new effect-driven persistence.
Source package/lockfiles and hosting metadata unchanged. Artifacts ignored.
Evidence: docs/verification/standing-foundations.md. No later stages or publication.

### Delivery complete — 2026-11-14

Implementation/source1132b5e and documentation1ed99cc pushed explicitly with own
upstream to origin/codex/standing-foundations. Remote HEAD matched local; final
fetch succeeded, branch contains latest origin/main e7fa05b (zero behind).
GitHub test/build/config-validation job132364867826 passed on1ed99cc; PR28 base
main marked ready via API after all checks passed. No merge/auto-merge/branch
deletion/publication. This documentation-only followup records the observed handoff;
its new CI run may start normally, without changing verified application code.
Next: user reviews PR28 and merges manually after current checks. All Stage1
execution tasks complete; later-stage plans/code remain separate future work.

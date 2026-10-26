# Unequal Lives and Historical Turning Points Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution or superpowers:subagent-driven-development if the user chooses delegation. Steps use checkbox syntax for tracking.

**Goal:** Implement the expansion approved by the user's 2026-10-26 request to implement PR #10, preserving legacy lives and updating that same PR.

**Architecture:** Keep the current simulation as a frozen legacy implementation. Add a separate expanded engine with validated structured state, independent personal/family RNG streams, deterministic regional history, and immutable completed summaries. Route shared UI and persistence through explicit ruleset adapters; enable expanded new lives only after acceptance checks pass.

**Tech Stack:** Existing React 19, TypeScript, Vite, Vitest, React Testing Library, plain CSS and browser localStorage; npm and the existing lockfile. Node.js 22.12+ or a supported Node.js 24 release. No new runtime dependencies or remote services.

**Spec:** [Unequal Lives and Historical Turning Points](../specs/2026-10-25-life-simulation-expansion-design.md).

## Authorization and execution status

The user requested implementation and pushing to the **same PR #10**, superseding the prior planning-only restriction. Treat the referenced spec's proposed details as the implementation baseline. The numerical choices below are builder-authored balance, subject to cohort calibration, not canon claims or separately confirmed user choices.

The installed writing-plans workflow requires review of this concrete plan before code implementation. This document is awaiting that review and execution-method selection. No application changes or verification are implied by its presence. Recommend native execution: the tasks share state, routing and validation contracts, so sequential implementation avoids concurrent schema changes. Do not create another branch, PR, worktree or checkpoint system.

## Global constraints

- Continue `codex/life-simulation-spec`; PR #10 targets `main`. Fetch before resumed implementation and final handoff; never merge/rebase upstream automatically. Human merges manually.
- Save key `six-faced-life.v1`; envelope and base life version 1. Absent ruleset means `legacy-1`; explicit `legacy-1` is accepted. Unknown rulesets fail safely without overwriting storage.
- Expanded ages through 1,000, initial maximum lifespan 800; legacy age ceiling 300. Preserve legacy event IDs, birth pools, RNG order, progression, pending choices and future results.
- New events/choices use `expanded.*` IDs. Separate event registries; the existing `expanded-events.ts` belongs to the legacy catalogue despite its name.
- Bounds: 600 chronicle entries; 64 named close relatives; 32 other named relationships; 256 descendant cohorts; 64 achievements; 128 historical/faction records; 512 summary facts; six distinct lifetime spouses and twelve direct children. All counts are safe integers.
- Retain one active and twenty completed lives; serialized envelope must fit the existing 6,000,000-character loader ceiling. Never evict archive entries to hide quota failure.
- No simulation RNG in rendering; personal RNG, family RNG and immutable world seed are separate. Locale never changes facts or random draws.
- New rules apply only to newly created expanded lives. Keep expanded creation off in the production new-life flow until Task 12 passes.
- English and Thai ship together; life-fixed language and mixed archives remain supported. Latent genetics never appear as player knowledge before discovery.
- Preserve pause-on-decision, hidden-tab suspension, reload paused, immediate choice/focus/study persistence and visible retryable storage failure.
- Preserve the illustrated chronicle, existing fonts/art/licenses, keyboard focus, reduced motion and mobile reading order. Use isolated QA port 5174 or another verified free port; never touch player storage on 5173.
- No deployment, source upload, new service, billing action, automatic PR merge or branch deletion.

## Review focus

1. Unknown rulesets and nearly valid nested records must enter recovery without rewriting the raw save (Tasks 1–2).
2. A same-year queue can become invalid after travel, death or a career change; annual costs/hazards must run only once (Task 3).
3. Scholarship withdrawal and career switching must not mint money, erase prior experience or pay multiple wages (Tasks 5–6).
4. Centuries of relatives can exceed record limits; compaction must preserve exact descendant and carrier counts and summary facts (Tasks 9–10).
5. Watch mode currently chooses the first free low-risk option; new manual-only decisions must remain pending even when that option looks safe (Tasks 3 and 11).

## File and interface map

Paths below are relative to `six-faced-life/` unless prefixed `docs/` or named `CONTINUE.md`.

- `src/game/types.ts`: shared fields and discriminated `Life = LegacyLife | ExpandedLife`; legacy race/career types remain closed. Keep `LegacyLife.ruleset?: "legacy-1"`; require `ExpandedLife.ruleset: "expanded-1"` and `expansion: ExpandedState`.
- `src/game/engine.ts`: retain current exported signatures as routing facade. Move current implementation mechanically to `src/game/legacy/engine.ts`; update relative imports only. Do not alter existing `events.ts`, `expanded-events.ts` or legacy progression algorithms for new rules.
- `src/game/simulation.ts`: presentation-safe selectors and routed `setSpecialization`, progression/title/income/readiness access. UI imports these adapters instead of assuming a legacy race or career. No circular imports back from domain modules.
- `src/game/expanded/{types,balance,random,origins,validation,engine,economy,education,careers,history,politics,genetics,family,summary,events}.ts`: focused expanded domain modules and colocated tests. `events.ts` assembles namespaced event factories; domain modules own their requirements and effects.
- `src/game/storage.ts`: route validators/migration; preserve the existing storage API and recovery contract. Do not cast expanded data through legacy migration.
- `src/i18n/expanded.ts`: typed EN/TH event, requirement, history and summary presentation; integrate through existing `story.ts`, messages and context. Saved identifiers/facts remain canonical.
- Existing `App.tsx`, `NewLife.tsx`, `LifeView.tsx`, `Progression.tsx`, `WorldView.tsx`, `Archive.tsx`: route selectors and add expanded disclosures. Create `ExpandedDetails.tsx` and `Retrospective.tsx` for composed sections without rewriting navigation.
- `src/game/fixtures/legacy-baseline.json`: committed pre-change deterministic fixtures. `docs/verification/life-simulation-expansion.md`: measured acceptance results, seed ranges, final balance and limitations, not screenshots or generated builds.

Public engine API remains `createLife(options?): Life`, `beginLife(life): Life`, `getDecision(life): Decision | null`, `choose(life, choiceId): Life`, `setFocus(life, focus): Life`, `advance(life, mode, deltaYears?): Life`, and mutating `finishLife(life, cause): void` for compatibility. Add `ruleset?: "legacy-1" | "expanded-1"` to creation options; before release its default remains legacy. Expanded module internals accept `ExpandedLife`, never legacy data.

`ExpandedState` version 1 groups `origin`, `calendar`, `economy`, `education`, `career`, `standing`, `politics`, `genetics`, `family`, `facts`, `queue` and nullable `summary`. Every group gets a bounded validator in Task 2 before being persisted. Store `birthYear`, `worldSeed`, `familyRng` and a monotonic person/fact counter. Current year is derived as birth year + age, never independently advanced.

## Task 1: Freeze legacy behavior and establish routing

**Files:** `types.ts`, `engine.ts`, new `legacy/engine.ts`, `simulation.ts`, `legacy-compatibility.test.ts`, `fixtures/legacy-baseline.json`, `storage.ts`, existing engine/progression/storage tests.

**Interfaces:** `isExpanded(life: Life): life is ExpandedLife`; `createLife({ ruleset: "legacy-1", ...options }): LegacyLife`. Existing engine exports continue accepting `Life`.

- [ ] Before moving code, capture deterministic JSON fixtures using baseline commit `238c3e4`: births for seeds 0–99 in both languages, pending `first-memory`, all fixed milestones reached by a scripted policy, promoted-career records and completed lives. Commit script/policy identity with the fixture; never regenerate expectations from the changed engine.
- [ ] Write tests asserting full object equality, including RNG, after every recorded action and load/save boundary. Assert absent ruleset and explicit legacy ruleset produce equivalent legacy futures except the explicit discriminator. Assert unknown rulesets fail load without `setItem` calls.
- [ ] Run `npm test -- src/game/legacy-compatibility.test.ts src/game/storage.test.ts`; record the expected missing-routing failures while baseline fixture comparisons pass.
- [ ] Move the current engine mechanically, add routing, and keep default creation legacy. Preserve legacy pools and catalogue; do not add Superd to a shared pool used by legacy births. Separate display catalogues from frozen legacy race/career records.
- [ ] Run the focused tests and `npm test`; all baseline action checkpoints must match. Commit only task files: `refactor: isolate legacy simulation behind ruleset routing`.

## Task 2: Expanded schema, validation and deterministic origins

**Files:** new expanded `types.ts`, `balance.ts`, `random.ts`, `origins.ts`, `validation.ts` and tests; `types.ts`, `storage.ts`, `simulation.ts`.

**Interfaces:** `createExpandedLife(options: LifeOptions): ExpandedLife`; `validateExpandedLife(value: unknown): value is ExpandedLife`; `draw(stream: { rng: number }): number`; `worldYear(life: ExpandedLife): number`. `LifeOptions` contains name, seed, region, language and ruleset. All stored RNGs are uint32 integers.

- [ ] Test 10,000 deterministic births for repeatability, all 31 birth years, region restrictions and race/wealth/nobility distributions. Test EN/TH equality after removing only language. Unknown ruleset, prototype keys, invalid versions, impossible ages, queue IDs, year relationships, duplicated people, unsafe counts and malformed summaries must fail without writes.
- [ ] Run `npm test -- src/game/expanded/origins.test.ts src/game/expanded/validation.test.ts`; expect missing-module failures.
- [ ] Use the existing pure Mulberry-style RNG algorithm in the new module without changing legacy code. Draw world seed and family seed independently once at birth. Uniform birth year `397 + floor(draw * 31)`. Use spec wealth/noble tables verbatim; Demon pool Migurd 65%, dwarf 30%, Superd 5%. Remove Migurd from any non-Demon expanded birth pool, renormalizing remaining weights. Keep all other existing regional weights. Superd lifespan/max 600/800; retain other race values.
- [ ] Separate birth wealth/status from coins. Child household support and initial purse use poor/modest/comfortable/extreme values 10/20/40/90 and 0/12/40/100 respectively; noble starts use comfortable/extreme 80/20, a patron contact, equipment access and basic schooling. Asura localities Fittoa/capital/countryside 20/15/65. Other regions use one named default locality plus explicitly configured travel destinations.
- [ ] Validate each nested structure with exact enums, string/array bounds, safe integers, parent references and acyclicity; use ruleset-specific age/race/career/event constraints. Unknown expansion version fails recovery. Migrate legacy data only through the legacy migration function.
- [ ] Run focused tests, legacy fixtures and storage round-trips. Check every generated birth with `isLife`; commit `feat: add validated expanded origins and independent random streams`.

## Task 3: Annual transactions, decision queue and manual boundaries

**Files:** expanded `engine.ts`, `events.ts` and tests; shared `types.ts`, facade `engine.ts`, `simulation.ts`.

**Interfaces:** `advanceExpanded(life: ExpandedLife, mode: "year" | "decision" | "tick", deltaYears?: number): ExpandedLife`; `chooseExpanded(life: ExpandedLife, choiceId: string): ExpandedLife`; `getExpandedDecision(life): Decision | null`; `canAutoChoose(life: Life): boolean`. Add `Decision.requiresManual?: boolean` (legacy absent preserves current behavior).

- [ ] Test annual transaction order, two due offers in one year, birth in K417, death before an offer, travel invalidating a queued offer, replay after reload, fractional ticks and ignored invalid deltas. Assert queue drainage changes neither age nor annual expense count.
- [ ] Run `npm test -- src/game/expanded/engine.test.ts`; expect failures.
- [ ] Clone before public actions. Apply annual economy/training/aging and stable cause checks, then historical consequences once, then calendar decisions, personal milestones, family milestones and random offers. Sort within each priority by stable ID. Queue maximum 16; combine same-category notices if needed without dropping durable facts. Resolving memory at age zero schedules applicable birth-year history before the first tick.
- [ ] Revalidate queue items after each choice, recording relevant expired obligations. Dead lives have no queue/pending item. Rejected/disabled/unaffordable choices preserve the original state. Random decisions retain eligible-year 25% chance and three-year spacing; milestones bypass and do not reset that gap.
- [ ] Mark allegiance, marriage, dangerous military service and legendary-duel decisions manual-only. `canAutoChoose` returns false for those expanded decisions; legacy behavior remains unchanged. Wire the actual App guard in Task 11.
- [ ] Run focused tests plus legacy fixtures; commit `feat: add transactional expanded time and persisted decision queues`.

## Task 4: Economy, actionable danger and mortality calibration

**Files:** expanded `balance.ts`, `economy.ts`, `engine.ts`, `events.ts`, `economy.test.ts`, `population.test.ts`; verification report.

**Interfaces:** `applyEconomyYear(life: ExpandedLife): void`; `checkSurvival(life: ExpandedLife): DeathCause | null`; `materialNeeds(life): NeedWarning[]`. Cause IDs distinguish malnutrition, illness, unsafe work, violence, travel and aging.

- [ ] Test children receive household support rather than wages; unmet food/shelter/care remain recorded at zero coins. Test actual expenses, dependants, rest without resources, immediate lethal choices and matching death causes. Add frozen 10,000-Superd and matched-resource cohort runners before hazard implementation.
- [ ] Run focused economy/population tests and record red results.
- [ ] Initial annual prices: food 8, shelter 6, care 4, child dependant 4, spouse dependant without income 6; no debt. Adults pay from current occupation income and purse; children receive resource support independently of purse. Work focus adds 6 income only with actual employment, explore adds 4 travel cost, instruction costs 8 when chosen. Household aid costs 8 and grants two years of +12 resource support; community protection costs time/relationship service and halves violence exposure for three years. Display costs/duration before selection.
- [ ] Check causes in order malnutrition → illness → unsafe work → violence → travel → aging, stopping at the first death. Initial annual probabilities: malnutrition `0.018 * unmetFood/8`; illness `0.002 + 0.006 * unmetCare/4 + 0.003 * unmetShelter/6`; unsafe work 0.003 only on unsafe work; unprotected Superd childhood persecution coefficient initially 0.135; active conflict adds severity-based violence 0.005/0.02/0.06; travel 0.004 only when exposed. Health below 35 doubles illness, rest multiplies illness by 0.7, protection multiplies violence by 0.5. Bound each probability to [0, 0.9]. Existing race lifespan aging bands remain; health failure has a recorded causal contributor.
- [ ] Calibrate only explicit balance coefficients using fixed cohorts, never death quotas: Superd death age <15 must be 87–93%; adequate-care/protected cohort improves survival by ≥10 percentage points. For other races matched poor cohorts must have ≥2× comfortable childhood mortality and ≥5 percentage points difference, with poor survivors and nonzero comfortable mortality. Freeze seed enumeration, selection policy and final coefficients in report. Select Superd via rejection sampling uniformly spaced uint32 birth seeds until 10,000 Superd births; report both attempted births and qualifying count, never select by survival.
- [ ] Run `npm test -- src/game/expanded/economy.test.ts src/game/expanded/population.test.ts` with a bounded measured timeout; record counts by age/cause/race. Commit `feat: model household needs and calibrated survival risks` only after benchmarks pass.

## Task 5: Talent discovery and funded education

**Files:** expanded `balance.ts`, `genetics.ts` (talent fields only), `education.ts`, `events.ts`, `education.test.ts`, validators and presentation requirements.

**Interfaces:** `educationRequirements(life): Requirement[]`; `applyEducationYear(life): void`; `Requirement = { id: string; met: boolean; current: number; required: number }`. Facts and event IDs carry school entry, assessment, scholarship, probation, withdrawal, interruption and degree completion.

- [ ] Test poor exceptional pupils can qualify through a free assessment; poverty or latent factor alone never qualifies. Test wealthy unready rejection, full travel/living support, one probation year, withdrawal, four successful years to graduate, and restored pending assessment.
- [ ] Run `npm test -- src/game/expanded/education.test.ts`; expect failures.
- [ ] Independent birth draws give magical/academic exceptional potential at 1% each. Free literacy/basic practice and public teacher assessment open at age 8. University entry age ≥15, knowledge ≥40 and either observed magical XP ≥60 or academic assessment ≥60. Exceptional relevant potential plus assessment ≥60 qualifies for full scholarship. Paid route costs admission 80, annual tuition 40, living 18 and actual travel cost (Demon 120, Begaritt 90, others 40); reserve family funding explicitly rather than minting purse coins.
- [ ] Successful year requires study/magic focus and ≥12 relevant XP or ≥3 knowledge progress. First failed scholarship year warns/starts probation; another failed year withdraws, while a successful probation year restores standing. No retrospective debt. Four successful attendance years confer the degree; interrupted years remain on record. Ordinary literacy and healing teaching remain possible without university.
- [ ] Run focused tests with survival disabled only in controlled fixtures, then integrated seeded survival tests without bypasses. Commit `feat: add discovered talent and budgeted education paths`.

## Task 6: Independent careers, status and realistic access

**Files:** expanded `careers.ts`, `balance.ts`, `events.ts`, validators/tests; `simulation.ts` adapter.

**Interfaces:** `careerRequirements(life, career: ExpandedCareer): Requirement[]`; `careerIncomeExpanded(life): number`; `applyCareerYear(life): void`; `careerOffer(life, career): Decision | null`. Maintain per-career ledger `{ xp, years, level, reputation, appointments }`; primary occupation alone pays wages.

- [ ] Test every entry gate and promotion, ordinary work for healthy/limited-health adults, commoner/noble knights, degree versus professor appointment, switch/re-entry, dismissal, retirement, preserved experience and one income source. Test eligibility does not create a guaranteed prestigious offer.
- [ ] Run `npm test -- src/game/expanded/careers.test.ts`; expect failures.
- [ ] Centralize thresholds in balance: all working entry age ≥15; adult-only dangerous service ≥18. Farmer/local labor health ≥20 (limited-health household work below 20), base income 20/12; merchant knowledge ≥20 and capital 30, pay 30; guard sword XP ≥40, pay 28; adventurer health ≥45, sword or magic XP ≥30 and registration 10, pay 32; swordsman sword XP ≥80 and recognized instruction, pay 34; mage relevant school XP ≥100 and instruction rank ≥2, pay 38; healer healing XP ≥50, pay 30; cleric healing XP ≥50, knowledge ≥35 and institution trust ≥30, pay 28; knight sword XP ≥150, recognized service ≥3 years, equipment 120 and patron contact, pay 45; teacher knowledge ≥40, subject XP ≥50 and reputation ≥10, pay 28; professor degree, subject XP ≥500, research ≥2, teaching ≥5 years and reputation ≥50, pay 60. Noble access pays equipment from reserved family resources; commoners earn patronage through service/reputation ≥30. Wealth never substitutes for skill.
- [ ] Promotion levels 1–3 require career XP 60/180/400, years 2/5/10 and reputation 10/25/50 plus vocation competence; add pay 8/18/32. Ordinary appointments are always accessible for eligible adults; other eligible appointments have 10% chance within a regular random opportunity, professor 2%. Switching requires an actual offer; retirement retains history with income 8 only when a recorded pension exists.
- [ ] Birth nobility remains separate from occupation. Exceptional service ≥5 major public-service facts and renown ≥70 permits a grant offer, not automatic noble status. Record promotions, refusal, losses and switches durably. Verify UI readiness selectors use identical requirements.
- [ ] Run focused tests and integration economy tests; commit `feat: add gated careers with persistent work and status histories`.

## Task 7: Local history and deterministic original conflicts

**Files:** expanded `history.ts`, `events.ts`, `balance.ts`, tests and validators; world-guide presentation data.

**Interfaces:** `regionalConflict(worldSeed: number, region: RegionId, year: number): Conflict | null`; `applyHistoryYear(life): void`; `historicalDecisions(life): QueuedDecision[]`. Exposure IDs: civilian, participant, support, remote-news; no record means no exposure, never implied service.

- [ ] Test Fittoa direct victims, other Asura residents, distant observers, K417 births and post-event births. Test Asura K424–425 fixed Ariel outcome; travelling cannot reroll a regional schedule; adults and children receive different roles. Test family losses require actual local exposure and survival checks.
- [ ] Run `npm test -- src/game/expanded/history.test.ts`; expect failures.
- [ ] Schedule fixed Calamity K417 and succession K424–425. Direct Calamity requires Fittoa locality; consequences can displace the protagonist and household, updating actual region/locality together. News never grants war achievements. Active military roles require adult consent; aid/neutral civilian outcomes remain valid.
- [ ] Derive each region's schedule from its immutable seed, iterating from K397 to requested year (maximum 1,030 years), 3% start chance outside cooldown, 1–3 year duration, at least five quiet years after a conflict ends before another start. Derived draws never consume personal/family RNG. Cache only immutable results, with no save dependence on cache state. Mark all original conflicts and all post-K430 continuation as authored.
- [ ] Record bounded exposure/action facts and durable totals before pruning detail. Preserve fixed historical outcomes regardless of player skill/faction. Run queue, reload and history tests; commit `feat: add locality-aware history and reproducible regional conflicts`.

## Task 8: Optional allegiances and exceptional titles

**Files:** expanded `politics.ts`, `events.ts`, `balance.ts`, tests and validators; `simulation.ts` manual decision adapter.

**Interfaces:** `factionOffer(life, faction): Decision | null`; `titleChallenge(life, position: 5 | 6 | 7): Decision | null`; `applyPoliticalYear(life): void`.

- [ ] Test age/date/contact gates, no membership on refusal, five-year refusal cooldown, one active allegiance, explicit costly defection, obligations after K430, manual-only offers and inability to obtain positions 1–4 from choices or normalized saves.
- [ ] Run `npm test -- src/game/expanded/politics.test.ts`; expect failures.
- [ ] Hitogami offers K417–430, Orsted K425–430, age ≥18, observed contact plus skill XP ≥100 or reputation ≥20. Eligible contact-year chance 2%, inside the normal random-decision slot (no extra interruption); consume the qualification roll each eligible year and record a candidate only if that year's normal random slot succeeds. Refusal stores year; retry after ≥5 years. Offer shows pay, assignment terms, family risk and refusal. Membership adds obligations/assignments, not permanent free stats. Defection requires explicit event, loses trust and creates three years of pursuit exposure.
- [ ] Challenges only after K430 with combat XP ≥2,000, instruction rank ≥5, renown ≥90 and three distinct major feats. Positions 5–7 are a separate title track. Victory probability bounded 15–60% from readiness; losing can injure/kill, declining is safe. Title defense can lose title while retaining the win/loss history. Never name or kill a canon incumbent as a simulation shortcut.
- [ ] Run focused tests, validator adversarial cases and annual queue tests; commit `feat: add consequential faction offers and bounded legendary titles`.

## Task 9: Persistent genetics and individual family lives

**Files:** expanded `genetics.ts`, `family.ts`, `events.ts`, `balance.ts`, validators and tests.

**Interfaces:** `generateGenetics(stream, parents: readonly Genetics[]): Genetics`; `applyFamilyYear(life): void`; `marriageRequirements(life, partnerId): Requirement[]`; `descendantCounts(life): { born: number; survivingChildren: number; survivingDescendants: number }`.

- [ ] Test spontaneous/one-/two-carrier probabilities, appearance with no training bonus, mana drawback, stable inheritance across reload and no latent diagnosis in presentation. Test both spouses ≥18, Millis monogamy, accepted concurrent marriage elsewhere, refusal, divorce, widowhood, remarriage and six-distinct-spouse limit. Test twelve direct children, mixed ancestry, adult descendants' families, no related partnerships, independent deaths and RNG streams.
- [ ] Run `npm test -- src/game/expanded/genetics.test.ts src/game/expanded/family.test.ts`; expect failures.
- [ ] Generate parents before protagonist genetics. Factor 0.1% without carrier parent, 20% with one, 40% with two; manifestation mana/appearance/physical 60/25/15, half mana cases impaired battle aura. Mana potential multiplies practice 1.25 only with instruction/resources; physical potential multiplies sword practice 1.15; aura impairment caps sword instruction at rank 2. Appearance gives no combat bonus. Discovery requires observed manifestations or assessment; green hair alone never diagnoses Superd/factor. Keep latent data out of selectors/narration.
- [ ] Family records contain unique ID, parent IDs, ancestry, primary race, birth/death year, relationship strength and marital intervals. Mixed child's primary race is a seeded 50/50 parent draw and lifespan is mean parental race bands with ±10% seeded variation bounded by race maxima; actual home is birthplace. Never create a seventh selectable race.
- [ ] Independent family RNG handles education, work, partnerships, births and deaths; never call full player engine recursively. Annual adult partnership chance 3%, partnered birth chance 4% while both ages 18–45, maximum four children per NPC couple. New partners are unrelated generated outsiders. First-release common adult cutoff is a scope/balance choice even for long-lived races. NPCs receive their own livelihood/support and cause checks. Direct player births require an explicit family decision and mutual agreement, not an automatic partner flag.
- [ ] Preserve base `family` only as a derived compatibility display if necessary; expanded facts are authoritative. Validate no duplicate or cyclic parents, impossible marriage ages or live/dead contradictions. Run focused tests plus century-long deterministic family simulations; commit `feat: add individual relationships descendants and inherited traits`.

## Task 10: Bounded durable facts and immutable retrospectives

**Files:** expanded `summary.ts`, `family.ts` compaction, validators and tests; new `components/Retrospective.tsx`, integration in `Archive.tsx` deferred to Task 11.

**Interfaces:** `compactExpandedRecords(life): void`; `buildSummary(life: ExpandedLife): CompletedSummary`; `legacySummary(life: LegacyLife): LegacySummary`; `presentSummary(summary, language): SummarySections`. `finishLife` creates the snapshot synchronously once; reads never simulate or mutate.

- [ ] Test early death, ordinary farmer/teacher, failed scholarship, interrupted career, lost title, multiple marriages, childless and non-romantic life, unknown legacy descendants, observed versus latent factor and 800-year ledger retention. Assert ending and archive return equal summary content and summary counters match underlying facts.
- [ ] Run `npm test -- src/game/expanded/summary.test.ts`; expect failures.
- [ ] Keep direct spouses/children and parents individually; distant people compact only after their personal records are no longer needed for pending relationships. Cohorts keyed by generation, birth year, ancestry/lifespan band, survival and factor state; preserve independent demographic RNG state and exact counts. Never approximate dead/alive status from missing detail. Bound new cohort creation by merging only equivalent bins, preserving exact totals and future hazards via count-based binomial sampling; cap generation count at the physically reachable age/18 bound. If representation cannot retain exact semantics at 256 cohorts, revise encoding before claiming the cap passes.
- [ ] Summary retains identity/ending, childhood/resources/protection, discovered talents, education, career ledger, standing/politics/history, all marriage intervals, distinct spouses, children and surviving descendants, important relationships, final/peak wealth/assets/reputation/titles and community contributions. Facts surviving chronological detail pruning remain available. Legacy summaries use recorded facts only and explicitly unknown fields.
- [ ] Author local EN/TH templates linking circumstances, decisions and outcomes without inferred motives. English narrative targets 80–180 words for early deaths, 200–450 ordinary lives, maximum 650 extensive lives; Thai conveys equivalent facts without word-count enforcement. Snapshot stores canonical facts and fixed bilingual narrative, so archived text does not silently change with future balance.
- [ ] Construct maximum-bound active + twenty archived lives, measure JSON length <6,000,000 and real browser write/read in isolated QA. Bound strings explicitly so passing a small random fixture is insufficient; if maxima do not fit, use dictionary IDs/normalized factual text rather than lowering retention or evicting archives. Run repeated restoration/compaction and exact-count tests. Commit `feat: preserve bounded family facts and immutable life retrospectives`.

## Task 11: Integrate the illustrated chronicle and full Thai presentation

**Files:** `App.tsx`, existing components, new `ExpandedDetails.tsx`, `Retrospective.tsx`, `simulation.ts`, `src/i18n/expanded.ts`, `story.ts`, `messages.ts`, `styles.css`, component/App/language/catalogue tests.

**Interfaces:** `raceDetails(life)`, `careerDetails(life)`, `progressionView(life)`, `expandedDetails(life)` return presentation-safe models without latent genetics; `canAutoChoose(life)` from Task 3 guards actual watch callbacks. Existing legacy components use adapters without changing their displayed behavior.

- [ ] Add failing tests for age + K-year, origin/wealth/status, extreme Superd survival warning, actionable material needs, career requirements, scholarships, faction obligations, family disclosure and retrospective consistency. Test EN/TH coverage for every expanded event/choice/outcome/requirement/message ID; no empty strings or fallback English for new Thai material.
- [ ] Add App tests with watch active for manual faction/marriage/service/duel offers, hidden tab during a queued choice, reload of a multi-offer year, immediate focus/study saving, failed writes and untouched unreadable storage. Test canceling new-life language preview and mixed legacy/expanded archives.
- [ ] Run focused App, language and catalogue tests; expect red for missing UI/guard.
- [ ] Integrate selectors into birth/character/progression/world/family/ending views; show concise main facts and native disclosures for deeper ledgers. Explain historical adaptation, authored balance and unverified chronology boundaries using the spec's source notes. Keep latency-free local templates; don't expose raw JSON or hidden genetics.
- [ ] Apply the `impeccable` skill when implementing the new UI sections, preserving DESIGN.md and sidecar tokens. Keep visible keyboard focus, manual outcome focus behavior, mobile order and reduced motion. No artwork/font replacements or navigation redesign.
- [ ] Run full `npm test` and `npm run build`. Browser-check desktop 1280px and phones 390px/320px in both languages, keyboard choices/disclosures/playback, reload paused, archives, overflow and console errors using isolated origin. Record actual evidence and limitations. Commit `feat: present expanded lives and safe manual decisions in English and Thai`.

## Task 12: Release gate, population evidence and same-PR delivery

**Files:** facade `engine.ts` default only after acceptance, integration tests, `docs/verification/life-simulation-expansion.md`, README/PRODUCT/DESIGN/sidecar where behavior changes, plan ledger and `CONTINUE.md`.

- [ ] Recheck usage and Git status; fetch origin. If upstream advanced, report distance without integrating it. Do not redo completed task checks without a new change or unresolved concern.
- [ ] Add a failing integration assertion that a production new-life form creates `expanded-1` while a fixture legacy life retains its exact next states. Keep the switch red until Tasks 1–11 and required cohorts pass.
- [ ] Review all acceptance sections in the spec against the measured report: deterministic legacy futures, expanded restore at each subsystem boundary, 10,000-birth distributions, mortality/protection cohorts, every career and degree route, factions/title exclusions, genetics, centuries of families, immutable EN/TH summaries, maximum-size saves and recovery. Fix any gap before changing default; do not call an incomplete subset the complete expansion.
- [ ] Enable expanded creation by default in the app/facade with explicit legacy creation retained for fixtures and compatibility. Update existing tests that intentionally exercise legacy to request it explicitly; never silently regenerate old baseline expectations. Rerun full `npm test` and `npm run build` after this final code change.
- [ ] Browser-check a normal new-life start to ending/archive/reload and prepared histories/scholarship/faction/family states on isolated QA origin. Capture console errors and desktop/mobile overflow; test real write/read size. Never clear player browser storage. Stop only owned QA server/tab resources.
- [ ] Apply requesting-code-review and verification-before-completion skills. Review entire branch, not only the last commit; fix required findings and rerun affected checks. Update checkpoints with exact commits/checks, usage observation/reset times and remaining limitations. Do not claim remote CI based on local tests.
- [ ] Run `git diff --check`, inspect complete diff against `origin/main` including untracked files and final status. Commit only task-owned paths, push explicitly to `origin codex/life-simulation-spec`, and update **existing PR #10** with implemented scope and actual verification. Keep draft until required checks pass; no new PR.
- [ ] Fetch before handoff; verify `git merge-base --is-ancestor origin/main HEAD` and report freshness. Leave user to merge manually. No deployment or branch deletion.

## Progress ledger

| Task | State | Evidence / next action |
| --- | --- | --- |
| Plan | Approved for execution | User: "let implement it" on 2026-10-26; native execution |
| 1 | Legacy extraction verified | 21,168 full-state SHA256 checkpoints captured before edits from 200 EN/TH lives at baseline 238c3e4. Unknown-rules rejection RED→GREEN; full suite 106/106 passed. Routing facade established; expanded dispatch follows Task 2. |
| 2 | Foundation verified | 10,000 seeded origins and malformed expanded restoration tests pass; 108/108 suite; TypeScript/Vite build passes (existing chunk warning). Expanded creation remains unavailable in production UI. |
| 3–10 | Implemented; final review pending | Expanded domain modules and RED→GREEN checks; 500 complete seeded lives remain valid with restored decision futures equal. Full-engine 10,000-Superd cohort 89.72% death before 15; protected/adequate-care cohort 73.02%. Hazard-only 91.49%/68.93%; matched other races 14.78% poor vs 4.35% comfortable. |
| 11 | Implemented; final review pending | English/Thai details, immutable retrospective, manual watch guard, actual pay/requirements and world guide integrated. Desktop 1280 and phones 390/320 inspected; no overflow/captured warnings/errors in inspected flows. |
| 12 | In progress | Full suite 169/169 passed before default switch. Explicit legacy fixtures unchanged; default-routing and Thai new-life checks 13/13 passed after switch. Final full suite, final browser form, whole-branch review and delivery pending. |

Ruling: preserve the base career enum for the shared spellbook/legacy-facing fields and store the expanded primary occupation in its independent ledger — avoids adding new occupations to the legacy event/migration registry — all expanded pay and public occupation labels must use expanded selectors.
Ruling: record academic family funding in a reserved education budget, not a purse deposit — prevents double wages and minted tuition allowances — validator and recovery tests must retain the reserve.
Ruling: add optional lossless dictionary encoding for large mixed/expanded envelopes while keeping key/envelope version 1 — the 20-full-chronicle fixture otherwise exceeded the 6,000,000-character loader ceiling — unknown/corrupt encodings enter recovery; small legacy saves retain their exact representation. Measured 7,644,765 characters before encoding, 1,140,474 after, with complete equality after reload.
Ruling: large seeded tests yield periodically to Vitest rather than extending a global timeout — a synchronous cohort caused a worker RPC timeout despite passing assertions — draws and sample sizes stay unchanged. Aggregate genetics invariant failures instead of issuing hundreds of thousands of redundant assertion calls; a shared-CPU 5-second failure became a ~73ms check without dropping samples.

Ruling: use this existing tracked ledger and existing PR branch rather than a second scratch checkpoint/worktree — repository/user instructions explicitly require continuing the same task branch and checkpoint — no parallel checkout isolation.
Ruling: baseline fixtures use SHA256 of each complete serialized state instead of duplicating every full life JSON — 21,168 checkpoints remain sensitive to all fields/RNG while keeping the committed fixture bounded — hash failures require reproducing the named seed/action to inspect field differences.
Pre-flight: Tasks 2–10 share ExpandedState and validation; define the complete bounded schema before adding domain effects. Tasks 3/7/8/9 share the persisted queue; factories derive offers from current state and revalidate after choices. Tasks 4/5/6 share resources; only economy applies annual income/expenses. Tasks 9/10 share person/cohort facts; compaction cannot discard live ancestry needed by future simulation. Task 11 consumes presentation-safe selectors and manual-only decisions; it cannot inspect latent genetics.

Self-review: spec requirements map to Tasks 1–12; five review risks each have explicit owning tests; public routing retains current engine signatures; balance and typed per-career/schema boundaries are explicit. Calibration values are initial builder choices, not measured outcomes. Cohort exactness and storage worst-case size are release blockers until proven. The original five phases are represented by foundation (1–3), survival/opportunity (4–6), history/politics (7–8), inherited family/summary (9–10), and presentation/release (11–12); localized presentation data accompanies each earlier domain task.

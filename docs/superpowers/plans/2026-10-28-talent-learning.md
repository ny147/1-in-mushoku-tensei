# Talent Learning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give 60% of new expanded lives one useful talent with +25% relevant learning.
**Architecture:** Extend current genetics, validation and active-save migration.
Share a pure talent multiplier across existing learning paths and the bilingual
assessment presentation; leave legacy simulation and archive snapshots intact.
**Tech Stack:** Existing React, TypeScript, Vite, Vitest; no dependencies.
**Spec:** [Approved design](../specs/2026-10-28-talent-learning-design.md).

## Global Constraints

- Birth odds: magic 20%, academic 20%, swordsmanship 20%, none 40%; mutually exclusive.
- Relevant positive learning multiplier 1.25; preserve fractions and knowledge cap 100.
- Preserve existing saves, RNG streams, pending choices and historical summaries.
- No talent required for ordinary careers; no sword-only university scholarship.
- Task branch and PR to main, manual merge, no publishing.

## Review Focus

- Pre-change active and ended lives, including double talents, must load unchanged except active missing sword=false.
- Repeated assessment, migration, pause/reload and render must not reroll or consume RNG.
- Training pauses/completion must not repeat or compound a milestone bonus.
- Fractional magic gains must match aggregate and selected-school XP for focus/choice paths.
- Sword talent must stay hidden before assessment and never imply scholarship eligibility.

## Task 1: Persisted categorical talents

Files: `expanded/genetics.ts`, `expanded/types.ts`, `expanded/validation.ts`,
`game/storage.ts`; tests in new `expanded/talents.test.ts`.

Interfaces: `talentMultiplier(life: ExpandedLife, kind: "magic" | "sword" | "academic"): number`;
`migrateTalents(life: ExpandedLife): ExpandedLife`. Optional `Genetics.swordTalent: boolean`.

- [ ] Write failing deterministic birth/distribution tests (10,000 seeds; each talent 18–22%, none 38–42%, never >1), RNG alignment and old-save restoration/malformed flag tests.
- [ ] Observe failures using `npm.cmd test -- --maxWorkers=2 src/game/expanded/talents.test.ts`.
- [ ] Implement categorical generation, shared multiplier, validator and active-only nonrandom migration; preserve old flags and archives.
- [ ] Verify focused tests; commit task files.

## Task 2: Learning benefits and assessment

Files: `expanded/engine.ts`, `expanded/training.ts`, `expanded/careers.ts`,
`i18n/education.ts`; new `expanded/talent-learning.test.ts` and existing
`components/ExpandedDetails.test.tsx`.

Consumes Task 1's talent multiplier; existing `trainingMultiplier` combines it
with existing inherited-factor annual-practice behavior. Academic positive
knowledge gains use the academic multiplier; negative effects remain unchanged.
Training computes boosted targets from baseline milestone targets to avoid
compounding. Existing occupation XP boundaries retain their existing destinations.

- [ ] Write failing integration tests: annual magic 9→11.25 with selected-school parity, sword 9→11.25, study knowledge 4→5 and cap100, choice XP12→15, unrelated/no-talent behavior, factor stacking, course targets 30→37.5 without repeated credit, work gains4→5/5→6.25, old-save reload equivalence.
- [ ] Add EN/TH sword assessment/name/+25% output and hidden-before-assessed tests. Keep restored double talent coverage; explicitly clear all three flags in ordinary fixtures.
- [ ] Observe RED, then implement minimal learning-boundary and copy changes.
- [ ] Verify focused tests, then full `npm.cmd test -- --maxWorkers=2` and `npm run build`; inspect output and fix regressions.
- [ ] Check assessed/unassessed/ordinary states, actual learning and reload in isolated port5174 browser; inspect desktop/mobile, keyboard and console.
- [ ] Update PRODUCT/README and CONTINUE, commit task-owned files, request fresh read-only whole-branch review, resolve findings, fetch/freshness check, push and create PR targeting main.

## Execution ledger

- Setup: clean checkout, fetch succeeded; branch `codex/talent-learning-balance` from current `origin/main`. Native inline execution follows the user's explicit request to update the approved change; no additional execution-method question.
- Ruling: work in the clean checkout on its required task branch, following AGENTS.md, rather than creating a separate worktree.
- Ruling: a versioned replacement talent enum would invalidate old dual-talent lives; use an optional sword flag with active-only migration.
- Task 1 complete: birth overlap/migration/validation failed RED, then 30/30 tests passed across talents, family and storage (1.60 seconds). 10,000 seeded protagonist births meet 20/20/20/40 bounds; old dual talents and archive snapshots survive restoration. RNG alignment is preserved.
- Pending: Task 2 RED.

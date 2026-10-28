# Event effect clarity implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Explain character consequences before and after event choices in EN/TH.
**Architecture:** Pure localization helpers read canonical choices and before/after
life snapshots. Existing buttons/results render their text; only household-aid
resource accounting changes simulation.
**Tech Stack:** React, TypeScript, Vite, Vitest/RTL; no new dependencies.
**Spec:** ../specs/2026-10-28-event-effect-clarity-design.md

## Global constraints

- Preserve stable IDs, saved lives, RNG, pause behavior and legacy rules.
- Keep unassessed talents and latent genetics hidden.
- Preserve existing inclusive aid expiry and child purse behavior.
- Use the existing illustrated chronicle and EN/TH localization.
- Deliver on codex/event-effect-clarity, PR base main, manual merge.

## Review focus

- Capped stats and fractional/hidden talent learning must not overpromise.
- Risk markers are not universal fatal probabilities; declines grant no rewards.
- Domain changes may occur without any basic stat gain.
- Old expanded saves may lack finance/training; presentation must remain read-only.
- Aid must work across age 15, expiry and save restoration without doubling.

## Task 1: Household aid

Files: expanded/economy.ts and economy.test.ts; use existing storage validation.
- [x] RED: purchase/advance tests for adults, children, age 15 and expiry/restore.
- [x] Add active allowance once after selecting child/adult resources.
- [x] Run focused economy tests and inspect resource/coin accounting.

## Task 2: Before-choice effects

Files: new i18n/choice-effects.ts and expanded-choice-effects.ts with tests;
components/LifeView.tsx and styles.css.
Interface: choiceEffects(life: Life, choice: Choice, language: Language): string[].
- [x] RED: actual gains, hidden/assessed talent, cap, domain consequences,
  risk/decline/navigation, read-only snapshots and bilingual button rendering.
- [x] Implement pure previews for structured fields and expanded actions.
- [x] Render compact labeled effects, preserving narrative and existing fees.
- [x] Run focused tests; no simulation/RNG call is permitted in previews.

## Task 3: Actual outcomes and delivery

Files: new i18n/choice-changes.ts, components/ChoiceOutcome.tsx and tests;
README.md, PRODUCT.md, DESIGN.md, CONTINUE.md and this ledger.
Interface: choiceChanges(before: Life, after: Life): string[].
- [x] RED: actual domain state, capped/fractional gains, unsuccessful actions,
  old saves, localized outcome rendering and save/reload behavior.
- [x] Extend existing feedback using actual before/after values only.
- [x] Run full npm test and npm run build; inspect isolated browser flows.
- [x] Review complete diff, fix issues, update checkpoint, fetch, commit/push/PR.

## Progress ledger

- Clean start confirmed; fetched origin/main 417e272 and created task branch.
- Usage at start: five-hour 95% remaining; weekly 90% remaining.
- Design reflects the user's approved audit update; execution proceeds inline.
- Aid adult/age-15 tests failed first, then all six economy cases passed.
- Eight preview UI cases failed first; six new outcome cases and the fractional
  Thai case failed first. All pass. Additional RED→GREEN checks cover Thai cap
  labels, purse caps and the mana developed by actual practice.
- Final: fixed income/stipend review finding — promoted-job/full-time-stipend and
  work-focus-income tests RED→GREEN; shared annual income accounting removes drift.
- Final full suite: **302/302 tests, 45 files**, 68.35s, via
  `npm.cmd test -- --maxWorkers=2`. `npm run build` passed with existing >500kB
  advisory. Frozen legacy compatibility and seeded/save restoration tests pass.
- Browser QA at isolated 5174: 1280px desktop, 360px mobile, EN protection and TH
  child choice, wrapping/overflow, keyboard outcome focus, paused reload retaining
  focus, adult aid fee/expiry and annual resources (992 → 986 after necessities).
  No application errors observed; one invalid disposable fixture was corrected
  before QA. Player 5173 storage untouched. Ignored fixture and screenshot remain
  local only. React component review retained native buttons and existing focus.
- Impeccable detector ran once; it reports existing stylesheet/font/token drift
  outside the changed rules. New effects use existing ink and inherited type.
- Fresh origin/main remains 417e272; branch includes it. Usage at 19:21 Bangkok:
  five-hour 67% remaining; weekly 85% remaining. Delivery/checkpoint below.
- Implementation 9422c9a pushed on codex/event-effect-clarity. PR #15 targets main,
  is ready for human review and attached to the chat. Local checks pass; remote CI
  is pending observation. Documentation follow-up records delivery. No remaining
  source work, no deferred reviewer findings; user merges manually. No deployment.

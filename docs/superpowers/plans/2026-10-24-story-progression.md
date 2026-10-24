# Story and Progression Expansion Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, with test-driven implementation and one final review. The user chose this expansion on 2026-10-24; keep the approved interface and local-only delivery.

**Goal:** Give repeated lives more distinct stories and make magic and careers reward deliberate choices.
**Architecture:** Extend the pure life engine with an optional, versioned progression record. Migrate existing saves without changing their random state, pending decision, history, wealth, or accumulated training. Author new conditional events in a separate catalogue and expose progression in the existing character rail/page.
**Tech Stack:** Existing React/TypeScript/Vite/Vitest; no new dependencies or backend.
**Spec:** Approved 2026-10-23 first-release design plus the user's 2026-10-24 choice: more story events and deeper magic/career progression.

## Global constraints
- Preserve current local saves and all existing event/choice IDs.
- Keep a free, enabled fallback in every decision; no spending or effects from unavailable choices.
- Instruction and practice both gate spell mastery. Selecting a school does not grant experience.
- Promotions require career experience and relevant skills, and are accepted through a decision.
- Remain local; no source uploads or deployment.
- Preserve the approved parchment/green chronicle; add useful controls and readable progress rather than redesigning it.

## Decisions for this continuation
- Five study tracks: water, fire, earth, wind, and healing. Each tracks experience and learned spells; the chosen discipline receives deliberate practice. Existing aggregate magic experience remains intact.
- A childhood specialization decision appears at age eight, with later study selection available in the training panel.
- Working vocations gain experience and reputation; three promotion steps provide new titles and increased income. Changing vocation starts its own career track; retirement never inherits a promoted salary.
- Add at least 25 new events: childhood/mentor discoveries, branching research, spell assessments, profession-specific dilemmas, regional stories, living-family decisions, and later-life legacy choices.
- Newly added career experience starts counting with this update. Legacy magical experience seeds its existing named discipline; migration does not fabricate history or reroll anything.

## Task 1 — Progression rules and compatibility
Files: `src/game/types.ts`, `progression.ts`, `progression.test.ts`, `engine.ts`, `storage.ts`, `storage.test.ts`.
Interfaces: `getProgression(life)`, `setSpecialization(life,school)`, `careerIncome(life)`, `careerTitle(life)`, `canPromote(life)`, yearly/choice progression helpers, nested save validation/migration.
- [x] Write and run failing tests for school-specific growth, rank-gated spell learning, promotion eligibility/pay, career changes/retirement, and legacy migration/corruption.
- [x] Implement deterministic progression and integration; run tests to green.

## Task 2 — Conditional stories
Files: `src/game/expanded-events.ts`, `events.ts`, `progression.test.ts`.
- [x] Test unique event IDs, complete magic/career routes, free fallbacks, branching prerequisites, and living-family conditions.
- [x] Implement at least 25 new event definitions, with outcomes affecting the new progression and later opportunities.
- [x] Run complete seeded lives across schools/vocations; verify bounded state, endings, and repeat cooldowns.

## Task 3 — Interface and verification
Files: `src/components/Progression.tsx`, `LifeView.tsx`, `App.tsx`, `styles.css`, UI tests and documentation.
- [x] Show study selection, learned/next spells, role/title, career experience, promotion requirements, and income in the incumbent layout.
- [x] Verify old-save restore and new progression interactions through UI tests and desktop/mobile browser checks.
- [x] Obtain a fresh review, fix material findings with regressions, and verify the complete suite and production build.
- [x] Update README, CONTINUE.md, and a new local source checkpoint for this completed version.

## Review focus
Legacy pending choices, prototype-key save corruption, profession changes with stale rank, retirement pay, invisible/disabled progression choices, and higher-rank spells unlocking without instruction.

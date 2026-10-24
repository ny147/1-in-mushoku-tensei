# Six-Faced Life Implementation Plan

Status: completed. The original checkboxes below are retained as the planning record; see the [implementation ledger](2026-10-23-six-faced-life-progress.md) for completion and verification, the [expansion plan](2026-10-24-story-progression.md) for subsequent work, and [CONTINUE.md](../../../CONTINUE.md) for current state. Do not restart this plan from unchecked boxes.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ship the approved reincarnated-protagonist life simulator with a complete birth-to-ending loop.
**Architecture:** React interface over a pure, seeded TypeScript life engine. Versioned browser storage persists active lives and an archive. Original artwork provides the scene; the application is a static Vite build.
**Tech Stack:** React, TypeScript, Vite, lucide-react, Vitest.
**Spec:** `docs/superpowers/specs/2026-10-23-six-faced-life-design.md` (approved 2026-10-23).

## Global Constraints
- English UI; original reincarnated protagonist with memories.
- Complete childhood, adulthood, aging, endings, replay, local saving.
- Pending decisions pause every advance mode. No negative accidental balances or invalid stats.
- Research files never enter the shipped application.
- Parchment, ink, restrained green/gold; keyboard, mobile, reduced motion.

## Review Focus
- Restoring a pending decision must not change its choices or reroll randomness.
- Long-lived races must finish without unbounded loops or endless childhood.
- Unaffordable choices must never charge money or advance the story.
- Storage exceptions and corrupt data must leave a playable interface and recovery message.
- Timed playback must stop when a decision or ending appears, including background tabs.

### Task 1: Seeded simulation
Files: `six-faced-life/src/game/{types,world,events,engine}.ts`, `engine.test.ts`, package/build configuration.
Interfaces: `createLife({name?,seed?,region?}): Life`, `advance(life,mode): Life`, `choose(life,choiceId): Life`, `setFocus(life,focus): Life`, `getDecision(life): Decision | null`.
- [ ] Write tests for coherent births, deterministic runs, decision interruption, costs, progression, and completed lifetimes across seeds.
- [ ] Run tests and confirm missing-engine failures.
- [ ] Implement types, region/race constraints, seeded randomness, event catalogue, ranks, career/family, aging, and endings.
- [ ] Run the engine tests; expected zero failures.

### Task 2: Persistence
Files: `six-faced-life/src/game/storage.ts`, `storage.test.ts`.
Interfaces: `loadGame(storage): LoadResult`, `saveGame(storage,save): boolean`, `archiveLife(save,life): SaveData`.
- [ ] Write tests for active/pending-state round trips, malformed/unsupported data, storage failures, and archive deduplication.
- [ ] Observe failures; implement versioned validation and saving.
- [ ] Run all tests; expected zero failures.

### Task 3: Playable chronicle
Files: `src/App.tsx`, `src/components/{Icon,WorldMap,LifeView,NewLife,Archive}.tsx`, `src/styles.css`, `public/assets/*`.
Consumes engine and persistence interfaces above. Produces a responsive playable application with New Life, Chronicle, World, and Past Lives views.
- [ ] Implement onboarding/birth, identity, scene, current decision, focus, training, family, record, timeline, time controls, endings, and archive.
- [ ] Check desktop and mobile via browser: birth, memory choice, focus, speeds, single year, next decision, saving/reload, world, archive.
- [ ] Run tests and TypeScript/Vite build; expected zero failures and a generated dist directory.

### Task 4: Review and delivery
Files: `README.md`, `PRODUCT.md`, `DESIGN.md`, hosting metadata where available.
- [ ] Obtain a fresh code/UX review; fix material issues and add regression tests.
- [ ] Verify full simulations, persistence, browser console, keyboard/mobile behavior, and production build.
- [ ] Publish a private Site if supported, otherwise provide a verified local preview and exact run command.
- [ ] Record completed checks and remaining limitations.

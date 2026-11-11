# Family Pixel Scene Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Show only living, co-regional partners and direct children in the pixel scene.
**Architecture:** Read-only scene facts select recorded family; existing sprite layers render them with a bilingual together caption. Existing animation controller remains authoritative.
**Tech Stack:** React, TypeScript, CSS, Vitest; no new dependencies.
**Spec:** [Approved design](../specs/2026-11-11-family-pixel-scene-design.md), approved in chat 2026-11-11.

## Global Constraints

No simulation, RNG, save-schema, storage-key or publishing changes. Preserve existing artwork, fallback, keyboard order and motion rules. Region equality is the recorded proxy for living together.

## Review Focus

Former spouses must disappear even if their home matches. Children remain independent of marriage. Adult children use adult sprites. Same asset URLs must not preserve an absent person's DOM. Large families must wrap without clipping.

### Task 1: Recorded family selection

Files: `six-faced-life/src/components/life-scene/{types.ts,model.ts,model.test.ts}`.
Produces: `SceneCompanion` records in `SceneFacts.family` and `SceneModel.family` with id/name/role/race/stage/outfit. Consumes existing Relative, marriage, race and life-stage data.

- [x] Add tests for active versus ended marriage, death, region, unborn/adult children, legacy/ended and immutable sampling; run to observe failure.
- [x] Select eligible family without mutation; carry records into resolved model.
- [x] Run focused model tests; require PASS.

### Task 2: Family artwork and bilingual identity

Files: `six-faced-life/src/components/life-scene/{assets.ts,PixelLifeScene.tsx,PixelLifeScene.test.tsx,scene.css}`, `six-faced-life/src/i18n/{life-scene.ts,life-scene.test.ts}`.
Consumes Task 1 family records. Produces `getCompanionLayers(person: SceneCompanion): readonly SceneLayer[]`, `sceneFamilyDescription(model, language): string`, visible family sprites and caption.

- [x] Add rendering/translation tests for family labels, layers, immediate removal, family fallback and stopped motion; observe failure.
- [x] Reuse bodies/outfits with idle frames and existing character motion; preload family assets in the scene's existing lifecycle. Wrap people in normal flow; omit empty family caption.
- [x] Run focused scene and i18n tests; require PASS.

### Task 3: Verify and deliver

- [x] Run `npm test` and `npm run build` in the app; inspect actual results.
- [x] Inspect isolated desktop/mobile EN/TH, large family, keyboard and motion states; check console and overflow.
- [x] Update PRODUCT.md, DESIGN.md and CONTINUE.md; review complete diff and get a fresh whole-branch review.
- [ ] Fetch origin, check whitespace/status/freshness, commit task-owned files, push explicit branch and create PR targeting main. User merges manually.

## Progress ledger

- Setup: clean repository; fetched origin/main 2714a94; task branch codex/family-pixel-scene. Design approved. Native execution follows user's "Approve and implement" instruction; no additional plan approval requested.
- Pre-flight: Task 2 consumes Task 1's family records; no conflicting interfaces. Existing motion flags and asset loader are reused.
- Task 1 complete: four family-selection regressions observed failing before implementation; all 14 model tests then passed. Scene sampling leaves the complete life unchanged.
- Task 2 complete: five rendering/translation regressions observed failing before implementation; all 33 focused scene/i18n tests then passed.
- Task 3 verification: full 487/487 tests in 70 files passed (89.11s); production build passed with existing >500 kB bundle advisory. No dependency installation needed. Sandbox subprocess restrictions required approved elevated test/build execution.
- Browser: isolated 5174, 1280px desktop and 390px phone, EN/TH captions, keyboard Scene motion and stopped family animations, reload idle/no reaction replay, away and separated family, 18-person household with no clipping/overflow. Original QA save restored; player 5173 storage untouched. A synthetic harness initially failed its peak-wealth invariant; corrected before loading. No application console errors. Reduced-motion/fallback are automated coverage, not a claimed manual OS-preference test.
- Independent whole-branch read-only reviewer: no actionable findings. Mechanical design detector: advisory findings for existing scene palette/type; new caption intentionally reuses the existing motion-control surface, now documented. No deferred source defect.

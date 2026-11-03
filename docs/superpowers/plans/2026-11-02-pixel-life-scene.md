# Pixel Life Scene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the active chronicle painting with a detailed, layered pixel scene that follows the life without changing simulation or saves.

**Architecture:** Pure presentation modules sample life state, resolve visible activity/outfits, and reduce transient reactions. Local raster atlases share frame registration; a React/CSS renderer loads only current layers. An App-owned scene hook survives the live-to-ending transition and never controls game time, choices or persistence.

**Tech Stack:** Existing React 19, TypeScript, Vite, plain CSS, Vitest/RTL and npm; Node.js 22.12+ or a supported Node.js 24 release. No new application dependencies, renderer engine or service.

**Spec:** [Pixel life scene design](../specs/2026-11-02-pixel-life-scene-design.md), approved for planning by the user's request to create this implementation plan on 2026-11-02. [Visual reference](../specs/assets/2026-11-02-pixel-life-style-comparison.png): **lower panel B**.

## Global Constraints

- Scene is **visual only**; location and focus are real state. Career controls ordinary clothing; magic/sword focus replaces it with selected-discipline, earned-rank gear.
- Cover six regions, six races, five age stages, all 15 current occupation values, eight focuses, five magic disciplines, three sword styles and seven ranks. No partial set described as complete.
- Use existing `lifeStage(age, race)` boundaries: under **3**, under **12**, under **18**, adult until **70%** of race lifespan, then later years. Training respects `FOCUSES[focus].minAge` (**magic 3**, **sword 5**).
- Preserve the original painting on other screens and as fallback. Keep parchment, fonts, captions, bilingual life-fixed language, keyboard order and the existing **650px** pending-decision scene hiding rule.
- Pause/pending means character **idle**, ambient motion continues. Playback speed never changes sprite speed. Hidden/offscreen scenes suspend work; reduced motion and Scene motion off show still frames. Ended lives stay still.
- Reactions last **2,000ms**, with at most **one current and one deferred**; ending > arrival > rank/career > family/birth. Never delay gameplay or replay saved history on reload/navigation.
- No audio, gameplay mutations, save fields, new RNG draws, hidden-genetics disclosure, inferred gender, automatic style allocation or invented relative records. Session motion preference stays outside saves.
- Load only active scene layers, target **under 2 MB** compressed art per scene and **at most 20** independently animated elements. Budget changes require measured evidence and documentation.
- Use original raster artwork and retain production provenance. Mockup B is a reference, not an animation-ready atlas. Use imagegen skill/built-in generation for raster authoring; no CLI/API fallback without user authorization. Do not silently replace it with CSS silhouettes.
- Continue **`codex/pixel-life-scene`**, existing **draft PR #19**, base **main**. Fetch/usage checks and preservation rules in root AGENTS.md apply at every resumed session; never merge/rebase upstream automatically.
- Protect the player's **127.0.0.1:5173** save. Browser QA uses **5174** or another separate origin. Human merges manually; no publishing or new paid service.

## Review Focus

- Expanded occupation differs from mirrored `life.career` (farmer can mirror merchant): outfit follows expanded primary occupation, never the compatibility mirror (Task 1).
- Switching to a weaker track or gaining XP above an instruction cap: selected earned rank drives gear, and switching alone never produces a promotion reaction (Tasks 1/2).
- Pending choice, hidden phone scene, page navigation and 8x bursts: no stale reaction backlog, hidden work, unintended focus move or delayed gameplay (Tasks 2/6/7).
- A slow old-region image resolves after a newer one, or one outfit fails: stale loads cannot replace the current scene; failed layers give a complete painted fallback (Tasks 3/6).
- App replaces LifeView with Ending on death: ending pose must survive that boundary, while an archive preview/reloaded ended life must not replay a death animation (Task 7).

## File map and shared contracts

All paths below are relative to the repository root. Run npm commands in `six-faced-life/`. New presentation code stays in `six-faced-life/src/components/life-scene/`, outside the simulation.

| File | Responsibility |
| --- | --- |
| `types.ts`, `model.ts`, `model.test.ts`, `fixtures.ts` | Scene types, read-only life sampling, activity/outfit resolution and test fixtures |
| `reactions.ts`, `reactions.test.ts` | Transition detection and bounded pure reaction state machine |
| `assets.json`, `assets.ts`, `assets.test.ts` | Asset metadata/coverage, current-layer selection and real-file validation |
| `useLifeScene.ts`, `useLifeScene.test.tsx` | Visibility/media subscriptions, transient timing and cleanup |
| `PixelLifeScene.tsx`, `PixelLifeScene.test.tsx`, `scene.css` | Scene composition, frame playback, loading/fallback and responsive styles |
| `six-faced-life/src/i18n/life-scene.ts`, `life-scene.test.ts` | Bilingual scene descriptions and control labels |
| `six-faced-life/public/assets/pixel-life/` | Original production atlases and region art, no mockup screenshots |
| Existing `src/App.tsx`, `src/App.test.tsx` | Session motion state, hook ownership and actual playback integration |
| Existing `src/components/LifeView.tsx`, `LifeView.test.tsx`, `Archive.tsx` | Replace chronicle scene; optional active-ending scene slot |
| Existing PRODUCT, DESIGN, `.impeccable/design.json`, ASSETS, README, CONTINUE | Final built behavior, provenance and verification only after implementation |

Define and export these contracts in `types.ts` (all other tasks consume them):

- `AgeStage = 'infant' | 'child' | 'teen' | 'adult' | 'elder'`; `Rank = 0 | 1 | 2 | 3 | 4 | 5 | 6`.
- `SceneOccupation = Occupation | 'neutral'`, importing `Occupation` from `game/expanded/types.ts`; all legacy `Career` values are included.
- `ClipId = 'idle' | 'observe' | 'magic' | 'sword-god' | 'water-god' | 'north-god' | 'read' | 'work' | 'social' | 'walk' | 'rest' | 'celebrate' | 'greet' | 'arrive' | 'birth' | 'ending' | 'prepare'` in that row order.
- `SceneFacts`: `{ lifeId, phase, age, race, region, focus, occupation, careerLevel, study, swordStyle, magicRanks, swordRanks, legacySwordRank, marriageKeys, directBorn }`. Types come from existing `Life` enums; `study: MagicSchool | null`, `swordStyle: SwordStyle | null`, rank maps cover each named discipline/style, and unknown legacy sword rank is nullable. Use readonly fields and readonly arrays/maps. `marriageKeys: readonly string[]`; `directBorn: number | null`.
- `SceneModel`: `{ lifeId: string; phase: Life['phase']; region: RegionId; race: RaceId; stage: AgeStage; occupation: SceneOccupation; activity: ClipId; outfit: SceneOccupation | 'magic-training' | 'sword-training'; training: { family: 'magic' | 'sword'; discipline: MagicSchool | SwordStyle | null; rank: Rank | null } | null }`.
- `SceneReaction = 'birth' | 'career' | 'rank' | 'family' | 'arrival' | 'ending'`; `ReactionState = { current: SceneReaction | null; deferred: SceneReaction | null; expiresAt: number | null }`.
- `ScenePresentation = { model: SceneModel; clip: ClipId; characterMotion: boolean; ambientMotion: boolean; reaction: SceneReaction | null }`.
- `SceneInput = { life: Life | null; enabled: boolean; playing: boolean; motionEnabled: boolean }`; `SceneSession = { presentation: ScenePresentation | null; setVisible: (visible: boolean) => void }`.
- `AssetRecord = { url: string; width: number; height: number; alpha: boolean; bytes: number }`; `SceneLayer = { id: string; asset: AssetRecord; row: number; frames: number; durationMs: number; z: number; anchor: 'background' | 'hero' | 'effect' | 'ambient' }`.

## Task 1: Read-only scene model and compatibility adapter

**Files:** Create `types.ts`, `model.ts`, `model.test.ts`, `fixtures.ts` in the new scene directory.

**Interfaces:** Produce `sampleSceneFacts(life: Life): SceneFacts` and `resolveScene(facts: SceneFacts): SceneModel`. Test fixtures export `expandedSceneLife(): ExpandedLife` and `legacySceneLife(): LegacyLife`, constructed through current public factories, then set alive/age 25/no pending, without browser storage.

- [ ] **Step 1 — Write failing model tests.** Pin these assertions with current factories/helpers rather than inventing serialized saves:
  ```ts
  expect(resolveScene(sampleSceneFacts(farmer)).outfit).toBe('farmer'); // mirror is merchant
  expect(resolveScene(sampleSceneFacts(guardPracticingMagic)).outfit).toBe('magic-training');
  expect(resolveScene(sampleSceneFacts(guardPracticingMagic)).activity).toBe('magic');
  expect(sampleSceneFacts(cappedSelectedTrack).swordRanks['water-god']).toBe(2);
  expect(resolveScene(sampleSceneFacts(unselectedSwords)).activity).toBe('prepare');
  expect(resolveScene(sampleSceneFacts(infantWithStaleWorkFocus)).activity).toBe('rest');
  expect(JSON.stringify(life)).toBe(before); // run both functions repeatedly first
  ```
  Add table tests for every race at 2/3/11/12/17/18 and either side of its 70% lifespan boundary, all focuses including min-age boundaries, all occupations and six regions. Assert only the selected magic track's XP plus actual shared cap determines magic gear; no best-track substitution.
- [ ] **Step 2 — Run RED:** `npm.cmd test -- src/components/life-scene/model.test.ts --maxWorkers=2`; missing exports are the expected initial failure.
- [ ] **Step 3 — Implement the adapter/resolver.** Reuse `lifeStage`, `FOCUSES`, `getProgression`, `rankFor`, `RANKS`, `selectedSwordTrack` and `swordRank` read-only. Expanded job is `expansion.career.role`/its matching work record; legacy job/level comes from `getProgression`. The displayed study follows `getProgression(life).specialization`, as the existing selector does. Snapshot every track's earned rank for reaction comparison. Missing/unallocated expanded sword state cannot assign a style; recognized legacy school names map read-only, unknown values resolve prepare/null rank. No migration/sync helper calls.
  Use actual expanded marriage records (`person` + `start`) and `family.directBorn`; return empty keys/null counts when old records lack trustworthy fields. Pure stable appearance uses race/stage; add no new random cosmetics. Resolve infant/locked activity safety before training outfits; regular paused idling is applied later, preserving the chosen outfit.
- [ ] **Step 4 — Run GREEN:** repeat the focused command. Deep-freeze fixture copies before sampling; include unchanged `rng`, `expansion.familyRng`, history, pending and missing sword state. Add no gameplay-file changes to make presentation tests pass.
- [ ] **Step 5 — Commit task-owned scene model files:** `feat: resolve pixel scene from existing life state`.

## Task 2: Nonblocking transition reactions

**Files:** Create `reactions.ts`, `reactions.test.ts` beside the model.

**Interfaces:** Consume `SceneFacts`. Produce `detectSceneReaction(before: SceneFacts | null, after: SceneFacts): SceneReaction | null` and `reduceReaction(state: ReactionState, input: { candidate: SceneReaction | null; now: number; pending: boolean; suspended: boolean; reset: boolean }): ReactionState`, plus `EMPTY_REACTION`.

- [ ] **Step 1 — Write failing transition/reducer tests.** Initial loaded alive/ended facts return null; observed same-life birth→alive returns birth; alive→ended returns ending. Region change returns arrival. Compare all ranks **by same track key**, not before-selected versus after-selected. Changing selection alone returns null; a recorded job/level increase returns career; new marriage key or higher direct-born count returns family; distant births/bonds changes do not.
  ```ts
  expect(detectSceneReaction(strongFire, switchedToWeakWater)).toBeNull();
  expect(reduceReaction(EMPTY_REACTION, eventAt100)).toEqual({ current: 'rank', deferred: null, expiresAt: 2100 });
  expect(reduceReaction(EMPTY_REACTION, pendingArrival)).toEqual({ current: null, deferred: 'arrival', expiresAt: null });
  expect(reduceReaction(activeRank, suspendedInput)).toEqual(EMPTY_REACTION);
  ```
  Define inputs in the test using the exact interface. Test simultaneous ending/arrival/rank/family priority, expiry at 1,999/2,000ms, 100-event bursts, choice clearing, newer candidates superseding a deferred one, reset and life replacement.
- [ ] **Step 2 — Run RED:** `npm.cmd test -- src/components/life-scene/reactions.test.ts --maxWorkers=2`.
- [ ] **Step 3 — Implement pure detection/reduction.** Collapse each committed before/after transition to its highest-priority event. Each new event replaces the deferred candidate; ending preempts everything, lower-priority new events wait behind a current higher-priority reaction. Pending interrupts current animation and retains at most its latest relevant candidate until clear. Resume sets a fresh 2,000ms deadline; expiration promotes only one latest deferred event. Hidden/offscreen/navigation or reset discards current/deferred. The hook keeps facts baselined even when it drops reactions, so no catch-up occurs.
- [ ] **Step 4 — Run GREEN** with the same command. Verify no timer, browser API or simulation call exists in this module; ending is a settled static pose in presentation, not a delay to the Ending page.
- [ ] **Step 5 — Commit:** `feat: derive bounded pixel scene reactions`.

## Asset coverage and frame contract for Tasks 3–5

These are production requirements, not placeholders. Create a manifest entry for every required key; paths below are concrete templates whose enum expansions are the complete file set. Metadata is in `src/components/life-scene/assets.json`, imported through the existing `resolveJsonModule` setting. URLs begin `/assets/pixel-life/`.

| Asset path under `public/assets/pixel-life/` | Coverage and registration |
| --- | --- |
| `regions/{region}.png` | Six region IDs, **768×256**, opaque; regional landscape plus safe hero clearing |
| `ambient/{region}.png` | Six region IDs, **512×128**, transparent; two 64px rows: small villager and flag/foliage |
| `bodies/{race}-{stage}.png` | Six races × five stages = **30** transparent **512×1088** atlases |
| `outfits/{stage}-{outfit}.png` | Four non-infant stages × 18 outfits (**15 occupations + neutral + two training families**) = **72** atlases, same grid; plus `infant-neutral.png` swaddle atlas |
| `ranks/{stage}-{family}-{rank}.png` | Four non-infant stages × two families × seven ranks = **56** aligned rank/equipment overlay atlases |
| `effects/{discipline}.png` | Five magic IDs + three sword IDs = **8** transparent **1024×128** strips, 8 cells at 128px |

All body/outfit/rank atlases use **64×64 cells**, **8 columns** and **17 rows** in `ClipId` order. Hero foot anchor is **(32, 56)** in each cell; face/arms/equipment match between layers. Base adult hero is approximately **48px** tall. Bodies show race-specific proportions/features; clothing is authored to the union of supported racial silhouettes for that stage, not a human-only fit. If a shared garment visibly fails a dwarf/beastfolk silhouette, add explicit race-fit variants in manifest metadata and file keys; update coverage/byte tests and ledger, never accept clipping or silently drop that race.

Idle uses 4 frames/1,000ms; ordinary action rows use 8/1,000ms; reaction rows birth/celebrate/greet/arrive use 8/2,000ms; ending uses frame 0 only. Unused atlas columns duplicate the last valid frame. Infant atlases need only rest/observe/idle/birth/ending rows with coherent swaddle coverage; the resolver must never select adult training/work rows. Training discipline selects magic effect or the correct sword row, not a random pose. Work uses a shared body gesture plus the occupation's identifiable garment/tool animation.

Concept art generation must preserve these frame/anchor invariants. Inspect generated sheets before accepting them; regenerate bad alignment rather than using a painted scene as a moving sprite. Any image editing uses imagegen unless the user explicitly requests another editing tool. No external asset service is needed. Keep all accepted runtime files and final prompts/provenance in the workspace; discarded draft sheets/screenshots remain ignored.

## Task 3: Asset manifest, validation and regional scenery

**Files:** Create scene `assets.json`, `assets.ts`, `assets.test.ts`; six region and six ambient PNGs from the table; update `six-faced-life/ASSETS.md` for delivered files.

**Interfaces:** `getSceneLayers(model: SceneModel, clip: ClipId): readonly SceneLayer[]` returns ordered current-layer metadata; `sceneAssetBytes(layers: readonly SceneLayer[]): number` counts unique URL bytes. Manifest format: `{ version: 1, assets: Record<string, AssetRecord> }`; IDs use path without `.png`. Metadata has no URLs for other regions in returned layers.

- [ ] **Step 1 — Write failing file/selection tests.** Validate JSON shape, local path prefix, unique IDs, PNG signature/IHDR dimensions, alpha-capable color type or `tRNS` for transparent layers, and actual byte length via Node fs (node test environment, no browser image-loading assumptions). Assert six actual regional/ambient pairs and that selected-region layers never include five unused regions. Test asset-union bytes below **2,000,000** and layer count ≤20 for supplied fixtures; full combination coverage is enabled as Tasks 4/5 land.
- [ ] **Step 2 — Run RED:** `npm.cmd test -- src/components/life-scene/assets.test.ts --maxWorkers=2`; missing asset files/manifest entries must fail visibly.
- [ ] **Step 3 — Author scenery and implement metadata selection.** Match lower mockup B in the six representative settings specified by the spec. Render a hero clearing around the center, atmospheric depth behind it and room for readable captions. Keep raster planes crisp, no baked UI/text/characters in base scenery. Produce modest ambient strips with no named relatives. Return only available delivered scenery at this task boundary; character/family layer selection is completed in subsequent tasks. Tests must not claim full-scene readiness yet.
- [ ] **Step 4 — Run GREEN** for delivered categories; inspect each region and transparent ambient strip at native and 2x scale. Record paths, byte sizes, prompts and generation/derivative steps in ASSETS. No app integration before the complete manifest passes.
- [ ] **Step 5 — Commit regional artwork, manifest/selector/tests and provenance:** `feat: add original regional pixel scenery`.

## Task 4: Race, age, career and training wardrobe artwork

**Files:** Add the table's 30 body and 73 wardrobe atlases; extend scene `assets.json`, `assets.ts`, `assets.test.ts`; extend ASSETS.

**Interfaces:** Consume model and clip contracts; extend `getSceneLayers` to return body/wardrobe layers at the shared hero anchor. Infants resolve the neutral swaddle regardless of stale career; all other stage/outfit keys must exist. Non-training outfits include their occupation tools.

- [ ] **Step 1 — Extend failing manifest tests.** Enumerate all race/stage and age-valid outfit keys from Task 1 types and current `OCCUPATIONS`/legacy career data. Assert file dimensions and alpha metadata as Task 3. Add an unknown-job fixture resolving neutral. Keep missing any single required body/outfit a failure; no default-human or default-merchant substitution.
- [ ] **Step 2 — Run RED** with `assets.test.ts` and `model.test.ts` focused commands.
- [ ] **Step 3 — Author aligned original bodies/wardrobes.** Make race traits, age proportions and jobs visible, with no latent-genetics hints. Dress every race/stage in neutral, farmer, guard, both training outfits and every remaining career; inspect montage contact views outside committed screenshots. Author tools in matching work frames, separate magic/sword practice from occupation. Fit variants may share exact files only when actual rendered fit is sound; metadata explicitly enumerates reuse.
- [ ] **Step 4 — Run GREEN** and inspect all race-stage combinations in neutral and training clothes, plus all occupation outfits on adult and teen bodies. Check first/last/mid action frames, dwarf/beastfolk fit, infant safety and readable elder silhouette. Correct registration before adding effects. Verify current scene's active asset bytes remain under budget.
- [ ] **Step 5 — Commit accepted atlases, manifest/tests and provenance:** `feat: add pixel character life stages and career outfits`.

## Task 5: Rank progression, selected-discipline effects and reactions artwork

**Files:** Add 56 rank and 8 effect atlases from the table; finish scene `assets.json`, `assets.ts`, `assets.test.ts`; extend ASSETS.

**Interfaces:** Finish `getSceneLayers(model, clip)` for selected rank/discipline and all reaction rows. Layer categories are background → ambient → body → clothing → rank gear → effect, with independent but compatible anchors. Use two ambient instances (one per atlas row), for at most seven rendered layers; count their shared URL once for bytes. `'career'`/`'rank'` reactions map to celebrate, family to greet, arrival to arrive, birth to birth, ending to ending.

- [ ] **Step 1 — Write failing complete-coverage tests.** For four training ages × six races × all five magic and three sword disciplines × ranks 0–6, each resolved layer exists, matches expected metadata and uses the selected track. Non-training scenes have no training gear/effects; null-ranked prepare scenes show neutral practice without borrowed God gear. Include known legacy style, unknown legacy style and unallocated expanded styles. Deduplicate URLs before counting bytes.
- [ ] **Step 2 — Run RED:** focused `assets.test.ts` plus `model.test.ts`.
- [ ] **Step 3 — Author rank and discipline artwork.** Seven garment/equipment variations per training family must show at least one visible adjacent-rank distinction; selected school/style adds its own effect. Water/fire/earth/wind/healing differ; Sword God/Water God/North God use distinct rows and blade effects. Restrict higher-rank intensity; no flashes or screen-filling pulses. Finish reaction poses in existing body/wardrobe grids, with age-appropriate infant variants and a respectful settled ending frame.
  Keep rank clothing during idle/reaction poses, but return no magic/blade effect layer unless the clip is its matching practice action. Test paused training and celebration explicitly so an idle character does not keep casting.
- [ ] **Step 4 — Run GREEN** over the complete manifest. Visually compare every adjacent rank and all eight disciplines, including a novice selected track alongside an unselected God track. Verify full-scene byte/count bounds across the entire valid model matrix. Asset-art review is mandatory; manifest tests cannot prove appearance or alignment.
- [ ] **Step 5 — Commit final art, selector, coverage and provenance:** `feat: visualize earned ranks and selected disciplines`.

## Task 6: Motion lifecycle, accessible renderer and fallback

**Files:** Create scene `useLifeScene.ts`, `useLifeScene.test.tsx`, `PixelLifeScene.tsx`, `PixelLifeScene.test.tsx`, `scene.css`; create `src/i18n/life-scene.ts` and its test.

**Interfaces:** `useLifeScene(input: SceneInput): SceneSession`; `PixelLifeScene(props: { presentation: ScenePresentation; onVisibilityChange: (visible: boolean) => void; motionEnabled: boolean; onMotionChange: (enabled: boolean) => void }): ReactElement`; `sceneDescription(model: SceneModel, language: Language): string`. The component consumes the existing language provider and the model/assets/reaction modules.

- [ ] **Step 1 — Write failing hook/renderer tests** using fake timers, media-query, visibility and IntersectionObserver doubles. Check playing activity versus pending/paused idle; speed is deliberately absent from hook props. Media/visibility changes apply immediately; leaving view clears timers/reactions; 100 rerenders do not leak subscriptions. Keep snapshots while visible-but-motion-off without queuing celebrations. No animation timers while reduced/hidden/offscreen/ended. Use a single timeout for reaction deadline, CSS for loops.
  Test every current image loading: old region A resolves after B, failed body/rank layer, navigation during load, remount with new life, and retry on a new scene signature. Fallback stays until **all current** layers are ready; one failure keeps the whole painted fallback, never a half-dressed character. Simulate image load/error in RTL instead of expecting jsdom to decode images.
- [ ] **Step 2 — Run RED:** `npm.cmd test -- src/components/life-scene/useLifeScene.test.tsx src/components/life-scene/PixelLifeScene.test.tsx src/i18n/life-scene.test.ts --maxWorkers=2`.
- [ ] **Step 3 — Implement lifecycle, frame rendering and localization.** Hook subscribes to `document.visibilitychange` and `matchMedia('(prefers-reduced-motion: reduce)')`; component reports actual visibility with IntersectionObserver and zero-size/650px pending fallback checks. Initial scene visibility is optimistic until observed; switching life IDs resets it so a new mount cannot inherit an old offscreen flag. Media/observer absence falls back conservatively to viewport/visibility checks, never a crash. Disabled scene navigation resets history baseline and reactions; first loaded snapshot is baseline only. Reset on life ID change. Readonly facts sampled while enabled include birth, so observed birth→alive can defer its single greeting while the first choice is pending.
  Hook motion intent requires enabled, visible, motion-on, no reduced motion and phase alive; the renderer additionally gates it on complete current-image readiness. Choose the activity clip only while playing with no pending choice; paused/pending uses a gently animated idle clip instead. Ambient motion remains on under those two states. Reduced/hidden/ended overrides both. Idle timing is CSS-only; callbacks never touch simulation. Ended pose is static even when transition detector yields ending.
  Load images by a signature of current unique URLs, guarded by generation token/disposed flag; previous loads cannot commit newer state. Reserve scene space and use existing Landscape fallback plus generic localized artwork caption. Do not import unused-region pixel files as eager image loads. Use `image-rendering: pixelated`, integer sprite scale (1x or 2x based on scene height), bottom-anchored hero in a safe central area, and separately cropped region art. Place narrative captions in a readable area that leaves hero/outfit visible; retain min-width 0/wrapping and existing scene order/heights.
  The main visual has `role='img'` and a short localized description, decorative layers `aria-hidden`, no live region. Scene motion is an adjacent accessible 44px toggle outside that image role, labeled EN **Scene motion** / TH **การเคลื่อนไหวของฉาก**, with `aria-pressed`. Read reduced-motion as a higher-priority setting and explain a disabled toggle if relevant. Descriptions cover actual region, race, stage and activity; no unlocalized template fragments. Never move focus on frame/model updates.
- [ ] **Step 4 — Run GREEN** with the focused command. Test on/off toggle event only changes the callback, keyboard activation works, EN/TH descriptions are complete, no new focus shift, listener/timer cleanup, pending idle versus true still state, loaded fallback and stale completion guards. Use runtime real-image browser checks in Task 8 for cropping/sprite alignment.
- [ ] **Step 5 — Commit:** `feat: render accessible pixel life scenes with safe motion lifecycle`.

## Task 7: Chronicle, playback and ending integration

**Files:** Modify `src/App.tsx`, `App.test.tsx`, `src/components/LifeView.tsx`, `LifeView.test.tsx`, `src/components/Archive.tsx`; add tests in scene hook test file if needed. Existing `styles.css` rules remain except narrowly scoped scene compatibility adjustments.

**Interfaces:** App owns `sceneMotionEnabled: boolean` session state default true and calls the hook unconditionally with `enabled: page === 'chronicle'`. Pass `scene?: ReactNode` into LifeView and Ending; only App's active chronicle paths supply it. LifeView replaces only its current `<section className='scene'>` with the supplied scene; standalone callers may retain the old painting when no slot is given. Ending places its optional scene before the ending letter. Archive previews never receive the slot. New-life/BirthRecord paintings remain unchanged.

- [ ] **Step 1 — Write failing integration tests** against actual App with seeded isolated localStorage fixtures. Assert Play drives activity, Pause/pending idles, 8x doesn't change clip duration, motion toggle doesn't advance time/change saves, Watch keeps manual decisions pending, and existing outcome/decision focus still works. Reload starts paused and has no historical celebration. Test app navigation discards transient reactions while retaining the session preference; complete unmount/reload resets that preference.
  Assert active death renders the static ending scene and existing retrospective; opening an archived life produces no scene/reaction slot. Observe birth→alive (same life ID) with pending birth choice, clear it and assert at most one birth greeting. Mount directly into saved alive/ended life and assert no birth/ending reaction replay. Include hidden-tab pending choice plus return on 360px, and a new life after offscreen ending.
- [ ] **Step 2 — Run RED:** `npm.cmd test -- src/App.test.tsx src/components/LifeView.test.tsx src/components/life-scene/useLifeScene.test.tsx --maxWorkers=2`.
- [ ] **Step 3 — Wire the hook/slots and CSS import.** Keep hook above conditional routes so prior facts survive alive→ended. Build scene JSX only for current active chronicle life; its React element can remount between slots while the controller stays in App. Use the current life language provider. Move scene location/stage/headline/career captions into PixelLifeScene using existing text and `careerTitle` from `game/simulation.ts`. Do not change character page or introduce a second heading h1. Remove the old fixed Asura artwork note only from pixel presentation. Scope pending-phone hiding to the new `.scene` root without hiding the decision or duplicating space. Never change `updateLife`, saving code or playback intervals to satisfy visual timing.
- [ ] **Step 4 — Run GREEN** with the focused command plus `npm.cmd test -- src/language.test.tsx --maxWorkers=2`. Assert saved data and RNG match before/after motion/media/image events. Existing gameplay remains deterministically unchanged. Recheck the new control does not trigger the global Space Play shortcut while focused.
- [ ] **Step 5 — Commit:** `feat: integrate pixel scenes with chronicle playback and endings`.

## Task 8: Full verification, built documentation and delivery

**Files:** Update `six-faced-life/PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `ASSETS.md`, `README.md`, root `CONTINUE.md`, this plan's progress ledger and spec implementation status only after evidence exists.

**Interfaces:** All preceding scene contracts and existing application flows; no new public game API.

- [ ] **Step 1 — Run required automated checks from the app:** `npm.cmd test -- --maxWorkers=2`, then `npm.cmd run build`. Expected: every test passes and TypeScript/Vite exits 0. Investigate actual failures; do not mark stale results as current. Respect usage checks before this expensive verification. No nonexistent lint/typecheck/e2e scripts or new browser-test framework.
- [ ] **Step 2 — Inspect browser flows on isolated 5174** (reuse an existing QA server, otherwise `npm.cmd run dev -- --port 5174`). Check 1280px/1700px desktop, 850px tablet and 360px mobile, both EN/TH. Exercise race/age/outfit/discipline/rank montage, Play/Pause, pending/Watch choices, all speeds, reload, live death, archive, hidden tab/offscreen, keyboard Space/toggle/focus, reduced motion, asset failure/throttled old-region completion and no horizontal overflow/console errors. Use isolated fixtures; never clear 5173 storage.
- [ ] **Step 3 — Measure the actual current scene.** Inspect Network to ensure only the active region/body/outfit/rank/effect loads, unique compressed assets total <2,000,000 bytes and independently moving elements ≤20. Verify sprite edges/face/equipment at actual screen sizes, all racial garment fits and adjacent-rank distinctions. Record measurements and art review evidence. Address a failed budget/visual requirement before calling it complete; ask before any material scope/budget change rather than silently dropping coverage.
- [ ] **Step 4 — Update built docs and ledger accurately.** Record asset provenance and tool prompts, browser checks actually performed, automated result counts, limitations and final commits. Retain original painting/font licenses and all existing design-sidecar previews. Document Scene motion, its session lifetime and the difference between Pause idling and reduced-motion stillness. Update spec status to implemented only after all prior tasks pass.
- [ ] **Step 5 — Deliver through existing PR #19.** Review `git diff --check`, complete `git diff origin/main...HEAD`, untracked files and `git status --short --branch`; commit only listed task files. Push explicitly to `origin codex/pixel-life-scene`; update this PR, not a new one. Fresh `git fetch origin --prune` and `git merge-base --is-ancestor origin/main HEAD` must establish freshness. Report behind status without automatic integration. Keep PR draft if checks/art coverage remain blocked; otherwise mark ready for human review. Never merge, enable auto-merge, delete the branch or publish.

## Progress ledger and resume point

- [x] Interview, chosen art B, chosen layered-sprite architecture and design approval for planning.
- [x] Source inspection and implementation plan authored; self-review of spec coverage, contracts, failure-mode tests and proportionality complete.
- [x] User selected Native execution ("1"). Implementation proceeds on the existing task branch.
- [x] Task 1: read-only model, nine tests including race/age gates, capped selected tracks, frozen saves and legacy handling. Infant ending precedence reproduced RED then corrected GREEN.
- [x] Task 2: pure reaction detection/reduction, three tests covering initial loads, selection changes, priority, burst bounds, choice deferral and deadlines.
- [x] Tasks 3–5 implementation: 179 exported PNGs and runtime selector; real-file metadata and enum/rank matrix checks pass. Full-pose visual acceptance and provenance documentation still need final QA.
- [ ] Task 6 acceptance incomplete: renderer, lifecycle hook and EN/TH descriptions exist and six initial tests pass; expand reduced-motion/hidden-tab/cleanup coverage.
- [ ] Task 7 acceptance incomplete: App/chronicle/active-ending slots exist; focused App/language/scene checks pass 50/50. Complete pending-phone, ending/archive and keyboard/browser checks.
- [ ] Task 8 not complete: current full suite, complete browser acceptance, built docs/provenance, fresh whole-branch review and ready-for-review delivery remain.

**Paused at user request, 2026-11-02 22:29 Asia/Bangkok.** Resume from CONTINUE.md.
Last prior task commits: model `3e22968`, reactions `438fe7f`. The checkpoint
commit preserves subsequent art/UI work. Latest full suite 358/358 predates UI
integration; latest focused integration 50/50 and current build pass. Never
represent that older full suite as current verification. Browser QA is partial.

Ruling: file-based PNG tests live in `six-faced-life/tests/pixel-assets.test.ts`
outside browser TypeScript scope — no Node typings/application dependency added.
Use that path instead of the earlier planned scene-directory asset test commands.

Ruling: model/facts carry age, calendar year and existing career-title text for
caption continuity — read-only existing helpers provide these values — no save
fields are added; a wrong adapter would mislabel the scene, covered in final QA.

Ruling: inspected 16-row source atlases map to 17 clips by sharing greeting/social
poses; child/teen bodies use mechanical size variants and elders use separately
generated aged sources — preserve source pixels and shared registration — verify
fits/recognizability in final art review rather than claiming bespoke poses.

Execution checks: focused scene tests **13/13**; full suite **358/358 in 56 files**, 75.38s. Initial build passed; rerun after subsequent edits. Sandbox esbuild spawn EPERM required authorized escalated test execution. Player 5173 storage untouched.

Ruling: continue in the clean existing task branch in place — the repository's continuation workflow and user's Native selection take priority over creating another worktree — existing checkout receives task-only changes.

User authorization: **Allow mechanical asset processing** was explicitly selected after the generated source was 2172×724 instead of 768×256. Pillow may resize, trim transparency and slice sheets; imagegen still authors the art. This supersedes the plan's earlier all-image-edits-through-imagegen restriction for those mechanical steps.

Pre-flight shared interfaces: Task 1 facts/model → Tasks 2/3/6 match; Task 2 reducer → Task 6 matches; Task 3 layers → Tasks 4/5/6 match; Task 6 presentation/visibility callback → Task 7 slots match. Art source row count differs from the requested grid, so source drafts require explicit inspected row mapping before production export; do not mark wardrobe coverage complete from generated source count.

Planning baseline was `419e9d6` / `origin/main 53f8fb7`; existing draft PR #19.
Current checkpoint usage: **57% five-hour / 90% weekly remaining**, Nov 2 22:29
Asia/Bangkok; resets Nov 3 01:03 / Nov 9 09:20. Native execution is selected.
Do not repeat Tasks 1/2 or regenerate retained artwork. Recheck status/usage/fetch,
then resume the acceptance-hardening command and remaining work in CONTINUE.md.
Independent review must still cover the complete final branch.


### Resumed acceptance checkpoint — 2026-11-03 17:23 Bangkok

User requested stop; save and stop after delivery. Continue existing branch/PR19.
- Lifecycle acceptance strengthened: media changes/cleanup, hidden timers,
  queued stale loads and observer disposal; live-ending and archive App coverage.
- Full integrated suite **372/372**, 59 files, 91.46s; build passed (pre-art).
  Post-art focused **43/43**, six files; Pillow **2/2**, RED→GREEN on both defects.
- Exact ImageGen prompts/templates and source SHA-256 inventory now retained;
  built product/design/readme/sidecar docs updated. 179 runtime PNGs total
  **41,874,507 bytes**; conservative scene upper bound **1,720,121 bytes**, 7 layers.
- Browser sampled EN850/1280/1700, TH360/850/1700, live ending/archive, pending
  phone hiding, toggle Space/focus, all four speeds, offscreen suspension/reload.
  No console errors observed. Reduced-media/hidden subscriptions and stale/fail
  delivery covered by automated tests, not browser OS/network emulation.
- **Art acceptance remains open:** Migurd source-specific slicing removed row
  leakage, but some youthful body/garment frames are now visibly misregistered.
  Inspect ignored `fits-migurd.png`; fix aligned per-race garments/anchors before
  marking Tasks3–5/8 fully accepted. Recheck rank gear after tall-pose scaling.
- Independent final code review: no Critical/Important code findings. Parent
  retains responsibility for artwork and unfinished acceptance/docs accuracy.
- Final: minor (deferred): carried expanded legacy sword XP allocation causes a
  false promotion reaction; cosmetic only, future regression through selectSwordStyle.
- Final: minor (deferred): no-IntersectionObserver fallback fails to resample CSS
  pending hiding until viewport event; stale motion state on that fallback.
- Final: Ruling: reviewer set aside art/remaining browser/docs as parent's active
  work — keep these acceptance gates open and PR draft — cost if wrong: visually
  misregistered sprites could be treated as ready despite passing code tests.
- Source-specific Migurd registration and a shared tall-pose scale are saved as
  an incomplete art fix, not a new approved fit contract. Two mechanical tests
  establish removed leakage/clipping only, not clothing correctness.
- Usage: 15% five-hour /76% weekly remaining; resets Nov3 21:58:50 / Nov9 09:20:55
  Bangkok. Exact resume actions and environment are in CONTINUE.md. Do not
  regenerate retained art or repeat completed Tasks1/2. Do not publish or merge.

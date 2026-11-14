# App Navigation and Sidebar Usability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair browser navigation, current-life/archive return paths, sidebar
reachability and brand fitting while retaining the existing illustrated chronicle.

**Architecture:** Add a small pure route/URL module and integrate the native
History API in App. Derive section and archived preview from one route, with
navigation-only entry metadata for archive list restoration. Use semantic links
and focused CSS repairs, retaining simulation and persistence modules unchanged.

**Tech Stack:** Existing React19, TypeScript, Vite, plain CSS, lucide-react,
Vitest4.1.12 and React Testing Library; no new dependency.

**Spec:** [App navigation and sidebar usability design](../specs/2026-11-14-shell-navigation-design.md).

**Status:** Proposed execution plan, not started. The user requested both spec
and plan; this contingent plan is prepared for joint review without treating the
newly written spec as approved. No execution method has been selected.

## Global Constraints

- React, TypeScript, Vite, plain CSS and lucide-react; no new dependency.
- Node.js 22.12+ or a supported Node.js 24 release; npm commands run in six-faced-life/.
- Preserve seeded simulation, save schema/keys, pending decisions, existing lives and archive snapshots.
- Keep storage errors visible and recoverable; never clear player storage for QA.
- Preserve the approved paper/forest/gold system, self-hosted fonts/artwork, EN/TH, visible focus and reduced-motion support.
- No automatic merge, deployment, source upload, billing change or new remote service.

## Review Focus

1. Stale/invalid archive URLs and a temporarily unreadable save: do not discard a
   requested valid preview before a successful load retry (Tasks1-3).
2. Back after actual choices or new-life creation: route history must show latest
   data without rewinding age, RNG, decisions or saved balances (Tasks2-3).
3. Preview reload, direct-open and stale list row: return must stay in app and
   restore only valid list-entry focus/scroll without duplicate effects (Task3).
4. Modified clicks, skip-link hashes, repeated current-page activation and failed
   history writes: preserve native links and avoid history loops or URL/view drift
   (Task2).
5. Short windows, enlarged/long Thai text and mobile header wrapping: Help and
   all destinations stay reachable, with bounded title/menu layout (Task4).

## Setup and file ownership

This documentation followup updates PR30 on codex/ui-navigation-review. Product
implementation starts only after document approval and the repository Git rules
are satisfied. Recheck usage/status/fetch and read CONTINUE.md. Require a clean
new-task tree; the updater's local .codex/hooks.json and .gemini/settings.json must
be resolved by the user before a new implementation task, not staged or deleted
by the implementer. Do not create a worktree to bypass that requirement.

After the user manually merges the documentation PR, create a new task branch
from freshly fetched origin/main. If it is unmerged, obtain explicit integration
instructions before carrying these documents onto an implementation branch.
Never merge the documentation PR or synchronize main automatically.

| File | Responsibility |
| --- | --- |
| Create six-faced-life/src/navigation.ts | UI route types, pure parsing/canonical URL helpers, validated navigation metadata |
| Create six-faced-life/src/navigation.test.ts | URL and metadata boundary tests |
| Modify six-faced-life/src/App.tsx | Single route state, browser history, semantic shell links, focus/playback integration |
| Create six-faced-life/src/navigation.test.tsx | RTL integration for shell routes, links, recovery, archive return and latest data |
| Modify six-faced-life/src/components/Archive.tsx | Stable row identity and preview-opening links |
| Modify six-faced-life/src/App.test.tsx and six-faced-life/src/language.test.tsx | Keep existing assertions aligned with real navigation links; isolate URL state |
| Modify six-faced-life/src/i18n/messages.ts | Explicit EN/TH navigation labels and recovery copy |
| Modify six-faced-life/src/styles.css | Shared anchor states, scrollable sidebar, brand fitting, mobile menu/header positioning |
| Update six-faced-life/PRODUCT.md and DESIGN.md | Actual shipped route/pause/layout behavior after verification |
| Create docs/verification/shell-navigation.md | Commands, real browser evidence and limitations |
| Update CONTINUE.md and this progress ledger | Honest execution state and exact next step |

No game/, package, save schema, artwork or hosting changes are planned. If an
unexpected dependency requires changing that scope, stop and revise the plan.

## Shared interfaces

Define these in navigation.ts; App imports Page instead of owning another copy:

```ts
export type Page = 'chronicle' | 'character' | 'world' | 'archive' | 'new' | 'help';
export type AppRoute =
  | { page: Exclude<Page, 'archive'> }
  | { page: 'archive'; lifeId?: string };
export type NavigationContext = {
  hasLife: boolean;
  archiveIds: readonly string[];
  loadFailed: boolean;
};
export type RouteNotice = 'missing-archive' | null;
export type RouteResolution = { route: AppRoute; href: string; notice: RouteNotice };
export function resolveRoute(url: URL, context: NavigationContext): RouteResolution;
export function routeHref(route: AppRoute, base: URL): string;
export function sameRoute(a: AppRoute, b: AppRoute): boolean;
```

href values are same-origin pathname+search+hash, not serialized saves. All
helpers are pure; no window, storage, timers or simulation randomness.

### Task 1: Route parsing and safe URL normalization (N3, N5)

**Files:** Create navigation.ts and navigation.test.ts.

**Interfaces:** Consumes URL and NavigationContext above. Produces all shared
interfaces above; resolveRoute validates exact archive IDs only after loading.

- [ ] Write failing unit cases using URL('https://example.test/play?...#main-content'):
  bare root resolves chronicle with hasLife=true, new with false; six explicit
  sections round-trip; archive IDs with spaces/slashes/non-ASCII round-trip
  through URLSearchParams; unrelated query keys, pathname and hash survive.
- [ ] Add assertions: unknown/empty/duplicate view uses default; life outside
  archive is removed; empty/duplicate/missing archive ID resolves list with
  missing-archive notice. Missing life key on an ordinary archive list is valid
  with no notice. Explicit no-life character stays character.
- [ ] Add load-failure assertions: valid requested archive ID survives with
  loadFailed=true and archiveIds=[]; resolving after recovery opens it if present
  or falls back once if absent. Chronicle remains requested until recovery can
  determine whether a life exists. No helper mutates context or URL input.
- [ ] Run `npm test -- src/navigation.test.ts`; confirm the intended missing
  module/export or behavioral assertions fail, not unrelated setup errors.
- [ ] Implement exact helper signatures above and the specification's route
  table. Use URLSearchParams for encoding; do not add an ID regex/length limit.
- [ ] Run `npm test -- src/navigation.test.ts`; all added cases must pass.
- [ ] Commit only navigation.ts/navigation.test.ts with an explicit file list.

### Task 2: Browser history and working shell destinations (N1-N3, N5-N6)

**Files:** Modify App.tsx, styles.css, i18n/messages.ts, App.test.tsx and
language.test.tsx; create navigation.test.tsx.

**Interfaces:** Consumes Task1 helpers. App keeps one AppRoute state; page and
preview are derived from it plus validated data. Its internal entry point is
`navigate(next: Page, options?: { lifeId?: string; replace?: boolean; focusTarget?: string }): void`.
Expose no new game API. Archive calls are completed in Task3.

- [ ] Add failing integration tests named `restores URL section on mount and
  reload`, `pushes once and applies popstate without pushing`, `does not duplicate
  current destination`, and `keeps latest life when navigating history`.
  Assert URL, heading, active aria-current, menu closure and focus. For popstate
  in jsdom, replaceState to the reached URL then dispatch PopStateEvent inside
  act; test real Back/Forward in Task5. Assert pushState call counts explicitly.
- [ ] Add `pauses when leaving chronicle and never resumes through history`:
  start playing a seeded alive save, enter Character, advance fake timers, return
  and advance timers again. Persisted age/RNG/history/pending remain equal to the
  snapshot at departure; Play is shown. Add the same boundary with a manual-only
  pending choice and Watch enabled. Test actual chosen/focus/study data surviving
  Back/Forward, rather than only comparing a never-mutated fixture.
- [ ] Add `keeps save recovery route until retry succeeds`, `reports history
  write failure without changing the current view`, and `does not treat skip
  fragment as a route change`. Assert no automatic replacement of unreadable
  localStorage. Stub a one-shot history exception and confirm the error is visible
  and a subsequent link activation can recover without loops.
- [ ] Add link tests: brand href points to chronicle/new as appropriate;
  breadcrumb ancestor is a link, current item is text with aria-current; Help and
  main nav are anchors; normal click intercepts, Ctrl/Meta/middle/targeted new-tab
  activation is not prevented. Include Enter and visible focus in browser QA.
- [ ] Add `new-life history never recreates or restores an old active life`:
  entering form does nothing; actual creation replaces its route entry, keeps
  latest data through old chronicle entries, and preserves existing confirmation.
  This test may create/replace only its jsdom fixture, never player storage.
- [ ] Run `npm test -- src/navigation.test.tsx`; confirm meaningful RED.
- [ ] Replace mutable page/preview with one route. Add initial replaceState and
  popstate reconciliation with listener cleanup; only navigate() pushes. Merge
  object history state under the versioned namespace reserved for Task3. Resolve
  routes again after successful load retry or active/archive changes; do not
  push on those data-driven corrections or simulation ticks.
- [ ] Implement link interception only for an unmodified primary same-origin
  same-tab click. Keep real href values. Add semantic breadcrumb list and brand
  action labels from the spec; preserve existing desktop/mobile rendering and
  44px focusable target treatment. Extend existing button selectors to anchors
  where needed; avoid a blanket all-anchor reset.
- [ ] Connect transitions to existing focus/outcome handling and pause rules.
  Replace openSpellbook's two-step focus with navigate('character',
  {focusTarget:'spellbook-heading'}). A same-route fragment event does nothing;
  same-section activation closes the menu/focuses the heading without a push.
- [ ] Add explicit localized messages: `This past life is no longer available on
  this device.` / `ไม่พบชีวิตที่ผ่านมานี้ในอุปกรณ์นี้แล้ว`; `This section could not
  be opened. Try the link again.` / `เปิดหน้านี้ไม่ได้ โปรดลองกดลิงก์อีกครั้ง`.
  Use the existing recovery/notice vocabulary without replacing storage alerts.
- [ ] Update existing App/language tests only where controls intentionally become
  links. Reset test URL using history.replaceState({}, '', '/') in each App-mount
  suite's setup and ensure cleanup removes listeners. Do not clear history with
  repeated back(), weaken existing assertions or rewrite gameplay fixtures.
- [ ] Run `npm test -- src/navigation.test.ts src/navigation.test.tsx src/App.test.tsx src/language.test.tsx`;
  all cases pass. Confirm the existing storage/manual-choice/hidden-tab checks
  still make their original assertions. Commit task-owned files explicitly.

### Task 3: Archive preview URLs and reliable list return (N4-N6)

**Files:** Modify navigation.ts, navigation.test.ts, App.tsx, navigation.test.tsx,
components/Archive.tsx and any existing archive-opening assertions in App.test.tsx.

**Interfaces:** Add to navigation.ts:

```ts
export type NavigationEntry = {
  version: 1; entryId: string;
  archiveScrollY?: number; archiveLifeId?: string;
  archiveReturnEntryId?: string;
};
export function readNavigationEntry(state: unknown): NavigationEntry | null;
export function mergeNavigationEntry(state: unknown, entry: NavigationEntry): Record<string, unknown>;
export function archiveRowId(lifeId: string): string;
```

Namespace is sflNavigation. Entry IDs are UI identifiers independent of simulation
RNG. Archive receives `lifeHref: (life: Life) => string` and
`onRead: (life: Life) => void`; render real preview anchors with safe stable row IDs.
App owns `returnToArchive(): void`, used by both return controls. The control in
Ending may remain a button because it performs contextual return, not a fixed URL.

- [ ] Add failing metadata tests: null/array/malformed/unknown-version state is
  unavailable; finite nonnegative scroll only; unknown top-level fields preserved;
  no Life object serialized; distinct encoded IDs produce distinct safe row IDs.
- [ ] Add integration tests: list row opens matching preview URL and language;
  Back restores row focus with preventScroll and clamped saved Y; Forward reopens
  preview; direct-open return replaces list rather than invoking external Back;
  preview reload retains proven list provenance. Missing row/preview produces
  heading focus and one localized missing-life notice, not a focus exception.
- [ ] Add latest-data/immutability tests: inspect an English archive from a Thai
  active life, return, then traverse history after a real active-life choice.
  Deep-compare archive snapshots and latest active save with their expected values;
  preview navigation must not rearchive, migrate or change language preference.
- [ ] Run `npm test -- src/navigation.test.ts src/navigation.test.tsx`; confirm RED.
- [ ] Implement metadata validation/merge, row IDs and App preview lookup from
  route. Save list position before push; record predecessor only on a plain
  in-tab list->preview activation. Reload reads its validated marker. A direct
  link/new tab has no predecessor. returnToArchive uses Back only for proven
  immediate list provenance, otherwise replaces the preview entry with the list.
- [ ] Restore list scroll/focus after commit/layout. Use a bounded layout-settling
  strategy with cleanup; clamp to available height. Do not add a global scroll
  framework or continuously refocus on save/age changes. Retain native link and
  existing scene-still behavior for archived endings.
- [ ] Run `npm test -- src/navigation.test.ts src/navigation.test.tsx src/App.test.tsx src/language.test.tsx`;
  all pass. Real native scroll/history acceptance remains Task5. Commit explicit
  task files.

### Task 4: Sidebar reachability, brand fitting and mobile menu (L1-L3)

**Files:** Modify styles.css; modify App.tsx only if normal-flow header/menu
positioning requires a focused wrapper change. Extend navigation.test.tsx only
for changed semantic/menu behavior; do not assert CSS implementation strings.

**Interfaces:** Consumes the semantic links from Task2. Keep existing IDs,
aria-controls, expanded state and Escape-to-toggle behavior.

- [ ] On isolated port5174 capture the original failing 800x545 sidebar bounds
  and title bounds, plus a phone menu with enlarged text. Record expected checks:
  last control can be scrolled into view; title/icon fit the content box; menu
  begins after actual header and can scroll to its last item. Reuse prior evidence
  if the exact failures still reproduce; do not repeatedly generate artifacts.
- [ ] Add vertical sidebar scrolling and nonshrinking content at desktop/tablet.
  Fit the brand via min-width:0 text and a nonshrinking icon; allow a full readable
  two-line title. Preserve widths, main offset, fonts and palette. Remove conflicting
  nowrap rules where necessary rather than stacking another invisible workaround.
- [ ] Make the mobile menu follow actual header height and fit available viewport
  height, with scrolling. Choose minimal normal-flow or equivalent measured-height
  positioning that satisfies the spec. Keep the menu nonmodal and all 44px targets.
- [ ] Check desktop/tablet and phone keyboard flow: Tab reaches every destination
  and Help; focused sidebar content scrolls into view; Escape restores the menu
  toggle; activating links closes the menu. Check long names in both languages.
- [ ] Inspect each L2 width, short heights and real 200% browser zoom. Compare
  brand rectangles against sidebar/header content bounds, not only document
  scrollWidth. Confirm no horizontal overflow, clipping or menu/header overlap.
- [ ] Run the focused navigation/App/language tests; commit CSS and any directly
  necessary shell changes. Record actual visual results in Task5's evidence file.

### Task 5: Full verification, documentation and delivery

**Files:** Update PRODUCT.md, DESIGN.md, CONTINUE.md and this ledger; create
docs/verification/shell-navigation.md. Change implementation only for found defects.

**Interfaces:** Consumes all previous tasks; no additional product API.

- [ ] Recheck usage. Run `npm test` and inspect all results, then `npm run build`
  and inspect TypeScript/Vite output. Fix required failures. No nonexistent lint,
  typecheck or test:e2e script is required or claimed.
- [ ] Execute N1-N6 and L1-L3/V1 from the spec in a separate QA browser context
  or origin. Real browser Back/Forward, reload, modified click/new tab, archive
  list scroll and real zoom are mandatory; jsdom is not evidence for those.
- [ ] Cover EN/TH, legacy and expanded lives, birth/alive/ended/no-life, a pending
  manual choice, readable/missing archived previews, and a controlled unreadable
  save/load retry. Use existing fixture helpers/storage APIs to create valid QA
  records. Snapshot the isolated saved data before/after navigation; no cleared
  player storage. Restore QA fixtures if a previously occupied origin was reused.
- [ ] Inspect focus, console warnings/errors, horizontal overflow, menu boundaries
  and reduced-motion behavior. Record exact viewport dimensions, actual check
  results, evidence paths and any unavailable screen-reader/zoom checks honestly.
  One full suite/build is enough unless later changes justify rerunning them.
- [ ] Update product/design documents with implemented route, pause, breadcrumb
  and scroll behavior. Update the existing design.json only if its represented
  foundation/component previews changed; preserve its inventory. Do not silently
  rewrite unrelated stale sidecar entries reported by the skill updater.
- [ ] Obtain an independent scoped review of history/data boundaries and shell
  accessibility after implementation. Resolve material findings and verify affected
  flows. Do not claim the initial 25/40 score improved without a fresh critique.
- [ ] Update this progress ledger and CONTINUE.md with commit, checks, remaining
  issues, usage/reset observations and exact next step. Review git diff --check,
  all task files against origin/main and status; inspect new files too.
- [ ] Commit only task-owned files, push the named task branch and create/update
  its one PR explicitly targeting main. Fetch before handoff; report upstream
  advancement without automatically merging/rebasing. Draft if required checks
  fail or remain blocked. User merges manually; no publication.

## Progress ledger and plan self-review

| Task | Status | Evidence |
| --- | --- | --- |
| 1 Route helpers | Not started | Planning only |
| 2 Shell/history | Not started | Planning only |
| 3 Archive return | Not started | Planning only |
| 4 Sidebar/brand | Not started | Planning only |
| 5 Verification/delivery | Not started | Planning only |

Coverage: N1/N2 -> Task2; N3/N5 -> Tasks1-3; N4 -> Task3; N6 -> Tasks2-3;
L1/L2/L3 -> Task4; V1 and complete acceptance -> Task5. All five Review Focus
classes have explicit test/check owners. Interface names are consistent across
tasks. Layout uses rendered verification rather than jsdom CSS assertions.

Recommended execution after approval: **native**, because the history, focus,
playback and archive tasks share App state and benefit from one implementer
maintaining that context. Use one independent whole-branch review at the end.
The user may instead choose subagent-driven execution. Neither has started.

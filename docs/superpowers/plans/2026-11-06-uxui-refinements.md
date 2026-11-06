# UX/UI Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execution method has not been selected; native execution is recommended for these closely related components.

**Goal:** Implement the five priorities from PR #21 without changing simulation, saved lives, or historical narrative.

**Architecture:** Refine the existing React components and plain CSS. Keep disclosure/announcement state transient, monetary presentation in i18n helpers, and domain decisions canonical. Use normal-flow scene text and width-aware time-control groups; verify geometry in a browser rather than jsdom.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, plain CSS, lucide-react, Vitest, React Testing Library. Node.js 22.12+ or a supported Node.js 24 release; npm and the existing lockfile.

**Spec:** [UX/UI refinements](../specs/2026-11-06-uxui-refinements-design.md), reviewed in [PR #21](https://github.com/ny147/1-in-mushoku-tensei/pull/21), head `75575f73d9b10049551f8be5700e523a9f0b006e`, against `origin/main` at `100e395c9a3ab73859208163b1351f63225d5adb`.

**Authority:** The user requested review and planning on 2026-11-06. This plan is prepared for review; application implementation and publishing are not authorized by this document. The spec's detailed choices remain proposals until confirmed. Code execution begins only after user review of the plan/design.

## Global Constraints

- "No new dependency or artwork is needed."
- "Do not change simulation rules, age unlocks, mentorship costs/progress, career qualification, income, debt arithmetic, spells, RNG, identifiers or save schema."
- "Do not reset a life, rewrite history or migrate saves for presentation changes."
- "Preserve fixed per-life language, pause-on-decision, hidden-tab behavior, immediate persistence, recovery controls and keyboard focus management."
- "Use **silver** in English and **เหรียญเงิน** in Thai"; resources, XP, years and percentages retain their units.
- "Existing stored strings, immutable snapshots, and **rendered historical text** must stay the same."
- "Keep `spellbook-heading` as the stable focus/scroll target" and retain independent access to the complete spellbook.
- "Never clear or replace the player's `127.0.0.1:5173` storage."
- Retain warm paper, forest ink, restrained gold, original artwork and self-hosted English/Thai typography. No general design-system migration.
- Follow AGENTS.md: check usage/status, fetch, clean start, task branch from fetched `origin/main`, task-owned commits/explicit push, PR base `main`, manual user merge. No automatic upstream integration or publication.

## PR #21 Review

**Verdict: no blocking findings.** The PR adds a specification and checkpoint, not application behavior. Source inspection and an independent read-only review found the proposed boundaries feasible and consistent with the established product.

The currency boundary correctly protects `entryText` and `expandedEntryText`, which reconstruct history from shared catalogues. The plan therefore adds a live-decision presentation adapter rather than editing catalogue outcomes. Layout goals remain acceptance requirements, not evidence that the current UI already passes them. Application tests/build/browser checks were not run for this documentation review.

No behavior was silently excluded from review. Broader copy polish, design-system drift, and skill updates remain explicitly deferred by the spec.

## Review Focus

1. Shared EN/TH catalogue strings can change visible old or newly generated history even with unchanged JSON: Task 1 pins literal narrative outputs; Task 2 tests adapter isolation.
2. A user closes the current spell discipline, then time advances: Task 4 must keep it closed and only open a discipline when specialization actually changes.
3. History grows while Memories is selected: Task 7 updates results but keeps the announcement unchanged until a different filter is activated.
4. Newborn/legacy/ended characters have unusual retained progress or active obligations: Task 3 keeps facts reachable, locks intact and paid state outside disclosures.
5. Thai text, a retained desktop sidebar, reduced motion or failed scene assets reduce usable width: Tasks 5/6 and the Task 8 matrix check readable reflow and real geometry.

## File Map and Sequence

All `src/` paths below are relative to `six-faced-life/`.

| Task | Files and responsibility | Dependency |
| --- | --- | --- |
| 1 | New `src/i18n/money.ts`, `money.test.ts`; existing economic UI/effect formatters and tests: canonical structured amounts, history characterization | None |
| 2 | New `src/i18n/current-decision.ts`, `current-decision.test.ts`; `LifeView.tsx`: live-only authored economic copy | 1 |
| 3 | `LifeView.tsx`, `SwordProgress.tsx`, `styles.css`, respective tests, `messages.ts`: character order and stage-aware sword detail | 1 |
| 4 | `Progression.tsx`, `Progression.test.tsx`, `styles.css`, `messages.ts`, `App.test.tsx`: independent spellbook disclosures/focus | 3 |
| 5 | `life-scene/PixelLifeScene.tsx`, `scene.css`, `PixelLifeScene.test.tsx`, shared scene rules in `styles.css`: nonoverlapping scene text | None |
| 6 | `App.tsx`, `App.test.tsx`, `styles.css`: time-control layout with existing actions | None |
| 7 | `LifeView.tsx`, `LifeView.test.tsx`, `messages.ts`, `styles.css`: accessible chronicle filters/status | 3 |
| 8 | PRODUCT.md, DESIGN.md, affected `.impeccable/design.json` previews, this ledger, CONTINUE.md, new `docs/verification/uxui-refinements.md`: rendered acceptance and delivery | 1–7 |

Execute sequentially to avoid conflicts in `LifeView.tsx`, `styles.css` and messages. Keep existing component exports and callbacks unless a task below explicitly adds an interface.

## Before Execution

- [ ] Confirm design/plan approval and record the execution method. Recheck account usage and read the current CONTINUE.md. If any applicable window has less than 10% remaining, assess the bounded next step and prefer a verified save point before substantial work; the threshold is not completion.
- [ ] Inspect `git status --short --branch` and `git branch --show-current`; fetch with `git fetch origin --prune` (use the documented OpenSSL retry only for Schannel credential failure).
- [ ] Start application work on a clean `codex/uxui-refinements` from freshly fetched `origin/main`. Resume its existing branch if implementation has already started. If this spec/plan PR is still unmerged, request the user's integration decision; do not silently cherry-pick, merge or rebase it into the code branch.
- [ ] Read applicable AGENTS.md, README.md, PRODUCT.md, DESIGN.md, design sidecar and spec. Use the existing Impeccable context and craft-floor workflow when UI editing begins. Install with `npm ci` only if dependencies are missing/unusable.
- [ ] Run baseline `npm test` and `npm run build` from `six-faced-life/`; record failures before editing. Capture isolated EN/TH examples at 741px and 1280x720 so layout fixes can be compared with the actual baseline.

### Task 1: Canonical Structured Monetary Presentation

**Files:** Create `src/i18n/money.ts`, `src/i18n/money.test.ts`; modify `src/components/LifeView.tsx`, `Progression.tsx`, `ExpandedDetails.tsx`, `EducationProgress.tsx`, `src/i18n/choice-effects.ts`, `expanded-choice-effects.ts`, `choice-changes.ts`, `messages.ts`, and live monetary lines in `sword.ts`. Extend `choice-effects.test.ts`, `ExpandedDetails.test.tsx`, `EducationProgress.test.tsx`, `ChoiceOutcome.test.ts`, and `src/i18n/expanded.test.ts`.

**Interfaces:** Produce `currencyUnit(language: Language): string` and `moneyText(amount: number | string, language: Language): string`. The latter appends a space and the unit to the supplied numeric representation; callers retain existing `toLocaleString`, `Math.round` or `effectNumber` behavior. Do not introduce automatic rounding/grouping or a currency conversion. Existing public effect/component interfaces remain unchanged.

- [ ] **Step 1: Pin history before copy changes.** In `expanded.test.ts`, reuse seeded existing fixtures to record literal `entryText`/`expandedEntryText` title/text for EN/TH paid aid, instruction, work and education choices, including entries without message references and unknown-reference fallback. Add outcome-narrative and immutable retrospective assertions using existing ChoiceOutcome/ExpandedDetails fixtures. These characterization checks must pass on the baseline; never regenerate expected strings after copy changes.
- [ ] **Step 2: Add failing monetary tests.** Assert `currencyUnit('en') === 'silver'`, `currencyUnit('th') === 'เหรียญเงิน'`, `moneyText(0, 'th') === '0 เหรียญเงิน'`, `moneyText('+1.25', 'en') === '+1.25 silver'`, `moneyText('−2.5', 'th') === '−2.5 เหรียญเงิน'`, and preserved caller formatting such as `'1,000'`. Component/effect cases must cover annual base/actual income and spending, fee/shortfall, debt principal/balance/repayment/refund and savings; retain 12 household resource units as resources. Render both languages with LanguageProvider. Run the named files and observe failures for the current missing/inconsistent units.
- [ ] **Step 3: Implement the helper and structured call sites.** Preserve all amounts and sign conventions. Keep a shared unit only under an unambiguous group label; otherwise attach it to each monetary value. Use `effectNumber` before `moneyText` for signed fractional effects. Keep `coins` fields and every domain calculation unchanged. Audit money-like strings with `rg -n 'coins?|silver|เหรียญ' src/components src/i18n`; inspect call sites rather than globally replacing matches. Do not alter `EXPANDED_COPY`, STORIES_TH, YEARS_TH, history readers or generation paths; Task 2 owns mixed live/historical copy. Existing savings may retain its split `<small>` unit using `currencyUnit`.
- [ ] **Step 4: Run the focused tests.** `npm test -- src/i18n/money.test.ts src/i18n/choice-effects.test.ts src/i18n/expanded.test.ts src/components/ExpandedDetails.test.tsx src/components/EducationProgress.test.tsx src/components/ChoiceOutcome.test.ts`; expected: all pass, including literal historic text. Compare serialized fixtures before/after rendering to ensure no mutation.
- [ ] **Step 5: Commit only this task's files.** Review `git diff --check`; stage explicit paths and commit `feat: standardize structured monetary labels`.

### Task 2: Isolate Live Economic Decision Copy

**Files:** Create `src/i18n/current-decision.ts`, `current-decision.test.ts`; modify `src/components/LifeView.tsx` and `EventEffects.test.tsx`.

**Interfaces:** Produce `currentDecisionText(decision: Decision, life: Life, language: Language): Decision`. It first uses existing `decisionText`, then returns presentation-only authored overrides for monetary decision text/choice labels/descriptions. Preserve each `outcome` from that existing localized result, plus identifiers, numeric effects, disabled flags, requirements and localized payloads. Unknown decisions pass through existing localization. Consume Task 1's money helpers. No domain writes.

- [ ] **Step 1: Add failing tests.** Exercise current `expanded.training`, `expanded.training-quote`, `expanded.university`, paid instruction/aid/service/assignment choices and debt-funded enrollment in EN/TH. Assert `24 silver/year` / `24 เหรียญเงินต่อปี`, canonical units on every quote contribution and loan enrollment, unchanged nonmonetary duration/resource values, and unchanged risk/requirements/refund explanations. Assert the adapter leaves input, history, RNG and each `outcome` untouched, and does not change history reader output for the same choice. Test unknown decisions and restored pending decisions.
- [ ] **Step 2: Run `npm test -- src/i18n/current-decision.test.ts`.** Expected: fail because the adapter is absent.
- [ ] **Step 3: Implement the adapter and use it only in DecisionPanel.** Inventory monetary live text by stable decision/choice ID. Use narrowly authored bilingual templates, existing read-only quote functions (`quoteTraining`, `universityQuote`) and existing requirement text; never parse arbitrary prose or duplicate eligibility calculations. Education quote data includes total, admission, travel, tuition, living, starter fee, family, personal and loan; label them with a common explicit unit or individually. Keep historical `fundingDescription`/`courseDescription` and engine-generated decision/outcome strings intact. Nonmonetary clauses must be retained verbatim where possible; pin them in tests when a whole sentence needs an authored override.
- [ ] **Step 4: Run `npm test -- src/i18n/current-decision.test.ts src/i18n/expanded.test.ts src/components/EventEffects.test.tsx src/components/ChoiceOutcome.test.ts`.** Expected: all pass. Recheck the Task 1 inventory: classify remaining old wording as protected historical prose or a missed live-only surface and resolve the latter.
- [ ] **Step 5: Review the diff and commit explicit files** as `feat: isolate live economic choice presentation`.

### Task 3: Condition-First Character and Stage-Appropriate Sword Detail

**Files:** Modify `src/components/LifeView.tsx`, `SwordProgress.tsx`, `LifeView.test.tsx`, `SwordProgress.test.tsx`, `src/styles.css`, `src/i18n/messages.ts`.

**Interfaces:** Preserve `CharacterView({ life, onStudyChange, onSwordStyle })` and `SwordProgress({ life, onSelect })`. Reuse CharacterStats, ExpandedDetails, Training, CareerProgress and Family with a single instance each; keep SwordProgress's chronicle call site appropriate too.

- [ ] **Step 1: Add failing EN/TH tests.** Assert DOM order: condition including savings → origin/biography/memory → training/work → family → spellbook. Assert one study selector and one sword selector at eligible ages. Test expanded newborn, ages 5 and 8, legacy and ended lives. Under five, no disabled practice selector, native details contain all three factual tracks including unusual nonzero restored XP. At five, records/selector are visible; general rules remain disclosed. Existing pending/queued locks, no ended edit control, and legacy allocation guidance remain exact. Paid, paused, ready and deferred mentorship lines must not have a `<details>` ancestor even under five.
- [ ] **Step 2: Run `npm test -- src/components/LifeView.test.tsx src/components/SwordProgress.test.tsx`.** Expected: new order/disclosure tests fail while existing persistence cases remain valid.
- [ ] **Step 3: Reorder CharacterView in DOM and implement native sword disclosures.** Group ExpandedDetails and existing biography/memory in life/background; place sword progress with training/work, full Spellbook last. Use grid layout without CSS order or duplicated mobile/desktop content. Keep existing mentorship output and allocation outside general rules. Add localized concise summaries/unlock text. Do not change lock predicates, callbacks or progression.
- [ ] **Step 4: Rerun focused tests.** Then inspect 360x800 and 390x844: normal newborn condition heading in viewport 1; all values/savings by viewport 2. Check long names, Thai and 200% zoom for readable reflow rather than fixed distance. Check native disclosures with keyboard and one chronicle instance to catch shared-selector styling regressions.
- [ ] **Step 5: Commit explicit files** as `feat: prioritize condition and disclose sword guidance`.

### Task 4: Independent Spellbook Disclosures

**Files:** Modify `src/components/Progression.tsx`, `Progression.test.tsx`, `src/App.test.tsx`, `src/styles.css`, `src/i18n/messages.ts`.

**Interfaces:** Preserve `Spellbook({ life }: { life: Life })`, SCHOOL_IDS and `spellbook-heading` with `tabIndex={-1}`. Internally track open state by MagicSchool; initialize only the current specialization open. No stored preference or schema change.

- [ ] **Step 1: Add failing tests.** Assert exactly five native details summaries name school, learned count and current-study text. Mount with water current; water opens and four others collapse. Open fire, close water, rerender a new life object with the same specialization and advanced year/progress: fire stays open, water closed. Change specialization to earth: earth opens, fire stays open; close earth and rerender without specialization change: earth stays closed. Remount restores the new-current default. Confirm learned descriptions, rank/XP/next requirements remain reachable in every disclosure. App test: Open your full spellbook navigates and focuses `spellbook-heading`.
- [ ] **Step 2: Run `npm test -- src/components/Progression.test.tsx src/App.test.tsx`.** Expected: disclosure cases fail on existing articles.
- [ ] **Step 3: Implement the independent state and details/summary markup.** Handle native toggle without overriding user choice on unrelated life updates; react only to an actual specialization change. Retain multiple open sections, sage current-study emphasis plus text, five discipline identities, heading focus target and existing study eligibility. Adapt article-specific CSS selectors to details and provide visible summary focus.
- [ ] **Step 4: Rerun the focused tests.** In browser, use Enter/Space on summaries, study selection at age eight, help-to-spellbook focus, playback and fresh navigation in EN/TH.
- [ ] **Step 5: Commit explicit files** as `feat: add independent spellbook disclosures`.

### Task 5: Separate Scene Metadata, Caption and Footer

**Files:** Modify `src/components/life-scene/PixelLifeScene.tsx`, `scene.css`, `PixelLifeScene.test.tsx`, and pixel-scene-specific overrides in `src/styles.css`.

**Interfaces:** Keep PixelLifeScene props, sceneDescription, model, layers, loading and animation hooks unchanged. Add a footer wrapper for art credit, reduced-motion note and button; retain accessible button name/pressed/disabled/description semantics.

- [ ] **Step 1: Extend scene tests.** For EN/TH, loaded/loading/failed images and reduced motion, assert metadata, caption, credit, button and reduced explanation remain present and controls retain behavior/cleanup. Existing lifecycle/motion tests remain authoritative; do not assert geometry in jsdom.
- [ ] **Step 2: Run `npm test -- src/components/life-scene/PixelLifeScene.test.tsx src/components/life-scene/useLifeScene.test.tsx`.** Use any failing behavioral case to drive markup changes; existing passing lifecycle assertions are regression guards, not proof of the layout fix.
- [ ] **Step 3: Give text its own normal-flow grid rows.** Keep the raster world/shade absolute behind the content. Place wrapping metadata above a caption row and wrapping footer below it; let content grow scene height. Reserve the hero side in the caption row and enough visible space for the existing 128px integer-scaled hero. Remove conflicting fixed caption/footer coordinates for pixel scenes, including 650px/1700px overrides; preserve painted scenes elsewhere, sprite scaling, reactions and suspension rules. No JS text measurement or text clipping.
- [ ] **Step 4: Verify in browser.** At 1280x720 and each Task 8 width, compare rectangles for `.scene-top`, `.scene-caption`, credit, motion button and reduced note. None may overlap or escape the scene. Check longest available region/caption, infant/adult, failed/loading fallback, motion off, reduced motion and 200% zoom. Inspect recognizable hero and contrast visually, not just rectangles. Rerun focused scene tests.
- [ ] **Step 5: Commit explicit files** as `fix: separate scene text and control bands`.

### Task 6: Readable Time Controls at Narrow Content Widths

**Files:** Modify `src/App.tsx`, `src/App.test.tsx`, `src/styles.css`.

**Interfaces:** Preserve existing time actions/handlers, time-guidance and watch-mode-help IDs, speed values 1/2/4/8 and focus targets. Reuse `.time-main` and `.time-forward` as the two coherent groups.

- [ ] **Step 1: Extend the existing App interaction test only where needed.** Assert EN/TH accessible order Play/Pause → speeds → Watch → +1 year → Next decision; all speeds and Watch remain usable, pending decisions disable manual advance, Review choices focuses the pending heading, and resolving a choice retains current outcome behavior. Existing hidden-tab/persistence tests remain in the final suite.
- [ ] **Step 2: Run `npm test -- src/App.test.tsx`.** Record any real behavioral failures; do not invent a CSS-source test to make a layout regression fail in jsdom. Reproduce the Thai 741px problem in the isolated browser before CSS changes.
- [ ] **Step 3: Use wrapping flex groups driven by intrinsic usable width.** Give `.time-forward` a nonshrinking readable basis so it moves to a full row when both groups cannot fit. Permit its children to wrap onto further rows on phones. Keep Play/Pause and +1 year labels intact, Next decision at natural boundaries up to two lines with an intact icon, speeds at least 44x44px, all other buttons and clickable Watch label at least 44px high. Preserve guidance, help and year progress. Reconcile later existing overrides so they cannot reintroduce shrinking; add no sticky overlay or icon-only variant.
- [ ] **Step 4: Inspect 741px and 850px with sidebar present, phones, and boundary widths.** Sample paused/playing/Watch/manual pending/outcome in EN/TH; inspect label lines, target sizes, keyboard order/focus and overflow at default/200% zoom. Rerun App tests.
- [ ] **Step 5: Commit explicit files** as `fix: wrap time actions at usable content widths`.

### Task 7: Accessible Chronicle Filters and Explicit Status

**Files:** Modify `src/components/LifeView.tsx`, `LifeView.test.tsx`, `src/i18n/messages.ts`, `src/styles.css`.

**Interfaces:** Preserve `LifeRecord({ life, all = false })`. Add typed local filter `"all" | "memories"`, a named button group, named results region and a persistent empty polite status element. Store announcement text only on a transition to a different filter; compute its count from the full matching history at that moment.

- [ ] **Step 1: Add failing EN/TH tests.** All initially has `aria-pressed=true`, Memories false; activation reverses them while retaining clicked-button focus. With 20 records and 8 memories, rendered pagination remains five initially, status reports all 8 matches, and Read earlier moments adds 12. Zero memories uses existing empty copy and announces zero. Growing history while Memories is active updates results without changing status; reactivating the already-selected filter is a no-op. Switching back uses the current full count. Test `all=true`, ended data and any archive call site that actually renders filters; retain its existing 1000 initial limit.
- [ ] **Step 2: Run `npm test -- src/components/LifeView.test.tsx`.** Expected: pressed-state/group/status assertions fail on the current buttons.
- [ ] **Step 3: Implement the named group/results and event-driven announcement.** Keep native buttons, existing active class and pagination state/increments; no tab roles, filter persistence, live region around results, or automatic focus movement. Use localized filter/count text (including English singular/plural). Mount a blank `role="status"`/polite region before the first interaction so assistive technology observes subsequent updates.
- [ ] **Step 4: Rerun LifeView tests.** Check mouse and keyboard activation, visible focus, accessible names/states and status in browser. Check that repeated yearly ticks do not change the live-region text. Report browser semantics separately from any actual screen-reader listening performed.
- [ ] **Step 5: Commit explicit files** as `feat: expose chronicle filter state and status`.

### Task 8: Integrated Acceptance, Documentation and PR Delivery

**Files:** Modify `six-faced-life/PRODUCT.md`, `six-faced-life/DESIGN.md`, affected existing `six-faced-life/.impeccable/design.json` component previews, this progress ledger and `CONTINUE.md`; create `docs/verification/uxui-refinements.md`.

**Interfaces:** Produce a dated verification record identifying branch/commit, fixtures, browser, viewport/state coverage, automated command results and any unverified cases. Documentation must describe only behavior actually delivered. Keep the sidecar's format and unrelated previews unchanged.

- [ ] **Step 1: Run full `npm test` and `npm run build` from `six-faced-life/`.** Require both exit 0; fix task-caused failures. Record counts from actual output. No nonexistent lint/typecheck/e2e command and no claim that baseline historical checks validate this branch.
- [ ] **Step 2: Run isolated browser acceptance.** Use `npm run dev -- --port 5174` or a disposable context, never the player's 5173 storage. Reuse seeded fixtures and existing save/storage APIs; do not weaken validation or add a production debug route. Use this matrix with representative pairings rather than claiming every Cartesian combination was checked:

| Surface | Required states | Widths and proof |
| --- | --- | --- |
| Character | EN/TH newborn, age 5, age 8, adult training/debt/earned spells, legacy, ended; long names | 360x800, 390x844 first-two-viewport criteria; desktop order; 200% zoom/reflow; disclosures and focus |
| Scene | EN/TH longest region/caption, infant/adult, loading/failure, motion off/reduced | 1280x720 reproduction plus all width samples; nonintersecting text/control rectangles, no clipping, visible hero/contrast |
| Time | EN/TH paused, playing, Watch, manual pending, resolved outcome | 741, 850, 1280 and phone widths; correct labels/locks/focus, sizes and maximum two-line Next decision |
| Filters | All/Memories/zero, pagination, history growth, ended uses | Keyboard and mouse; named group/results, pressed state/count and unchanged live text on ticks |
| Economy | savings, paid choice, income/spending, training/university funding, debt/refund | Both languages; unchanged amounts, history prose and restored state after reload |

Also sample 1700px wide, 649/651px and 849/851px (one pixel around existing 650/850 boundaries), and both sides of any newly introduced breakpoint. Check horizontal overflow, keyboard focus, pending-choice phone scene hiding, console errors/warnings, pause/hidden-tab behavior and immediate study/focus/style persistence/reload on isolated saves. Record exactly which combinations were inspected. Stop only servers started for this work and reset viewport overrides.

- [ ] **Step 3: Run the Impeccable detector once over changed UI targets** with the installed launcher: `impeccable.cmd detect --json <changed targets>`. Reconcile findings against the approved visual authority; do not perform unrelated token/font/format migrations. Record unavailable tooling honestly.
- [ ] **Step 4: Update the actual-behavior documentation and ledger.** Amend the Character Spellbook, Sword/Character, Career and Education Finance previews as affected; add previews only for an affected existing component responsibility. Keep historical prose wording examples distinct from canonical live UI. Leave unresolved failures unchecked and use a draft PR if required checks are blocked.
- [ ] **Step 5: Review the complete diff and deliver.** Check `git diff --check`, all task files including new ones, `git diff origin/main...HEAD` and unstaged changes. Obtain one independent whole-branch review; resolve actionable findings and rerun affected verification. Commit only task files, push explicitly to `codex/uxui-refinements` with its own upstream, and create/update its PR with base `main`. Fetch/prune before final handoff; report whether latest `origin/main` is contained without merging/rebasing. The user merges manually; do not publish or enable auto-merge.

## Progress Ledger

| Step | Status | Evidence |
| --- | --- | --- |
| PR #21 specification review | Complete, 2026-11-06 | Head `75575f7`, base `100e395`; source comparison and independent read-only review; no blocking findings |
| Implementation plan | Prepared for user review | This document; no application code changed |
| Design/plan approval and execution method | Approved, 2026-11-06 | User requested implementation and explicitly approved updating existing PR #21 on codex/uxui-refinement-spec; native sequential execution |
| Tasks 1–8 | Not started | Test/build/browser commands above are future requirements, not executed results |

**Recommended execution:** native, sequential implementation, with the required independent whole-branch review before delivery. These tasks share components and CSS; concurrent edits would add integration work. The spec and this plan should be reviewed before execution.

### Execution rulings and pre-flight

- Ruling: continue the existing PR #21 branch rather than create codex/uxui-refinements — explicitly authorized by the user; all implementation stays reviewable in the same PR.
- Ruling: use this existing plan ledger with native Windows commands instead of shell-specific scratch scripts; preserves one durable checkpoint and per-task evidence.
- Pre-flight: Tasks 1→2 share monetary helpers; preserve caller number formatting. Tasks 3→4/7 share LifeView but keep independent transient state. Tasks 5/6 share responsive CSS; verify final cascade together in the browser. No interface conflict found.
- Baseline build: PASS; existing >500kB bundle advisory. Initial sandbox esbuild spawn EPERM resolved by escalated execution. Baseline tests running.

- Baseline suite: 372/372 tests, 59 files passed (73.79s).
- Task 1: complete — monetary helper and structured savings/income/debt/effect surfaces. Debt-unit regressions RED→GREEN; history snapshot pinned before UI edits and unchanged; focused 38/38 tests passed. Protected education generation helpers/catalogues unchanged.

- Task 2: complete — live-only decision adapter; focused 32/32 tests pass, canonical decisions/outcomes/history/RNG unchanged. Exact known education fragments retain requirements/refund clauses. Mentorship copy is opt-in at UI call sites because the same reader also feeds generated history; its default wording remains historical.

- Task 3: code verified — condition precedes background/training/family/spellbook, sword details by age with visible legacy/paid obligations; 11/11 focused tests passed after RED. Rendered newborn/zoom acceptance remains for Task 8. Character-page education finance is now reachable too.

- Task 4: code verified — independent native disclosures, current study opens only on actual selection change; 24/24 focused tests pass after RED. Full spellbook focus is additionally covered in the integrated App assertions.
- Tasks 5/6 baseline rendered failures observed in IAB: Thai741 Next decision fragmented into three lines and +1 year split;1280 scene metadata/caption intersect, art credit/motion intersect. These are layout failures, not jsdom claims.

- Task 5: code verified — separate metadata/stage/footer rows, hero layers share the caption row; loaded/fallback/reduced semantics retained. Task 5/6 regression run 31/31 passed; build passed. Thai741 inspected: text/control rectangles separate; hero visible; no horizontal overflow. Full matrix remains Task 8.

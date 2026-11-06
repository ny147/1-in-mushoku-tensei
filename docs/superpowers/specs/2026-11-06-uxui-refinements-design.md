# UX/UI refinements

Status: **proposed design for user review, 2026-11-06**. Documentation only;
implementation and a task-by-task implementation plan have not started.

## Intent and authority

Make the current character, scene information and time controls easier to read,
and make economic labels and chronicle filters consistent. Preserve the approved
illustrated-chronicle identity: warm paper, forest ink, restrained gold,
self-hosted English/Thai type and original artwork.

The user requested a specification to implement the preceding UX/UI review.
This draft interprets that request as covering **all five priority findings**.
The detailed presentation choices below are builder proposals awaiting review,
not additional user-confirmed decisions.

Review evidence is archived in [review PR #20](https://github.com/ny147/1-in-mushoku-tensei/pull/20)
at `.impeccable/critique/2026-11-06T12-26-25Z__six-faced-life-src-app-tsx.md`.
That file may remain on its review branch until the user merges it; this spec is
self-contained and does not require its local presence. Product and visual
authority remain [PRODUCT.md](../../../six-faced-life/PRODUCT.md),
[DESIGN.md](../../../six-faced-life/DESIGN.md) and the approved
[pixel-scene design](2026-11-02-pixel-life-scene-design.md).

Audience: new and returning players checking a life on desktop or phone,
including keyboard and assistive-technology users. Controls and progression use
Operate mode; narrative remains a Read surface. No replacement visual world.

## Approaches

| Approach | Benefit and tradeoff | Disposition |
| --- | --- | --- |
| Refine existing components and their layout | Addresses all five findings while retaining familiar navigation, assets and behavior; needs small structural, copy and semantic changes as well as CSS. | Recommended in this draft; awaiting user approval. |
| Restrict the pass to CSS | Resolves scene/control geometry quickly; leaves currency terminology and filter semantics unresolved, and cannot reliably repair accessible reading order. | Incomplete coverage. |
| Redesign the character and chronicle screens | Could reorganize more systems; expands scope and reopens an approved identity and interaction model. | Outside this request. |

## Scope and non-goals

Five deliverables: character-page information order/disclosure; scene text
separation; responsive time controls; currency vocabulary; accessible record
filters. Reuse existing React components, domain helpers, native controls and
plain CSS. No new dependency or artwork is needed.

Do not change simulation rules, age unlocks, mentorship costs/progress, career
qualification, income, debt arithmetic, spells, RNG, identifiers or save schema.
Do not reset a life, rewrite history or migrate saves for presentation changes.
Preserve fixed per-life language, pause-on-decision, hidden-tab behavior,
immediate persistence, recovery controls and keyboard focus management.

Keep the approved quiet/result-panel behavior: progression uses existing time
controls; do not introduce continuation shortcuts. Preserve chronicle mobile
reading order and the hidden scene during a pending phone decision. This pass
does not move the chronicle's entire character rail ahead of its story.

Minor review observations (birth grammar, repeated aptitude prose, wider help
content) and Impeccable configuration/token reconciliation are deferred. No
skill update, hosting upload, deployment or production publication is authorized.

## 1. Character page: present condition before future progression

### Structure

Keep the page h1 and identity passport. After them, use this accessible document
order, omitting sections that do not exist for that ruleset:

1. **Your condition**: health, happiness, knowledge, bonds and savings.
2. **Life and background**: current history/origin facts, biography and existing
   previous-life memory summary.
3. **Training and work**: current magic training/study controls, sword progress,
   and existing career information.
4. **Family**: existing relationships and family disclosures.
5. **Your spellbook**: the complete, independently accessible discipline record.

Use one instance of each section and control. Desktop can retain a main column
and supporting rail, but DOM, keyboard and assistive-technology order must keep
condition before optional progression and the full spellbook. Do not create
separate mobile/desktop copies or use CSS order to contradict that sequence.
The implementer may choose grid areas and wrappers within those constraints.

At 360x800 and 390x844, default text size, with a normal newborn identity, the
condition heading must appear in the first viewport and all condition values,
including savings, within the first two. Long names, Thai wrapping and 200% zoom
must remain readable; their acceptance is logical order and reflow, not a fixed
pixel-distance limit. Do not achieve these targets by shrinking type or hiding
condition values.

### Sword information

Before age five, show a compact Sword styles heading and localized practice
unlock sentence. Put the three retained rank/XP records and general advancement
rules inside a native disclosure; omit the disabled practice selector from the
compact view. Recorded nonzero progress must remain discoverable, including in
restored unusual/legacy states.

At age five and above, keep the existing three factual tracks and labeled style
selector visible. General Saint+ instruction and job/event-style explanations
belong in a native About sword advancement disclosure. Existing eligibility,
pending/queued choice locks and read-only ended states remain exact.

One-time legacy-allocation guidance and actual paid mentorship state are always
visible when present, regardless of age. In particular, paid fee, paused reason,
eligible-year progress and ready/deferred trial guidance must not disappear into
the general rules disclosure. Do not enable a control that domain rules lock.

### Spellbook

Keep `spellbook-heading` as the stable focus/scroll target for Open your full
spellbook. Show the existing introduction, then five native disclosures. Each
summary names its discipline, learned-spell count and current-study status when
applicable; XP/rank and complete spell descriptions/next requirements remain
available inside. Status is expressed in text as well as existing sage emphasis.

On mounting the character page, open the current discipline and collapse the
other four. Users can open several and close any of them. Selecting another
discipline opens that discipline without closing others the user opened.
Ordinary playback/rerenders must not undo the user's disclosure choices. These
are transient UI states; do not add them to saves. Navigating afresh can restore
the default current-discipline expansion.

## 2. Scene metadata, caption and controls occupy separate space

The review reproduced region/Infancy overlap at 1280x720: top metadata occupied
y407-429 while the caption's life-stage span occupied y408.66-422.66. The compact
160px scene and constrained caption measure must no longer force text upward.

Reserve distinct vertical bands for top metadata, narrative caption, and bottom
art-credit/motion controls. Metadata can wrap naturally within its own band.
Allow scene height to grow with localized text at compact desktop widths; the
existing 160px value is not a requirement. Do not clip, truncate, remove or shrink
meaningful text to preserve that height. Prefer CSS layout over JavaScript text
measurement or per-language hardcoded coordinates.

Keep the caption on the opposite side from the hero. The hero must remain
recognizable, and the motion button/reduced-motion explanation must remain
readable and operable without covering captions or metadata. Apply the same text
safety to the painted loading/failure fallback. Keep original raster layers,
integer sprite scaling and all animation/suspension policies unchanged.

Acceptance: at the specified widths, rendered bounding rectangles for metadata,
caption, credit and motion controls do not intersect; no text is clipped and no
horizontal overflow is introduced. Use visual inspection as well as geometry,
because a visible hero and readable artwork/text contrast are also required.

## 3. Time controls wrap according to usable width

Preserve every action and its state: Play/Pause; four speeds; Watch; advance up
to one year; Next decision; pending guidance/Review choices; year progress.
Maintain existing order in DOM and keyboard traversal.

Treat playback/speeds and Watch/manual advancement as coherent groups. When
they cannot fit side by side, move the latter group to a full row before its
buttons shrink into fragmented labels. This must work while the desktop sidebar
is still present, including the reproduced Thai 741px viewport. The implementer
chooses a content-aware CSS strategy or verified breakpoint; no viewport-only
assumption that a phone breakpoint fixes every narrow content column.

Keep Play/Pause, the short +1 year label and their icons together. Next decision
can wrap at natural language boundaries to at most two readable lines, with its
icon intact. Watch's clickable label remains at least 44px high; speed buttons
remain at least 44x44. Other time buttons have minimum 44px height and enough
width for their labels. Keep explicit active/disabled/focus state and adjacent
Watch explanation. No icon-only substitutions or new sticky overlay is needed.

## 4. One currency name in current economic UI

Use **silver** in English and **เหรียญเงิน** in Thai, matching the existing
savings/choice convention. Examples: 24 silver/year; 24 เหรียญเงินต่อปี;
Remaining debt: 16 silver; หนี้คงเหลือ: 16 เหรียญเงิน.

Apply this to current savings, income/base pay, annual actual income/spending,
fees/shortfalls, structured choice effects/outcome changes, training/university
quotes, personal and family monetary contributions, refunds, and education
debt/repayment.
Every standalone monetary value must identify its unit; a clearly labeled
group/table header can supply a shared unit. Household resource units, XP,
reputation, years, percentages and other nonmonetary numbers must keep their
own meaning. Do not relabel resources as money.

Centralize monetary labeling/formatting through an appropriate small helper in
the existing i18n/presentation layer. Retain existing sign, numeric precision and
locale behavior unless a specific display is already defined differently. No
currency conversion or arithmetic change. Internal `coins` fields and identifiers
remain unchanged. Translate authored copy in both languages; do not perform
runtime regex replacement across arbitrary prose or payloads.

The generation boundary is explicit:

- Canonical wording is required for current structured economic labels/amounts,
  quotes, effect previews and actual numeric outcome changes. Live-only decision
  labels/descriptions may use narrowly authored presentation overrides when
  needed, without mutating the canonical engine decision or shared history copy.
- Existing stored strings, immutable snapshots, and **rendered historical text**
  must stay the same. `entryText` and `expandedEntryText` reconstruct some Thai
  history from shared catalogues; preserving JSON alone is insufficient. Leave
  those narrative readers and the catalogue entries they use unchanged.
- The same preservation rule applies to shared narrative prose shown in a current
  outcome panel and to newly recorded chronicle prose. New history continues its
  existing generation/localization path; this pass does not require its prose
  to replace coins with silver, introduce copy versions or change the schema.
  Structured monetary feedback alongside it uses the canonical unit.
- Static labels surrounding a historical record may use silver/เหรียญเงิน, but
  do not normalize the record itself. A catalogue/file can contain both live and
  historical copy: inspect individual call sites rather than treating a whole
  file as safe to edit. Do not regenerate entries, change identifiers or run
  regex replacement over prose or payloads.

This intentionally limits vocabulary unification to economic UI and live-only
copy; preserving historical narrative takes priority over standardizing prose.

## 5. Chronicle filter selection is perceivable without color

Keep All and Memories as two native buttons in a named filter group. Add
`aria-pressed` to both, with exactly one true. Reuse the active visual class;
these are filters, so do not introduce tab roles/arrow-key obligations.

Filter activation retains focus on the clicked button and updates the existing
results. Add a short polite status for explicit filter changes, for example
Memories: 2 moments / ความทรงจำ: 2 ช่วงเวลา. Count all matching records, not
only the currently rendered page. The results region has an accessible name.
The status must not announce automatic yearly ticks or every newly added entry.

Keep the existing filter definitions, newest-first ordering, initial five-record
limit, Read earlier moments increments, history payloads and empty-state text.
Do not add filter persistence, change pagination semantics or move focus to the
results automatically. Ended/archived read-only uses of the record retain their
existing data and limits while receiving the same filter semantics if present.

## Implementation boundaries

| Area | Expected responsibility |
| --- | --- |
| `src/components/LifeView.tsx` | CharacterView grouping/order; LifeRecord filter semantics and change status. |
| `src/components/SwordProgress.tsx` | Stage-appropriate disclosure with retained factual records and visible active obligations. |
| `src/components/Progression.tsx` | Spellbook disclosure behavior; retain study selector and focus target. |
| `src/components/life-scene/PixelLifeScene.tsx`, `scene.css` | Scene overlay structure/geometry and existing fallback integration. |
| `src/App.tsx`, `src/styles.css` | Time-control grouping/layout, responsive character layout and shared scene rules. |
| Existing components and `src/i18n/` | Canonical currency copy/helper and localized filter/disclosure labels, including education finance. |

Paths in this table are relative to `six-faced-life/`. The implementer chooses
small helper names, wrapper structure and exact spacing from existing patterns.
Do not move simulation rules into React or introduce new domain state. Inspect
all call sites before changing shared components: chronicle and character views
must retain their appropriate level of detail.

After implementation, update PRODUCT.md, DESIGN.md, the relevant existing design
sidecar previews if affected, and CONTINUE.md to describe actual delivered
behavior. Keep confirmed decisions and proposed future work distinct. This spec
does not authorize a general design-system migration.

## Verification and acceptance

This document records required future checks, not tests already run.

### Meaningful automated checks

- Character reading order exposes condition before progression/full spellbook;
  early unlock text, retained sword records, legacy allocation and paid/paused/
  ready mentorship remain available under the correct states.
- Spellbook opens the current discipline initially, allows independent user
  expansion, opens a newly selected discipline, preserves expansion across
  ordinary rerenders, and retains the existing heading focus target.
- All/Memories announce their pressed state, matching-result count and explicit
  change status, including no matches; normal history growth is not announced
  as a user filter change. Verify keyboard focus retention.
- EN/TH current economic displays consistently label representative zero,
  signed/fractional outcome, annual income/spending, fee, debt and refund values.
  Resource units remain distinct. Compare `entryText`/`expandedEntryText` output
  for representative existing EN/TH records as well as stored payloads, so shared
  catalogue changes cannot silently alter their visible past. New history uses
  the existing narrative path; immutable retrospectives remain verbatim. Use
  existing fixtures rather than adding a migration.
- Existing tests continue to cover playback, focus, persistence, pending choices
  and scene lifecycle. Add targeted behavior regressions where this pass changes
  behavior; avoid tests that assert CSS source strings or arbitrary wrappers.

Run `npm test` and `npm run build` from `six-faced-life/` during implementation.
Do not claim layout geometry is verified by jsdom or require nonexistent lint,
typecheck or end-to-end scripts. No dependency installation unless needed.

### Rendered checks

| Surface/state | Required samples and outcome |
| --- | --- |
| Character | EN and TH; expanded newborn, age 5, age 8, adult with training/debt and earned spells; legacy and ended read-only cases. Present condition first, retained records/actions reachable, no duplicated controls. |
| Scene | EN and TH; longest available region/caption labels, infant/adult, loading/failure fallback, motion off and reduced-motion explanation. Metadata/caption/credit/controls remain separate and hero visible. |
| Time | EN and TH; paused, playing, Watch, pending manual choice and resolved outcome. Labels stay readable; actions, locks and focus retain existing behavior. |
| Record filters | All, Memories, zero matches, enough records for Read earlier moments; mouse and keyboard, accessible state/count, no tick announcements. |
| Economy | Compare savings, paid decision, work income and education funding/debt; units are consistent and actual amounts unchanged after reload. |

Viewport coverage: 360x800, 390x844, the reproduced 741px width, 850px tablet,
1280x720, and 1700px wide desktop. Also inspect one pixel below/above the 650px
and 850px layout boundaries; cover other changed breakpoints if introduced.
Inspect 200% zoom/reflow, visible keyboard focus, disclosure operation, console
warnings/errors and horizontal overflow. A sampled inspection is not a claim of
complete WCAG certification.

Use a disposable browser context or isolated preview origin. Never clear or
replace the player's `127.0.0.1:5173` storage. Exercise pending choice, pause and
reload with seeded fixtures on the isolated origin. Record observed browser
results separately from automated/source-only evidence; stop review-only servers
and reset viewport overrides after use.

Run the Impeccable detector once over changed markup targets after UI work is
finished. Reconcile findings against the established visual authority; the review's
415 declaration findings are not an instruction to recolor/retype the app.

## Approval and delivery

User review of this proposed design is the next decision. Once approved, create
the implementation plan using the normal planning workflow. Do not interpret
creation or merging of this documentation PR as approval to implement or publish.

Implementation later follows AGENTS.md: fresh usage/Git checks, a clean task
branch from fetched origin/main, relevant tests/build and isolated browser QA,
task-owned commits/push, PR targeting main and manual user merge. If main advances,
report the difference without automatically merging or rebasing it.

---
target: Six-Faced Life UX/UI review
total_score: 28
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
target_identity: "file:D:\\Developer\\mashoku bilion\\six-faced-life\\src\\App.tsx"
target_fingerprint: "sha256:ebf7e65de45761a49593797c2a2473de3305841afc2269bc2ef527a6ead1027e"
target_path: "D:\\Developer\\mashoku bilion\\six-faced-life\\src\\App.tsx"
timestamp: 2026-11-06T12-26-25Z
slug: six-faced-life-src-app-tsx
---
Method: dual-agent (A: /root/design_review · B: /root/detector_review)

# Six-Faced Life UX/UI review — 2026-11-06

Target: `six-faced-life/src/App.tsx`, its composed views and styles, at `origin/main` `100e395`. Mode: Operate for controls and progression, Read for the chronicle. This is a heuristic review, not a user study or a complete accessibility certification. No application changes are included.

## Design specificity and overall impression

The interface feels authored for a personal fantasy chronicle: warm paper, forest ink, literary headings, original scenery and retrospective language reinforce one another. Preserve that visual direction. The biggest opportunity is making the current person and next useful action easier to find as progression systems grow.

## Design health

| Heuristic | Score /4 | Evidence |
| --- | ---: | --- |
| System status | 3 | Explicit paused/pending state, saved status and actual outcomes. |
| Match with the real world | 3 | Natural story language; occasional raw labels enter prose. |
| User control and freedom | 3 | Pause, manual stepping, return navigation and replacement warning. |
| Consistency and standards | 2 | Silver/coins terminology and filter selection semantics differ. |
| Error prevention | 3 | Unaffordable choices disabled; replacing a life takes an explicit second action. |
| Recognition rather than recall | 3 | Effects previews help; mobile status is buried. |
| Flexibility and efficiency | 3 | Play, stepping, four speeds, Watch and disclosures. |
| Aesthetic and minimalist design | 3 | Coherent visual identity; irrelevant infant progression and overlapping scene text weaken hierarchy. |
| Error recovery | 3 | Persistent retry and preservation guidance verified in source; failures not induced in this review. |
| Help and documentation | 2 | Clear overview; expanded training, activities and loans need more task-focused help. |
| **Total** | **28/40** | **Good** |

## What works

- Decisions respect reading: the phone scene disappears while a decision is pending, effects are visible before commitment, and actual results replace choices afterward. Focus moves to the relevant heading and reassurance removes time pressure.
- Labeled mobile navigation, visible gold keyboard focus, semantic headings/meters and explicit saved/time states make a substantial simulation approachable.
- The empty archive explains its purpose, offers a return to the active life and discloses its browser-local, 20-life limit without breaking the tone.

## Priority issues

### 1. [P2] Current character condition is buried beneath future progression

At age zero on a 390×844 viewport, Sword styles begins around document y457, including a disabled practice selector and Saint+ mentorship rules. The biography begins around y1354, the five-discipline spellbook around y1993, and Your condition around y3264. A player checking health or savings must traverse roughly four phone viewport lengths.

Put current condition and identity first. Keep locked sword progression as a compact age-appropriate summary with advanced rules disclosed on demand. Give the full spellbook a compact index or disclosure. Preserve access to all recorded details.

Source: `six-faced-life/src/components/LifeView.tsx:720` places SwordProgress first; `:785` places Spellbook before the aside containing CharacterStats at `:788`. Suggested command: `$impeccable adapt`.

### 2. [P2] Desktop scene metadata and life-stage text overlap

At 1280×720, Infancy is superimposed on the region badge, observed for Ranoa and Asura. The top metadata occupies y407–429; the caption's Infancy span occupies y408.66–422.66. The 160px scene height and narrow caption force the headline upward into the metadata band.

Reserve separate metadata and caption bands, or provide enough scene height and title measure at the affected desktop breakpoint. Verify long English and Thai captions while keeping the caption and hero on opposite sides.

Source: `six-faced-life/src/styles.css:723`, `:3969`; `six-faced-life/src/components/life-scene/scene.css:57`. Suggested command: `$impeccable layout`.

### 3. [P2] Tablet time controls squeeze Thai labels into awkward stacks

On the Thai chronicle at a 741px inner viewport, the desktop sidebar remains while time controls compete for the remaining width. The +1 year button measures only about 43.5px wide and 57.6px high; its short label breaks across lines. Next decision also becomes a tall, fragmented label. The phone layout below 650px wraps more coherently, so checking only desktop and phone misses this intermediate-width problem.

Wrap the time-control groups earlier according to available content width. Keep labels and button icons together, prevent the step button from shrinking below a readable width, and reuse the clear phone rows where necessary. Preserve all existing playback behavior.

Source: `six-faced-life/src/styles.css:550`, `:598`, `:2581`, `:3894`; controls in `six-faced-life/src/App.tsx:629`. Suggested command: `$impeccable adapt`.

### 4. [P2] Currency terminology makes economic comparisons uncertain

Savings and decision fees use silver, while Work and opportunity uses coins per year. Last annual income and Actually spent omit a unit. These refer to the same currency, but a player comparing work, course fees and savings could infer separate denominations.

Choose one player-facing currency label and apply it to savings, income, costs, debts and outcomes, including annual accounting. Preserve numerical values and mechanics.

Source: `six-faced-life/src/components/LifeView.tsx:111`, `:384`; `six-faced-life/src/components/ExpandedDetails.tsx:136`. Suggested command: `$impeccable clarify`.

### 5. [P2] Chronicle filters do not announce which filter is selected

All and Memories are ordinary buttons in the accessibility tree. Source confirms that their selected state exists only through an active CSS class. Keyboard activation works, but assistive technology cannot identify the current filter programmatically.

Expose the filter state with `aria-pressed` or an appropriate tab pattern, and label the filtered results/update clearly. Keep the current visual treatment and keyboard focus safeguards.

Source: `six-faced-life/src/components/LifeView.tsx:450`. Suggested command: `$impeccable harden`.

## Cognitive load and emotional journey

Cognitive load is moderate on the expanded character page: current-state hierarchy, stage-appropriate disclosure and chunking each need attention. Pending decisions isolate one task well, and yearly focus is collapsed by default. Source-only adult states can expose nine activity buttons or eight focus choices; their count is a prompt for later adult testing, not proof of overload. Native selects and the six-region world grid already disclose/group their choices.

The opening painting and second-chance language create possibility; a named birth record and first consequential choice make the life personal. Readable effects, reassurance and outcome feedback create a satisfying early sequence. The emotional valley is opening an infant's character page and meeting locked progression before the person's present condition. The empty archive restores the tone. Endings were not exercised, so this review makes no observed claim about their emotional payoff.

## Persona red flags

- **Jordan, first-time player:** future sword systems lead the character view; silver versus coins obscures economic comparisons. Raw numeric phrases such as Base Mana +5.49 can feel unlike the surrounding prose.
- **Sam, keyboard/assistive-technology user:** filter state is not announced. Navigation focus and menu Escape behavior worked, but NVDA and a complete contrast/zoom audit were not run.
- **Casey, distracted phone player:** current health and savings require extensive scrolling on the character page. Pending-decision simplification and explicit pause/saved guidance are strengths.

## Minor observations

- Birth copy can read “You are born in Ranoa Kingdom, into Poor.” Author a grammatical household phrase rather than interpolating the wealth label directly (`NewLife.tsx:200`).
- Infant work accounting exposes Child, Level 0, Experience 0, 0 years and yearly finances. A short childhood explanation would provide more meaning, with the detailed record still available.
- Natural aptitude guidance is repeated in the character page's history and biography sections.
- Do not add result/quiet-panel continuation shortcuts as an assumed fix: their current behavior is an approved product decision.

## Deterministic scan and reconciliation

The source scan reported **415 findings: 408 advisory and 7 warning**, across four design-system rules. These are declaration/documentation comparisons, not 415 confirmed usability or accessibility defects. No findings were directly in App.tsx or component TSX markup.

| Rule | Count | Locations |
| --- | ---: | --- |
| design-system-color | 176 advisory | styles.css 170; life-scene/scene.css 6 |
| design-system-font-size | 223 advisory | styles.css 220; life-scene/scene.css 3 |
| design-system-radius | 9 advisory | styles.css 622, 1154, 1239, 1452, 1483, 1922, 2847, 2870, 3049 |
| design-system-font | 7 warning | styles.css 2, 8, 80, 88, 117, 120, 134 |

All seven font warnings concern approved self-hosted Thai font aliases documented in DESIGN.md prose. Focus gold #8c7039 at styles.css 169 and 3812 is also explicitly documented. Many size advisories compare responsive/component sizes with a limited base ramp; radius advisories include switch, meter and timeline geometry. Do not mechanically remove these values or replace the approved visual world. A future design-system reconciliation can distinguish intended variants from unnecessary drift.

The detector missed the verified desktop scene overlap and the interaction/copy issues above. Native screenshots and DOM geometry supplied those findings; no reliable browser overlay was available because the supported evaluate API is read-only.

## Evidence and limits

A independently inspected desktop around 1264×712 and phone 390×844: new life, birth, first pending decision/result, character, world and empty archive. B independently inspected 1280×720 and 360×800: chronicle, character, world, help and empty archive. Parent inspected the Thai chronicle/character at 741px inner width.

B found no horizontal overflow at its two tested sizes, zero captured warning/error console entries, visible gold keyboard focus, route-to-heading focus, and mobile menu Escape/focus restoration. Speed buttons were 44×44 and the clickable Watch label was 102×44. These successful samples do not establish complete accessibility conformance.

Adult progression, storage-failure recovery and completed retrospectives were source-reviewed rather than fully exercised. Existing saves were preserved; only A's new disposable localhost:5176 life was created and left paused. Port 5173 was never visited. No application changes, deployment or publication were performed.

## Questions for the next pass

Which matters most next: mobile character hierarchy, scene/tablet layout, or currency/accessibility consistency? Should the next pass address the three layout/hierarchy findings first or all five findings?

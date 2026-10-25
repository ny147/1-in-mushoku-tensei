---
name: Six-Faced Life
description: A quiet illustrated chronicle of a second life.
colors:
  paper: "#f6f4ee"
  white: "#fdfcf8"
  ink: "#303b32"
  muted: "#697065"
  line: "#dedfd3"
  green: "#365442"
  green-dark: "#284433"
  sage: "#e9ede2"
  gold: "#967c43"
  sidebar: "#f0f0e7"
  decision-paper: "#fcfcf5"
typography:
  display:
    fontFamily: "Chronicle, Georgia, serif"
    fontSize: "53px"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Chronicle, Georgia, serif"
    fontSize: "42px"
    fontWeight: 600
    lineHeight: 1.13
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Chronicle, Georgia, serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.17
    letterSpacing: "-0.015em"
  body:
    fontFamily: "LifeSans, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  narrative:
    fontFamily: "LifeSans, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "LifeSans, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  control-small: "4px"
  field: "5px"
  control: "6px"
  panel: "9px"
  spread: "10px"
spacing:
  choice-gap: "8px"
  control-gap: "12px"
  section: "24px"
  spread-gap: "32px"
  page-gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "#f8f8ee"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  button-primary-hover:
    backgroundColor: "{colors.green-dark}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  input:
    backgroundColor: "#f9f9f1"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 12px"
    height: "42px"
  nav-item:
    textColor: "#626b60"
    rounded: "{rounded.control}"
    padding: "12px 13px"
  nav-item-active:
    backgroundColor: "#dfe5d8"
    textColor: "#324f3b"
  decision-card:
    backgroundColor: "{colors.decision-paper}"
    rounded: "{rounded.panel}"
    padding: "22px 24px 17px"
  choice:
    backgroundColor: "#fdfdf9"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 13px"
---

# Design System: Six-Faced Life

## Overview

**Creative North Star: "The illustrated life chronicle"**

Thai lives preserve this direction with self-hosted Noto Serif Thai for narrative headings and Noto Sans Thai for practical text. English retains Cormorant Garamond and DM Sans. The document language follows the current form/life/retrospective, with Thai-specific line heights, neutral tracking and wrapping controls to keep combining marks and longer labels legible. Language selection is a labeled native select in the new-life form, with a nearby fixed-language explanation; mixed archive entries carry explicit language labels. See [ASSETS.md](ASSETS.md) for pinned font sources and licenses.

Warm parchment, dark green ink, and original painted fantasy countryside make the interface feel like a personal record. Expressive serif titles carry the story; compact sans-serif controls keep the simulation legible. Gold is a restrained accent, never the dominant surface.

This documents the implemented system in `src/styles.css` and the React components. Typography tokens describe base roles; media queries adjust individual components. The approved direction in PRODUCT.md remains the visual authority.

Reviewed against the source on 2026-10-24. This is the current implementation guide; the original approved spec and implementation ledgers under `../docs/superpowers/` retain historical proposals and validation. The progression expansion uses the same visual system.

**Key Characteristics:**

- Quiet paper surfaces and fine dividers.
- Self-hosted literary type paired with practical controls.
- A painted scene beside a readable character record.
- Muted state colors, clear focus outlines, and restrained motion.

## Colors

The palette combines mossy greens and warm neutral paper; the frontmatter records the source values.

### Primary

- **Forest green:** primary actions, active controls, icon strokes, and links; the darker green is the primary button hover state.
- **Restrained gold:** small accents and time-step hover. Keyboard focus uses a distinct darker gold outline (`#8c7039`).

### Neutral

- **Warm paper:** the page canvas; **ivory white** and **decision paper** distinguish content surfaces.
- **Green ink:** main text; **muted olive ink** supports descriptions and metadata.
- **Paper line:** hairline rules; **sage** and the slightly deeper sidebar paper provide tonal separation.

Condition meters use subdued clay, olive, blue sage, and ochre fills. Labels and numeric values accompany their colors.

## Typography

**Display Font:** Cormorant Garamond, self-hosted as `Chronicle`, with Georgia and serif fallbacks.
**Body Font:** DM Sans, self-hosted as `LifeSans`, with Arial and sans-serif fallbacks.

Both families ship weights 400, 500, 600, and 700 with `font-display: swap`. Headings use balanced wrapping; scene headlines use pretty wrapping. Body paragraphs default to a generous line height.

### Hierarchy

- **Display:** the new-life introduction; its base token expands to 64px on wide screens and becomes 47px on phones.
- **Headline:** the current person or page; 38px at the narrower desktop breakpoint and 35px on phones.
- **Title:** decision headings; 33px on wide screens and 28px on phones. Character-rail headings are smaller serif companions.
- **Body:** descriptive prose and help. Decision narrative uses its own airier role and a maximum measure of 70ch.
- **Label:** choice titles and practical controls. Secondary metadata varies by context; preserve the source's readable contrast rather than fading it for decoration.

## Layout

Desktop uses a fixed left navigation (226px), a top bar (76px), and centered content with a maximum width of 1580px. The chronicle is a story column plus a character rail (274px), separated by the spread-gap token. The rail is divided by rules rather than enclosed in repeated cards.

At 1250px and 1050px the sidebar narrows to 205px and 184px. At 850px the chronicle becomes one column, with the character sections in a two-column grid below the story. At 650px the sidebar becomes a menu below a 72px mobile header, page gutters become 20px, and time controls wrap into rows. The mobile menu has two columns and a visible How to play row below them. Additional 360px adjustments support narrow phones.

At 1700px the character rail grows to 310px and the spread gap to 40px. Scene height is 300px on wide screens, 160px from 851–1699px, 245px at the stacked tablet layout, and 218px on phones. A pending phone decision hides the scene so its story follows the time guidance directly. Keep narrative, decisions, yearly focus, and record in reading order before supporting character information.

## Elevation & Depth

Depth comes primarily from tonal paper layers, hairline borders, and the painted scene's dark text overlay. Standard decision cards are flat. Small ambient shadows belong to primary buttons, opening/birth/ending spreads, and the open mobile navigation.

### Shadow Vocabulary

- **Primary action:** `0 3px 8px #2c47261a`.
- **Opening spread:** `0 10px 35px #3c492012`.
- **Birth record:** `0 10px 40px #4655320d`.
- **Mobile navigation:** `0 12px 22px #3c4a2412`.

## Shapes

Controls have gently curved corners; larger paper spreads and artwork use slightly softer corners. Borders are generally 1px. Circular initials, radio-like choice indicators, and small status dots are recurring accents. Meters are thin rounded tracks, not prominent pills.

## Components

### Buttons

Primary actions use forest green with pale text. Secondary actions use a fine paper border; quiet actions drop the visible border. All inherit sans-serif type. The standard button has a 39px minimum height. Hover transitions change background, text, or border over 150ms; disabled buttons reduce opacity to 0.45. Keyboard focus has a 2px gold outline offset by 4px.

### Inputs / Fields

New-life fields use a pale paper fill, a 1px muted border, and field corners. Inputs and native selects share the 42px height; selects reserve space for a leading icon. The global keyboard outline also applies to fields.

### Navigation

The fixed navigation uses small line icons, sentence-case labels, and sage hover fills. Active items gain deeper sage, green ink, stronger weight, and a small green dot. Phone navigation opens under the brand header; secondary desktop identity and colophon content are hidden there.

### Cards / Containers

The decision card pairs an ivory surface with a fine green-tinted border. Choice rows contain a circular indicator, title, explicit tradeoff text, and an arrow. Hover shifts their background and border; unavailable choices retain the disabled treatment. Mobile cards use 7px corners and tighter padding.

### Chronicle Scene and Character Record

Original painted countryside is cropped with `object-fit: cover`. A dark green gradient supports pale scene text; location and season sit above the narrative caption. Use the source artwork rather than a decorative placeholder. Condition, training, family, and location sections use serif headings, thin rules, quiet icons, and restrained progress bars.

Page entrance is a subtle half-second opacity and clipping reveal. Respect `prefers-reduced-motion`, which disables animation, transitions, and smooth scrolling.

### Magic Study

The training section contains a compact study selector separated by a dashed paper rule. Its native select uses ivory white, a fine olive border, field corners, 13px sans-serif type, and a 44px minimum height. The labeled selector appears from age eight when a change handler is available; earlier states explain the unlock in plain text. Nearby 12px guidance distinguishes yearly Practice magic focus from discipline selection, explains preserved study and event-based instruction, and links the chronicle rail to the full spellbook. The spellbook heading is the focus/scroll target.

Keep the next spell visible beneath the selector, with its experience threshold and either remaining experience or the instruction requirement. Learned spells use a native details/summary disclosure with a count, check icons, and an empty-state sentence. The summary has its own gold keyboard outline (2px, offset 3px); avoid replacing this compact disclosure with another card.

### Career Progress

“Your calling” shares the existing ruled character-section treatment on both chronicle and character pages. A small muted award tile accompanies the current title and tenure. From age fifteen, yearly silver income appears with its living-cost and work-bonus qualification directly below it.

Separate the next promotion with a dashed rule. Pair the thin career-experience meter with explicit experience, skill, and reputation requirements, each showing the current amount earned. Met conditions use a check and green text; unmet conditions use an outlined circle and muted text. Readiness text explains that an offer may appear, rather than presenting requirements as a promotion button. Early-life and established-career states use short explanatory prose. The career section spans both supporting columns on the character page at 850px and below, and in the chronicle rail at 650px and below.

### Character Spellbook

The character page places the full spellbook after the life details and memory summary. A fine top rule introduces the serif heading (29px; 27px on phones). Each discipline is a vertically stacked article with a serif title (25px; 24px on phones), experience/rank metadata, description, learned spell names and explanations, and the next spell's explicit requirement.

The current discipline alone receives a pale sage fill (`#edf0e4`), 6px corners, and 18px padding; the remaining disciplines are separated by paper rules. “Current study” text accompanies the highlight. Preserve the distinction between learned spells, an unwritten spellbook, and instruction needed; these states use words and icons alongside color.

## Interaction and state

Time controls sit above the chronicle. Speeds are 1×, 2×, 4×, and 8×, with an explicit pressed state and 44px minimum targets. The button names its action, Play or Pause; separate guidance distinguishes paused, moving, waiting for a manual choice, and Watch mode choosing automatically. Review choices focuses and scrolls to the blocking decision. The manual-step tooltips explain that year advance stops early for a decision and next-decision advance searches up to twelve years per activation. A pending decision blocks both advancement buttons. Watch mode has an adjacent explanation that it makes choices while time plays. Hidden tabs suspend both timed progression and automatic choices; reload starts paused.

A manual choice leaves its actual narrative outcome and actual rounded stat/experience/silver changes in a sage paper section where the choice was. The heading receives focus, a polite live region announces the result, and Continue to next decision provides a direct next action. Capped gains and failed risks use actual before/after state, never the promised reward. This transient feedback does not alter saves; the permanent result remains in the chronicle. Timed playback can continue while the result is visible; a new decision or manual time step supersedes it. Automatic choices do not move focus or announce every tick.

Playback, mobile navigation, history filters and study controls have 44px minimum touch height; speed buttons are also at least 44px wide. Mobile choice descriptions and pause reassurance are 12px, and choice titles are 14px. Narrow-phone maps hide tiny overlaid region buttons and retain the existing readable region list. The menu exposes its expanded/controlled state and Escape restores focus to its toggle. Page navigation moves focus to the new h1; completed-life content uses a subordinate heading, and ended timelines stop at their final year without future labels.

Choice rows show their consequences and availability. Add missing-silver text only when the actual cost exceeds savings; a knowledge or story prerequisite must not produce a misleading affordability message. Preserve native disabled controls and the visible requirement explanation.

Focus and magic-study changes save immediately, including while paused. The top bar pairs a status icon with “Saved on this device” or “Not saved.” Failed writes show a persistent recovery alert explaining that current progress remains in this tab, with Retry save for the latest in-memory data. Failed loads show the original recovery explanation and Retry loading; retrying before any new game changes never writes empty state over the stored payload. Opening/archive/ending wording reflects actual save status. Keep storage state visible; do not replace it with a transient decorative toast.

Magic study has five independent experience/spell tracks and one shared instruction cap. Changing the current discipline preserves previous studies and grants no experience. Career requirements describe eligibility for an event offer; they do not promise an immediate promotion. Yearly income is base pay before living costs and work-focus bonuses.

## Source map and maintenance

| Source | Design responsibility |
| --- | --- |
| [styles.css](src/styles.css) | Font faces, palette, layout, interaction styles, responsive overrides, and reduced motion |
| [App.tsx](src/App.tsx) | App shell, navigation, time controls, storage feedback, and help |
| [LifeView.tsx](src/components/LifeView.tsx) | Chronicle, choices, yearly focus, condition/training rail, and character record |
| [ChoiceOutcome.tsx](src/components/ChoiceOutcome.tsx) | Actual manual-choice feedback and next action |
| [Landscape.tsx](src/components/Landscape.tsx) | Same original landscape served as optimized WebP with PNG fallback |
| [Progression.tsx](src/components/Progression.tsx) | Study selector/disclosure, career requirements, and full spellbook |
| [NewLife.tsx](src/components/NewLife.tsx) | Opening form and birth record |
| [WorldMap.tsx](src/components/WorldMap.tsx), [WorldView.tsx](src/components/WorldView.tsx) | Simplified regional guide and location information |
| [Archive.tsx](src/components/Archive.tsx) | Past lives and ending retrospectives |
| [design.json](.impeccable/design.json) | Structured foundations and 11 illustrative component previews |

Keep this guide and the structured sidecar aligned when foundations or documented components change. Previews illustrate states; the React components and CSS determine runtime behavior. The sidecar is not a complete inventory of every contextual color or responsive override. Retain its existing previews when extending it.

For UI changes, inspect desktop and narrow phone layouts, keyboard operation, explicit state labels, overflow, and the browser console. Exercise pending decisions and reload in an isolated save when persistence or playback changes. Use a separate port such as 5174; preserve the player's `127.0.0.1:5173` storage. Historical screenshots are ignored local evidence and may be absent in a clone. See [CONTINUE.md](../CONTINUE.md) for prior validation; this documentation refresh does not constitute a new browser audit.

## Do's and Don'ts

### Do:

- **Do** retain the warm paper, forest ink, and restrained gold relationship.
- **Do** pair serif narrative headings with sans-serif controls and explicit state labels.
- **Do** keep original painted scenery and maintain its text-supporting overlay.
- **Do** preserve visible keyboard focus and the stacked mobile reading order.

### Don't:

- **Don't** add heavy shadows to every character section or decision row.
- **Don't** replace the self-hosted font pair or introduce a competing display face.
- **Don't** communicate condition or interaction state through color alone.

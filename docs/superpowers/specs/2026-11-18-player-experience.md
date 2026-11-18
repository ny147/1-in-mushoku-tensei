# From a new life to the first choice

**Proposed for review · 18 November 2026 · baseline `2846da4`**

The first consequential action is deciding how to meet the new world. The birth record makes that moment feel personal, then asks the player to read a household dossier before entering the chronicle. Give the invitation to play the same prominence as the character’s name. Once the player reaches a choice, tell them what the clock will do after they answer.

## What changed since the last review

The [November 6 refinements](2026-11-06-uxui-refinements-design.md) established choice guidance, a jump to the decision, and focused outcomes. The [November 14 navigation work](2026-11-14-shell-navigation-design.md) reached main in PR #30. The current shell has real destination links, a chronicle return link and a phone navigation disclosure. Keep those interactions. The earlier [verification record](../../verification/shell-navigation.md) leaves real 200% zoom open. This review did not repeat that check.

Impeccable design review and source detection ran independently. The walkthrough used a disposable local origin, English, a fresh life and an ordinary Asura birth. It covered setup, birth and a pending first choice at 390 × 844, plus the chronicle at 1440 × 900. These are observations of a specific playthrough. Thai, exceptional births and older saves appear below as implementation acceptance cases. Preserve the warm paper, original illustrations, forest-ink controls and serif storytelling established in [DESIGN.md](../../../six-faced-life/DESIGN.md).

## P1 · Put the birth invitation next to the character

**Observed.** On the phone the setup submit button began at y=968. The following birth screen put “Open my chronicle” at y=1722, after facts including missing education, house association, housing and repayment records. “Poor” appeared as Family, Family resources and part of Birth rank. The opening sentence rendered “You are born in Asura Kingdom, into Poor.” A player looking for the next action must scroll past details they have no occasion to use yet.

**Proposed reading order.** Keep the illustration, name and reincarnation motif. Follow them with a natural localized birth sentence, compact identity facts, any immediate survival or material warning, and one “Open my chronicle” button. Place a collapsed “Origins and household” disclosure directly after the button. Put the full era, standing, ancestry, house, housing and debt record inside it. Keep meaningful starting obligations in the summary when they affect the player immediately. Use existing domain values and warning logic. Write complete localized sentences or use a standalone birthplace sentence followed by labeled facts so every wealth category reads naturally. Show the actual aptitude on a classic life and the assessment state on an expanded life.

**Acceptance**

- At 390 × 844 with ordinary default-length English text, the full action is reachable within the first viewport or one half-viewport downward scroll from the top. At 320 CSS pixels, Thai text and a maximum-length name wrap in reading order. No fixed control covers prose.
- The action precedes the optional record in visual, DOM and keyboard order. Enter opens the chronicle once and delivers focus to the pending decision as today. The disclosure has an accessible name and announced state and can be toggled with the keyboard.
- Compare ordinary, indebted, Superd and classic fixtures. A player can find every previously available fact. Applicable urgent warnings remain visible before continuing. Reopening the record cannot reroll a birth or advance time.

Implementation touchpoints include `NewLife.tsx` (BirthRecord), `ExpandedDetails.tsx`, standing details, locale strings and birth layout styles.

## P1 · Say what happens after a decision

**Observed.** Immediately after “Open my chronicle,” the focused first choice said “Time pauses while you decide.” Time controls simultaneously offered “Pause time,” and both advance buttons were disabled. Both messages describe real behavior. One describes the decision blocking time, the other the playback setting that will take effect afterward. A player cannot tell whether answering will start the clock.

**Proposed behavior.** Keep focus on the story. In the decision panel, replace the generic reassurance with a short sentence driven by the existing playback state. Example English copy is “Time will resume after you choose” when playback is on and “Time will stay paused after you choose” when it is off. In the transport, distinguish the current waiting state from the Play/Pause action. When Watch mode will make a permitted choice, use its existing automatic-choice guidance and make Pause reachable. For decisions requiring the player, describe manual choice even when Watch mode is enabled. Use the same eligibility decision as the simulation.

**Acceptance**

- Open a new chronicle, pause before answering, then resolve a choice. Repeat with playback enabled. Before each answer the visible sentence predicts the observed outcome; the focused result and disabled forward controls retain their existing semantics.
- Exercise an eligible automatic decision and a manual-only activity in Watch mode. Toggling Play, Pause or Watch mode updates dependent copy immediately without moving focus. Reload with a pending choice shows the paused wording; returning from another section stays paused.
- Verify English and Thai at phone and desktop widths. Keep speed selection, timing, keyboard shortcuts, save contents, seeded outcomes and hidden-tab behavior consistent with [PRODUCT.md](../../../six-faced-life/PRODUCT.md).

Implementation touchpoints include the time bar in `App.tsx`, the pending-choice panel and shared locale messages. Share the derived presentation state so both surfaces agree.

## P2 · Describe local saving accurately on first use

**Observed.** Empty setup displayed a checkmark and “Saved on this device” before a life existed. Its footer more accurately explained that progress is saved only in this browser. In `App.tsx`, a successful initial read supplies the same status as a successful save.

**Proposed behavior.** With empty, healthy storage, present a single neutral explanation near the form, “Your life will be saved in this browser.” Show confirmed save status for an existing saved life. If an unfinished life exists during replacement setup, identify that life as the saved object. Give load or write failure and its existing recovery action precedence over positive copy.

**Acceptance.** Inspect empty setup, a saved active life, replacement setup before confirmation, a failed write, a failed read and a successful retry in both languages. The UI identifies what is saved and where. Preserve the second confirmation before replacing a life and immediate saving of choices. Use isolated storage for all fault cases.

## P1 · Lead Optional activities with what the player can do

**Source finding.** Opening the disclosure exposes eleven equally styled buttons. “Review creditor service” leads even for a child with no such arrangement. In an ordinary quiet age-eight state only three actions are available. Two paragraphs beneath the buttons ask players to match actions with age, qualifications and costs. A player looking for an instructor scans unrelated employment and debt controls first.

**Proposed behavior.** In `OptionalActivities.tsx`, show available actions first. Follow them with a collapsed “Later opportunities” list of future activities and their specific opening conditions. Show contract-specific actions in their relevant context. When a pending choice blocks every activity, show the shared reason once and provide the existing route to the pending choice. Source availability and its explanation from the same game rule. Distinguish opening an activity for inspection from qualifying for its eventual offer.

**Acceptance.** Check age 7, the age-eight boundary, a qualified adult with and without a creditor-service contract, and a pending decision. Every previously available action remains reachable with the keyboard. Future activities describe a meaningful next condition in English and Thai. Browsing preserves existing pause, cancellation, costs and commitment rules.

## P2 · Keep a selected region and its description together on phones

**Observed.** On a 390 × 844 World screen, selecting Begaritt left the button at y=786 and the description heading below the viewport at y=854. The phone layout hides the map markers, so the map offered no corresponding highlight. The desktop layout kept the description in sight at y=293.

**Proposed behavior.** On phones, place a labeled native region selector immediately above the detail heading. Show one noninteractive marker at the selected region on the illustration, using the existing region coordinates. Keep “Your home” tied to the character’s actual location. Preserve the desktop map and list interactions. Update the instructional copy to name the available input at each size.

**Acceptance.** In `WorldView.tsx` and `WorldMap.tsx`, exercise all six regions at 320, 390 and 1440 CSS pixels, in both languages, with and without a life. Each selection updates the marker, region name and description together. At 390 × 844 the heading is visible with the selector when the selector is in reading position. Keyboard focus stays on the input. Selected and home states remain distinguishable without color alone. Exploring a region never changes residence.

## Review evidence and delivery order

Start with the birth record and pending-choice message. Together they cover the first uninterrupted journey from character creation to a consequential choice. Next address activity discovery for returning players, then local-save wording and phone geography. Keep the existing illustration and choice cards: the first choice already gives the player a named action, narrative consequence and numerical effects before commitment.

Independent Impeccable heuristic judgment for the sampled flows was **28/40**. Status visibility, match with the player’s world, consistency, prevention, visual restraint and error recovery each scored 3/4. User control scored 4/4. Recognition, efficiency and help each scored 2/4. The earlier 25/40 concentrated on the shell; the two totals measure different journeys.

The detector scan of `src/` reported seven primary font findings for the intentional Thai families and 409 advisory size, color and radius matches. The scan of `src/App.tsx` alone was clean. The browser walkthrough and game rules establish the priorities above. The browser interface allowed read-only inspection, so no live detector overlay was evaluated. No screen-reader session, usability study or real browser zoom test was performed.

For implementation, use isolated saves and verify the scenarios above with keyboard input, visible focus, narrow and desktop layouts, maximum-length names, and real 200% browser zoom. Run the existing app test and build commands after code changes. This document records design proposals for approval.

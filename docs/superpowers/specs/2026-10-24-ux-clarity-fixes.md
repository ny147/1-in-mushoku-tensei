# UX clarity fixes

The user approved implementing the completed UX review, prioritizing knowing what to do next and time controls. This spec records implementation decisions within that approved scope; the illustrated chronicle, simulation rules and existing saves remain the foundation.

## Interaction

- Keep play/pause, speeds, year advance and next-decision controls. Show a separate readable current state and a short next-step explanation. Pending manual decisions have a Review choices action that moves keyboard focus to their heading. Explain that Watch mode makes choices while playback is active; use different pending-decision copy when automatic choices are active.
- Show a resolved manual choice's actual narrative outcome and actual meaningful stat/experience/silver changes in its original area. Include a next-decision action when no decision is pending. Keep the outcome visible during ordinary timed playback until another decision/action supersedes it. Do not pause or change seeded behavior merely to show feedback. Keep outcomes presentation-only, outside the save schema.
- Focus new page content after navigation and a stable outcome heading after a manual choice. Keep a polite short outcome announcement; never announce every playback tick. Initial reload must not steal focus. Preserve Space and hidden-tab playback protections.

## Recovery and supporting flows

- Failed writes show persistent explanation, current-session risk and Retry save. Retry saves the latest in-memory data; it never reloads or replaces that life. If loading failed and no new game state exists, offer Retry loading instead of overwriting unreadable storage with an empty game. Never clear browser storage.
- Make opening/archive/ending storage wording conditional and truthful. A failed load still preserves the original payload until the player explicitly creates new state. Keep help reachable on mobile, menu expanded/control semantics, and predictable Escape behavior.
- Explain yearly focus versus selected magic discipline, preserved prior learning, instruction opportunities and current promotion requirements. Link compact study information to the character spellbook.
- Increase utility touch targets toward 44px and consequential text to at least 12px, with narrative body remaining comfortably readable. Give a pending decision visual priority on phones. Hide tiny map overlays on narrow phones and use the existing labeled region list as the primary control.
- Ended timelines stop at the final year and have no playable-future labels. Keep one h1 per page. Use Latest moment for generic history. Empty-archive actions describe returning to a current life correctly.
- Encode the existing original artwork into an optimized WebP without changing its composition. Keep the source PNG and its provenance. Reuse a picture component with PNG fallback; do not add dependencies or change game artwork.

## Verification

Behavior tests cover choice feedback and continuation, focus/navigation, save retry including repeated failure/latest data, load recovery without overwriting, automated/hidden playback, and ended timelines. Full npm test and build; isolated browser QA on a separate port for desktop/phone, keyboard, pending choice, reload, failure recovery, ending/archive and overflow. No changes to event identifiers, random calls, migration, game balance or published hosting.

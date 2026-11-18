# Player experience implementation plan

**Goal** — Carry the five changes approved for implementation in PR #31 through the existing chronicle, setup and World views.

**Spec** — [From a new life to the first choice](../specs/2026-11-18-player-experience.md)

Keep English and Thai, native controls, original art, seeded outcomes, and the existing browser save format. Use isolated storage for testing.

- [x] Birth — Put the chronicle button before the native household disclosure. Keep survival, material needs, and household liability visible. Cover indebted and classic births in `player-experience.test.tsx` and ordinary and Superd births in isolated Chromium.
- [x] Playback — Derive one pending-decision guidance message in `App.tsx` and pass it to the decision panel. Cover paused, playing, eligible Watch, manual Watch and reload using saved life fixtures.
- [x] Activities — Return gate reasons from the same domain helper used by `activityAvailable`. Show those reasons in the future-activity disclosure and give a blocked player a jump to the existing decision. Cover ages 7 and 8, creditor service and manual choice.
- [x] Saves — Show the browser-local explanation on empty setup, name the unfinished life during replacement, and let load/write recovery take precedence. Exercise both languages and preserve the existing persistence tests.
- [x] World — Use the existing selection state for the phone select, map marker and detail; retain desktop inputs. Cover all six regions, keyboard focus and residence.
- [x] Run the new tests against the original behavior, implement the changes, then run the full test and build commands. Inspect phone and desktop flows in an isolated browser, including 200% zoom, and record actual verification in `CONTINUE.md`.

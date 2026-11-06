# UX/UI refinements verification — save point, 2026-11-06

Branch: `codex/uxui-refinement-spec`, existing PR #21, base `main`.
Implementation commits through `265ee8f`; review fixes and checkpoint follow.
User explicitly authorized implementing on this existing branch. This is an
incomplete acceptance checkpoint, not a ready-to-merge claim.

## Automated evidence

- Baseline: 372/372 tests, 59 files; build passed.
- Final code suite: `npm.cmd test -- --maxWorkers=2`: 394/394 tests, 61 files,
  77.01s, exit 0. Includes all three independent review fixes.
- Final `npm.cmd run build`: exit 0, existing >500kB bundle advisory.
- Impeccable detector once over six changed component targets: `[]`, exit 0.
- `git diff --check`: passed. No game-domain files, dependencies, identifiers,
  RNG, save schemas or narrative catalogues changed.
- History snapshot pinned before implementation and unchanged afterward.
- Five initial suite failures were old single-status queries; narrowed them to
  the outcome announcer after naming the new filter status. Focused 40/40 passed.

## Browser evidence (IAB, isolated 127.0.0.1:5174)

Disposable seeded fixtures in ignored `.sites-workflow/uxui/fixture.html` use
real origin/storage APIs. Never visited or cleared the player's 5173 storage.
A first fixture was rejected by validation (peak wealth/birth-year mismatch);
corrected the disposable fixture, never weakened application validation.

- Reproduced Thai741 fragmented time labels and1280 scene metadata/caption,
  credit/motion intersections before layout changes.
- EN infant and TH adult at widths360,390,649,651,741,849,850,851,1280,1700:
  measured no text/control rectangle intersections, no horizontal overflow;
  all sampled time targets44px high and speeds44px wide. Loaded hero visible.
 1280 used height720; other matrix samples844. Visual samples at741,1280,1700.
- TH newborn360x800: condition heading y425, savings bottom708. EN newborn
 390x844: heading y457, savings bottom722. Both satisfy first/two viewport goals.
- EN age5 controls/order checked; age8 learned spells and stable full-spellbook
  heading focus checked. Enter/Space opens Fire, closes Water; Earth selection
  opens Earth while Fire stays open. Earth selection survives reload.
- EN record keyboard filter: Memories8, initial5 rows, focus retained; pagination
  and year advance preserve the explicit filter announcement.
- TH390 pending aid: scene hidden, advancement disabled, no overflow. Choosing
  aid focuses outcome-heading, remains paused, displays −8 เหรียญเงิน and real
  resource effects; reload preserves492 savings.
- TH adult real loan enrollment: active training,24 เหรียญเงิน/year, debt24,
  repayment0 and policy units inspected; character page finance reachable.
- EN ended character: no edit selects, no horizontal overflow.
- TH simulated reduced-motion/failed art at1280/360: complete fallback,
  described disabled motion button and separate text bands. EN loading/motion
  off at360 checked. TH desktop CSS zoom2: separate bands/no overflow.
- Captured browser warning/error log: empty on sampled paths.

## Remaining acceptance / exact resume step

**Unresolved:** TH390 long-name character at CSS zoom2 still has horizontal
page overflow. Added `min-width:0; overflow-wrap:anywhere` on passport divs,
but browser recheck still reported overflow. Do not call this fixed. Next:
restart `npm.cmd run dev -- --port 5174`, visit
`/.sites-workflow/uxui/fixture.html?lang=th&age=0&long&zoom`, open Character,
inspect bounding rectangles extending beyond innerWidth and their min sizes,
then correct the cause and verify again. CSS zoom is a reflow simulation;
actual browser200% zoom/OS reduced-motion and actual screen-reader listening
were not performed. No WCAG certification claimed.

Finish rendered rare legacy/paid/paused/deferred obligations and remaining
representative EN/TH playback/Watch/style/focus/finance refund/university cases
from Task8. Automated tests cover these state rules but do not replace visual
acceptance. Update PRODUCT.md, DESIGN.md and affected existing sidecar previews
when acceptance is complete. Keep PR draft until required checks pass.

Independent whole-branch review found three Important currency gaps (Thai mentor
effect, Thai stipend, monetary requirement rows): all reproduced RED→GREEN,
focused29/29 and final394/394 pass. No Critical issue. Minor deferred: financial
university enrollment/paid-mentorship history snapshots could be stronger; the
pinned university example currently declines. Reviewer declined geometry,
contrast, hero/mobile/zoom, actual AT and final-document accuracy: parent owns
these; observations and remaining limits are explicitly recorded above.

QA browser tab closed and viewport reset. Stop/restart only this task's server;
current server exec session85742 is stopped at handoff. Ignored logs/fixture
remain for resumption. No publishing, merging, auto-merge or branch deletion.

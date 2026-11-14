# App navigation and sidebar verification, 2026-11-14

Implementation follows the [approved spec](../superpowers/specs/2026-11-14-shell-navigation-design.md)
and [plan](../superpowers/plans/2026-11-14-shell-navigation.md), on
`codex/ui-navigation-review`, existing PR30, base main. User explicitly authorized
continuing this branch and leaving the two updater hook files local/uncommitted.

## Automated results

| Check | Observed result |
| --- | --- |
| Route helper RED -> GREEN | Missing navigation module before implementation;16 URL boundary tests passed after |
| Shell/history RED -> GREEN |7 integration failures before implementation; focused64/64 after |
| Archive metadata/restoration RED -> GREEN |9 failures before implementation; focused74/74 after |
| History edge regression | Fragment-copy entry incorrectly used Back; observed RED, then focused78/78 GREEN |
| Independent review regression | Delayed fonts stole moved focus; observed RED, then focused79/79 GREEN |
| First full suite |732/732 in82 files PASS,98.74s |
| Final full suite after review fix |733/733 in82 files PASS,88.46s |
| Final npm run build |TypeScript/Vite PASS; existing >500kB advisory, JS837.11kB |

Commands ran inside six-faced-life/. Tests needed process sandbox escalation for
esbuild; the initial sandbox-only attempt stopped at spawn EPERM and is not a
test result. Full logs are ignored in `.openai/navigation-qa/`. No configured lint,
typecheck or test:e2e script exists or is claimed. No dependency/lockfile change.

## Rendered browser evidence

Used new Chrome agent tabs. Existing Vite5174 was stopped when this implementation
began. npm incorrectly stripped the requested port and launched a transient Vite
on5173; stopped immediately without opening that origin. Started the QA server
directly with `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort`.
Stopped this server after QA. No player5173 page or storage was touched.

The preexisting disposable Thai Mira fixture on127.0.0.1:5174 was only read during
initial checks. Richer tests used **localhost:5174**, a distinct origin whose save
was initially absent. An ignored fixture page used existing game/storage APIs to
create an English legacy life, a Thai expanded life,12 mixed-language completed
records, and a long active name. It backed up/restored the original state in its
own tab. Cleanup confirmed no save remained on that previously empty origin.
No fixture/test hook is present in production source. Hosted/player saves intact.

Confirmed in the real browser:

- Character -> World -> Back -> Character -> Forward -> World; reload retains
  World. Actual native history, URL, active state and heading agree.
- Clicking brand returns to latest current chronicle; its expanded pending choice
  remains visible with Play, not automatic playback.
- Clicking Help scrolls its fixed sidebar into view. At1280x600 with a long Thai
  name, Help y387 was within the600px viewport. At800x545 the original sidebar
  also scrolls to Help, rather than stranding it below the window.
- EN legacy/long name and TH expanded/long name: all11 actual CSS widths
  320,390,650,651,800,850,1050,1051,1250,1251,1440 passed brand fitting and document
  horizontal-overflow checks. The original Thai fixture also passed these11
  widths. Total33 measured width checks; do not count the early attempts whose
  viewport capability targeted a different tab. Browser selection was corrected
  by closing its stale error tab, then actual innerWidth was checked each time.
- At390px, the disclosure menu begins immediately below the real header, can
  scroll, and fits the viewport. Escape closes it and focuses the toggle. Enter
  on World follows the link and closes the menu. No header/menu overlap observed.
- Ctrl-click on World opens a native new tab with the correct page and leaves
  the source at Help. The extra task tab was closed.
- Clicking Record8, browser Back, Forward, preview reload and the in-app return
  reopen the correct Thai retrospective or restore archive scrollY1137 and the
  same stable row focus. Sample only after the restoration frame settles; an
  immediate in-call measurement preceded that frame and was not counted as a
  failure or pass. A fresh direct-preview tab returns to archive without leaving
  the app. Its return button measures44px high after the review fix.
- Missing archive ID corrects to archive list and displays localized explanation.
  Unknown view corrects to chronicle while preserving source=qa and #main-content;
  the skip target receives focus.
- An intentionally unreadable isolated fixture keeps its requested preview URL
  through a failed Retry loading. Repair via the fixture page plus Retry loading
  restores that exact retrospective without discarding the request.
- SHA-256 fingerprints of the saved JSON matched before/after the EN and TH
  navigation checks, including the repaired TH save. No full save payload logged.
- Restoring QA storage then reloading Character shows the existing empty state;
  bare root normalizes to new-life setup without creating a life.
- Console warning/error capture on both main QA tabs returned empty arrays.
  Existing reduced-motion CSS remains; no new animation was introduced.

Screenshot: ignored local `.openai/navigation-qa/final-tablet.jpg`, actual800x545,
showing fitting two-line brand and safely wrapping long Thai-life character name.
Browser viewport overrides were reset before finishing.

## Independent review and remaining acceptance

One fresh whole-branch reviewer found an Important delayed-font restoration issue
and a Minor undersized archive return control. Both were corrected in one fix
pass; the reviewer inspected the fix and returned **ready subject to verification**.
Final suite/build above followed the fix. The late font correction now never
refocuses, and user pointer/wheel/touch/key/focus/scroll intent cancels it.

**Remaining required check: real200% browser zoom**, including the enlarged-header
phone menu and short-sidebar keyboard reachability. The connected browser exposes
viewport overrides but no verified browser-zoom control; the attempted shortcut
did not establish a zoom level. Native Windows inventory exposed no targetable QA
window. Do not equate viewport resizing with a real200% zoom test. No screen-reader
or OS reduced-motion preference audit is claimed. These limitations are explicit;
the PR remains **draft** until the required zoom check is performed and recorded.

Manual next step: use a separate preview/profile, set Chrome zoom to200%, test
Character and the menu at phone/short desktop sizes, Tab through navigation to
Help, confirm full title and all controls fit/scroll without overlap, reset zoom,
and record the actual result. Then mark the PR ready if no defects are found.
The user merges manually; no deployment was authorized or performed.

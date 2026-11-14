# App navigation and sidebar usability design

**Status:** Proposed specification for review, 2026-11-14. The user requested a
spec and implementation plan after the UX review. No application implementation
is authorized by this document alone. Detailed behavior below is the author's
recommended approach, not a claim that each detail was individually approved.

**Related:** [UX review](../../../six-faced-life/.impeccable/critique/2026-11-14T10-07-29Z__src-app-tsx.md),
[product](../../../six-faced-life/PRODUCT.md), [design system](../../../six-faced-life/DESIGN.md).
Documentation follows existing PR30 on `codex/ui-navigation-review`; base main.

## Intent, evidence and scope

Make the existing illustrated chronicle behave like a predictable browser app:
players can return to their current life, move Back/Forward between sections,
refresh the section they are reading, and reach every navigation control at
tablet widths and short window heights.

The review reproduced three issues against main e27c2b1:

| Requirement | Observed failure | Required outcome |
| --- | --- | --- |
| N1 Navigation | Character -> World -> browser Back exits to about:blank | Section transitions participate in browser history |
| N2 Return paths | Logo and breadcrumb are plain text | Clear, keyboard-operable current-life and archive return destinations |
| L1 Reachability | Help y684-725 lies below an 800x545 CSS viewport | Sidebar can scroll to every control |
| L2 Brand fitting | Title ends at x191 beyond sidebar x184 | Full title and icon fit within the sidebar's content area |

Also cover reload, archive previews, invalid URLs and existing save recovery,
because URL navigation is incomplete without those boundaries. Preserve the
current palette, artwork, typography, content order and game systems. No general
redesign, world-map changes, new game actions, save export, server, routing library,
save-schema migration or deployment is in scope. Back must never rewind a life.

## Approaches and recommendation

1. **Native History API with query parameters, recommended.** Six existing
   sections and one archive-detail state need little routing machinery. Real
   anchors plus pushState/replaceState/popstate provide links, reload and browser
   navigation without changing hosting routes or adding a dependency. Query
   parameters leave the existing `#main-content` skip target intact.
2. **Routing library.** Useful for a larger nested application, but adds a
   dependency and migration surface beyond this shell repair.
3. **React-state navigation plus an in-app Back button.** Smallest patch, but
   leaves browser history, direct links and reload inconsistent. Rejected.

These are assessed alternatives. The user has not separately selected one;
the accompanying plan assumes recommendation 1, pending document approval.

## URL and route contract

Own only the query keys `view` and `life`. Preserve pathname, unrelated query
parameters and the existing hash. Do not put names, save payloads or simulation
state in the URL. `life` is an encoded existing archive ID, not an active-life ID.

| State | Canonical app query |
| --- | --- |
| Current chronicle, including birth/ending | `?view=chronicle` |
| Character | `?view=character` |
| World | `?view=world` |
| Completed-life list | `?view=archive` |
| Completed-life retrospective | `?view=archive&life=<encoded-id>` |
| New-life form | `?view=new` |
| Help | `?view=help` |

- Bare root defaults to chronicle when an active record exists, including an
  ended record; otherwise new-life setup. Replace the initial entry with its
  canonical URL, so loading the app does not create an extra Back step.
- Explicit character, world, archive, help and new routes work without an active
  life. Character retains its existing empty state. Chronicle without a life
  resolves to new. This must not create a life.
- Unknown/empty/duplicate `view` values resolve to the same default. A `life`
  key outside archive is removed. Empty/duplicate/unmatched archive IDs resolve
  to the archive list and show one localized, nonblocking explanation. Replace,
  never push, these corrected URLs. No arbitrary ID-length or ID-format rule is
  added; exact lookup against the existing bounded archive decides validity.
- During a save-load failure, preserve a syntactically valid requested route and
  ID without concluding its life is missing. Show existing recovery UI. Resolve
  data-dependent fallbacks only after a successful retry, or an explicit user
  action that replaces the inaccessible save through the existing flow.
- Reload restores the section/valid archive preview in that browser's current
  save, with time paused. A link opened in another browser/profile may have no
  matching life; it must fall back safely rather than suggesting cloud sharing.

## History and data ownership

Use one route state as the source of truth. Derive `page` and archived `preview`
from the route and current validated save. Do not retain independent mutable
`page` and `preview` states that can contradict the URL.

Ordinary in-app section and archive-preview activation pushes one entry. Selecting
the already-current destination creates no entry. Browser Back/Forward applies
the reached URL without pushing another entry. Preserve native modified clicks,
middle-click, open-in-new-tab and copy-link behavior for navigation anchors.
Do not trap Back at the app boundary; after all app entries have been traversed,
normal browser Back may leave the app.

All routes read the **latest** active life and archive. History entries contain
navigation metadata only. They never restore an earlier save, random state, age,
choice, focus discipline, pending decision, balance or language preference.
Archive navigation must not change or rearchive its immutable stored snapshots.

Leaving the chronicle pauses playback. Returning through links or browser history
stays paused until Play is pressed. Navigation never enables Watch or auto-chooses
a pending decision. Starting the birth record through its existing explicit
Open chronicle action keeps its existing start-time behavior. This pause rule is
an explicit proposed safety refinement to the current in-memory playing flag.

New-life setup is only a view: reaching it through Back/Forward cannot create or
replace a life. Creation still uses the existing explicit submission/confirmation.
Successful creation replaces the form entry with the new chronicle route, resets
playback/Watch as today, and invalidates stale navigation restoration references.
Earlier chronicle entries still show the latest life, never an old active snapshot.
Keep unsaved form-language behavior and the existing cancel destination.

If history writes throw, keep the current route/view coherent, show a localized
nonblocking navigation error, and leave game data untouched. Do not silently show
one page while the URL names another. Real links remain usable via normal browser
navigation; do not introduce an unbounded fallback reload loop.
For a failed user-initiated push, retain the previous URL and view. If replacing
an invalid URL fails on initial load/popstate, render the resolved safe destination
with the visible error and leave the original URL untouched until a later explicit
navigation succeeds. Do not retry normalization on every render.

## Return controls and accessibility

- Brand: a real anchor, full name visible. It points to chronicle if an active
  record exists, otherwise new-life setup. Accessible action labels:
  `Return to your chronicle` / `กลับสู่บันทึกชีวิต` and
  `Begin a new life` / existing Thai equivalent. Desktop and mobile share it.
- Main section navigation and Help: real anchors with existing icons, selected
  styling, counts and `aria-current="page"`. New-life setup keeps the existing
  chronicle-group visual association and expresses it accessibly.
- Breadcrumb: `nav` labeled `Breadcrumb` / `เส้นทางนำทาง`, with an ordered list.
  Ancestors are links; the final item is noninteractive with aria-current=page.
  Replace the decorative world prefix with the current-life home destination.
  Example: Your chronicle -> Your character. A chronicle/new landing has just
  its current item; no misleading clickable current crumb.
- Archive detail: home -> Past lives -> archived person's name. Both the Past
  lives crumb and existing Back to past lives control return to the list.
  Do not manufacture an in-app Previous page control in addition to these paths.
- Each control has visible focus and a target at least 44px high. Breadcrumbs
  wrap at narrow widths rather than concealing the return link. Link text is
  sans-serif UI text; the brand keeps its established display face.
- Ordinary section navigation closes the phone menu, scrolls to the top and
  focuses the page heading. Archive detail focuses retrospective-heading.
  Re-selecting the current section closes the menu and focuses its heading
  without adding history. Existing choice/outcome/spellbook focus remains intact.
- Initial loading with `#main-content` honors the skip target. History processing
  of an identical route (such as a skip-link fragment entry) must not count as a
  section transition, reset scroll, clear feedback or trigger extra history.

## Archive list restoration

Before opening a retrospective from the list, store its entry ID, current list
scroll Y and clicked life's ID under a versioned `sflNavigation` history-state
namespace. Merge with existing object state; treat unknown/nonobject metadata as
unavailable. Do not touch any save storage key or persist a full Life in history.

Browser Back to that list restores its scroll and focuses the same life row with
preventScroll. The in-app return uses Back only when metadata proves the preview
was entered from its immediately preceding list entry in this tab. A direct-open
preview without that provenance replaces itself with the archive list, rather
than navigating out of the app. Preserve provenance across reload using the
versioned entry metadata. Browser Forward reopens the same valid retrospective.

Give archive rows stable DOM IDs derived safely from the life ID. After rendering,
clamp restoration to the current document height; if the row no longer exists,
focus the list heading and use the clamped position. A missing preview ID returns
to the list with the explanation described above. Restoration is scoped to the
list entry; no general scroll-history framework is needed. Test restoration after
layout, including font/layout settling, and avoid repeated focus/scroll effects.

## Sidebar and brand layout

Desktop/tablet sidebar keeps its fixed position and existing responsive widths.
Give it a bounded viewport height, vertical overflow:auto, and nonshrinking
navigation/identity/footer sections. Its scroll area must include Help and the
colophon even at a short height; keyboard focus must reveal the focused control.
Allow long names to wrap without forcing controls out of the scroll range. Use
ordinary scrollbars; do not hide document overflow to mask sizing failures.

In mobile mode keep the existing disclosure menu, not a modal. Its top follows
the **actual** header height, rather than the hard-coded 72px value when enlarged
text wraps the header. Constrain the open menu to available viewport height and
allow its own vertical scrolling. Prefer normal-flow positioning if it removes
the height coupling; exact CSS mechanics are a builder choice. Preserve Escape,
toggle focus, aria-expanded and the menu's reading order.

Brand flex items must have real available width: text wrapper min-width:0, icon
with flex-shrink:0, and title allowed to wrap intentionally. Preserve the full
Six-Faced Life name, existing font and readable type sizes. No ellipsis, clipped
text, overflow:hidden patch, forced global zoom or horizontal page scrolling.
Two title lines are acceptable at compact sidebar widths. All title pixels and
icon geometry fit within the sidebar/header content area, including at 200% zoom.

## Global constraints

- React, TypeScript, Vite, plain CSS and lucide-react; no new dependency.
- Node.js 22.12+ or a supported Node.js 24 release; npm commands run in six-faced-life/.
- Preserve seeded simulation, save schema/keys, pending decisions, existing lives and archive snapshots.
- Keep storage errors visible and recoverable; never clear player storage for QA.
- Preserve the approved paper/forest/gold system, self-hosted fonts/artwork, EN/TH, visible focus and reduced-motion support.
- No automatic merge, deployment, source upload, billing change or new remote service.

## Acceptance and verification

| ID | Acceptance check |
| --- | --- |
| N1 | Chronicle -> Character -> World -> Back -> Character -> Back -> Chronicle -> Forward -> Character, with correct URL, active state and heading |
| N2 | Brand, breadcrumb ancestors and Help work by keyboard and pointer; navigation links support new-tab/copy-link conventions |
| N3 | Reload/direct opening each section and a valid preview restores that view paused; no navigation creates/rewinds a life |
| N4 | Preview return restores list row/scroll; direct-preview return stays in app; Forward reopens preview |
| N5 | Unknown/duplicate/missing routes, absent lives, removed archive IDs and save-load retry produce bounded recoverable fallbacks |
| N6 | Pending manual choices and saved focus/study survive navigation/reload unchanged; ordinary navigation cannot advance time |
| L1 | Help and all destinations reachable at 800x545 and 1280x600 CSS viewports, long names, keyboard and real 200% browser zoom |
| L2 | Brand fits at 320,390,650,651,850,1050,1051,1250,1251,1440 CSS widths, plus the reported 800px case; EN/TH |
| L3 | Open phone menu fits and scrolls with enlarged text, Escape restores toggle focus, no header/menu overlap |
| V1 | No horizontal document overflow, clipped navigation, new console errors, invalid focus destination or reduced-motion regression |

Automate route parsing and integration assertions with Vitest/RTL. Actual layout,
scroll restoration, modified clicks and native Back/Forward also need isolated
browser checks. Use port5174 or a fresh isolated origin/context; preserve5173.
Run npm test and npm run build after implementation. Test/build/browser acceptance
are future checks, not results of this documentation task.

Open implementation review choices: the exact two-line title break and minimal
CSS arrangement for the mobile header/menu. Neither may weaken the criteria above.
Approve this specification and its proposed defaults before product code begins.

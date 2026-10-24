# Save point — Six-Faced Life

Updated 2026-10-24 (Asia/Bangkok). The original game and the chosen story, magic, and career expansion are complete. The active task reviews UX/UI clarity and usability; implementation changes are proposals until selected by the user. Do not repeat discovery or request the original design approval again.

## User decisions

- Build a browser life simulator inspired by https://1in8b.life/en/, set in Mushoku Tensei.
- Original reincarnated protagonist with memories of a previous life.
- Design approved; implementation requested and completed.
- On October 24, the user chose more story events and deeper magic/career progression; that expansion is now implemented and verified.
- The playable game stays local; Sites source uploads and deployment require a new request. On 2026-10-24 the user superseded the earlier restriction on Git delivery by adopting automatic task commits, branch pushes, and PRs targeting `main`. Follow-up commits update the task's existing open PR; the user merges manually.

## Current state

Project: `D:\Developer\mashoku bilion\six-faced-life`.
Local game: http://127.0.0.1:5173/.

Implemented: generated birth records; six regions/five races; memory-driven childhood; 55 milestone/recurring events; five magic study disciplines with 30 learnable spells; instruction-gated mastery; magic and sword training; yearly priorities; five working career ladders with experience, reputation, promotions, titles and increased income; university and linked research; adult relationships/family; travel; aging/endings; replay; versioned local saves; an archive of the last 20 completed lives; desktop/mobile chronicle, character, world, and retrospective views.

Original landscape and self-hosted fonts are in `public/assets/`. Font licenses and generation details are included. `PRODUCT.md`, `DESIGN.md`, and `.impeccable/design.json` describe the built product and visual system.

## Current UX review checkpoint

The user requested a UX/UI review because parts of the game are hard to use or understand, authorized two independent review agents, and explicitly requested a saved checkpoint. The clean task branch is `codex/ux-review`, created from freshly fetched `origin/main` at `e2bd13f` (the merge of documentation PR #1). Application files are unchanged. The review preserves the approved illustrated-chronicle direction and the player's browser save on port 5173.

Completed: independent design and detector/browser assessments, followed by a synthesized [UX review](six-faced-life/.impeccable/critique/2026-10-24T08-46-33Z__src-app-tsx.md). The review scores the current experience 25/40 and prioritizes visible choice outcomes/keyboard continuity, reachable mobile help and clear Watch mode wording, larger mobile utility controls, actionable training guidance, and save-failure recovery. These are recommendations; no UI fixes are implemented. Assessments initially stopped with a workspace-credit error, then both completed after the user's continuation request and a successful usage recheck. No credits were purchased or redeemed.

Usage observed 2026-10-24 at 15:46:34 Asia/Bangkok: five-hour window 20% remaining; weekly window 72% remaining. Resets: October 24 at 20:40:38 and October 31 at 10:39:46, Asia/Bangkok. Both applicable windows are above the save-point threshold. On resumption at 15:41, the windows had 98% and 84% remaining respectively.

Verification: browser review covered desktop opening/birth/choices/focus/help/character/world/archive and a 390×844 phone layout on isolated review origins. Enter, mobile menu Escape, pending-decision blocking, pause/reload, and console capture were exercised. No captured console warnings/errors or horizontal overflow occurred in the inspected mobile state. Port 5173 browser storage was untouched; an existing port 5174 adult QA save was read only. Both temporary preview processes were stopped and QA tabs closed. No full screen-reader, contrast, 200% zoom, completed-life, storage-failure or exhaustive-breakpoint audit was performed. Application tests/build were not rerun for this documentation-only review.

The detector completed with exit 2: 402 advisory token/documentation mismatches (171 color, 222 font-size, 9 radius), not 402 demonstrated UX defects. False positives and representative source locations are documented in the report. Native browser evaluation was read-only, so no detector overlay was injected and no overlay server was started. The report temporary file was removed. No ignore list existed; this is the first report for `src-app-tsx`.

Delivery: report and checkpoint committed as `7212078` (`docs: review UX clarity and save findings checkpoint`) and pushed on `codex/ux-review`. [PR #2](https://github.com/ny147/1-in-mushoku-tensei/pull/2) is open against `main`; this follow-up checkpoint records delivery on the same PR. The complete task diff and 18 source references/line bounds were reviewed. Staged and committed `git diff --check` passed after removing one generated frontmatter trailing space. Fetch/prune succeeded; the branch contains current `origin/main` at `e2bd13f`. Only the report and checkpoint changed. No delivery blocker, UI fix or site publication remains part of this review task. The user merges manually. Next step: review PR #2 and select an implementation scope from the report; do not treat review recommendations as approved new behavior. Resume inspection with `git status --short --branch` and `git log -2 --oneline` from the repository root.

## Previous documentation checkpoint (historical; PR #1 is now merged)

The workspace is now a Git repository; the earlier no-Git note described initial development only. On 2026-10-24, the documentation task began with a clean working tree on `main`. `git fetch origin` succeeded, and `codex/update-project-docs` was created from freshly fetched `origin/main` at `19364d8` (`docs: add project-specific agent instructions`). The user then authorized adopting the poker-game repository's workflow rules, adapted to this game's stack and `main` base. This continues the same documentation task and preserves its changes. Commit/push/PR delivery is now authorized; the user merges manually.

The refresh adds a root README and updates the app README, DESIGN.md, PRODUCT.md, AGENTS.md, this checkpoint, and historical-document status notes. AGENTS.md now requires a PR per task, fetch/prune on resumed sessions, usage checks, and a save-point assessment below 10% remaining. This project uses CONTINUE.md and active progress ledgers instead of introducing poker-specific checkpoint files. Application code, design tokens, dependencies, and browser storage are unchanged. Final documentation checks passed across 11 Markdown files and 45 local links/anchors, documented npm scripts, 11 structured design previews, and nine palette tokens against CSS. `git diff --check` passed. Application tests and browser QA were not rerun for these documentation-only edits.

Latest usage observation: 2026-10-24 12:43 Asia/Bangkok (05:43 UTC), five-hour window 39% remaining (resets October 24 at 15:39:46) and weekly window 90% remaining (resets October 31 at 10:39:46), all times Asia/Bangkok. No low-capacity save-point trigger.

Delivery: task changes are committed as `a6f6142` (`docs: adopt task PR workflow and refresh project guides`) and pushed on `codex/update-project-docs`. [PR #1](https://github.com/ny147/1-in-mushoku-tensei/pull/1) is open against `main`; the checkpoint follow-up commit records this delivery on the same PR. The final fetch/prune succeeded, and the branch contains the latest `origin/main` at `19364d8`. No outstanding implementation work or delivery blocker remains. Next step: the user reviews PR #1 and merges manually. Do not merge, enable auto-merge, or delete the branch. To inspect locally, run `git status --short --branch` and `git log -2 --oneline` from the repository root. Future changes for this task update PR #1; new tasks follow the clean-start rules.

Before resuming, inspect the actual Git state and follow `AGENTS.md`. Continue this documentation task on its existing branch with its in-progress changes; for a new task, require a clean working tree and create a branch from freshly fetched `origin/main`. Do not implement on `main` or automatically merge/rebase.

Local source snapshots from the implementation remain at `checkpoints/six-faced-life-2026-10-24.zip` and `checkpoints/six-faced-life-2026-10-23.zip`. They predate the Git/documentation refresh and are not the current repository state. Snapshots contain source, assets, configuration, dependency lockfile, and documentation, excluding installed dependencies and generated build output. `checkpoints/` is ignored and may be absent in a fresh clone.

## Restart locally

```powershell
Set-Location 'D:\Developer\mashoku bilion\six-faced-life'
npm run dev
```

Open http://127.0.0.1:5173/ in the same browser to continue the saved life. If the preview is already running, use the open tab instead of starting a second server. Use Node.js 22.12+ or a supported Node.js 24 release. If dependencies have been removed, run `npm ci` inside the app first. Vite uses a strict port. The dev server was left running at the implementation save point, but its current process state has not been rechecked during this documentation task.

**In-game saves are browser-local and are not part of the source ZIP.** Keep the same browser profile and local URL; do not clear site storage if you want to preserve progress. Playback starts paused after reload. Pending decisions retain their outcomes and randomness.

## Historical implementation verification

These results belong to the original implementation and October 24 progression expansion. They are not fresh test/build/browser results for the documentation task. Rerun relevant checks for application changes.

- `npm test`: **39 tests passed**.
- `npm run build`: TypeScript and Vite production build passed.
- Automated engine runs completed 100 seeded lifetimes across every race, checking valid stats, nonnegative balances, and endings.
- Expansion tests also completed 25 school/vocation combinations, requiring earned spells, genuine promotions, valid balances, and endings. Tests verify actual increased yearly income, linked research outcomes, legacy migration, and study changes saving immediately.
- Actual browser playthrough completed a 74-year life through 52 decisions, including university, partnership, parenthood, teaching, and retirement.
- Browser checks covered pending-decision reload, training/focus controls, archive/reopened retrospective, world guide, new-life flow, clean console, and HTTP 200 preview.
- Desktop and 390×844 mobile layouts checked; no horizontal overflow. Final UX review approved delivery.
- Expansion browser QA used isolated port 5174 to avoid altering the player's 5173 saves: age 8 specialization, study switch/reload, merchant/invention route, promotion at 20, title Established trader, and base income 29→41. Desktop/mobile progression sections passed review with no major defects.

Five Important review findings were reproduced with failing tests and fixed: inherited enum keys in corrupted saves, hidden-tab watch-mode decisions, rapid paused focus saving, a parenthood event after partner death, and excluded travel destinations. The full suite passed after the fixes. No Important/Critical finding remains open.

The expansion's review found no Important/Critical defects. One misleading affordability hint for knowledge-gated assessments was reproduced and fixed, and its optional-cost TypeScript issue was corrected. Final tests and production build passed afterward. All 25 original event IDs and 69 literal choice IDs were retained.

## Scope and known limits

- This is a complete first playable version with a bounded event catalogue and choice-based danger, rather than tactical combat.
- School XP and learned spells are separate; instruction rank is shared. Existing magic experience migrates into the named discipline. Newly added career experience starts counting with this update; old history, savings, random state, and pending decision are preserved. Passed childhood milestones are not replayed for older characters.
- Geography, lifespans, birth weights, and other probabilities are authored/simplified game balance, not canon statistics.
- Mobile users scroll to the first choice; the layout was approved after readability improvements.
- Source ZIP preserves development state; browser progress remains separate.
- A private Sites project was registered during development, but source synchronization was blocked by automatic approval review. The user then explicitly chose local-only. No source upload or deployment followed. Preserve `.openai/hosting.json` as existing registration metadata and never publish without a new explicit user request.

## Context files

- `README.md`: repository entry point, setup, documentation map, and Git delivery rules.
- `AGENTS.md`: required workflow and verification instructions.
- `six-faced-life/README.md`: run instructions and implementation guide.
- `six-faced-life/DESIGN.md`: implemented design system.
- `docs/superpowers/specs/2026-10-23-six-faced-life-design.md`: approved design.
- `docs/superpowers/plans/2026-10-23-six-faced-life.md`: implementation plan.
- `docs/superpowers/plans/2026-10-23-six-faced-life-progress.md`: progress and review ledger.
- `docs/superpowers/plans/2026-10-24-story-progression.md`: expansion implementation plan.
- `docs/superpowers/plans/2026-10-24-story-progression-progress.md`: expansion results and review record.
- `docs/research/reference-findings.md`: reference evidence and incomplete REA analysis boundary.
- `six-faced-life/screenshots/chronicle-desktop-final.png` and `chronicle-mobile-final.png`: final UI evidence.
- `six-faced-life/screenshots/progression-desktop-2026-10-24.png` and `progression-mobile-2026-10-24.png`: expansion UI evidence.

## Next session

Start by reading the current UX review checkpoint above and inspecting Git as required by `AGENTS.md`. Do not redo completed review evidence, original implementation, progression expansion, or reference investigation. The main preview is 5173; use a separate origin for QA and preserve existing saves. UI improvements remain proposals until the user chooses implementation scope. If the user only wants to play, help restart the preview and preserve browser storage.

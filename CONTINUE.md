# Save point — Six-Faced Life

Updated 2026-10-24 (Asia/Bangkok). The original game and the chosen story, magic, and career expansion are complete. The latest task refreshes documentation against the current Git repository. Do not repeat discovery or request the original design approval again.

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

## Current Git and documentation checkpoint

The workspace is now a Git repository; the earlier no-Git note described initial development only. On 2026-10-24, the documentation task began with a clean working tree on `main`. `git fetch origin` succeeded, and `codex/update-project-docs` was created from freshly fetched `origin/main` at `19364d8` (`docs: add project-specific agent instructions`). The user then authorized adopting the poker-game repository's workflow rules, adapted to this game's stack and `main` base. This continues the same documentation task and preserves its changes. Commit/push/PR delivery is now authorized; the user merges manually.

The refresh adds a root README and updates the app README, DESIGN.md, PRODUCT.md, AGENTS.md, this checkpoint, and historical-document status notes. AGENTS.md now requires a PR per task, fetch/prune on resumed sessions, usage checks, and a save-point assessment below 10% remaining. This project uses CONTINUE.md and active progress ledgers instead of introducing poker-specific checkpoint files. Application code, design tokens, dependencies, and browser storage are unchanged. Documentation checks verified local links, documented npm scripts, 11 structured design previews, and nine palette tokens against CSS. Application tests and browser QA were not rerun for these documentation-only edits.

Latest usage observation: 2026-10-24 12:39 Asia/Bangkok (05:39 UTC), five-hour window 44% remaining (resets October 24 at 15:39:46) and weekly window 91% remaining (resets October 31 at 10:39:46), all times Asia/Bangkok. No low-capacity save-point trigger. Last completed commit before this task: `19364d8`; pending work is the documentation/workflow changes on `codex/update-project-docs`. Next step: verify the complete documentation diff, commit task-owned files, push that branch, and create or update its PR against `main`. If Git delivery is blocked, preserve the branch and record the exact blocker here.

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

Start by reading this file and inspecting Git as required by `AGENTS.md`. Do not redo the original implementation, the completed progression expansion, or reference investigation. The main preview is 5173; 5174 is reserved for isolated QA. No further game feature is currently authorized. If the user only wants to play, help restart the preview and preserve browser storage.

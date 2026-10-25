# Save point — Six-Faced Life

Updated 2026-10-25 (Asia/Bangkok). The active feature task is `codex/thai-language`; start with its plan checkpoint below. Earlier task checkpoints are historical. Separate production-deployment evidence was recorded on `codex/vercel-live-checkpoint` / PR #6, which is not part of this task's fetched base.

## Current Thai-language plan checkpoint

The user requested Thai as the next feature, selected **full-game Thai coverage**, then explicitly chose **language selection for new lives only** over instant switching. Existing lives and archives stay English; new lives retain their chosen English or Thai language through reload and retrospective reading. The user approved the [design](docs/superpowers/specs/2026-10-25-thai-language-design.md) and requested implementation. The [implementation plan and progress ledger](docs/superpowers/plans/2026-10-25-thai-language.md) is prepared and self-reviewed; the writing-plans skill requires plan review and execution-method selection before product code. Native execution is recommended, with one fresh whole-branch review after implementation.

Branch `codex/thai-language` started clean from freshly fetched `origin/main` at `01acad7` (merged Vercel migration PR #5). Fetch/prune succeeded again on resumption with authorized Git write access; there were no user changes. No application code, dependencies, saves, or deployment settings have changed. The design, plan and this checkpoint are the only task-owned files. A fresh read-only builder review found nothing important left unresolved before planning.

Usage observed on resumption 2026-10-25, recorded at 11:43 Asia/Bangkok (04:43 UTC): five-hour 16% remaining (resets October 25 at 14:52:47), weekly 43% remaining (resets October 31 at 10:39:46), all reset times Asia/Bangkok. No low-capacity trigger. Documentation verification: source paths, plan test commands, storage/progression interfaces, and current English save/history behavior inspected; `git diff --check` passed before this checkpoint update. Application tests/build are not required for this documentation-only step and have not been rerun.

Delivery: design/checkpoint commit `d189f7b` is pushed with its own upstream. [Draft PR #7](https://github.com/ny147/1-in-mushoku-tensei/pull/7) targets `main` and is attached to the chat; implementation updates this same PR after design approval. A documentation-only follow-up records delivery. Final fetch/prune succeeded and the task branch contains current `origin/main` at `01acad7`. No product implementation or readiness-to-merge claim is made.

Next: obtain plan review/execution-method selection, then invoke `superpowers:executing-plans` for native execution or `superpowers:subagent-driven-development` for the selected alternative. Begin with Task 1's failing persistence/preference tests. Resume this same branch, recheck usage/status and fetch origin first. Follow-up implementation updates draft PR #7 targeting `main`; keep it draft until implementation and required checks pass. The user merges manually. No deployment or browser-storage modification is authorized by this checkpoint.

## Current Vercel migration checkpoint

The user requested Vercel instead of Cloudflare, asked to update all related setup and create a new PR, and confirmed PR #4 was already merged. No hosting credentials were configured. This supersedes the Cloudflare activation steps below. Use the [new design](docs/superpowers/specs/2026-10-25-vercel-deployment-design.md), [plan/ledger](docs/superpowers/plans/2026-10-25-vercel-deployment.md), and [current deployment guide](docs/deployment.md).

Branch `codex/vercel-deployment` started clean from freshly fetched `origin/main` at `21e6b06` (merge of PR #4). Implemented: Vercel native Git integration configuration in app-root `vercel.json`, Vite/npm settings, SPA rewrite, main-only automatic deployments including disabling slash-containing task branches, and `build:vercel` (`npm test && npm run build`). GitHub CI runs the same command and retains its diagnostic artifact; Vercel independently builds source and runs tests before publishing. No deployment token, project/org ID, enable variable, Vercel CLI, or Actions deployment job is required. Wrangler dependency/config/scripts and the Cloudflare deploy job are removed. Existing ignored Cloudflare state remains protected; `.vercel/` is ignored.

Fresh verification: exact `npm run build:vercel` passes all 51 tests across seven files, TypeScript and Vite. Existing dependency records are unchanged; Wrangler and 60 obsolete lockfile package paths are removed. actionlint 1.7.12, `git diff --check`, and 39 local links across nine documents pass. All seven configured top-level properties pass their corresponding official Vercel schema definitions; unused experimental function definitions were excluded because the upstream schema mixes draft-04 and newer keywords. No full upstream-schema or hosted validation is claimed. Isolated production preview on 5177 served 13 HTML/JS/CSS/favicon/WebP/font responses; browser QA verified a fresh life, decision, pause, memory choice, paused restore after reload, and a direct local fallback path, with no captured warnings/errors or opening-screen overflow. This is Vite preview, not Vercel CDN verification. Port 5173 and its browser saves remain untouched.

Remote/account boundary: GitHub `production` environment still exists, but queried secret/variable lists are empty and the new workflow does not reference it. No Vercel project has been imported or deployed. After manually merging the new PR, the user imports `ny147/1-in-mushoku-tensei` into Vercel with Root Directory `six-faced-life`, Production Branch `main`, Node.js 22.x, Vite preset and output `dist`. The app-local config supplies install/build settings. Do not ask for API tokens or repeat the retired Cloudflare setup. A Vercel integration is available but not confirmed installed/connected; code migration does not depend on it.

Independent read-only review found no Critical/Important/Minor issue. Account/project import, hosted routing/assets and rollback remain external checks; the native independent-build and automatic-branch-control boundaries are intentional and documented. Latest usage observation: 2026-10-25 10:51 Asia/Bangkok (03:51 UTC), five-hour 65% remaining (resets October 25 at 14:52:47), weekly 50% remaining (resets October 31 at 10:39:46). All reset times Asia/Bangkok. No low-capacity trigger.

Delivery: implementation committed as `ec62b42` (`ci: replace Cloudflare deployment with Vercel Git integration`) and pushed with its own upstream on `codex/vercel-deployment`. [New PR #5](https://github.com/ny147/1-in-mushoku-tensei/pull/5) targets `main` and is attached to the chat. [GitHub Linux CI run 40159739528](https://github.com/ny147/1-in-mushoku-tensei/actions/runs/40159739528) passed for that implementation commit. A documentation-only follow-up records final evidence on the same PR. Fetch/prune succeeded and the branch contains current `origin/main` at `21e6b06`.

Next: the user reviews and manually merges PR #5, then imports the Vercel project following [docs/deployment.md](docs/deployment.md). Root Directory `six-faced-life`, Vite preset, Node 22.x, Production Branch `main`, output `dist`, no environment variables required. Confirm the actual first deployment's commit/Ready status, hosted asset types, SPA navigation and save/reload before claiming a live release. If account assistance is requested, use the available Vercel integration only after connection is confirmed. No hosted release is claimed now. Do not merge automatically, enable auto-merge, delete the task branch, configure hosting tokens, or repeat the retired Cloudflare activation. Resume source work with `git status --short --branch`, `git fetch origin --prune` and the new plan ledger; update PR #5 for this task's follow-ups. Port 5177 QA server/tab are stopped/closed; player port 5173 and its saves are intact.

## Previous Cloudflare checkpoint (historical; PR #4 is merged and hosting superseded)

**Do not execute this section's activation steps.** Vercel replaces Cloudflare as described above. The following records the earlier implementation and evidence only.

The user requested a plan followed by implementation and selected a new Worker named `six-faced-life` on `workers.dev`. This supersedes local-only hosting for this Cloudflare task; Sites publishing and paid upgrades remain outside the request. The [design](docs/superpowers/specs/2026-10-24-cloudflare-cicd-design.md), [plan and progress ledger](docs/superpowers/plans/2026-10-24-cloudflare-cicd.md), and [operations guide](docs/deployment.md) describe the implementation.

Branch `codex/cloudflare-cicd` started from clean, freshly fetched `origin/main` at `aab3b1b`. Implemented: pinned Wrangler tooling and lockfile; static-only SPA configuration uploading `dist`; local preview/dry-run/deploy scripts; ignored Wrangler state and local secret files; GitHub Actions tests/build/dry-run on PRs, main pushes, and manual runs; dependent main-only production deployment of the same tested artifact, opt-in repository variable, read-only permissions, pinned actions, timeouts, missing-secret errors, serialized releases and stale-main skipping. No game or save behavior changes.

Fresh verification: 51/51 tests pass across seven files; TypeScript/Vite production build passes; Wrangler 4.152.0 dry run reads 17 static files and exits without upload; actionlint 1.7.12 passes. No pre-existing lockfile package version changed. The 100-lifetime simulation test exceeded Vitest's default 5 seconds twice (9.9s and 9.2s); only that test now has a bounded 30-second timeout, preserving all seeds/assertions, and passed in 8.4s. Local Wrangler serving at isolated port 8787 loads root/JS/CSS/WebP, all eight TTF fonts and SPA fallback. Browser QA opened a fresh life, paused, chose a memory, reloaded into a paused restored life with the recorded choice, and opened a direct fallback path, without captured warnings/errors. Port 5173 storage is untouched. Independent code review found no Critical/Important/Minor issue; 31 local links across seven documents and `git diff --check` passed.

External setup: existing Cloudflare dashboard session is signed in; no local CLI token was found. GitHub initially had no secrets, environments, or variables. Created GitHub environment `production` and restricted deployment branches to `main`; no secret or activation variable has been added. Publication is disabled. The user must supply a scoped Cloudflare token directly to GitHub environment secrets (`CLOUDFLARE_API_TOKEN`, plus `CLOUDFLARE_ACCOUNT_ID`) and set repository variable `CLOUDFLARE_DEPLOY_ENABLED=true`. Then manually merge the task PR, or manually run the workflow on `main` after merging. Do not claim the Worker was created or the site is live without an observed successful deploy and hosted smoke check.

Latest usage observation: 2026-10-24 22:08 Asia/Bangkok (15:08 UTC): five-hour window 37% remaining (resets October 25 at 02:06:33); weekly 59% remaining (resets October 31 at 10:39:46). All times Asia/Bangkok. No low-capacity trigger.

Delivery: implementation commit `6f002b8` (`ci: validate builds and prepare Cloudflare static deployment`) is pushed with its own upstream on `codex/cloudflare-cicd`. [Draft PR #4](https://github.com/ny147/1-in-mushoku-tensei/pull/4) targets `main` and is attached to this chat. [GitHub Linux CI](https://github.com/ny147/1-in-mushoku-tensei/actions/runs/40105781892) passed for that implementation commit. A documentation follow-up records this checkpoint on the same PR. The final fetch/prune succeeded; branch contains the latest `origin/main` at `aab3b1b`.

Next: supply the two production secrets directly in GitHub, enable the repository deployment variable, and review PR #4. The user merges manually; do not merge, enable auto-merge, or delete the branch. After merging, inspect the successful main deployment and its actual workers.dev URL, then perform hosted smoke checks before calling the deployment complete. If secrets are configured after merging, manually run **CI and Cloudflare deployment** on branch `main`. Until then preserve the draft and disabled publishing. Resume with `git status --short --branch`, `git fetch origin --prune`, and this task's plan ledger; do not reimplement completed steps.

## User decisions

- On 2026-10-25, after manually merging PR #4, the user switched hosting to Vercel before configuring Cloudflare and requested a new PR. Native Vercel Git integration replaces token-driven Actions deployment; project import remains pending until the migration PR merges.

- Build a browser life simulator inspired by https://1in8b.life/en/, set in Mushoku Tensei.
- Original reincarnated protagonist with memories of a previous life.
- Design approved; implementation requested and completed.
- On October 24, the user chose more story events and deeper magic/career progression; that expansion is now implemented and verified.
- The user identified “What to do next / time controls” as the most confusing area, completed the review, then explicitly requested implementation of its fixes. The approved illustrated-chronicle identity remains the visual direction.
- The playable game stays local; Sites source uploads and deployment require a new request. On 2026-10-24 the user superseded the earlier restriction on Git delivery by adopting automatic task commits, branch pushes, and PRs targeting `main`. Follow-up commits update the task's existing open PR; the user merges manually.

## Current state

Project: `D:\Developer\mashoku bilion\six-faced-life`.
Local game: http://127.0.0.1:5173/.

Implemented: generated birth records; six regions/five races; memory-driven childhood; 55 milestone/recurring events; five magic study disciplines with 30 learnable spells; instruction-gated mastery; magic and sword training; yearly priorities; five working career ladders with experience, reputation, promotions, titles and increased income; university and linked research; adult relationships/family; travel; aging/endings; replay; versioned local saves; an archive of the last 20 completed lives; desktop/mobile chronicle, character, world, and retrospective views.

Original landscape and self-hosted fonts are in `public/assets/`. Font licenses and generation details are included. `PRODUCT.md`, `DESIGN.md`, and `.impeccable/design.json` describe the built product and visual system.

## Current UX implementation checkpoint

Task branch: `codex/ux-clarity-fixes`, created clean from freshly fetched `origin/main` at `e2bd13f`. The preceding review was delivered separately on [PR #2](https://github.com/ny147/1-in-mushoku-tensei/pull/2), latest review commit `1ff7c45`; its recommendations are now authorized for implementation. This task has its own [spec](docs/superpowers/specs/2026-10-24-ux-clarity-fixes.md) and [plan/progress ledger](docs/superpowers/plans/2026-10-24-ux-clarity-fixes.md). Implementation decisions preserve existing timed playback after a manual choice rather than adding a mandatory confirmation step.

Implemented: explicit time-state/next-action guidance and Review choices; separate Play/Pause action text; adjacent Watch mode explanation and mode-aware pending copy; actual manual-choice outcome and actual deltas in place with continuation, polite announcement and stable focus; navigation/spellbook/archive focus targets; 44px utility controls; accessible phone Help and Escape/menu state; actionable magic/career guidance; retry saving the latest in-memory data and safe retry loading of unreadable data; truthful storage wording; ended timelines without future squares; one h1 per retrospective; Latest moment labels; readable phone region selection. The original landscape now has a 554,172-byte WebP derivative, 83.2% smaller than its 3,293,374-byte PNG, with the original retained as fallback/source. Game engine, event identifiers, random consumption and save schema are unchanged.

Fresh verification on October 24: **51 tests passed across seven files**, including eight initially failing UX/recovery/keyboard cases, actual capped/risky outcomes, hidden automatic playback and immediate focus/study persistence. `npm run build` passed TypeScript and Vite (JS 353.95 kB / 112.86 kB gzip; CSS 51.16 kB / 10.78 kB gzip). Independent code review found no Important/Critical issue; its minor archive save-message concern was corrected to refer to latest progress. A keyboard regression test reproduced Space starting playback from a spell disclosure; the interactive-element guard now prevents it, and a fresh browser page confirmed it.

Browser QA used only isolated port 5176: desktop 1280px, phones 390×844 and 320×800; pending-choice navigation, actual outcomes, mobile help, full spellbook, 44px playback controls, Escape focus, automatic choice/playback, pause/reload, failed writes/repeated retry/recovery and persisted choice after real app reload, failed reads/retry, a 114-year ending/archive reopen, one h1, completed timeline and region selection. No horizontal overflow or captured console warnings/errors on inspected paths. WebP currentSrc and visual fidelity checked. Port 5173 and existing 5174/5175 browser saves were untouched. QA fixture source files were removed, preview stopped, tab closed and viewport reset. Ignored evidence: `six-faced-life/screenshots/ux-clarity-desktop.png` and `ux-outcome-mobile.png`. Full assistive-technology sessions, actual 200% zoom and exhaustive pixel/network/event audits were not claimed.

Usage observed 2026-10-24 at 21:41:52 Asia/Bangkok: five-hour **52% remaining** (resets October 25 at 02:06:33), weekly **62% remaining** (resets October 31 at 10:39:46). Neither window triggers the low-capacity save point. Delivery: implementation committed as `91b52b3` (`fix: clarify choices playback and save recovery`), pushed with its own upstream on `codex/ux-clarity-fixes`, and [PR #3](https://github.com/ny147/1-in-mushoku-tensei/pull/3) is open against `main`. This follow-up records delivery on the same PR. Documentation links/design JSON and all 11 retained previews were checked; full source/asset/task diff, untracked additions, staged diff and `git diff --check` reviewed. Engine/event/save-schema and dependency files were confirmed unchanged. Fetch/prune succeeded and the branch contains current `origin/main` at `e2bd13f`. No outstanding implementation blocker remains. Next step: review PR #3 and merge manually; resume inspection with `git status --short --branch` and `git log -2 --oneline`. Do not publish, merge automatically, enable auto-merge or delete the branch.

## Previous documentation checkpoint (historical; PR #1 is merged)

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

Start with the current Vercel migration checkpoint and plan ledger, then inspect Git as required by `AGENTS.md`. Resume on `codex/vercel-deployment` and update its new PR after creation; PR #4 is already merged and must not be reused. The user merges manually. Vercel native Git integration needs a project import after migration merge, with no deployment tokens. Ignore retired Cloudflare activation steps. The player origin remains 5173; production-build QA uses isolated port 5177 and preserves existing saves.

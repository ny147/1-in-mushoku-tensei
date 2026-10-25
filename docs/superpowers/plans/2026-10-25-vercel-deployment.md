# Vercel Deployment Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline and update this progress ledger. The user requested implementation and a new PR.

**Goal:** Replace the merged Cloudflare deployment setup with token-free Vercel Git deployment while retaining PR validation.

**Architecture:** GitHub Actions checks PRs/main and retains a diagnostic build artifact. Vercel's separate native Git build runs the same test/build command before publishing main; the user imports the project with app-root settings after manually merging this PR.

**Tech Stack:** Node.js 22, npm, React/TypeScript/Vite, Vitest, GitHub Actions, Vercel static hosting.

**Spec:** `docs/superpowers/specs/2026-10-25-vercel-deployment-design.md`.

## Global constraints

- App root is `six-faced-life`; Git root is its parent.
- Preserve seeded simulation, existing browser storage, port 5173 and the 30-second heavy-test timeout.
- No deployment tokens in source, Actions, or public `VITE_*` variables.
- Native Vercel Git builds run `npm test && npm run build`; do not imply GitHub's artifact is deployed.
- User merges the new PR manually; no force pushes, automatic main integration, or paid upgrades.

## Review focus

- Root Directory and the app-local config must agree; avoid doubled `six-faced-life/six-faced-life` paths.
- Vercel publication must run tests, not only the Vite build.
- Slash-containing task branches must not automatically deploy.
- Old Cloudflare secrets/enable switches must not remain in an active publishing path.
- Historical deployment evidence must not be presented as a current Vercel release.

### Task 1: Replace deployment configuration and tooling

Files: `.github/workflows/ci.yml`, `.gitignore`, `six-faced-life/vercel.json`, app package/lockfile; delete `six-faced-life/wrangler.json`.

- [x] Add `build:vercel`, app-local config, SPA fallback and main-only Git rules.
- [x] Remove Wrangler tooling/scripts and Cloudflare deployment job; keep diagnostic artifact and existing check name.
- [x] Ignore Vercel metadata; protect legacy ignored local artifacts.
- [x] Run exact build command, actionlint, official-schema validation, and lockfile comparison. Expected: tests/build pass, configuration valid, unrelated versions unchanged.

### Task 2: Replace active documentation and record migration

Files: `docs/deployment.md`, root/app READMEs, `six-faced-life/PRODUCT.md`, `CONTINUE.md`, historical Cloudflare spec/plan status notes, this ledger.

- [x] Explain native integration, exact import settings, no-token setup, first release after merge, main-only publishing, rollback and browser-local saves.
- [x] Mark Cloudflare records superseded without rewriting historical evidence.
- [x] Verify local assets and SPA navigation using isolated production preview; preserve existing player saves.
- [x] Review changed files and links; obtain independent read-only review and resolve material findings.

### Task 3: New PR delivery

- [ ] Fetch/prune, check diff and branch freshness, commit task-owned files, push explicit task branch and create/attach a new PR to main.
- [ ] Check GitHub Linux CI; record results and Vercel account setup still pending.
- [ ] Leave the user to import Vercel after manually merging; no hosted release is claimed.

## Progress ledger

- Setup: clean checkout; fetched `origin/main` at `21e6b06` (merged PR #4) and created `codex/vercel-deployment`. Usage: five-hour 89% remaining, weekly 54% remaining. No low-capacity trigger.
- Pre-flight: Vercel and CI consume the same `build:vercel` script. Vercel root is the app; Actions paths remain repository-relative for cache/artifact inputs. Native deployment intentionally rebuilds from source and does not depend on GitHub artifact transfer.
- Task 1 complete: exact `npm run build:vercel` passes 51/51 tests and TypeScript/Vite build; actionlint passes; all surviving lockfile versions unchanged, Wrangler and 60 obsolete package paths removed. No application logic or test assertions changed.
- Schema validation: all seven configured top-level properties pass their corresponding official schema definitions. The upstream full schema declares draft-04 but contains newer numeric `exclusiveMinimum` in unused experimental function fields, so those unused definitions were excluded instead of weakening checks on this config. No full upstream-schema validation or hosted Vercel routing success is claimed.
- Local QA: isolated Vite preview on 5177 loads the opening screen and WebP without overflow or captured warnings/errors; fresh life opens a pending decision, pauses, records a memory, restores paused with that outcome after reload, and opens a direct SPA path. This checks built output/local Vite fallback, not Vercel's CDN. Existing 5173 storage is untouched.
- Remote check: production environment secrets and repository variables are empty. It can remain unused; no remote deletion is needed.
- Task 2 complete: 13 asset/HTML responses and 39 local links across nine documents checked. Windows PowerShell npm-shim argument stripping was corrected with `npm.cmd`; the guide records that local alternative. Independent read-only reviewer found no Critical/Important/Minor findings. Review boundaries: actual Vercel import/hosting/rollback remain unverified; GitHub's diagnostic artifact is intentionally independent; Git branch rules control automation rather than maintainer authorization; CI checks JSON syntax while local verification checks configured schema fields. No game code changed.
- Pending: Task 3 delivery and GitHub Linux CI; user imports Vercel after manually merging the new PR.

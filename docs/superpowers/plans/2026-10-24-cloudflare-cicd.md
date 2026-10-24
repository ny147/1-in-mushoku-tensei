# Cloudflare CI/CD Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Track verification and decisions in the progress ledger below.

**Goal:** Check pull requests and deploy validated main builds to a new `six-faced-life` Cloudflare Worker.

**Architecture:** GitHub Actions validates the existing npm app and retains its built `dist` artifact. A dependent, main-only production job publishes that same artifact with locked Wrangler tooling after deployment is enabled.

**Tech Stack:** React, TypeScript, Vite, Vitest, Node.js 22, npm, GitHub Actions, Cloudflare Workers Static Assets, Wrangler 4.

**Spec:** `docs/superpowers/specs/2026-10-24-cloudflare-cicd-design.md`.

## Global constraints

- Use Node.js 22.12+ or a supported Node.js 24 release, npm, and the existing lockfile.
- Upload only `six-faced-life/dist/`.
- Preserve local port 5173 and existing browser storage.
- Keep credentials in GitHub secrets, never in source or public `VITE_*` configuration.
- Deliver a PR targeting `main`, which the user merges manually.

## Review focus

- Fork PRs and non-main manual runs must never receive deployment secrets or publish.
- Failed tests, build, or dry-run validation must prevent deployment.
- Missing credentials after opt-in must fail with actionable names, without printing values.
- Artifact and Wrangler paths must resolve inside `six-faced-life`, even though workflows live at the Git root.
- A new hosted origin must not be described as importing local browser saves.

### Task 1: Reproducible static hosting configuration

Files: `six-faced-life/wrangler.json`, `six-faced-life/package.json`, `six-faced-life/package-lock.json`, `.gitignore`.

- [x] Add an exact Wrangler dev dependency without unrelated upgrades.
- [x] Configure `six-faced-life`, `workers_dev`, `./dist`, and SPA fallback; add `cf:check`, `cf:dev`, and `deploy` scripts.
- [x] Ignore `.wrangler` and `.dev.vars` files, retaining example-file conventions.
- [x] Run `npm test`, `npm run build`, and `npm run cf:check` from the app. Expected: all tests pass, production output is built, and dry run exits successfully without upload.

### Task 2: GitHub Actions validation and gated production deployment

Files: `.github/workflows/ci.yml`.

- [x] Resolve and pin official action revisions.
- [x] Validate pull requests to main, pushes to main, and manual runs using Node 22 and the app lockfile.
- [x] Upload tested build; deploy only from main after validation and explicit repository-variable activation, through environment `production`.
- [x] Add read-only permissions, timeouts, concurrency, and explicit missing-secret errors.
- [x] Validate workflow syntax with actionlint and review all trigger/credential conditions. Expected: no syntax errors and no PR deployment path.

### Task 3: Operations guide, smoke checks, and delivery

Files: `docs/deployment.md`, root/app `README.md`, `six-faced-life/PRODUCT.md`, `CONTINUE.md`, this progress ledger.

- [x] Document secrets, production environment, enable switch, first deploy, rollback, local commands, and origin-specific saves.
- [x] Check root, compiled JS/CSS, artwork/fonts, and fallback through isolated Wrangler serving. Inspect the running app in a browser if available.
- [ ] Inspect available GitHub/Cloudflare access; activate and verify hosted deployment only with the necessary account access. Otherwise record the exact external blocker and setup steps.
- [ ] Review diff, run `git diff --check`, fetch/prune, commit task files, push the explicit branch, and create/attach a PR targeting main. Keep incomplete delivery or blocked required checks in draft. Never merge.

## Progress ledger

- Setup: clean checkout; fetched `origin/main` at `aab3b1b`; created and confirmed `codex/cloudflare-cicd`. User explicitly requested plan and implementation in one task and selected the new Worker name. Implement inline without another design approval round.
- Usage at session start: five-hour 46% remaining; weekly 61% remaining. No low-capacity trigger.
- Pre-flight: Task 2 consumes Task 1's npm scripts and `dist` output; Task 3 documents both. Paths are app-relative for commands and repository-relative for action artifact/cache inputs.
- Task 1 complete: Wrangler 4.152.0 installed; 51/51 tests pass, build and dry run pass (17 static files, no upload). Compared every existing lockfile package: zero version changes.
- Task 2 complete: official action SHAs resolved from GitHub; actionlint 1.7.12 passes. Main-only production environment created with a main branch policy. No credentials or enable variable added.
- Ruling: the 100-seed lifetime test exceeded the default 5-second budget twice (9.9s and 9.2s) while all assertions completed; give only this heavy test a 30-second budget for shared runners. Preserve every seed and assertion; no simulation changes. Cost if wrong: a genuinely slow simulation can run up to 30 seconds before failing.
- Pending: final test run, workflow validation, operations documentation, local serving checks, remote setup boundary, and PR delivery.

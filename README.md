# Six-Faced Life repository

A single-player browser life simulator set in Mushoku Tensei. An original reincarnated protagonist remembers a previous life, grows up, studies, works, forms relationships, and reaches an ending. The current version includes 55 authored events, five magic disciplines with 30 spells, and five working career ladders.

The application lives in **`six-faced-life/`**. Run npm commands there, not at this Git root. Development changes are committed and pushed through task PRs; the playable game remains local unless deployment is explicitly requested.

## Start locally

Use Node.js 22.12+ or a supported Node.js 24 release.

```powershell
Set-Location 'six-faced-life'
npm ci
npm run dev
```

Open [the local game](http://127.0.0.1:5173/). Vite uses a strict port; reuse an existing server when it is already running. Install dependencies only when needed.

Saves belong to the browser profile and exact origin. Keep using `http://127.0.0.1:5173/` to retain the same life. Git commits and source ZIPs do not back up browser saves. Use port 5174 or an isolated browser context for QA that starts or replaces a life.

## Repository guide

| Path | Purpose |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Required Git/PR workflow, usage checks, save points, and verification |
| [CONTINUE.md](CONTINUE.md) | Current checkpoint, user decisions, and historical validation |
| [App README](six-faced-life/README.md) | Playing, setup, scripts, implementation, and save compatibility |
| [Vercel deployment](docs/deployment.md) | CI checks, token-free Git import, first release, verification, and rollback |
| [PRODUCT.md](six-faced-life/PRODUCT.md) | Approved behavior, scope, and current expansion |
| [DESIGN.md](six-faced-life/DESIGN.md) | Implemented visual system, component behavior, and responsive rules |
| [Design sidecar](six-faced-life/.impeccable/design.json) | Structured design tokens and component previews |
| [ASSETS.md](six-faced-life/ASSETS.md) | Original illustration, fonts, and licenses |
| [Source](six-faced-life/src/) | React interface, pure simulation, persistence, and colocated tests |
| [Plans and specs](docs/superpowers/) | Approved design and historical implementation records |
| [Reference findings](docs/research/reference-findings.md) | Observations and analysis limitations |

Captured reference files in `research/` are research data outside the app build. Local `checkpoints/`, screenshots, dependencies, build output, and `.openai/` registration metadata are ignored by Git. Checkpoints and screenshots may be absent from a fresh clone.

## Verify changes

From `six-faced-life/`:

```powershell
npm test
npm run build
```

Vitest and React Testing Library cover simulation, progression, persistence, and UI behavior. The build runs TypeScript checking and Vite. There are no separate lint, typecheck, or end-to-end scripts. Documentation-only changes require path, command, and diff checks; prior test results in the checkpoint are historical evidence.

## CI/CD and hosting

GitHub Actions runs `npm run build:vercel` (tests followed by TypeScript/Vite build) on pull requests to `main` and main pushes. Vercel's GitHub integration runs the same command independently before publishing main; no deployment tokens in GitHub are needed. After this migration PR merges, import the repository into Vercel with Root Directory `six-faced-life`, Vite preset, Node 22.x, Production Branch `main`, and output `dist`. See [the deployment guide](docs/deployment.md) for setup, isolated local preview, first release, and rollback. The user switched from Cloudflare to Vercel on 2026-10-25 before configuring hosting. PRs are still merged manually. Hosted and local browser saves belong to different origins.

## Work with Git

Follow [AGENTS.md](AGENTS.md): start a new task with a clean working tree, fetch `origin --prune`, and create a task branch from freshly fetched `origin/main` before editing. Resume existing work on its task branch and fetch again before implementation. Preserve user changes and leave integration to the user; never implement or merge directly on `main`.

Each task is committed and pushed on its task branch and gets a PR targeting `main`; follow-up commits update that open PR. You merge manually. Blocked or incomplete verification requires a draft PR. The user authorized this Git workflow on 2026-10-24; Sites source uploads, deployment, new remote services, and paid upgrades still require separate authorization.

Check account usage at implementation-session starts, task boundaries, and before substantial work. Below 10% remaining in any applicable window triggers a save-point assessment. Update the existing `CONTINUE.md` with verified progress, pending work, branch/PR, usage observations, and exact resume instructions; do not create a second checkpoint system.

This is an unofficial fan creation. See the [app credits and scope](six-faced-life/README.md#scope-and-credits) for setting attribution and the distinction between original game balance and canon.

# CI/CD and Cloudflare deployment

Date: 2026-10-24. The user requested a plan followed by implementation and selected a new Worker named `six-faced-life` on `workers.dev`.

## Intent and constraints

Validate pull requests before manual merge, and publish validated `main` builds through GitHub Actions. The app remains a static React/Vite application with browser-local saves. Upload only `six-faced-life/dist/`; do not upload repository source, research, local saves, or Sites registration metadata. No custom domain, backend, database, paid upgrade, or game behavior change is needed.

Use Node.js 22.12+ or a supported Node.js 24 release, npm, and the existing lockfile. Preserve local port 5173 and existing browser storage. Keep credentials in GitHub secrets, never in source or public `VITE_*` configuration. Work on `codex/cloudflare-cicd`; deliver a PR targeting `main`, which the user merges manually.

## Approaches

- **GitHub Actions + Workers Static Assets (implementation choice):** run existing tests/build, retain the tested build as an artifact, and deploy it with a locked Wrangler dependency. All deployment gates live beside the code; no Worker server script is needed.
- **Cloudflare Git integration:** convenient automatic builds, but a separate Cloudflare build could publish without the GitHub test gate unless separately configured.
- **Cloudflare Pages:** fits a static app, but Workers Static Assets provides the required static hosting without a second deployment model. The user selected a new Worker rather than an existing Pages project.

## Behavior

Pull requests targeting `main`, pushes to `main`, and manual workflow runs install with `npm ci`, run `npm test`, build, and validate Wrangler with a dry run. Only successful `main` runs may publish. Deployment is opt-in through `CLOUDFLARE_DEPLOY_ENABLED=true` and a `production` GitHub environment; missing credentials fail clearly after opt-in. PRs receive no deployment credentials and never publish. Use read-only repository permissions, pinned action revisions, bounded jobs, and serialized production deployments.

Wrangler serves `./dist` with SPA fallback under `six-faced-life`. Add reproducible local dry-run, preview, and deploy commands. Ignore Wrangler state and local secret files. Document account/token setup, activation, manual retry, smoke checks, rollback, and the fact that a new origin has its own saves.

## Verification and external boundary

Run the complete existing test suite and production build, Wrangler dry-run validation, workflow syntax validation, and isolated HTTP/browser checks against Wrangler's local static serving. Review the complete diff and fetch before handoff. Do not claim a hosted deployment until Cloudflare reports success and its URL is checked. Cloudflare account access and GitHub secret/environment configuration may require user setup; record exact remaining steps if those capabilities are unavailable.

## Sources

- [Cloudflare GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [Workers SPA configuration](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)

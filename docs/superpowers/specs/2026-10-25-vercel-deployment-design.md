# Vercel deployment migration

The user requested Vercel instead of Cloudflare after manually merging PR #4, and requested a new PR. They have not configured the hosting credentials. This design supersedes the Cloudflare hosting design; historical verification remains historical.

## Approach and scope

Use Vercel's native GitHub integration, with no deployment API tokens or IDs in GitHub Actions. GitHub Actions remains the PR/main validation service. Vercel clones the repository, builds the `six-faced-life` root, and runs `npm run build:vercel` (`npm test && npm run build`) before publication. A failing test or build prevents that Vercel release. The Vercel build is independent of GitHub's diagnostic build artifact; do not claim it deploys the identical uploaded artifact or waits for GitHub's check to finish.

The alternative, Vercel CLI from GitHub Actions, preserves artifact-driven deployment but requires tokens and project IDs. Native integration is the implementation choice because the user is still setting up hosting and this app needs only static Vite hosting. No backend, database, new UI, save migration, Vercel SDK, or CLI dependency is needed.

## Configuration

- Add app-root `vercel.json`: Vite framework, `npm ci` install, `npm run build:vercel` build, `dist` output, and the documented SPA rewrite to `/index.html`.
- Allow automatic Git deployments only from `main`. Use `git.deploymentEnabled` with `main: true` and `**: false` so slash-containing task branches are also disabled. The rule is convenience, not an authorization boundary: maintainers can still request manual deployments or edit configuration.
- The Vercel project must use Root Directory `six-faced-life`, Production Branch `main`, and Node.js 22.x. These account settings require importing/linking the repository; adding configuration alone creates no Vercel project or live release.
- Remove the Cloudflare deploy job, Wrangler package/configuration/scripts and active setup instructions. Retain harmless ignored legacy caches/secret files so old local files cannot accidentally enter Git. Add `.vercel/` to ignored state.
- Keep GitHub validation secret-free with pinned actions, read-only permissions, bounded jobs, concurrency, and a seven-day diagnostic artifact. Retain its existing check name so any manually configured branch protection stays usable.
- Document fresh import after the new PR merges, exact dashboard settings, first-release/rollback checks, and origin-local saves. No Cloudflare or Vercel token, organization ID, project ID, or enable variable is required in this model. Preserve the existing unused GitHub production environment; it no longer drives deployment.

## Verification and delivery

Run the exact Vercel build command, validate the workflow with actionlint and Vercel configuration against the official schema, inspect a production preview on a separate port, and check links/diff. No tests that merely mirror static configuration are needed. Compare lockfile versions to exclude unrelated upgrades. Verify the new PR's Linux CI before handoff. Deliver on `codex/vercel-deployment` in a new PR targeting `main`; the user merges manually. A hosted smoke test remains pending until the user imports the Vercel project; never claim a live URL without observing it.

## Sources

- [Vite SPA configuration](https://vercel.com/docs/frameworks/frontend/vite)
- [Git deployment rules](https://vercel.com/docs/project-configuration/git-configuration)
- [Project root and build settings](https://vercel.com/docs/builds/configure-a-build)

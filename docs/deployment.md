# Vercel deployment

Six-Faced Life uses Vercel's GitHub integration for static Vite hosting. GitHub Actions checks pull requests; Vercel installs, tests and builds the app before publishing. **No Cloudflare or Vercel API tokens, organization/project IDs, GitHub environment secrets, or deployment enable variable are required.** The earlier Cloudflare setup from merged PR #4 is retired.

## One-time setup after this migration PR merges

1. Review and manually merge the Vercel migration PR into `main` before importing the project. This ensures the first import contains the test-gated build and SPA configuration. Do not import the old Cloudflare version of main.
2. Sign in to [Vercel](https://vercel.com/new), choose **Add New → Project**, and import `ny147/1-in-mushoku-tensei`. If prompted, authorize Vercel's GitHub integration for this repository. This connection replaces deployment-token setup.
3. Set these project values before the first deployment:

   | Setting | Value |
   | --- | --- |
   | Project name | `six-faced-life`, or an available name you prefer |
   | Framework Preset | Vite |
   | Root Directory | `six-faced-life` |
   | Production Branch | `main` |
   | Node.js Version | `22.x` |
   | Install Command | `npm ci` |
   | Build Command | `npm run build:vercel` |
   | Output Directory | `dist` |
   | Environment Variables | None required by this app |

   Command and output paths are relative to the Root Directory. Do not set the output to `six-faced-life/dist`, which would double the app path. The app-local [vercel.json](../six-faced-life/vercel.json) supplies the framework, install/build/output settings and SPA rewrite; verify the dashboard root/branch/Node settings too.
4. Click **Deploy**. Vercel creates the project and its production release only after the tests and build succeed. Read the build logs and copy the actual production URL from the dashboard. An exact hostname is not reserved by the repository; Vercel may assign a different name if one is taken.
5. After setup, pushes/merges to `main` trigger production builds automatically. Automatic deployments from other branches, including slash-containing task branches, are disabled by the app's Git rules. Manual deploys remain possible for authorized maintainers; these rules do not replace account/repository access control.

You do not need a Cloudflare Worker, a Cloudflare token, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, or an Actions deploy job. The unused GitHub `production` environment created for Cloudflare may remain; the new workflow does not reference it. If you created old Cloudflare credentials despite not completing setup, revoke tokens you no longer use and remove only this app's obsolete secrets/enable variable; do not affect credentials used by other projects.

Do not use the retired **CI and Cloudflare deployment** workflow's manual dispatch on an older commit. Once this migration is merged, the current workflow is **CI**, with no publishing step.

## CI and deployment gates

[GitHub Actions](../.github/workflows/ci.yml) runs on PRs targeting `main`, pushes to `main`, and manual runs. It installs the lockfile with `npm ci`, runs `npm run build:vercel`, checks Vercel JSON syntax, and retains `dist/` for seven days as a diagnostic artifact. The existing check name **Test, build, and validate deployment** is retained for compatibility with any manually configured required check. Configure that check in GitHub branch protection if you want GitHub to block manual merges on failures; the workflow does not change branch protection.

`build:vercel` runs `npm test && npm run build`. Both GitHub and Vercel use this command. The heavy 100-lifetime test retains its 30-second bound and every seed/assertion. A failing Vercel test, TypeScript check or Vite build prevents that release from publishing.

Vercel builds independently from the selected Git revision. It does **not** download GitHub's artifact or wait for the GitHub check to finish. Its own test step provides the publication gate. GitHub's workflow uses read-only repository permissions and no deployment secrets. Production hosting and its account permissions are managed by Vercel's native integration.

The app has no backend or hosted database. Only `dist` is the public build output; research, source checkpoints, local registration metadata, test sources and source save data are not deployed as public static files. Vercel does fetch repository source to perform the Git build. Keep credentials out of source and `VITE_*` variables, which are public browser configuration. No paid upgrade or custom domain is part of this setup.

## Local verification

Run in `six-faced-life/`:

```sh
npm ci
npm run build:vercel
npm run preview -- --port 5177 --strictPort
```

Install dependencies only when needed. `build:vercel` runs the complete suite and production build without publishing. `preview` serves `dist` on isolated port 5177; rebuild after source changes and stop with Ctrl+C. It is a Vite smoke test, not an emulation of Vercel's CDN. The normal player origin `http://127.0.0.1:5173/` remains untouched. There is no repository `deploy`, `cf:check`, or `cf:dev` script and no hosting CLI dependency.

In Windows PowerShell, use `npm.cmd run preview -- --port 5177 --strictPort` if the npm PowerShell shim strips the argument separator. The Bash command above remains valid in GitHub/Vercel's build environment.

The SPA rewrite uses Vercel's documented `/(.*)` → `/index.html` configuration. Check deep links on the real hosted URL after deployment; local Vite fallback alone does not prove hosted routing.

## Check the first hosted release

In Vercel, confirm the expected Git commit and **Ready** production deployment, then open the actual production URL and check:

- The opening screen, landscape, fonts, JS and CSS load without application console errors.
- A fresh test life opens its birth record, pauses for a decision, and restores a chosen outcome after reload.
- Direct navigation to a non-file path loads the SPA while artwork/fonts still return their real file types.

**Saves remain local to the exact browser profile and origin.** A Vercel production hostname does not import the life at `http://127.0.0.1:5173/`. Unique deployment URLs, later custom domains, and hostname changes have separate storage. Use the stable production hostname to continue a hosted life. There is no account sync or save export/import; do not clear the local player's storage.

## Retry, pause, and rollback

- **Failed first build:** check Root Directory, Node 22.x, install/build/output settings and the failing test/build log. Correct repository issues through another task PR, or fix account settings and redeploy the latest intended main revision from Vercel. A first release has no earlier deployment to restore.
- **Pause new automatic deployments:** disconnect the Git repository under the Vercel project's Git settings, or make a reviewed configuration change setting `git.deploymentEnabled=false`. Existing live content remains; cancel an in-flight deployment separately if necessary. Do not change the retired Cloudflare enable variable.
- **Immediate rollback:** in the project's deployment history, use Vercel's rollback action to restore a known-good production deployment when available for your account. Verify the live version afterward. Pause new automatic deployments first so a new main build does not replace the rollback.
- **Permanent correction:** revert the bad application change in a new branch/PR, merge manually after checks, then reconnect/re-enable deployment. Do not reset or force-push main. Do not buy a plan upgrade to enable an unavailable operation; report the account limit instead.

## References

- [Vite and SPA routing on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [GitHub integration](https://vercel.com/docs/git/vercel-for-github)
- [Root Directory and build configuration](https://vercel.com/docs/builds/configure-a-build)
- [Git deployment rules](https://vercel.com/docs/project-configuration/git-configuration)
- [Instant Rollback](https://vercel.com/docs/instant-rollback)

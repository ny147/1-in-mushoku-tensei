# Cloudflare deployment

Six-Faced Life deploys as static files to a Cloudflare Worker named `six-faced-life`, using its `workers.dev` address. There is no Worker server script, database, or application secret. The deployment credential belongs only to CI.

## Pipeline

[The workflow](../.github/workflows/ci.yml) runs on pull requests targeting `main`, pushes to `main`, and manual runs. Its validation job uses Node 22, installs the app lockfile with `npm ci`, runs all tests, builds with TypeScript/Vite, validates Wrangler with a dry run, and retains `six-faced-life/dist/` for seven days. The heavy 100-lifetime simulation test has a 30-second limit; its seeds and assertions remain unchanged.

The production job requires successful validation, branch `main`, a non-PR event, and repository Actions variable `CLOUDFLARE_DEPLOY_ENABLED` equal to `true`. It downloads the tested artifact from that same run and publishes it with the exact locked Wrangler version. It does not rebuild the app. Production deployments are serialized, and a superseded main revision is skipped before publishing. Fork PRs and manual runs from task branches cannot deploy. Repository permissions are read-only; credentials exist only in the steps that need them.

CI runs without Cloudflare credentials. Leaving the enable variable unset or setting it to `false` keeps deployment disabled without failing validation. Once enabled, missing secrets produce an explicit failure. This workflow is the deployment authority: do not also enable Cloudflare Git builds, which would create a separate publishing path.

## One-time account and GitHub setup

1. Sign in to Cloudflare and select the intended account. Find its Account ID. Under **Workers & Pages**, ensure that account has a `workers.dev` subdomain. No custom domain or paid upgrade is needed for this configuration.
2. Create an API token restricted to that account, with **Account / Workers Scripts / Edit** and **Account / Account Settings / Read**. Avoid a Global API Key. Keep the token private; enter it directly in GitHub secrets rather than chat, repository files, or `VITE_*` variables.
3. In the GitHub repository, open **Settings → Environments → production**. Create the environment if absent, and restrict deployment branches to the `main` branch. Optional required reviewers can add a manual production approval.
4. Add these **environment secrets** under `production`:

   | Secret | Value |
   | --- | --- |
   | `CLOUDFLARE_API_TOKEN` | The scoped deployment token |
   | `CLOUDFLARE_ACCOUNT_ID` | The selected Cloudflare Account ID |

5. Under **Settings → Secrets and variables → Actions → Variables**, add repository variable `CLOUDFLARE_DEPLOY_ENABLED` with value `true`. This must be a repository variable, because the job condition is evaluated before environment variables are available.
6. Review and manually merge the task PR into `main`. That push runs validation and then the first deployment. If setup happens after merging, use **Actions → CI and Cloudflare deployment → Run workflow**, selecting branch `main`.

The first successful deploy creates the Worker if it does not exist. Wrangler prints its real URL; expect `https://six-faced-life.<your-account-subdomain>.workers.dev`, where the account subdomain is supplied by Cloudflare, not invented in configuration. Worker names are unique within an account: confirm an existing Worker with this name is the intended target before deploying into an account that already uses it.

The workflow uses the token for asset uploads and Worker deployment. Anyone able to change trusted `main` workflow code can influence how that token is used; restrict main writes and use environment reviewers as appropriate for your repository. Set the validation job **Test, build, and validate deployment** as a required pull-request check if you want GitHub to block merges on failures. Adding the workflow alone does not configure branch protection.

## Local verification and preview

Run inside `six-faced-life/`, after installing dependencies with `npm ci` when needed:

```sh
npm test
npm run build
npm run cf:check
npm run cf:dev
```

`cf:check` runs `wrangler deploy --dry-run` and does not upload or publish. `cf:dev` serves the existing `dist/` locally at `http://127.0.0.1:8787/`; rebuild after source changes. It uses Cloudflare's local runtime and SPA routing. Stop with Ctrl+C. The normal Vite preview at port 5173 remains separate.

For an explicitly authorized manual release from a verified, current main checkout, authenticate Wrangler with `npx wrangler login` or provide `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` through your shell's secure environment, then run `npm run deploy`. This command publishes immediately; it does not run tests or build. Prefer the main workflow so the tested artifact and deployment record remain together. Never commit credentials. Wrangler state and `.dev.vars` files are ignored; `.dev.vars` is for local Worker bindings, not CI authentication.

## Check a deployment

Confirm both GitHub's validation and deploy jobs succeed and Cloudflare lists a successful deployment. Open the actual URL printed in the deploy log and check:

- The opening screen loads with its landscape and self-hosted fonts; JS/CSS requests succeed.
- A fresh test life can open a birth record, stop at a decision, and save/reload in that isolated hosted origin.
- A direct navigation to a non-file path serves the SPA rather than a Cloudflare 404.
- The browser console has no application errors.

**Browser saves stay with their exact origin and profile.** A `workers.dev` address starts with separate storage; it does not import the life saved at `http://127.0.0.1:5173/`. Changing the Worker hostname, account subdomain, or later custom domain creates another origin. Keep the local player tab and its storage intact. The app has no export/import or cloud-save feature.

## Retry, stop, and roll back

- **Retry:** run the workflow on `main` after correcting token/account setup. Old runs whose commit is no longer main are skipped; use a fresh manual run for the current commit.
- **Stop future releases:** set repository variable `CLOUDFLARE_DEPLOY_ENABLED=false`. This does not cancel a job that already started or take down the live site; cancel an active job separately if necessary.
- **Roll back immediately:** open the `six-faced-life` Worker in Cloudflare, choose a known-good previous deployment under **Deployments**, and roll back to it. A first deployment has no prior release to restore. Disable automatic deployment first so an in-flight/new main build does not replace the rollback.
- **Keep the rollback:** revert the bad application change through a new task branch and PR to `main`, run checks, and merge manually before re-enabling deployment. Do not reset, force-push, or rewrite main.

## References

- [Cloudflare static SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Cloudflare GitHub Actions authentication](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [Cloudflare API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Cloudflare rollback](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/)

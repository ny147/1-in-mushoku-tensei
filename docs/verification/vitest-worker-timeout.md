# Vitest worker timeout correction — 2026-11-12

## Failure and cause

PR #24 was manually merged as `c34cd5c`. GitHub's PR and main CI runs passed,
including [main run 43032083980](https://github.com/ny147/1-in-mushoku-tensei/actions/runs/43032083980).
Vercel's [production build HLKira2RTwAQJ1N2mxNqQTQo6gxT](https://vercel.com/ny147s-projects/six-faced-life/HLKira2RTwAQJ1N2mxNqQTQo6gxT)
reported 70 files / 487 tests passed, followed by one unhandled
`[vitest-worker]: Timeout calling "onTaskUpdate"` and exit 1 after 362.97s.
The older `2714a94` deployment remained live.

The installed Vitest 3.2.7 used a fixed 60-second RPC timer separate from each
test's configured timeout. Slow synchronous worker execution can delay receipt
of an acknowledgement until that timer expires. This matches the maintained
[upstream issue](https://github.com/vitest-dev/vitest/issues/8164) and
[upstream correction #8297](https://github.com/vitest-dev/vitest/pull/8297).

## Correction and regression

- Pin Vitest and its coupled test-runner packages to 4.1.12, which contains the
  upstream RPC correction and current v4 patches. No other direct dependency changes.
- Reference the direct Vite spec with `overrides.vite: "$vite"`. Vite stays at
  7.3.7. Without this constraint npm 10.9.2 and 11.5.2 failed internally with
  `edgesOut` while exploring optional Vite 8/devtools/Vitest 5 peers. No legacy
  peer mode, forced audit fix, global npm change or new hosting setting is used.
- Keep all existing application tests, seeds, assertions and timeout limits.
  Unhandled errors continue to fail the build. No retries or error suppression.
- Add opt-in `npm run test:runner`: a fork worker blocks synchronously for 65s,
  then both assertions pass. Correctness is the runner's clean exit, including
  reporting/shutdown; the old runner instead exits 1 with the production error.
  `tooling/rpc-timeout.fixture.ts` is included only by its dedicated config and
  does not add a minute to every ordinary test/deployment run.

## Evidence

- **RED, Vitest 3.2.7:** dedicated fixture, 2/2 assertions passed, one unhandled
  `onTaskUpdate` timeout, exit 1; 65.19s. Full log is ignored under checkpoints/.
- **Intermediate check, Vitest 4.0.18:** same fixture 2/2, no unhandled error,
  exit 0; 65.17s. Final delivery uses patched 4.1.12 instead.
- **Clean installer:** Node 22.16.0 / bundled npm 10.9.2 `npm ci` passed against
  the final lockfile; audit reports zero vulnerabilities. The existing
  whatwg-encoding deprecation notice remains.
- **GREEN, final Vitest 4.1.12:** same fixture 2/2, no unhandled error, exit 0;
  65.18s. Command: `npm run test:runner` after clean `npm ci`.
- **Production gate:** `CI=true npm run build:vercel` passed: 70 files / 487
  tests (94.78s), then TypeScript/Vite build (2.54s), exit 0. The existing
  >500 kB bundle advisory remains; output JS/CSS hashes match the preceding
  family-scene build. No application-test changes were necessary for Vitest 4.
- Independent read-only review found no actionable findings in the dependency,
  lockfile and regression fixture changes. Whitespace/diff review passed.

## Scope and release

Branch `codex/vercel-test-worker-timeout` starts at freshly fetched
`origin/main c34cd5c`. No simulation, UI, saves, browser storage, runtime
dependency, hosting settings or publication changes. Docker's Linux engine was
unavailable, so no claim of a constrained Linux/Vercel reproduction is made;
the deterministic local regression reproduces the exact worker error instead.
Delivery is a PR targeting main, for manual merge. Vercel's actual fixed
production build can be verified after that merge; the failed release was not
retried as part of this code correction.

[PR #25](https://github.com/ny147/1-in-mushoku-tensei/pull/25) contains
implementation commit `b507fc9`. The final documentation checkpoint adds the PR
link; see Git history for its SHA and the PR Checks for the latest Linux CI run.

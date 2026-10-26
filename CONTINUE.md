# Save point — Six-Faced Life

## Accessible career design — 2026-10-26 21:00 Asia/Bangkok

The user reports being stuck as farmer even when not poor and explicitly asked
for `grill-me` **before planning anything**. The design interview is complete;
the requested `i-have-adhd` response style stays active until turned off. Keep
responses short with one clear next action. **No game implementation or
implementation plan has been written.**

Confirmed: all ordinary careers get accessible training routes; paid full-time
apprenticeships take 2–3 years; optional slower part-time training retains the
current job; entry requirements decrease and existing skills count; ordinary
qualified applicants and graduates get guaranteed appointments without vacancy
waiting. Loans are voluntary, interest-free and repaid only from income after
necessities, with hardship pauses. Loans cover career training **and university**;
university keeps academic readiness with clearer guidance. Mastery and prestigious
roles remain harder. See the full confirmed/proposed distinction in
`docs/superpowers/specs/2026-10-26-accessible-careers-design.md`.

Source investigation found most jobs have only a deterministic **10% vacancy
chance per world year**, versus always-available farmer/laborer. Swordsman needs
80 sword XP/cap 2; mage needs 100 discipline XP/cap 2; ordinary focus gives 9
XP/year and instruction itself requires prior XP and a fee. These are source
findings, not observations of the player's private save or current hosted build.

New clean task branch: `codex/accessible-career-design`, from freshly fetched
`origin/main` **`c88743a`** (PR #11 is merged). Ordinary fetch was sandbox-blocked
at FETCH_HEAD; the authorized escalated fetch succeeded. Only the design and this
checkpoint change. A fresh builder reviewer found **nothing important left**;
remaining internal allocation/schema/refund choices are explicitly delegated.
Design/checkpoint commit **`ae116d4`** is pushed to the task branch. Draft design
**PR #12** targets `main`: https://github.com/ny147/1-in-mushoku-tensei/pull/12.
It is attached to this chat and stays draft while the written design awaits user
review. The following documentation-only commit records delivery. User merges
manually; no deployment.

Proposed defaults, **not yet user-approved**: lower ordinary thresholds listed in
the design; 24 coins/year full-time apprentice pay, 8 coins per equivalent year
tuition; 4/6-year part-time duration; 10% positive earned-surplus repayment;
provider-paid loans including university's existing tuition/living reserve;
retained qualification during injury and manual placement acceptance. Review
these before implementation planning. Existing expanded lives need validated
no-course/no-debt migration; frozen legacy lives and completed snapshots stay intact.

Verification is documentation-only: source paths/values, the full new document,
and the staged task diff were inspected; `git diff --cached --check` passed after
removing two Markdown line-break trailing spaces. Final fetch/prune succeeded,
the branch contains current `origin/main` **`c88743a`**, the working tree was clean,
and `git diff --check origin/main...HEAD` passed. No application tests,
build, or browser QA were run or claimed; no player storage was touched.
Usage observed around **20:56 Asia/Bangkok**: five-hour **24% remaining**, reset
**Oct 27 00:20:55**; weekly **88% remaining**, reset **Nov 2 19:20:55**. No billing
or reset-credit action. This is above the below-10% checkpoint trigger.

Exact next step: have the user review the design/proposed defaults. The
brainstorming skill requires
design-document approval before invoking writing-plans to create the implementation
plan. Do not repeat the completed interview, treat proposed numbers as approved,
or begin product implementation at this checkpoint.

## Optional activities follow-up — 2026-10-26 20:15 Asia/Bangkok

User feedback: careers seemed restricted to farmer; user explicitly clarified
that players should open optional activities whenever they choose, including
Seven Great Powers challenges. **Implemented** on
`codex/career-choice-access`, created cleanly from freshly fetched `origin/main`
at **`271f718`**. PR #10 was already merged by the user; deliver this follow-up
as a new PR targeting `main`, not as commits to the closed PR.

Chronicle now has an Optional activities disclosure below yearly focus, from age
eight: careers, instruction, assessment, university, travel, meeting people and
legendary challenges. Opening pauses playback/focuses and saves the decision,
consumes no time/random draws/resources and stays manual in Watch/reload. Pending
decisions cannot be replaced. First work also links to other careers. Job rows
show vacancy status, missing qualifications and all positive fees. Qualifications,
costs and deterministic yearly vacancies remain; legendary challenges no longer
interrupt ordinary lives randomly. Existing pending challenge saves still load.

Fresh checks after final code edit: **197/197 tests across 33 files**, 64.04 sec;
**production build passed**, existing >500 kB bundle advisory only; diff check
passed. Legacy 21,168 hashes and measured childhood cohorts remain unchanged.
Isolated browser 5180: desktop menu, merchant chosen/charged 30 once and restored
at 170 coins/age 35, voluntary challenge reload/decline, Thai keyboard disclosure,
fees/vacancies and 390/320px wrapping without overflow or captured warn/error logs.
Owned server/tab stopped/closed and viewport reset; player 5173 storage untouched.
Screenshot outside Git: `C:/Users/Neary/.codex/visualizations/2026/10/26/01a177e4-3d14-7050-9342-aaa2304e4fe6/optional-activities-mobile.png`.

One fresh follow-up review found hidden affordable fees: reproduced RED→GREEN,
fixed before final suite. Two minor explanatory gaps deferred: instruction lock
reasons remain generic; university button does not explain its post-graduation
lock. No required review finding remains. See the existing follow-up plan at
`docs/superpowers/plans/2026-10-26-optional-activities.md`.

Usage observed **20:13**: five-hour **52% remaining**, reset **Oct 27 00:20:55**;
weekly **92% remaining**, reset **Nov 2 19:20:55**. No billing/reset credits changed.
Delivery confirmed: code commit **`20d819a`** is pushed to
`codex/career-choice-access`; follow-up **PR #11** is ready for review and targets
`main`: https://github.com/ny147/1-in-mushoku-tensei/pull/11. Remote head matched
that commit; this final documentation commit records the handoff. No required
implementation work remains. User reviews/merges manually; do not repeat the
implementation or planning. No deployment was performed.

## Completed implementation — PR #10, 2026-10-26 19:47 Asia/Bangkok

**Implementation and required review repairs are complete.** Continue only for
new feedback; do not repeat the implementation. Branch
`codex/life-simulation-spec`, existing PR
https://github.com/ny147/1-in-mushoku-tensei/pull/10, base `main`.
Repair checkpoint **`c741baf`** and final code/verification commit **`3f0868e`**
are pushed. The following documentation-only commit confirms delivery;
use `git log -1` for its identifier.

Final fresh checks after that last code change: **186/186 tests across 32 files**
in 62.52 seconds, **`npm run build` passed**, `git diff --check` passed.
Full-engine cohort remains 89.72% Superd childhood mortality, 73.02% with care/
protection; all 21,168 legacy hashes remain unchanged. The sole whole-branch
review's eight required findings are fixed; no declined findings or deferred
minors. Existing Vite >500 kB bundle advisory remains nonblocking.

Post-repair isolated browser checks: family and scholarship enrollment restore;
remote succession news has no military service option; Calamity widowhood closes
the marriage and restores; completed snapshot displays dismissal and named
friend/rival/enemy facts. Keyboard focus works, no overflow at 390/320px, no
captured warning/error logs in these flows. Owned 5180 Vite process stopped,
owned QA tab closed and viewport reset. Port 5173 browser saves were untouched.
Screenshot: `C:/Users/Neary/.codex/visualizations/2026/10/26/01a177e4-3d14-7050-9342-aaa2304e4fe6/expanded-reviewed-summary.png`.

Fetch/prune succeeded and HEAD contains latest `origin/main` **`9d19b9a`**;
no upstream integration was needed. Latest usage observation around **19:45**:
five-hour **74% remaining**, reset **October 27 00:20:55**; weekly **96% remaining**,
reset **November 2 19:20:55**. No credits or billing changed.

Delivery confirmed through GitHub API: PR #10 is **ready for review** (`draft:
false`), targets **`main`**, and its title/body now describe the implementation
and measured validation. Remote code head matched **`3f0868e`**. This final
documentation commit follows on the same branch. **User merges manually. No deployment.**
No remaining implementation blocker; future work is human review/feedback.

## Verified repair checkpoint — PR #10, 2026-10-26 19:42 Asia/Bangkok

Continue **`codex/life-simulation-spec`**, existing PR #10 targeting `main`.
All eight findings from the sole independent review have been repaired in the
one RED→GREEN pass. New regressions cover family compaction/count safety,
800-year family restoration, title history, impossible decisions, attainable
university progress, local historical service and attribution, disaster
widowhood, and bilingual social/career-outcome snapshots.

Fresh checks: **`npm test` 185/185 across 32 files** (67.67 seconds), and
**`npm run build` passed** TypeScript/Vite; only the existing >500 kB bundle
advisory remains. Full-engine Superd cohort remains 8,972/10,000 childhood deaths,
7,302 with protection/care, from 2,207,675 candidate births. Legacy 21,168 hashes
remain unchanged. Code and these checkpoint changes are saved together in the
commit immediately following `ea8bbe0`; use `git log -1` for its identifier.

Latest fetch/prune succeeded. Usage observed at **19:38 Asia/Bangkok**:
five-hour **84% remaining**, reset **October 27 00:20:55**; weekly **97% remaining**,
reset **November 2 19:20:55**. No billing or reset credits changed.

Next: finish affected isolated browser checks on **port 5180**, then update the
verification report and this checkpoint, fetch again, inspect the complete task
diff/status, push the same branch and update PR #10's description/readiness.
Do not dispatch a second reviewer or redo completed implementation. Owned QA
Vite process is running on 5180; stop it and close the owned QA tab afterward.
Player 5173 browser storage remains untouched. User merges manually; no deployment.

Family representation ruling: group demographic profiles by generation/carrier
while retaining birth year, ancestry, lifespan and RNG per live profile; merge
equivalent extinct profiles. Binomial sampling uses beta decomposition rather
than per-person loops. The existing one-million modeled distant-birth safety bound
is now explicitly disclosed in the UI and final snapshot if reached; it never
discards an already recorded person or changes living/dead counts.

## Resumed review repairs — PR #10

User explicitly requested continuation and save points. On **2026-10-26 around
19:21 Asia/Bangkok**, usage recheck reports **100% remaining in both windows**.
The prior 7% save-point trigger is historical; the agent did not redeem credits
or change billing. Fetch/prune succeeded; continue `codex/life-simulation-spec`
and preserve its task-owned documentation changes.

The sole independent review is complete: eight actionable findings, none declined
to judge. They are recorded in the plan ledger below. Required repair pass:
genuine family compaction/count validation; bounded title-yield history; invalid
pending-state recovery; attainable university progress (including capped skills);
local historical service/record attribution; unified family-death bookkeeping;
and complete social/career-outcome snapshots. Reproduce each with failing tests,
fix, then run the complete suite/build and affected isolated browser checks.
Do not dispatch another reviewer or repeat completed baseline work. Save/push
bounded verified milestones to the existing draft PR #10, targeting `main`.

## Required save point — capacity trigger, PR #10

**2026-10-26 19:06 Asia/Bangkok:** five-hour **7% remaining**, reset tonight
**23:06:56**; weekly **85% remaining**, reset **November 2 at 18:06:56**.
The repository's below-10% rule requires a checkpoint assessment. Do not start
substantial new repairs without capacity to verify and save them. No credits,
reset credits or billing were changed.

Task remains **incomplete**. Code through **`f453e6f`** is implemented on
`codex/life-simulation-spec`; existing PR #10 targets `main` and must stay draft.
Fresh final `npm test` passed **171/171 across 30 files** with expanded creation
enabled. TypeScript/Vite build passed after the default switch (nonblocking chunk
warning). Legacy 21,168 full-state hashes remain unchanged. Additional product,
design/sidecar/setup and verification-report documentation is saved with this
checkpoint; its commit follows the code commit.

The sole fresh whole-branch reviewer (`final_review`, reviewing
`9d19b9a..f453e6f`) identified a required family-capacity repair: named people
are never compacted; the retained-person gate disables new NPC partnerships at
44 people, and cohort admission silently refuses births at 256 records. Do not
claim this is implemented compaction or mark the PR ready on the strength of the
green suite. The reviewer was asked to finalize all collected findings when the
7% trigger was observed. Consolidated findings will be appended to the plan's
existing ledger when available. No repair pass has started.

Exact next step after capacity is available: recheck usage/status, fetch origin,
read this checkpoint and the plan's review findings, then perform the **one
RED→GREEN repair pass** required by executing-plans. Start with a failing test
that fills retained distant relatives and demonstrates that living/direct family
counts, inheritance and later-family formation survive actual compaction. Fix
other Important/Critical findings from that same review, run the affected checks
and complete `npm test`/`npm run build`, repeat only affected isolated QA, update
the same draft PR and checkpoint. Do not regenerate legacy baseline expectations,
repeat the completed interview, or request implementation approval again.

QA cleanup completed: owned port-5180 Vite process stopped, owned IAB tab closed,
temporary viewport reset. Screenshot outside Git:
`C:/Users/Neary/.codex/visualizations/2026/10/26/01a177e4-3d14-7050-9342-aaa2304e4fe6/expanded-chronicle-mobile.png`.
Ignored local fixture page remains under `six-faced-life/public/screenshots/`;
it is QA-only and not staged. Player 5173 and production saves were untouched.

## Active execution — PR #10 (2026-10-26)

**Latest checkpoint around 19:00 Asia/Bangkok:** domain and bilingual UI are now
implemented; expanded births are enabled by default. Legacy tests explicitly
request legacy rules, and all 21,168 pre-change state hashes remain identical.
Full suite **169/169 passed** before the switch; default/Thai/legacy targeted
checks **13/13 passed** afterward. Final full suite, independent whole-branch
review and final delivery remain pending. Earlier in-progress details below
record the work chronologically, not the latest release state.

Full-engine calibrated Superd cohort: 10,000 births from 2,207,675 uniformly
spaced uint32 seed attempts; 8,972 deaths before 15, protected cohort 7,302.
Persecution coefficient now 0.155. Hazard-only cohort: 9,149/6,893; matched
other-race hazards 1,478 poor versus 435 comfortable per 10,000. Long tests now
yield to avoid Vitest RPC timeout; genetics keeps all 300,000 samples with
aggregated invariant checks. Initial worker timeout and one shared-CPU 5-second
genetics timeout were diagnosed, fixed and followed by the clean full run.

New large-save lossless dictionary encoding reduces the 20-full-chronicle fixture
from 7,644,765 to 1,140,474 stored characters without losing fields/prose or
evicting archive entries. Unknown/corrupt encoding recovers without writes.
Default new-life UI, desktop/mobile/Thai flows, faction refusal/watch boundary,
scholarship and immediate study/reload have browser evidence on isolated 5180.
Player port 5173 and production were untouched. QA server/session cleanup and
review remain before handoff. The user approved updating Impeccable; its updater
reported five skills updated to v4.7.0 outside the repository.

The user approved the concrete plan with **"let implement it"**. Continue native
execution of the existing plan on `codex/life-simulation-spec`; no further plan
or spec approval is pending. The older planning gate below is historical.

Verified foundation: baseline `238c3e4` captured before code edits as 21,168
full-state SHA256 action checkpoints across 200 EN/TH lives. Legacy extraction
commit `6bb5345`; expanded origin/schema foundation `da70c70`. Existing saves
remain legacy; unknown rules recover without overwriting storage. The default
new-life route is still legacy until final release checks pass.

Domain work added after that foundation: independent expanded transaction/queue,
household economy and cause-specific mortality, talents/education funding,
per-career experience and access, fixed/local historical exposure and seeded
conflicts, optional factions and title boundaries, individual family/genetics,
and bilingual immutable death snapshots. These are **in progress**, not a claim
of complete spec acceptance. Full suite **138/138 passed** and TypeScript/Vite
build passed on October 26 around **18:30 Asia/Bangkok**; Vite reports its existing
nonblocking chunk-size warning. Hazard-only cohorts measured 88.38% Superd death
before 15 (10,000 births), 63.83% with care/protection; matched other races 14.78%
poor versus 4.35% comfortable. These are not yet full-engine/policy benchmarks.

Next: integrate actual expanded components/playback and EN/TH entry translation,
then exercise full engine/restore/bounds, run actual population cohorts and QA,
review the whole branch, and enable the expanded default only after acceptance.
Record remaining limits/decisions in the plan's existing ledger. No production
deployment, user browser save operation or merge is authorized.

Session start was clean at `6930486`; fetch succeeded with escalation. Last
usage at **18:22 Asia/Bangkok**: five-hour **85%**, weekly **98%** remaining,
resets October 26 **23:06:56** / November 2 **18:06:56** respectively. No low-usage
trigger. Same PR #10 remains draft until implementation/verification completes.

## Current implementation request — PR #10

Updated **2026-10-26, Asia/Bangkok**. The user asked to implement
[PR #10](https://github.com/ny147/1-in-mushoku-tensei/pull/10) and push to the same
PR. This approves its concrete specification as the implementation baseline and
supersedes the older planning-only restriction below. Do not repeat the design
interview or ask for spec approval again.

Existing branch **`codex/life-simulation-spec`** is the open draft PR's head;
base is `main`. Start-of-session status was clean at `238c3e4`. Fetch/prune
succeeded with sandbox escalation after the ordinary sandbox denied FETCH_HEAD
writes. The branch contains current `origin/main` at `9d19b9a`; no upstream
integration, worktree, new branch, deployment or player-storage operation occurred.
GitHub CLI is absent; authenticated GitHub REST through the existing credential
helper confirmed the PR's state/head/base without displaying credentials.

Completed this session: read spec and affected engine/types/storage/progression,
playback/translation integration and product/design context; wrote and
self-reviewed the twelve-task
[implementation plan](docs/superpowers/plans/2026-10-25-life-simulation-expansion.md).
It pins interfaces, initial balance, seeded cohorts, compatibility fixtures,
validation/queue boundaries, family compaction, immutable summaries, bilingual UI
and final release checks. Spec/README now record the implementation request.
**No application implementation has started.**

**Pending gate:** the installed `superpowers:writing-plans` skill requires review
of the completed plan and execution-method selection before implementation.
Recommend native execution because tasks share the schema and routing contracts.
This gate comes from the skill, not AGENTS.md, Git permissions, or absent approval
to push. The user already authorizes same-PR commit/push delivery.

Verification for this documentation follow-up: **37 local Markdown links**
resolve; tracked diff and new plan were reviewed; `git diff --check` passes.
Application tests/build/browser checks are unnecessary and were not run. Do not
reuse historical test counts as verification of the unimplemented expansion.

Delivery: plan/spec/checkpoint committed as **`881420d`** and pushed to
`origin codex/life-simulation-spec` with its own upstream. Existing draft PR #10
was updated in place and still explicitly targets `main`; its description
accurately states that code implementation awaits plan review. A documentation
follow-up records this delivery. Final fetch/freshness is checked before handoff.

Usage observed at session start on **2026-10-26**: five-hour **100% remaining**,
resets **October 26 at 23:06:56**; weekly **100% remaining**, resets
**November 2 at 18:06:56**, all Asia/Bangkok. At **18:11** the subsequent reading
was five-hour **96%**, weekly **99%** remaining with the same resets.
No low-usage trigger or billing/reset
action. Account identifiers and reset-credit details are intentionally omitted.

Exact next step: user reviews the linked plan and chooses native or delegated
execution. Then recheck usage/status, fetch origin, read this plan/spec, and start
Task 1 by capturing legacy fixtures from baseline `238c3e4` before changing code.
Continue the same branch/PR; preserve the player's 5173 save. Commit/push bounded
verified task steps and update this checkpoint/plan ledger. Expanded creation
stays disabled until all acceptance checks pass. The user merges manually.

## Current design save point — unequal lives and historical events

**Historical:** the implementation request above supersedes this section's
pending spec approval and planning-only restriction.

Updated 2026-10-25 **21:33 Asia/Bangkok**. Active task: create a specification and
implementation plan for the user's game-design expansion, using their explicitly
invoked `grill-me` and `i-have-adhd` skills. ADHD output rules remain active until
the user disables them. Ask one design question at a time with a recommendation;
inspect the project before asking questions the code already answers.

Branch **`codex/life-simulation-spec`** was created from clean, freshly fetched
`origin/main` at **`9d19b9a`** (PR #8 is now merged). The branch initially required
sandbox escalation to write Git metadata. No user work was discarded or stashed.
The previous calmer-decision checkpoint below is historical.

Written: [draft specification](docs/superpowers/specs/2026-10-25-life-simulation-expansion-design.md).
It records every confirmed interview decision, proposed detailed rules and
balance, compatibility boundaries, verification, sources and five implementation
phases. A fresh read-only builder review found **"nothing important left"** for
planning. This does not approve the spec or verify nonexistent implementation.

Confirmed: shared calendar and fixed major outcomes; uniformly random births
from 20 years before the Mana Calamity through 10 years afterward; original
regional conflicts; Superd as the only new race; Superd mortality target 90%
before age 15 under typical conditions, with meaningful mitigation; special-talent
scholarships; separate status/job/title tracks; Seven Great Powers positions
5–7 only; optional faction offers; latent inherited Laplace Factor discovered
during life; inheritance within each life, separate reincarnation next run;
simultaneous adult marriages where customs permit; independently developing
descendants; new rules only for new lives; and a separate versioned simulation
that preserves legacy rules.

**Pending:** user approval of the concrete spec, then the detailed implementation
plan at `docs/superpowers/plans/2026-10-25-life-simulation-expansion.md`. No plan
file exists yet. The brainstorming workflow requires spec approval before the
writing-plans stage. Proposed percentages, limits, chronology mapping and other
builder calls are explicitly distinguished from confirmed interview choices.
The user requested planning only: do not implement game code or deploy.

Source boundary: official Seven Seas volume 3/17 descriptions corroborate story
arcs. Exact K-year anchors and factor manifestations use an identified secondary
wiki/search-index reference; direct wiki retrieval returned HTTP 402. No complete
primary-text chronology/genetics audit is claimed. All demographic, mortality,
genetic and economic numbers are authored game balance or user decisions.

Documentation checks passed: 33 local Markdown links across the three task
files, no trailing whitespace, referenced npm test/build scripts, complete task
diff review (including the new spec), and `git diff --check`. A final fetch/prune
initially hit sandbox FETCH_HEAD permissions, then succeeded with escalation;
the branch contains current `origin/main` at `9d19b9a`. Final fetch/prune after PR
creation also succeeded with the same upstream base.
Application tests/build/browser QA are unnecessary and have not been run for
this task. Specification/README/checkpoint committed as **`eff5cd3`** and pushed
with its own upstream. [Draft PR #10](https://github.com/ny147/1-in-mushoku-tensei/pull/10)
explicitly targets `main` and is attached to this chat. A documentation-only
follow-up records delivery. The draft is intentional: spec approval and the
detailed plan remain pending. No remote CI pass is claimed.

GitHub CLI is absent; the existing Git credential helper authenticated GitHub
REST under sandbox escalation without displaying credentials. The initial PR
attempt was skipped because PowerShell wrapped an empty API list as one item.
Read-only inspection confirmed no PR existed; using the direct response fixed
the delivery script, and GitHub confirmed exactly this draft PR. No app code
was involved. The spec was requested in the Codex panel; opening was queued.

Usage observed **2026-10-25 21:33:00 Asia/Bangkok**: five-hour **57% remaining**,
resets **October 26 at 00:41:09**; weekly **79% remaining**, resets **November 1 at
13:17:43**. No below-10% trigger; no billing or reset-credit action.

Exact next step: **user reviews and approves the linked spec**, starting with
its four proposed-detail review items. After approval, recheck status/usage and
fetch, continue this branch, write/self-review the detailed plan, and update
PR #10. Do not repeat the completed interview or start game implementation.
The user merges manually; do not merge, enable auto-merge, delete the branch,
or deploy the game.

Updated 2026-10-25 (Asia/Bangkok). Active task: calmer decision pacing on `codex/calmer-decisions`, based on freshly fetched `origin/main` at `cc8322e` (Thai PR #7 is now merged). Earlier checkpoints below are historical; the Thai integration blocker is resolved upstream.

## Current calmer-decision save point

The user approved keeping major milestones, reducing random-event probability from 68% to 25% in an eligible year, and at least three years between random decisions. They explicitly requested implementation without further planning questions. Implementation and delivery are complete. There is no new multi-step plan or outstanding design approval.

Implemented in `six-faced-life/src/game/engine.ts`: derive random spacing from existing `life.seen` ages; ignore first-memory, fixed milestones and unknown event IDs for this gap. Major milestones keep their exact dates and neither obey nor reset random spacing. Quiet years retain normal progression and chronicle entries. No save-schema, translation, event/choice ID, pending-choice, history, archive or rendering changes; saved RNG is retained, while future events follow the newly approved balance.

Verification: new regressions failed under old behavior (a random decision at age 26 after one at 25; 71 of 100 eligible-year seeds triggered). After implementation, all **104 tests across eleven files passed** with `npm test`; **npm run build passed** TypeScript/Vite. Vite reports its nonblocking >500 kB chunk warning (JS 500.08 kB / 152.09 kB gzip). Seeded tests cover two quiet intervening years, restored state, normal quiet-year history, milestone priority, and sparse-but-reachable events at the three-year boundary. Existing 100-lifetime, pending/future-equality, progression and storage tests pass. Fresh independent code review found no Critical/Important/Minor issue; reviewer inspected engine/event/save context without rerunning executor checks.

Isolated browser QA on port 5178: resumed the pre-existing QA life at its pending memory, chose normally, advanced two quiet years with chronicle/stat changes, then Next decision stopped at the age-three reading milestone. Reload preserved the exact pending milestone and paused controls; captured console warnings/errors were empty. No UI changes require new layout checks. Player port 5173 and its storage were untouched. QA tab closed and owned Vite server stopped. Proof screenshot outside Git: `C:/Users/Neary/.codex/visualizations/2026/10/25/01a17157-5909-7d52-ba89-f044fa8b0d47/calmer-decisions-preview.png`.

Usage observation 2026-10-25 14:45:49 Asia/Bangkok: five-hour **9% remaining**, resets October 25 at 18:17:43; weekly **86% remaining**, resets November 1 at 13:17:43. Below-10% checkpoint trigger reached after required checks completed. Finish only the bounded delivery step, then reassess before new work. No billing/reset credits changed.

Delivery: implementation and verification checkpoint committed as **`a1dbbe6`**, pushed with its own upstream on `codex/calmer-decisions`. [PR #8](https://github.com/ny147/1-in-mushoku-tensei/pull/8) targets `main`, is ready for review and attached to this chat. A documentation-only follow-up records this delivery. Full task diff and `git diff --check` reviewed; final fetch/prune succeeded and the branch contains latest `origin/main` at `cc8322e`. No remote CI pass is claimed. Exact next step: user reviews and manually merges PR #8; before new work, recheck usage, status and fetch. No deployment is authorized or performed for this task.

## Previous Thai-language implementation save point (merged PR #7)

**Implementation complete; integration blocked.** The user approved full Thai coverage with language chosen only for new lives, the design/plan, native execution, and persistent save points. Use the existing [design](docs/superpowers/specs/2026-10-25-thai-language-design.md), [completed plan/ledger](docs/superpowers/plans/2026-10-25-thai-language.md), branch `codex/thai-language` and [draft PR #7](https://github.com/ny147/1-in-mushoku-tensei/pull/7), targeting `main`. Do not repeat approval questions, completed work, or create another PR.

Implemented: fixed English/Thai per new life, immediate form preview, remembered next-life preference separated from save recovery, legacy-English compatibility, full 55-event/choice and 30-spell/domain/UI/help/accessibility translations, bounded narrative snapshots, actual translated outcomes, mixed-language archives, and licensed self-hosted Thai typography. Existing personal names, pending decisions, seeds/rules and browser saves are preserved. No dependency or deployment configuration changed.

Verified milestones: persistence `cc2079f`, catalogues `9f546c8`, narrative `4f6c808`, interface `c42bc44`, fonts/docs/pre-review checkpoint `77a806c`, final review fixes **`9d86fd9`**. A final documentation-only checkpoint follows that code commit. The branch is pushed with its own upstream; only task-owned files were staged.

Fresh final verification on 2026-10-25: full **npm test passed 101/101 across eleven files** after the review's behavioral/CSS fixes. A TypeScript-only regression-fixture typing correction followed; the unchanged twelve narrative test cases passed again, and **npm run build passed TypeScript/Vite**. Final JS 499.94 kB / 152.05 kB gzip; CSS 52.40 kB / 11.04 kB gzip. Local documentation links, structured design JSON, pinned font hashes and git diff --check were verified. The 25-lifetime test alone has a bounded 30s timeout after exceeding 5s under parallel CPU load; all seeds/assertions remain. No lint/e2e or remote-CI pass is claimed.

Fresh whole-branch review of `01acad7..77a806c` found no Critical/Important issues and two Minor issues. Both were reproduced and fixed: incomplete birth parameters now fall back to canonical saved text, with missing/number/empty-background regressions; Thai excerpts inside an English archive now use LifeThaiSans, confirmed by browser computed font before/after. The reviewer did not independently inspect platform rendering; the following executor browser QA covers the actual inspected views.

Isolated port 5178 browser QA: desktop 1280px and phones 390px/320px, Thai new-life form/birth/choices, pending restore paused, real outcome/focus/reload, immediate study/reload with old-school history retained, spellbook, mobile world/help/menu Escape and keyboard Space playback. A Thai test life finished at 72 with one h1 and zero unwritten timeline labels. It reopened in Thai over an English active life, returned to English, and an English life stayed English after canceling Thai setup. Both Thai fonts available, locally tagged mixed-archive text uses the bundled face, no inspected horizontal overflow or captured app warnings/errors. Storage failure/retry covered in automated tests; no browser fault injection or exhaustive cross-browser audit claimed. Temporary viewport reset, QA tab closed, only our Vite server stopped. Player browser storage was never opened/cleared. An npm argument issue briefly started our own server on 5173 before it was stopped without browser navigation; all QA used 5178. Original hosting metadata is untouched. Screenshot is outside Git at `C:/Users/Neary/.codex/visualizations/2026/10/25/01a17157-5909-7d52-ba89-f044fa8b0d47/thai-language-preview.png`.

**Exact integration blocker:** final fetch/prune succeeded; `origin/main` is `ae9a2d1`, three upstream commits beyond the task's base `01acad7`. GitHub reports mergeable=false/dirty and no current head check runs. Non-mutating `git merge-tree --write-tree --name-only origin/main HEAD` identifies **only CONTINUE.md** as conflicted; README/PRODUCT merge automatically. Per AGENTS.md, do not automatically merge/rebase/synchronize upstream. Keep PR #7 draft. The user handles integration and merges manually; no auto-merge, deletion, or deployment.

**Exact next step:** user-authorized integration must reconcile CONTINUE.md while preserving both the production-deployment evidence on main and this completed-feature checkpoint. Rerun required checks and update the same PR after integration; only then assess readiness. No feature code remains pending, and no new design/plan approval is needed. Resume by checking usage/status and fetching origin; do not redo Tasks1–6.

Usage observed 2026-10-25 **13:59:49 Asia/Bangkok**: five-hour **21% remaining**, resets October 25 **18:17:43**; weekly **88% remaining**, resets November 1 **13:17:43**. Earlier below-10% checkpoint is historical; resumption rechecked reset windows. No credits or billing changed.
Updated 2026-10-25 (Asia/Bangkok). Vercel migration PR #5 is merged and the game is deployed at https://six-faced-life.vercel.app. Start with the production checkpoint below; earlier task checkpoints are historical.

## Current production deployment checkpoint

Live game: [six-faced-life.vercel.app](https://six-faced-life.vercel.app). Project: [ny147s-projects / six-faced-life](https://vercel.com/ny147s-projects/six-faced-life). Verified source: merged `main` commit `01acad7664173ee99e012a8c0f3bf8b3a91a2907` from manually merged PR #5. [Main GitHub CI](https://github.com/ny147/1-in-mushoku-tensei/actions/runs/40160749076) passed for this commit.

The user installed/connected the Vercel plugin, merged PR #5, and approved workspace access. The plugin still returned HTTP 403 for the `ny147s-projects` workspace after approval. The already authenticated browser provided the correct workspace and Git connection, so deployment was completed through Vercel's UI. Do not create a duplicate project, request API tokens, change accounts, or weaken protection to work around the plugin grant. If future MCP operations are needed, resolve that workspace grant separately; the live site does not depend on the plugin connection.

Project created with Root Directory `six-faced-life`, Vite preset, `npm ci`, `npm run build:vercel`, output `dist`, connected Git repository `ny147/1-in-mushoku-tensei`, and production source `main`. The first import used Vercel's default Node 24; Node was then set to 22.x to match the documented setup and the same source was rebuilt with the latest project settings and no build cache. Final production deployment [FRegNWsarqHf5qA7fVifWYgXtd5N](https://vercel.com/ny147s-projects/six-faced-life/FRegNWsarqHf5qA7fVifWYgXtd5N) is **Ready**, completed at 2026-10-25 11:21:09 Asia/Bangkok in 34 seconds. Its logs show **51/51 tests passed across seven files**, followed by successful TypeScript/Vite build and deployment. No hosting tokens, application environment variables, paid upgrades, custom domains, or additional services were configured.

Hosted verification: public stable URL returned HTTP 200 with the real app HTML; favicon, compiled JS/CSS, original WebP and two representative self-hosted TTF fonts returned HTTP 200 and their correct file types. Direct `/chronicle/deployment-check` navigation returned the SPA. The stable browser opening screen loaded its artwork without horizontal overflow or captured warnings/errors. A separate deployment hostname was used for destructive QA: fresh test life, birth record, pending decision restored after reload while paused, actual memory choice, recorded outcome restored after reload, and direct `/chronicle/hosted-check` navigation all passed with no captured warnings/errors. Stable production storage and the local player's port 5173 saves were untouched. No exhaustive mobile/assistive-technology audit, runtime-log scan through MCP, rollback, or artificial push-to-main test was performed.

Operational next step: play on the stable production hostname so browser-local progress stays on one origin. The Vercel Git connection is active; future reviewed merges to main use the repository's test-gated build, while automatic task-branch deployments remain disabled by the app config. The browser QA tab is closed and the stable production tab is left open. [Deployment guide](docs/deployment.md) contains the current hosting and rollback instructions.

Documentation delivery: branch `codex/vercel-live-checkpoint`, created clean from fetched `origin/main` at `01acad7`, records this deployment evidence only. No application or deployment configuration changed in this follow-up. Documentation checks passed: 38 local links across six files, referenced settings/source/deployment evidence and `git diff --check`. Application tests were not rerun locally for these prose-only edits; the deployed source's 51-test build and main CI evidence are recorded above. Usage observed 2026-10-25 11:24 Asia/Bangkok (04:24 UTC): five-hour 30% remaining (resets October 25 at 14:52:47), weekly 45% remaining (resets October 31 at 10:39:46), all reset times Asia/Bangkok. No low-capacity trigger. Deployment documentation committed as `8b784f8` and pushed with its own upstream; [documentation-only PR #6](https://github.com/ny147/1-in-mushoku-tensei/pull/6) targets `main` and is attached to the chat. [Linux CI run 40161797526](https://github.com/ny147/1-in-mushoku-tensei/actions/runs/40161797526) passed for that commit. A documentation-only follow-up records this delivery. Final fetch/prune succeeded and the branch contains current `origin/main` at `01acad7`. The user merges documentation PR #6 manually; do not merge, enable auto-merge, delete the branch, or reuse already merged PR #5 for new changes.

## Previous Vercel migration checkpoint (historical; PR #5 is merged)

**The import/hosted checks described as pending in this section are now completed above.** The following records the source migration and its earlier evidence.

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

- On 2026-10-25, the user connected Vercel, manually merged PR #5, and approved continuing deployment. The production site is now live; the browser UI completed setup because the plugin's workspace API grant still returned 403.

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

Start with the current production checkpoint, then inspect Git as required by `AGENTS.md`. The game is live at https://six-faced-life.vercel.app; do not import or create another Vercel project. PRs #4 and #5 are merged. Resume an interrupted documentation delivery on `codex/vercel-live-checkpoint`, preserving its changes; new code work gets its own clean task branch from freshly fetched main. The user merges manually. Vercel's Git connection deploys the tested app on main. The plugin's workspace API grant remains separate from browser deployment access. Keep player saves on their original profile/origin: stable production and local 5173 have separate data.

# Asura succession crisis — Stage 2 implementation plan

> **For agentic workers:** After approval, use superpowers:executing-plans or superpowers:subagent-driven-development. Track implementation using the unchecked tasks below.

**Goal:** Give an Asuran succession pledge consequences the player can live through, from a household choosing shelter to a royal claimant governing after victory.

**Architecture:** The expanded simulation owns the historical result, the protagonist's participation, and any continuing sentence, exile or reign. The chronicle displays the same quotes the engine resolves. Keep the existing succession handler for compatibility lives.

**Tech stack:** TypeScript, React, Vite, Vitest, React Testing Library and browser localStorage.

**Spec:** [Standing consequences, Stage 2](../specs/2026-11-13-standing-consequences-design.md#stage-2-asura-succession-defeat-captivity-and-permanent-exile). [Stage 1 delivery and stage boundaries](2026-11-13-standing-foundations.md#delivery-sequence-and-scope).

**Status:** Proposed for review against merged main at `ff0ad57`. All implementation tasks are pending.

## What the player experiences

| At the crisis | Decision in K424 | Consequence in K425 |
| --- | --- | --- |
| Adult noble living in Asura, including an earned noble | Support Ariel, support the opposition, or leave Asura forever | A loyal winner receives recognition, silver and access to court. A loser chooses surrender, escape or resistance. |
| Adult Asura dynasty member living there | Same choices, plus explicitly standing as the opposition claimant | Opposition victory crowns the surviving, committed claimant. Supporting another candidate leaves that candidate on the throne. |
| Local noble or royal child | Seek protection or flee with available help | Household allegiance and danger matter. A child gains neither a military record nor an adult reward. |
| Commoner, distant resident or late arrival | Hear the news | Learn who rules. No personal oath, punishment or backdated reward. |

**Already confirmed.** Adult allegiance starts at 18. Ariel wins 80% and the opposition wins 20%. There is one world result. Permanent exile has no pardon. Surrender guarantees imprisonment, escape can lead to capture, and resistance can kill. A crowned claimant continues the same life with royal income and governing decisions. House sponsorship and royal marriage belong to Stage 3.

**Review first.** The eligibility cutoff, child protection, prices, probabilities for personal survival, sentence, court duties, and governance rules below are proposed game balance. For example, a 17-year-old who takes shelter in K424 and turns 18 in K425 remains part of the household outcome. A penniless defeated supporter can always surrender or attempt an unassisted escape.

## Global constraints

- Keep seeded domain logic in the game engine. Rendering, translation, inspecting choices and reloading must consume zero draws. Keep faction membership, Seven Great Powers rank, legal standing, ancestry and office independent.
- Preserve stable old IDs, pending decisions, queued choices, progress, random streams and archives. Keep queue length within the existing limit of 16. Every binding personal choice is manual in Watch mode and immediately saved.
- Use English and Thai for quotes, disabled reasons, history and outcomes. Keep the existing chronicle, keyboard focus, narrow-screen reading order and reduced-motion behavior. Keep authored alternate history identifiable in World and the archive.
- Use the existing annual budget, study reserves and parental-debt ledger. Quote deductions from the actual available purse. Record affected people, amounts and years. Stage 2 requires no new dependency or service.

## Review focus

| Failure to catch | Owning task |
| --- | --- |
| An old pending accession changes winner on reload, or a later-born life receives a reward | 1–2 |
| Turning 18, earning a title or arriving after the oath reopens it | 2 |
| A full queue loses a survival decision or an old invitation bypasses exile | 2–4 |
| Captivity pauses annual wages but tick playback still grants mentorship, or debts spend reserved money | 4 |
| An ended reign still earns a salary, sends duties to itself or archives Ariel as the winner | 5–7 |

## Implementation sequence

Paths below are relative to `six-faced-life/src/` unless indicated. Run focused commands from `six-faced-life/`. Each task starts with its failing regression, ends with the same focused suite green and a task-owned commit. The full feature ships together after Task 7.

### 1. Establish one world result and a safe save boundary

**Files and interface.** Add `game/expanded/succession-state.ts` and `succession-validation.ts` beside it. Wire them into `game/expanded/types.ts`, `origins.ts`, `validation.ts` and `engine.ts`. Expose `successionWinner(worldSeed: number): "ariel" | "opposition"`. Initialize versioned, optional `expansion.succession` with the stored winner, unrevealed until K425. Track participation, decision due, frozen quote, reward receipt, restriction, crown relationship and tenure as explicit states. Keep historic facts after a restriction or office ends.

- [ ] Add `game/expanded/succession-state.test.ts`. Pin the roll boundary at 0.80, both winners from fixed seeds and a broad 18–22% opposition band over 10,000 world seeds. Changing personal RNG, family RNG or allegiance must leave the winner unchanged. Use a private stream initialized from `worldSeed` XOR a fixed feature salt.
- [ ] Exercise the real storage decoder with frozen legacy, ended, archived, pre-K424, pending, queued, already-recorded and post-K425 fixtures. For existing active expanded lives, compose after social migration at an unobstructed pre-K424 boundary. Preserve pending unrelated events until drained. If K424 has already begun or old succession exposure exists, retain the old route permanently. Initialize new births explicitly, including births in or after the crisis. Reject inconsistent new-state combinations through existing recoverable load errors.
- [ ] Run `npm test -- src/game/expanded/succession-state.test.ts src/game/storage-codec.test.ts` red, implement state, rerun green. Compare original pending IDs, queue order, RNG values and future choices for compatibility lives. Commit the migration and fixtures together.

### 2. Play K424 through the chronicle and reveal K425 once

**Files and interface.** Add `game/expanded/succession-events.ts`. Integrate `applySuccessionYear(life: ExpandedLife): string[]` with `game/expanded/history.ts`, `engine.ts` and `events.ts`. Keep `expanded.succession` and its historical service context valid on the old route. Register distinct Stage 2 event and choice IDs.

- [ ] Test through public advance/choice calls. Take one snapshot at the first K424 annual history checkpoint after age advances. Check physical region and current noble status or Asura royal ancestry at that instant. An 18th birthday on that step qualifies. A later arrival, grant or birthday cannot reopen the snapshot. For a new K424 birth evaluate the child route after the birth introduction and before time advances. For a K425 birth or later, provide the actual outcome as news only.
- [ ] Offer the adult options in the table. A funded supply contribution of 12 personal silver is an optional addition to a pledge, proposed to earn 8 extra silver on victory and record service even on defeat. Quote it before payment and record at most one contribution. Keep the winner hidden before K425. Reject side-switching and late claims.
- [ ] For a child, assign household alignment once from a distinct seed salt (proposed even split). Offer shelter through a living co-located parent, or public sanctuary if none exists. Staying keeps the child safe from adult penalties. If the household loses, remove local household protection and record the named helpers who lost it. Flight uses Task 4. Move a consenting guardian with the child, or use escorted flight if alone. Keep absent/dead relatives' histories intact.
- [ ] Persist due decisions when another event owns the screen. On drain, give historical decisions their existing priority, then deferred obligations. Test a full queue, age-15 parental debt, save/reload before and after pledge, and both winners. Never overwrite an unresolved choice. At K425 reveal the world result to everyone once, then dispatch the personal outcome only for recorded participants. Death before K425 ends personal eligibility.
- [ ] Run `npm test -- src/game/expanded/succession-events.test.ts src/game/expanded/history.test.ts` against the new regressions before and after implementation. Commit eligibility, scheduling and choice handling.

### 3. Resolve recognition, coronation eligibility and defeat

**Files and interface.** Extend the succession events and state. Add `game/expanded/succession-outcomes.ts` for `quoteDefeat(life: ExpandedLife): DefeatQuote` and one-shot resolution. Use `game/expanded/balance.ts` for proposed constants and `finishExpanded` for a fatal result.

- [ ] Test that a loyal winner receives one 40-silver payment (48 with recorded supply service), recognition and a usable crown relationship. Give royal supporters precedence on their first court petition in Task 5. Only an expressly declared, living, still-committed, non-exiled claimant on the winning opposition side enters office. Give that claimant the recognition payment once and route them to governance in place of vassal duties. No estate or second crown roll.
- [ ] Snapshot three defeat options. Surrender always leads to custody. Escape succeeds on 25%, plus 20 percentage points for choosing to spend 12 silver and 20 for an identified recorded friend (role `friend`, strength at least 50). Quote aided and unaided options separately. Charge the fee once on attempt. Failed escape leads to custody. Resistance succeeds at 20% plus half the higher current sword or mana stat in percentage points, rounded down, capped at 65%. Success gets the survivor out under permanent exile. Failure ends the life immediately. Disclose both outcomes.
- [ ] Persist the quote, source friend ID, prices and a single concealed personal roll when the decision opens. Inspection and reload preserve all values. Applying a stale choice, double-clicking or reloading the outcome cannot charge, award, crown or resolve twice. Verify the costs and disabled choices with zero silver and no allies.
- [ ] Run `npm test -- src/game/expanded/succession-outcomes.test.ts` red then green, including ordinary opposition supporter versus actual claimant and poor versus trained/connected losers. Commit quotes and outcomes.

### 4. Make captivity, release and permanent exile effective everywhere

**Files and interface.** Add `game/expanded/succession-restrictions.ts` with `canRelocate(life: ExpandedLife, destination: RegionId): boolean` and custody checks shared by choice generation, choice execution, annual progression and partial-year ticks. Integrate `engine.ts`, `events.ts`, `history.ts`, `education.ts`, `activities.ts`, `economy.ts`, and affected training, career and debt hooks in the same directory.

- [ ] On capture confiscate half the remaining personal purse, rounded down. Serve two complete annual intervals with the release year visible. Entering in K425 suppresses earnings for the K426 and K427 annual settlements, then releases once after K427 settlement. Supply personal necessities in custody. Charge actual dependant costs, pause tuition and both debts, preserve balances, skills, study reserves, service credit and course progress. Record any unmet dependant costs. Continue age, health, family aging and unrelated world history.
- [ ] Suspend work and hazard exposure from work, assignments, focus gains, courtship, travel, training, school and mentorship while held, including tick-based credit and stale pending/queued invitations. Defer playable obligations whose eligibility survives release. At release recompute availability and restart eligible commitments prospectively. Test manual year, advance-to-decision, fractional ticks and release-year reload.
- [ ] Before voluntary political flight show the destination (proposed Ranoa, evacuation fare covered), loss of half the purse rounded down, loss of Asuran protection/title privileges and any actual local housing security. Preserve ancestry, debts, foreign connections and recorded achievements. Apply flight losses once to voluntary or successful defeat flight. A bound supporter attempting to leave before resolution must confirm withdrawal on those terms or stay pledged. Ordinary earlier travel remains ordinary.
- [ ] Snapshot who actually leaves. Proposed adult flight takes co-located dependent minor children, with other adults remaining at their recorded homes. For guardian flight apply Task 2's named guardian rule. Exile binds only this protagonist for life. Exercise every expanded region write, direct choice execution, loaded stale travel, school placement, offers and family moves. Refusal must leave coins, location and progress intact. Show the reason even on a stale offer and provide a way to dismiss it.
- [ ] Run `npm test -- src/game/expanded/succession-restrictions.test.ts src/game/expanded/debt-budget.test.ts src/game/expanded/sword-integration.test.ts` red then green. Include no-money evacuation, death in custody, family separation and a return attempt years after a change of ruler. Commit restrictions and economic integration.

### 5. Give recognized supporters a court relationship they can use

**Files and interface.** Add `game/expanded/crown-service.ts` and its tests. Register petitions and requests in `activities.ts` and `events.ts`. Persist one open request with benefit, due year, alternatives, resolution and deliberate refusal count. Apply eligibility to optional access as well as presentation.

- [ ] Propose a petition for 12 silver of household relief once per three years of active recognition. Ordinary winners can petition the following year, royal supporters immediately. A crown request every third anniversary asks for 12 silver or one year of local administrative service. Service requires availability and a full eligible year. It earns no extra wage or second service credit. Defer to the next eligible year during custody, illness, conflicting service or approved full-time study. An unfunded player can negotiate a one-year extension or take service. Show the deadline before commitment.
- [ ] First explicit refusal warns. Second suspends petition access. The third opens a manual final choice between negotiated service to restore standing and relinquishing the title. Completing service clears strikes and restores access. Hardship, deferral and inability never count as refusal. Remove actual title privileges on relinquishment, retain ancestry and Powers rank, and test earned/born noble parity. Appointment qualifications and unrelated allegiances continue to apply.
- [ ] Run `npm test -- src/game/expanded/crown-service.test.ts` red then green. Include a penniless winner with active creditor service, a suspended petitioner, a ruler receiving no vassal request, and replay of a paid petition. Commit court access and consequences.

### 6. Continue the claimant's life as ruler

**Files and interface.** Add `game/expanded/governance.ts` and tests. Wire accession and office closure into `engine.ts`, `careers.ts`, `economy.ts`, `debt-budget.ts` and `summary.ts`. Store accession/end year, end reason, treasury, stability and the next governing decision.

- [ ] At coronation replace primary wages with 60 personal silver per full governing year starting the following year. Retain qualifications. Disclose the transition at declaration and coronation. Pause incompatible courses/mentorship with credit retained. End incompatible creditor service on the existing early-exit terms, preserving paid credit and unpaid balance. Apply ordinary affordable repayments to the new salary. Suppress concurrent job/service progress and self-petitions.
- [ ] Proposed treasury opens at 30, gains 10 per full year, caps at 60. Stability starts at 2 on a 0–4 scale. Every second anniversary alternate relief and court disputes. Relief costs 15 public silver for +1 stability, or conserve funds for −1. Mediation costs 5 public silver for +1, or impose an unpopular settlement for −1. Disable unaffordable spending and always offer the free choice. Surface budget and stability previews with their actual limits.
- [ ] At zero stability, queue one disclosed office crisis. Abdicate safely, losing office, salary and authority, or attempt reconciliation for 15 treasury silver if available and restore stability to 1. After abdication resume normal livelihood through eligible work choices. On death archive tenure and end the same protagonist's life. Neither exit changes the original K425 winner. Separate accession history from current officeholder and leave any unnamed successor unnamed.
- [ ] Run `npm test -- src/game/expanded/governance.test.ts src/game/expanded/summary.test.ts` red then green. Trace a seeded claimant through accession, one payroll, both governance choices, office loss and ordinary aging. Assert treasury/purse separation, no double salary or debt spending, and an accurate archive after death in or out of office. Commit governance.

### 7. Verify the player-facing story and deliver the feature for review

**Files.** Add `i18n/succession.ts`. Integrate actual decision quotes into `i18n/expanded.ts`, `expanded-choice-effects.ts`, `current-decision.ts` and `world.ts` in that directory. Surface lasting consequences in `components/StandingDetails.tsx`, `WorldView.tsx` and `Retrospective.tsx` in the components directory. Exercise the public interface in `App.test.tsx` and `language.test.tsx`.

- [ ] Add failing English/Thai rendering and save tests first. Read the same quote in both languages, press a choice by keyboard, reload and compare the actual outcome to the preview. Exercise all winners, including an unnamed opposition ruler and the player ruler. A pre-resolution guide must keep the winner concealed. Confirm manual Watch pause, hidden-tab behavior, persistence failure/retry and accurate old archives.
- [ ] Run the focused App/language tests, then `npm test` and `npm run build`. Inspect isolated Chromium at port 5174 with desktop and narrow mobile viewports in both languages. Play a household flight, an adult defeat and a claimant reign, including reload on each binding choice. Check focus, horizontal overflow, console errors and that public finances and personal silver remain legible. Leave the player save on port 5173 intact.
- [ ] Update the app README, PRODUCT and repository checkpoint with only verified behavior and actual results. Review the whole feature diff, record seed fixtures and observed failures, fetch and deliver the implementation on its own PR to main for manual merge.

## Review decision

The highest-impact choices to settle before coding are the K424 eligibility cutoff, the two-year custody and confiscation terms, and the cadence of court and ruler decisions. The proposed values make surrender predictable, give poor characters viable choices and keep governing within the ordinary chronicle. Approval of this document can retain or revise any of those values.

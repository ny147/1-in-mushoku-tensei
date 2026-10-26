# Expanded simulation verification

Evidence observed 2026-10-26, Asia/Bangkok, on `codex/life-simulation-spec`, for
[PR #10](https://github.com/ny147/1-in-mushoku-tensei/pull/10). No deployment or
production/player-storage operation is part of this work.

## Compatibility and deterministic state

Before product edits, baseline `238c3e4` produced 21,168 SHA256 hashes of complete
serialized states across 200 EN/TH lives (seeds 0–99, first enabled affordable
risk-free choice, otherwise first affordable enabled choice; advance one year).
These checkpoints include birth, pending decisions, every action, endings and
random state. All hashes remain equal after extraction/routing. Existing
progression, storage and playback tests also remain active. Legacy tests now
request `legacy-1` explicitly; their expected state hashes were not regenerated.

Expanded checks cover 10,000 seeded origins, 500 complete lives validated after
every action, and uninterrupted versus restored pending-decision futures.
Targeted cases cover same-year queues, fatal consequences, child/adult gates,
unknown rules/encodings, malformed ancestry, duplicated people, contradictory
summaries, invalid RNG/phase/queue relationships, funding/probation/graduation,
each occupation's actual pay, retained experience, promotion/dismissal,
faction refusal/acceptance/defection, title exclusions, inheritance and cohorts.

## Frozen cohorts and final authored balance

Full-engine policy: balanced yearly focus; first enabled free choice without a
danger marker, excluding allegiance acceptance. Superd births are selected by
rejection from uniformly spaced uint32 seeds `imul(index, 2654435761) >>> 0`;
selection does not depend on survival. Birth-year and existing personal RNG are
retained. Death age 15 is excluded from childhood mortality.

| Measurement | Births | Deaths before 15 | Fraction |
| --- | ---: | ---: | ---: |
| Full engine, typical Superd | 10,000 | 8,972 | 89.72% |
| Full engine, adequate care + protection | 10,000 | 7,302 | 73.02% |
| Cause-specific hazard harness, typical Superd | 10,000 | 9,149 | 91.49% |
| Hazard harness, adequate care + protection | 10,000 | 6,893 | 68.93% |
| Matched poor, each other race | 10,000 | 1,478 | 14.78% |
| Matched comfortable, each other race | 10,000 | 435 | 4.35% |

2,207,675 candidate seeds yielded the 10,000 Superd births. The full-engine
protection improvement is **16.70 percentage points**. The matched poor hazard
cohorts have over three times comfortable mortality and a 10.43-point gap. Identical
matched resources produce identical hazards across the other races by design;
their generated wealth and origin/access distributions differ.

Hazard order is malnutrition, illness, unsafe work, violence, travel, then aging.
Annual coefficients: food shortfall 0.018, base illness 0.002, care shortfall
0.006, shelter shortfall 0.003, unsafe work 0.003, Superd childhood persecution
**0.155**, travel 0.004. Conflict violence is 0.005/0.02/0.06 by severity.
Protection halves violence, rest multiplies illness by 0.7, low health doubles
illness. Probabilities are bounded, not mortality quotas. No death is preassigned
to meet a running target. The initial 0.135 coefficient was calibrated against
the actual safe-choice policy before the default was enabled.

Basic annual food/shelter/care costs are 8/6/4. Dependants, actual chosen travel,
tuition and work focus are accounted separately. Wealth support/purse/family
funding tables are in `expanded/balance.ts`; education and career requirement
functions are the authoritative sources also consumed by the interface.
These are authored game rules, not statistical/lore claims.

Genetics sampling checks 100,000 draws for each zero-/one-/two-carrier-parent
case (300,000 total), stable latent manifestations, no appearance combat bonus,
adult marriage, mixed ancestry, actual family birthplace and restored cohort
futures. No data is inferred from personal names or appearance alone.

## Storage and performance

One active life plus twenty 600-entry archives was loadable at about 2.15 million
characters. A longer repeated-prose fixture would occupy **7,644,765 characters**;
lossless dictionary encoding stores it in **1,140,474**, with exact equality after
readback, no removed archive entries, and unknown/corrupt-reference recovery.
The raw loader ceiling remains 6,000,000 characters. Encoding is optional for
large mixed/expanded envelopes; small legacy output remains unchanged. Actual
browser quota failures retain the existing visible retry path.

An initial long synchronous acceptance run completed its assertions but hit a
Vitest worker RPC timeout. Periodic test-harness yields resolved that scheduling
failure without changing seeds or sample counts. A separate shared-CPU genetics
test exceeded five seconds because it performed hundreds of thousands of
redundant assertion calls; accumulating invariant failures instead retained every
sample and reduced the focused test to tens of milliseconds. Neither failure was
reported as a clean suite pass.

## Browser evidence

Only isolated `127.0.0.1:5180` was used; the player origin 5173 and hosted saves
were untouched. Prepared scenarios were served from an ignored local QA page,
not a production cheat control.

- Desktop 1280px: English birth/chronicle, calendar, pending choice/focus,
  same-year historical decision and reload paused.
- Phone 390px/320px: Thai Superd origin/warning, translated choices and histories,
  no horizontal overflow; focused decision heading retained.
- Manual faction offer remains visible with Watch active; refusal persists after
  reload. The time guidance correctly asks for a player choice.
- A poor talented pupil receives a free assessment and funded place; scholarship
  survives reload. Changing study to healing persists immediately across reload.
- Thai family disclosure shows spouse, child, marriage interval and living counts,
  using computed `LifeThaiSans, LifeSans, sans-serif`.
- A completed Thai life renders the bilingual snapshot, structured disclosures,
  actual cause and archive-compatible recorded facts.
- Captured warning/error logs were empty in inspected scenarios. These checks
  are not an exhaustive cross-browser or assistive-technology audit.
- The real new-life form created an expanded calendar/origin record; its first
  choice survived reload with time paused. Space toggled playback in both
  directions through the focused page heading.

The installed Impeccable update moved its detector from `detect.mjs` to the
bundled `impeccable.cmd detect` launcher. The mechanical scan ran and reported
inherited stylesheet font/color/type-ramp advisories, plus the new 19px occupation
subhead. That subhead's actual computed LifeSans/19px/700 treatment is now
documented. The scan is not reported as a clean lint pass, and existing unrelated
style warnings were not rewritten or suppressed.

## Final gate

Before the default switch, `npm test` passed 169/169 across 29 files. After the
switch, the complete suite passed **171/171 across 30 files**; default-routing/Thai-new-life/legacy checks also passed 13/13 and
`npm run build` passed TypeScript/Vite. Vite reports its nonblocking >500 kB
bundle warning. The sole independent review identified eight required repairs;
all were reproduced and fixed in one pass. On 2026-10-26 at 19:41 Asia/Bangkok,
the final complete suite passed **185/185 across 32 files** in 67.67 seconds;
TypeScript/Vite build passed. The family tests include 800 years with repeated
restoration, actual named-person compaction, 255 extinct profiles plus a live
cohort, exact aggregate ledgers, bounded binomial draws and mean/variance checks.
Other regressions cover malformed/impossible saves, capped title history,
attainable university study, service revalidation after travel, simultaneous
historical attribution, disaster widowhood and bilingual social/career facts.
After a final boundary regression ensured named relatives also respect the
disclosed million-person projection bound, the suite was rerun: **186/186 across
32 files**, 62.52 seconds, with the production build passing again.

Affected post-repair browser checks passed on isolated 5180: family and funded
university reload; remote succession news excludes military service; Calamity
widowhood persists; completed summary displays dismissal plus all three named
social roles. Keyboard focus and 390/320px layouts were checked without overflow
or captured warning/error logs. Owned tab/server closed, viewport reset. Final
fetch confirms the task branch contains `origin/main` at `9d19b9a`; same PR #10 is
the delivery target and the user merges manually. No deployment or unrun remote
CI pass is claimed.

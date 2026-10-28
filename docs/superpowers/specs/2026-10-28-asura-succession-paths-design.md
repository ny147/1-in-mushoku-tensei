# Asura succession: allegiance and consequences

Status: **proposed design, awaiting approval**. No gameplay implementation yet.

## Confirmed user decisions

- The succession event intrudes on too many lives and lacks meaningful personal
  consequences. Offer an Ariel / opposition choice with different resulting paths.
- Ariel has an **80% chance of winning and 20% chance of losing** the succession.
  This explicitly replaces the earlier fixed-accession decision for the new route.
- A winning supporter receives **a noble title and a one-time cash reward**,
  rather than an income-producing estate.
- A losing supporter risks **imprisonment or death**.

## Approaches

1. Resolve allegiance and its reward immediately in one choice. Smaller, but the
   campaign has no period of commitment and it does not fit K424–K425 progression.
2. **Recommended:** allegiance in K424, resolution in K425, with winning, losing
   and neutral routes. This fits the existing two historical anchors and makes
   the choice a commitment. The approval requested is for this approach and the
   proposed balance below; these are not yet confirmed user decisions.

## Reach and choices

Offer one manual allegiance decision to **adults aged 18+ physically in Asura at
the K424 historical checkpoint**. The options are support Ariel, support her
opposition, or remain neutral. Sampling eligibility at that checkpoint is a
builder call; entering Asura later that year does not replay the offer.
No allegiance is selected by Watch mode. Joining is not an automatic change of
occupation and does not overwrite Orsted/Hitogami membership.

Children, distant residents and neutral characters receive chronicle news rather
than repeated blocking succession decisions. They get no supporter reward or
punishment. Other regional conflicts and the Mana Calamity keep their own rules.
Do not make every Asura civilian a participant merely because of residence.

The first departure from Asura before K425 permanently withdraws the commitment:
no reward and no supporter
arrest/execution. Explain this before joining and when opening travel. A pledge
cannot be switched to the winning side after commitment or after the outcome.
Only surviving, still-committed supporters in Asura at resolution get the route.

## Outcome and proposed balance

Determine Ariel's 80/20 outcome once from a dedicated world-seeded stream. It must
be stable across reloads, independent of personal skill, and never consume the
personal or family RNG. Store the resolved result; do not reveal it before K425.
The choice of faction does not change the world result.

Proposed amounts, for approval:

| Route | Result |
| --- | --- |
| Back the winner | **500 silver once**, bounded by the purse limit; noble standing, retaining an existing noble title; record the ruler's recognition |
| Back the loser, remain in Asura | **20% execution; 50% imprisonment for 3 years; 30% escape**. These are conditional odds after the faction loses, using a separate seeded personal-verdict stream |
| Neutral / withdrawn | No supporter reward or judicial penalty; record the news/withdrawal |

No estate, passive rent, job promotion, combat mastery, Seven Great Powers title,
or repeated reward is granted. Both sides use the same reward and losing-verdict
rules; opposing Ariel is deliberately less likely to win. Existing noble status
does not turn a loss into a victory. Escaping a verdict gives no reward.
Use **standing.status** and a recognition fact for nobility; leave the birth's
origin.status and **standing.title** (Seven Great Powers rank) unchanged.

For an Ariel supporter remaining in Asura, execution risk is 20% loss × 20%
execution = **4% overall**; opposition support has **16% overall** execution risk.
The UI must distinguish those totals from the conditional verdict odds.

## Imprisonment as a real temporary state

Execution ends the life with an explicit recorded cause and normal immutable
archive. A sentence at the end of K425 suppresses activity for the K426, K427 and
K428 annual ticks, releases once after K428 processing, and resumes normal annual
earnings/study in K429. This exact timing is a builder call for approval.

While imprisoned:

- Job wages, work experience, yearly focus gains, ordinary course progress and
  university progress stop. No full-time training stipend or tuition consumption.
- Keep job/course/degree progress and attendance selections for release; do not
  trigger university probation because of captivity. Education debt repayment
  pauses with no earned income.
- Custody supplies the protagonist's basic food/shelter/care (18 resources/year),
  without depositing wages. Existing dependant expenses still use household funds.
- Normal aging, family aging and unrelated world history continue. No simulated
  freedom to travel, join factions, marry, take service or open training activities.
  Disable those controls with the sentence and release year stated visibly.
- Resolve unrelated already-queued choices safely; no action may bypass custody
  through a previously saved pending decision. On release restore normal access,
  income and retained studies without a second grant or automatic job switch.
- Freeze faction obligations/trust during custody. Suppress stale unsafe-work,
  travel and personal violence hazards and focus-based family relationship gains;
  retain normal aging/illness and independent family aging. Custody adds no hidden
  execution roll after its one stated verdict. These are builder calls to keep
  the stated sentence from secretly creating extra work benefits or danger.

No new user-facing prison management system is proposed. Reuse the existing
chronicle, time controls and character disclosures for the sentence/release.

## State, restoration and prior lives

Use versioned validated expanded-state data for allegiance, resolution, verdict
and custody/release. Keep political allegiance separate from the existing faction
field. All irreversible outcomes/rewards must be idempotent under annual calls,
queue draining and save/reload. Reserve the allegiance and resolution event IDs
without deleting old IDs used by existing saved choices.

Preserve frozen legacy rules and completed archives. New expanded lives use the
new succession route. For existing expanded lives, opt into the new route only
before exposure to the old succession event; do not rewrite a lived K424/K425,
retrospectively reward a civilian, or reroll a recorded accession. Preserve old
pending neutral/aid/service choice IDs; define an explicit compatibility path for
an already-seen or pending older succession event. Old histories remain factual
for their original rules. Missing new state is a migration case, not permission
to discard the save. No schema reset or browser-storage clear.

Migration boundary (builder call): keep compatibility rules when an old
succession ID is pending/queued or a K424/K425 succession history record already
exists. The history record is written before the old decision is shown, so an old
aid/service choice must never be inferred to mean political allegiance. Upgrade
only unexposed earlier active lives. Old `ariel-accession` facts remain intact;
new-route history codes distinguish either winner.

For new K426–K427 births, derive/store the already-historical world result without
backdating personal history, showing a participation event or granting a reward.
The world guide can disclose that world's result after K425. This is a builder
call covering births that never traverse the resolution checkpoint.

## Presentation and truth

Update EN/TH event text, Effects previews, actual outcomes, chronology/world guide,
character history and ending summary together. Label Ariel's possible defeat as
authored alternate history, never a sourced claim about the original story.
Current fixed-history text/tests must be revised only for the new route, while
compatibility tests preserve old recorded outcomes. No outside canon research is
required to choose these explicitly authored game rules.

## Acceptance and delivery

- Distribution tests for 80/20 over world seeds and conditional verdict buckets;
  deterministic reloads, no personal/family RNG consumption by the world outcome.
- Both winners/losers, neutral, remote news, children, withdrawal and late arrivals;
  manual Watch behavior and no repeated pledges, reward or sentence.
- Prison annual accounting, three-year release, retained career/training/degree,
  debt pause, old pending-action bypass prevention, death/archive and restoration
  at each boundary. Existing seeded legacy futures remain identical.
- Existing saves before/during/after K424–K425, old pending IDs and immutable old
  completed snapshots; actual effects match stated cash, odds and status changes.
- Full npm tests/build, desktop/mobile EN/TH, keyboard, console, overflow and
  pause/reload QA on an isolated origin. Preserve player 5173 storage.
- Implement on `codex/asura-succession-paths`, PR targeting main, user merges
  manually. Design-only work is a draft until the user approves implementation.

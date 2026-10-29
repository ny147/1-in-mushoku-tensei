# Swordsmanship styles and advanced mentorship

Status: **approved by the user on 2026-10-29** ("approve it"), including the
proposed fees, original teacher locations, and event balance below. Implementation
plan: [swordsmanship-styles](../plans/2026-10-29-swordsmanship-styles.md).
No application code, save migration, or gameplay has been implemented.

## Intent and confirmed decisions

Let sword practice develop a recognizable school and make that choice matter in
the existing life story. Players should be able to become specialists or spend
more of their lifetime learning several styles.

The user confirmed these decisions through a one-question-at-a-time interview:

- Sword God, Water God, and North God are all available when sword practice
  opens. Players may learn multiple styles, practicing **one at a time** and
  keeping earned progress when switching.
- Styles affect event options and outcomes. An event uses **only the currently
  selected style**, rather than every style the protagonist has learned.
- Switching is free **between events only**. A pending decision locks switching.
- Sword-related jobs use the **strongest learned style**; practicing a weaker
  style must not remove existing job eligibility.
- Self-practice can reach **Advanced**. Saint and higher require a qualified
  mentor and a trial. Players seek teachers directly through an activity that
  shows requirements and any travel needed, rather than relying on random finds.
- Once the requirements and training are complete, a trial **passes without a
  random failure roll**. Each promotion from Saint onward takes **one training
  year**, alongside the current job, with sword practice as yearly focus.
- Advanced mentorship charges a fee that increases with rank and is displayed
  before commitment. Trials are **manual chronicle events**, without a new
  playable-duel screen.
- Existing lives keep a saved recognized style. If none was chosen, the player
  assigns their existing sword experience and rank to **one style once**. The
  other two begin at Beginner; old experience is not copied into all three.

Numbers, locations, integration details, and edge-case policies below originated
as **builder proposals**, rather than additional interview answers. The user's
subsequent approval of this document accepts those proposals; keep that distinction
from the directly confirmed interview decisions above.

## Existing behavior and implementation approach

The older `legacy-1` childhood event `wooden-sword` already offers the three
styles, but only stores a school label and shared sword experience. Current
`expanded-1` practice, instruction, job learning, and career courses use generic
`training.swordXp` and `swordCap`. The existing ranks and XP thresholds are:

| Rank | XP | New promotion requirement |
| --- | ---: | --- |
| Beginner | 0 | Select the style |
| Intermediate | 35 | Practice |
| Advanced | 110 | Practice |
| Saint | 260 | Prior rank, mentor, fee, one training year, manual trial |
| King | 560 | Prior rank, mentor, fee, one training year, manual trial |
| Emperor | 1000 | Prior rank, mentor, fee, one training year, manual trial |
| God | 1800 | Prior rank, mentor, fee, one training year, manual trial |

**Approaches:** extending the expanded rules with an authoritative per-style
ledger and explicit compatibility queries fits the chosen chronicle experience.
A wholesale replacement of the shared training, career, and save systems would
increase migration risk without supplying a requested feature. A separate duel
system was considered during the interview; the user selected chronicle trials.
Use the incremental ledger approach, as recommended in the conversation.

Add a small versioned sword-progression module under `src/game/expanded/`, with
pure helpers for selection, grants, effective rank, eligibility, mentor quotes,
elapsed training, and trial completion. Existing engine entry points own time
and RNG. UI rendering never changes progress or consumes randomness.

Scope is new and active **expanded-1** lives. Frozen legacy simulation and old
completed archives keep their original rules and facts. Shared displays must
continue to render those older lives without inventing style-specific mastery.

## Style selection, learning, and qualifications

Each style has separate finite nonnegative fractional XP and an earned
instruction ceiling. New styles can self-advance through Advanced (ceiling 2).
The displayed rank is the lower of the XP-supported rank and that ceiling.
Banking XP above a ceiling is allowed, but it does not bypass consecutive mentor
promotions or shorten their training years. No style loses XP through inactivity.

Sword practice currently opens at age **5**; retain that age and the current
learning rates. No school membership, birth talent, or fee gates initial access.
Initial selection is explicit: the first safe sword-practice choice offers all
three styles, or selecting sword focus between events asks for the initial style
before completing that change. Initial selection in the safe first-practice
event is not permission to switch an already selected style during an event.
Sword-bearing career-course enrollment likewise obtains an initial selection
if needed, before confirming its quote. Never silently default to Sword God.

When a decision is pending, reject style-switch mutations in both UI and domain
helpers, including in Watch mode and while a trial or teacher menu is open.
Otherwise switching is immediate, free, and persisted; it does not change focus
or advance time. Reading a pending event and switching through another tab is
also blocked. If multiple decisions are queued, switching remains unavailable
until no pending decision or queued decision remains.

Route **all** new sword learning to the selected style: annual focus, generic
practice choices, employment, and career-course skill gains. Preserve the existing
sword talent +25% and physical-factor annual-practice multiplier, including
fractions. Do not multiply twice or award the same gain to multiple styles.

Courses retain their current attendance, prices, funding, completion, and manual
placement rules. Their cumulative skill milestones need a credited-entitlement
record: changing styles or reloading must not re-credit an earlier milestone to
another style. A completed course cannot be replayed to duplicate its skill floor.
The precise internal ledger representation is left to the implementer.

For a job, **any single learned style** that meets that job's sword requirements
qualifies. Do not sum three styles or combine XP from one with instruction from
another. Switching styles neither dismisses the character nor alters career
experience. An unassigned migrated legacy bundle continues to count toward
existing job qualifications until the player assigns it.

Keep paired `training.swordXp`/`swordCap` compatibility mirrors from one strongest
track (rank, then XP, then stable style-ID order). Update consumers to use
purpose-specific queries: jobs check all styles, while sword-based event options
and legendary challenge eligibility/chance use the selected style. Other magic,
reputation, age, feat, and title requirements still apply. Do not add style XP
together or treat a God style rank as a Seven Great Powers title. General sword
stat development should derive from the maximum single-style XP, preserve the
existing saved stat, and never decrease because the selected style changes.

## Teachers, prices, and training time

Add a directly accessible **Seek a sword mentor** activity alongside instruction,
available from the existing instruction age of **8**. It can show all three
schools, next-rank requirements, locations, current fees, training status, and a
safe leave option. Enrollment is for the **selected style only**; switch before
opening the activity to choose a different school. Teacher access is reliable
when conditions are met, with no random contact or vacancy roll.

Proposed authored school locations and prices:

| Style | Mentor location for Saint through God |
| --- | --- |
| Sword God | Asura |
| Water God | Millis |
| North God | Demon Continent |

| Target rank | One-time fee in silver |
| --- | ---: |
| Saint | 16 |
| King | 32 |
| Emperor | 64 |
| God | 128 |

These are original game schools, instructors, and balance choices, **not canon
claims about real school locations or named characters**. Use original teacher
identities rather than changing canon characters' lifetimes or appointments.
God remains the game's existing top mastery rank; this feature does not replace
an incumbent school leader or award an unrelated world title.

Enrollment requires the prior rank, target XP, local mentor, affordable fee,
and no other active mentorship. Quotes show unmet conditions and confirm that
the fee buys the mentorship once, not a yearly subscription. Payment uses
personal silver, without introducing a new loan, subsidy, equipment charge, or
automatic travel operation. Existing travel prices, risks, and minimum age **18**
remain; a child may train locally but cannot use this feature to bypass travel
restrictions. Leaving a quote costs nothing.

The year means **one full simulated year of eligible elapsed practice**, measured
across ordinary ticks and explicit time-advance modes. Starting just before a
birthday must not award a full year at the next tick. Paused playback, pending
decisions, hidden-tab suspension, or a save/reload never supply elapsed practice.
Use an explicit saved 0..1 progress value; advancement accounts for actual
simulation time, never wall-clock time or render frequency.

Eligible time requires sword focus, the mentored style selected, presence in its
mentor region, and an alive protagonist. University attendance or an unpaused
career course pauses mentor progress, preventing simultaneous formal programs.
Normal employment continues with its existing income and job-skill rules.
Changing focus, switching style, or traveling pauses mentorship without losing
paid access or earned time. Returning resumes it; no second payment is taken.
One paid mentorship can be retained while paused, but a second cannot be enrolled
until it completes or is explicitly abandoned. Abandonment retains sword XP and
earned ranks, forfeits that unfinished mentorship's time/fee, and explains this
before confirmation. Ordinary annual life and travel hazards remain unchanged.

Once one year is complete, mark the trial ready and queue one manual trial at
the next normal decision boundary. Respect queue capacity, history-event order,
pause-on-decision, and existing Play/Pause behavior. A ready trial is durable if
the queue is temporarily full. The trial can be deferred with no loss or repeat
payment, then sought through the mentor activity. Never grant a rank merely by
rendering, filling the progress bar, or letting Watch mode choose.

Completing the trial checks the saved training completion, prior rank, XP,
selected style, and mentor location. It guarantees the next rank, charges nothing
further, records an original bilingual trial scene, and completes only once.
One year does not promote several ranks, even with banked XP. Promotion trials
themselves cannot kill or injure the protagonist. Reaching God needs no further
mentor quote. Retain the existing **aura impairment ceiling at Advanced**;
experience, wealth, or mentorship must not bypass it.

Future generic paid sword instruction routes to this mentor system; it must not
remain a cheaper way to unlock Saint+. Magic instruction keeps its existing
behavior. The saved pending-instruction exception is described below.

## Style effects in events: first-release proposal

Keep the current generic accept/decline choices and stable IDs. Add one extra
option when the **selected style is Advanced or higher** to the existing
voluntary service and faction-assignment events:

| Selected style | New approach | Immediate fatal risk | Successful reward |
| --- | --- | --- | --- |
| Sword God | Take the offensive | Existing 10% service / 5% assignment | 40 / 30 silver; reputation +8; normal service/assignment credit |
| Water God | Protect the team | 5% service / 2.5% assignment | Existing 30 / 20 silver; reputation +8; normal service/assignment credit |
| North God | Complete a limited scouting task | 0% | 10 / 6 silver; no reputation, service count, or feat; assignment obligations -1 only |

Normal successful assignments still reduce obligations by 3 and add faction
trust as currently authored. The limited North God option gives no additional
faction trust. Existing relationship/history exposure rules apply to full service;
limited scouting records support rather than military-service accomplishment.
Base accept remains 30/20 silver at 10%/5% fatal risk. Decline stays safe and free.
The reward/risk table is authored balance for approval, not setting statistics.

Maintain existing service age/locality/participation requirements and manual
dangerous-choice behavior. Explain these as different scopes of work in the
scene: they are not global passive stat bonuses, automatic protection for the
family, or guaranteed safety for the rest of the year. The North God choice is
the low-reward safe alternative; it does not clear all faction obligations.
Use existing seeded personal RNG for dangerous outcomes, one roll per risky
choice. Safe scouting and reading previews consume none. Other event, world,
annual-survival, and title-challenge probabilities gain no new style modifier.
Title challenges still use the selected style's actual strength on the sword
path, with the existing chance formula and other requirements.

Show actual style/rank requirements, costs, risks, and rewards in English/Thai
Effects previews; feedback confirms the actual result, fractional learning,
rank advancement, income, reputation, and obligations where applicable. Teacher
and trial details disclose that promotion is guaranteed when ready, while normal
life hazards remain possible during the training year.

## Saves, migration, and old decisions

Add optional, versioned expanded sword state. Absence means an older save, not
corruption; a present malformed ledger is invalid and must trigger the existing
recoverable load error without resetting or overwriting saved data. Validate
style IDs, all three tracks, finite bounded XP/progress, integer rank ceilings,
mentor targets/payment/completion consistency, and initial-allocation state.
Bound trial/mentor records by the three styles and four advanced promotions.

Migration is deterministic and idempotent and consumes **no RNG**. Preserve age,
calendar, partial-year progress, coins, existing stats, pending/queued IDs,
history, family, talents, careers, debt, and all RNG streams. Recognized saved
school names map to stable IDs. Preserve high ranks already earned; do not
retroactively charge fees or require new trials for them. Lower ceilings may
benefit from the new free-through-Advanced rule; no earned rank is taken away.

For an old life with no recognized school, hold its original XP/ceiling in an
unassigned legacy bundle. Offer the one-time player allocation **between events**
without advancing time or replacing a pending decision. Until allocation,
continue generic old sword learning into that bundle, keep old qualifications,
and withhold new style-specific event bonuses and mentorship. Once allocated,
move the bundle exactly once and begin the other tracks at zero. Reloading,
switching, or an invalid selection cannot repeat the transfer.

An existing pending generic choice keeps its original label, ID, price, effects,
and risk at migration. In particular, honor a paid pending sword-instruction
offer once under its old cap-increase rule, even if it would grant Saint+; apply
it to the recognized track or unassigned bundle. Track this narrow compatibility
exception durably so subsequent newly opened instruction uses mentorship.
Additive style options appear only on newly opened decisions after allocation;
do not rewrite already offered service/assignment stakes. Preserve saved queue
entries and resolve them without inserting style allocation ahead of them.

Old ended active lives and archived lives remain immutable, without inferred
per-style ranks, invented mentorship history, or reconstructed accomplishments.
New completed summaries include actual per-style ranks, the last selected style,
and completed mentorships in both languages. The archive uses those saved facts.
Do not change the browser storage key, clear browser data, or reroll a life.

## Interface and scope boundaries

Reuse the current parchment/forest-ink components and existing focus, character,
instruction, effects, and retrospective patterns. Near sword practice, show the
selected style and a compact list of all three ranks/XP. Explain a disabled
selector with "Resolve the current decision before changing style." Keep mentor
requirements, progress, paused reason, fees already paid, and trial readiness
visible through existing disclosures; no extra continuation shortcut is added.

Keyboard controls need explicit labels and focus after manual trial outcomes.
Keep the established mobile reading order, reduced-motion behavior, life-fixed
English/Thai, immediate persistence, storage-error recovery, and Watch-mode
manual selection/enrollment/promotion. Exact component boundaries, prose,
accessible control choice, and internal helper signatures are builder choices.

Non-goals: a tactical combat screen, independent school questlines, named-canon
teacher simulation, a global combat rebalance, unique school-leader succession,
new lending or subsidies, legacy-rule migration, Asura succession implementation,
hosting changes, or deployment. Separate style records and authored story choices
must remain understandable without adding a second yearly focus or another job.

## Implementation surfaces and verification for the future plan

The subsequent implementation plan should cover these groups in dependency order:

1. Sword ledger/helpers, focused domain tests, validation, idempotent migration,
   pending-offer compatibility, and immutable-archive fixtures.
2. All XP sources, talent/factor fractions, course entitlement, compatibility
   consumers, strongest-style careers, and selected-style challenges.
3. Mentor registry/quotes/fee payment, exact elapsed-time accounting, pausing,
   ready-trial queue/manual completion, and instruction routing.
4. Style-sensitive service/assignment actions, deterministic outcomes, effects,
   EN/TH presentation, selection controls, and new retrospective facts.
5. Documentation/checkpoint, complete tests/build, isolated browser flows, review,
   and task-branch PR delivery.

Before claiming implementation complete, run `npm test` and `npm run build` from
`six-faced-life/`. Test unchanged/inactive styles, invalid switching during any
pending event, banked XP without skipped trials, same-style paired requirements,
no milestone duplication, birthday-edge training duration, all advance modes,
reloads, interrupted training, no duplicate charges/trials, aura impairment,
every style action and safe decline, no preview/render RNG, migration with a
pending legacy lesson/service event, and old ended snapshots. Preserve the
normal unstyled magic path when testing mixed magic/sword requirements.

Browser QA uses isolated port **5174**, never the player's **5173** save. Cover
desktop and narrow mobile, keyboard/focus, EN/TH, console errors/overflow,
pause/play/Watch, style locking, reload persistence, mentor quotes and costs,
pause/resume across travel/focus, and one full promotion from enrollment to saved
trial outcome. No application tests or browser checks are claimed by this
planning-only task.

# Accessible careers, training, and education finance

**Date:** 2026-10-26, Asia/Bangkok.

**Status:** Design for user review; not an implementation plan or implemented behavior.

**Planning follow-up — 2026-10-27:** The user requested an implementation plan
from PR #12 and delivery to the same PR. See
[the implementation plan](../plans/2026-10-27-accessible-careers.md) for task order,
interfaces, funding arithmetic, migration and verification requirements. This
authorizes the planning document; proposed balance values remain labeled for
review, and no game implementation has started.

**Branch:** `codex/accessible-career-design`. Base: freshly fetched `origin/main`
at `c88743a`. No game code changes are part of this design delivery.

**Builder check:** A fresh read-only reviewer reported **nothing important left**
after checking for consequential unanswered planning questions. The proposed
defaults below still await user review; this is not implementation verification.

## Intent and evidence

The player reports being stuck as a farmer even when financially comfortable.
An ordinary character should have a clear, reliable route into a chosen ordinary
profession. Exceptional talent can help, but is not required for ordinary work.
Mastery and prestigious appointments remain earned achievements.

Source inspection identifies three separate barriers:

- `expanded/events.ts` offers farmer/laborer directly at first work. Its career
  menu gives most other jobs only a deterministic **10% vacancy chance per world
  year**, even after qualifications are met. Professor uses 2%; farmer/laborer
  are always available. Reopening/reloading does not reroll these vacancies.
- `expanded/careers.ts` requires sword XP 80 and instruction cap 2 for swordsman,
  or selected-discipline XP 100 and instruction cap 2 for mage. Ordinary sword
  and magic focus in `world.ts` grants 9 XP/year before applicable modifiers.
  Wealth does not satisfy skill or instruction requirements.
- `expanded/events.ts` separately gates instruction on aggregate XP of
  `60 * currentCap`, with an 8-coin fee. `expanded/education.ts` requires academic
  readiness and complete university funding; there is no lending system.

This is a source diagnosis, not a reproduced measurement of the player's browser
save or a claim about a particular hosted deployment. No player storage was read,
modified, or cleared, and no application tests were run for this investigation.

## Confirmed decisions from the interview

1. All ordinary careers get accessible beginner routes, including magic,
   swordsmanship, healing, trade, and other regular work.
2. Paid apprenticeships cover basic living costs. Optional training loans cover
   fees when needed.
3. Consistent full-time training qualifies an ordinary beginner for a regular
   entry-level job in **2–3 game years**. Mastery/prestige take longer.
4. Loans are **interest-free**, with automatic income-based repayment after
   necessities; repayment pauses during hardship.
5. Completing training guarantees a starter placement, without vacancy waiting.
6. Players choose full-time paid training or slower part-time training while
   keeping their current job.
7. Ordinary direct-entry requirements also decrease. Existing skills can qualify
   a character without requiring them to repeat an apprenticeship.
8. University loans are in scope, including admission, tuition, and necessary
   travel. University retains its academic/readiness requirements, with clear
   explanations of what is missing.
9. Qualified direct applicants can always enter ordinary jobs. Scarce openings
   remain for prestigious appointments.

These decisions amend the previous expansion specification's ordinary vacancy
behavior and its statement that no lending/debt system is required. Its other
rules remain the baseline, particularly legacy compatibility and preservation of
earned advanced ranks, political standing, and exceptional titles.

## Approaches considered

- **Loans alone:** offered during the interview and not selected. They solve fees
  but leave the skill/instruction and vacancy barriers intact.
- **Paid apprenticeships plus optional loans:** selected by the user, together
  with lower ordinary direct-entry requirements and guaranteed ordinary access.
  This addresses both reliable retraining and players who already have skills.
  It requires saved training progress and a validated debt ledger.

**Builder recommendation:** extend the existing career, instruction, and
university activities in the current app. Use one education-finance ledger for
both apprenticeships and university. Reuse the existing occupation ledgers,
language system, and chronological facts. Do not introduce a separate game mode,
external service, account system, or dependency for this feature.

## Proposed defaults for review

The following details are **author recommendations**, not numbers the user has
already approved. They make the agreed behavior concrete and reviewable.

### Ordinary and prestigious roles

Ordinary roles are laborer, farmer, merchant, guard, adventurer, swordsman, mage,
healer, cleric, and teacher. Knight and professor are prestigious; their current
skill, service, patronage, degree/research/teaching, equipment, reputation, and
vacancy rules stay intact. A cleric apprenticeship represents institution-based
training and service, not a university degree or political allegiance.

All ordinary direct appointments are always available from the existing working
age of 15 once their displayed requirements are met. Do not reroll or consume RNG
to list these jobs. Farmer/laborer keep their immediate-entry routes; training is
optional for them, never an added barrier.

| Ordinary role | Proposed direct requirements, in addition to age 15 |
| --- | --- |
| Laborer | None |
| Farmer | Health 20, unchanged safety floor |
| Merchant | Knowledge 10; starter capital/fee 10 |
| Guard | Sword XP 20 |
| Adventurer | Health 30; sword or magic XP 15; starter fee 5 |
| Swordsman | Sword XP 30; instruction cap 1 |
| Mage | Selected magic discipline XP 30; instruction cap 1 |
| Healer | Healing discipline XP 25 |
| Cleric | Healing XP 25; knowledge 20; institutional trust 10 |
| Teacher | Knowledge 25; selected magic discipline or sword XP 25; reputation 5 |

These are entry requirements, not grants of higher combat rank or mastery.
Current learned spells and rank XP thresholds remain meaningful. Retain existing
rare-trait limitations on advanced aura/instruction; they must not block the
ordinary cap-1 sword route. Existing health-based dismissal rules remain.

### Participation and progress

- Training opens manually from career activities at age 15, including for adults
  already in a job. No rare talent, existing skill XP, degree, reputation, wealth,
  collateral, patron, race, or random offer is needed to start an ordinary course.
- Full-time courses take **2 years** for laborer, farmer, merchant, guard, and
  adventurer; **3 years** for swordsman, mage, healer, cleric, and teacher.
  Part-time takes **4 or 6 years**, respectively, from zero progress.
- Model progress in half-time units: full-time earns 2 units/year, part-time 1;
  courses require 4 or 6 units. Preserve progress when changing mode or pausing.
  One active course at a time; retain bounded per-role progress when switching
  courses so earned progress does not disappear. Enrollment quotes remaining time.
- An active course represents committed participation independently of yearly
  focus. Existing focus remains usable and does not silently invalidate training.
  Explicit pause/leave controls stop course progress. Advancing years progresses
  the course; merely opening activities or reloading does not.
- Full-time training pays **24 coins/year**, replacing regular job wages and
  regular career-year advancement while attending. Part-time retains actual job
  wages/advancement and pays no additional stipend. Never stack full-time wages
  with the old occupation's income. A jobless part-time applicant sees the lack
  of income before enrolling and can choose the paid route instead.
- Tuition is **8 coins per full-time-equivalent year**, total 16 or 24 for a fresh
  course, the same total for part-time. Required instruction is included. Quote
  any merchant/adventurer starter fee with the course and reserve it for placement;
  do not charge it twice. Farmer/laborer training is optional and free.
- Training builds the relevant skills, knowledge, reputation/trust, and elementary
  instruction needed for the selected ordinary role. Contributions are bounded
  by its entry thresholds; never reduce existing values or award advanced mastery.
  The implementation plan must specify per-course gains that meet these targets
  within its duration for an ordinary eligible participant, without relying on
  unrelated focus, lucky events, or rare talents.
- Physical courses also provide preparation to reach their entry health floor.
  Illness, injury, and the world's existing death risks still apply. A surviving
  graduate below a safety floor retains the completed qualification and guaranteed
  placement until recovered; show the exact health blocker rather than requiring
  retraining. Guaranteed placement is an available **manual acceptance**, not a
  forced job switch. No extra waiting roll or hidden fee may block acceptance.
- Existing skills remain a valid faster path. A player may apply directly when
  qualified, without buying or finishing a course. Training must not become a new
  compulsory gate. Completed courses are not repayable cash/XP reward loops.

### Loans, university funding, and hardship

- Borrowing always requires explicit player acceptance, showing purpose, exact
  principal, funding breakdown, and repayment terms. Watch mode cannot borrow,
  enroll in a course, switch training mode, or accept a placement for the player.
- Loans finance the actual unpaid quoted cost of an eligible course or university
  enrollment. They pay the provider/reserved education budget rather than adding
  spendable purse money. No arbitrary collateral or credit-score gate recreates
  poverty-based exclusion. One active course/enrollment prevents simultaneous
  funded attendance; changing institutions cannot duplicate a reserved budget.
- Use family education funds and personal funds through the existing explicit
  funding flow; offer a loan for the uncovered amount. Choosing not to borrow
  leaves the current life, purse, and appointment unchanged.
- University keeps age 15, knowledge 40, existing readiness conditions, four
  successful study years, academic probation/withdrawal, and scholarship rules.
  A loan satisfies only funding. Full quotes retain admission 80, the existing
  four-year tuition/living reserve 232, and required regional travel cost
  (currently 40/90/120). Thus necessary basic living costs are included, not just
  tuition. Show all components before acceptance.
- Scholarships cover the existing necessary costs without debt. Existing enrolled
  students are not retroactively charged or lent money. Apprenticeship and
  university cannot both pay benefits or advance attendance in the same year.
  Graduation does not automatically award professor, knight, or mastery.
- Repayment is **10% of positive annual earned-income surplus**, rounded down but
  at least 1 coin when an integer surplus exists, capped by both actual surplus
  and outstanding principal. Compute surplus after food, shelter, care, existing
  dependant costs, and current necessary education costs. Grants, loan proceeds,
  and saved wealth are not earned income; do not seize old savings for repayment.
  Pause during full-time university attendance or when no positive surplus exists.
  Multiple loan purposes share one affordable repayment ceiling, not one per loan.
- Repayment cannot create unmet necessities or negative coins. No interest,
  penalties, repossession, imprisonment, or compounding. Show balance and last
  repayment even while paused. Death closes obligations without passing debt to
  descendants; the completed-life record retains principal borrowed/repaid/unpaid.
- Charge training tuition for committed participation, not repeatedly on opening
  the menu. On withdrawal, return only unused reserved funding: borrowed funds
  reduce outstanding debt first, and only the player's unused contribution can
  return to their purse/family fund. No refund of consumed tuition or instruction.
  The plan must pin funding allocation and withdrawal arithmetic explicitly.

### Presentation and recovery

Career activities show each ordinary role's direct requirements, immediate
eligibility, and a visible training route if still unqualified. A training quote
shows target role, full-/part-time mode, remaining years, income replacement,
total cost, existing contribution, optional loan, and qualification/placement.

Active training has a compact status, progress, expected remaining years,
pause/mode controls, and placement when ready. Education finance shows principal,
remaining debt, repayment policy, and a clear hardship-paused label. University
funding distinguishes scholarships, family/personal funding, and a voluntary loan;
academic blockers identify exactly which training or study requirement is missing.

Reuse the current illustrated chronicle, accessible controls, and English/Thai
catalogues. Keep mobile reading order, visible keyboard focus, reduced-motion
support, and understandable disabled reasons. Keep technical save-schema terms
out of player-facing text. No new academy screen is required.

All explicit choices persist immediately. Preserve pending decisions, pause on
decisions, hidden-tab handling, queue priority, and manual consequential choices
in Watch mode. A completed course must survive other queued events and reload
without duplicating fees, debt, income, progress, or placement rewards.

## Compatibility and constraints

- Applies to new and existing **expanded-1** lives. Initialize missing training
  and finance fields as no course/no debt through validated migration. Keep age,
  money, world/family RNG, occupation records, traits, spells, history, and pending
  choices. Existing jobs remain held even if their route changes.
- Frozen **legacy-1** lives retain their original engine and draw order; do not
  silently convert them. Existing completed-life snapshots remain immutable.
  New expanded summaries include actual training and debt outcomes in EN/TH.
- Reject malformed new fields through the established recoverable storage flow;
  never reset or overwrite an unreadable player's save. Numeric balances and
  progress are finite, bounded, and validated; unknown future versions recover.
- Keep deterministic simulation logic in `src/game/`. Rendering and listing
  activities must not consume random state or grant time/progress.
- No dependency upgrades, new server, publication, source uploads, browser save
  reset, billing action, or main-branch integration is part of this work.

## Success and verification required before implementation delivery

Implementation must demonstrate that ordinary low-skill adult expanded characters
can select each ordinary path, complete full-time training in 2–3 years or its
part-time equivalent, and accept a guaranteed job. Show both a poor and a
financially comfortable farmer moving into sword/magic work, plus a character
using existing skills for direct appointment. Ordinary availability must be
independent of the former vacancy roll.

Cover direct threshold boundaries; each course; relevant magic discipline and
instruction; health-blocked deferred placement; per-career experience; no duplicate
income; mode changes, pause, withdrawal, re-entry, and persisted qualification.
Verify poor but academically ready university admission by voluntary loan,
scholarship without borrowing, and academic refusal despite available credit.
Exercise repayments at zero/tiny surplus, dependants, existing savings, multiple
purposes, withdrawal refunds, death, and save migration/corruption boundaries.

Run meaningful regressions followed by `npm test`, `npm run build`, and diff
checks from the documented locations. Verify affected EN/TH browser flows,
desktop/narrow mobile, keyboard operation, reload, Watch/manual boundaries, and
console errors on an isolated origin. Preserve player port 5173 storage. Historical
checks from earlier PRs are not verification of this unimplemented design.

## Size, delegated details, and next gate

This is a cross-cutting gameplay change across careers, education, economy,
storage, translations, and player controls. It needs a written implementation
plan and comprehensive behavioral verification, rather than a stat-only patch.

The builder owns exact internal module/type names and component decomposition,
per-year course skill allocation, migration layout, bounded progress retention,
and refund allocation mechanics within the invariants above. The implementation
plan must make these choices explicit and testable; none authorizes changing the
confirmed experience or silently removing a career route.

The completed builder check found no consequential unanswered questions. The
2026-10-27 request advances this design to implementation planning on the same
PR; it does not authorize product implementation or turn proposed numbers into
confirmed interview decisions. Review the design defaults and linked plan before
starting implementation. Git delivery uses a PR targeting `main`; the user merges
manually and publishing remains separately authorized.

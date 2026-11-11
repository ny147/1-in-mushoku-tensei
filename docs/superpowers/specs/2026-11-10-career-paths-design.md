# Six career paths

**Date:** 2026-11-10, Asia/Bangkok.
**Status:** Implemented after user approval of the plan and native execution.
Completed for human review2026-11-11; see [verification](../../verification/career-paths.md).
Historical planning statements below are retained for provenance. No publication authorized.
**Branch:** `codex/career-paths-design`, from fetched `origin/main` at `0f791ee`.
**Builder check:** A fresh read-only reviewer reported "nothing important left"
and found no inaccurate statement of current career behavior in inspected source.
This is design review, not application verification or implementation approval.

**Planning follow-up — 2026-11-10:** The user requested an implementation plan
from this design. See the [eight-task implementation plan](../plans/2026-11-10-career-paths.md)
for proposed balance, interfaces, migration and verification. This authorizes
planning; the written plan and numerical defaults await review. No application
implementation or publishing is authorized by the planning request.

## Intent

Reduce the number of competing career choices and give each career a recognizable
journey with meaningful work and advancement. The user reported too many careers,
requested an inventory, and agreed to six paths after reviewing all twelve paid
occupations. The user specifically combined Mage and Professor and replaced the
proposed adventurer titles with four guild ranks: **F → D → B → S**.

This document describes future behavior. [PRODUCT.md](../../../six-faced-life/PRODUCT.md)
continues to describe the built game until implementation is approved and verified.

## Confirmed direction

- Six main choices: Farming and everyday work, Trade, Martial service,
  Adventuring, Magic and scholarship, Healing and religious service.
- Current occupations become entry roles, branches, or earned titles within
  those paths rather than twelve competing top-level choices.
- Mage and Professor share a path with professional and academic branches.
- Working mages need not attend university; Professor remains academic prestige.
- Healing remains a separate path, with secular Healer and institutional Cleric
  branches.
- Adventuring has only F, D, B, and S ranks. The seven-rank proposal was rejected
  as too many ranks. Do not reintroduce E, C, or A as hidden mandatory steps.
- Advancement should reflect work and accomplishments specific to each path,
  rather than only identical experience/year/reputation gates.
- Learned skills and previous work survive branch changes. Child, Student, and
  Retired remain life states rather than selectable career paths.

The titles and example activities below were presented and accepted as the
direction. Exact numerical balance, event scripts, UI layout, and save migration
mechanics were not individually agreed. Recommendations are labeled separately.

## Approaches considered

1. **Keep twelve independent occupations.** This is the current baseline. It
   preserves the flat catalogue but does not answer the user's concern about
   too many overlapping choices.
2. **Organize existing work into six paths with branches and progression.**
   Selected in the conversation. It retains familiar roles while reducing the
   initial choice and giving related work a shared journey. It requires domain,
   presentation, and compatibility work rather than a menu-only grouping.
3. **Full setting adventurer ladder, F/E/D/C/B/A/S.** Presented during research
   and rejected for excessive ranks. The selected F/D/B/S ladder is a deliberate
   game adaptation, not a claim that the setting has only four ranks.

## Current implementation and boundaries

The expanded ruleset stores fifteen occupation identifiers: twelve paid jobs
plus child, student, and retired. Ten ordinary roles have direct access and
optional paid full-time or slower part-time training. Knight and Professor are
prestigious appointments. One primary occupation earns pay; per-role records
survive job changes.

Relevant code:

- [balance.ts](../../../six-faced-life/src/game/expanded/balance.ts): roles/pay.
- [careers.ts](../../../six-faced-life/src/game/expanded/careers.ts): qualifications,
  appointments, common promotions, retained records, yearly skill/service gains.
- [career-access.ts](../../../six-faced-life/src/game/expanded/career-access.ts)
  and [training.ts](../../../six-faced-life/src/game/expanded/training.ts): courses.
- [events.ts](../../../six-faced-life/src/game/expanded/events.ts): career menu,
  vacancies, manual promotions, research and service decisions.
- [education.ts](../../../six-faced-life/src/game/expanded/education.ts): university.
- [progression.ts](../../../six-faced-life/src/game/progression.ts): legacy
  progression and shared magic learning; do not confuse compatibility mirrors
  with expanded occupation records.
- [validation.ts](../../../six-faced-life/src/game/expanded/validation.ts),
  [storage.ts](../../../six-faced-life/src/game/storage.ts), summaries, localization,
  and the pixel scene also depend on occupation identity.

Today all paid expanded roles use three common promotion gates and the same
pay increments. Guard/Knight add sword learning and service; Swordsman does not.
Mage/Healer/Cleric/Professor add aggregate magic XP; Cleric also adds trust.
These overlaps motivate distinct future work, not claims that the proposed
contracts, businesses, harvests, or clinics already exist.

## Paths

### 1. Farming and everyday work

**Laborer → Farmhand → Farmer → Farm Steward**

Laborer is accessible starting work and can fund preparation for any other path.
Farming is voluntary, not the inevitable next job for every laborer. Practical
work, reliable harvests, and resource management drive agricultural advancement.
Example decisions: retaining seed, improving tools, and responding to a poor
harvest. Identity: stability, household resources, and family life.

### 2. Trade

**Trade Assistant → Merchant → Established Merchant → Trading House Leader**

Successful deals, capital, and customer trust drive advancement. Example
decisions: safe local sales versus costly travel, reinvestment versus household
savings, and fulfilling commitments. Higher titles represent building a business,
not only accumulated working years. Identity: investment and judgment.

### 3. Martial service

**Trainee → Swordsman**, then **Guard → Guard Captain** or
**Sworn service → Knight → Knight Commander**.

Swordsman is the professional foundation. Guard emphasizes protection and
leadership; knighthood requires service, sponsorship or recognized standing, and
equipment as well as sword ability. Independent sword disciplines and earned
ranks remain unchanged: employment cannot grant Sword Saint/King/etc. by title.
Identity: duty, protection, and institutional advancement.

Sword-qualified characters retain access to instructor work within this path.
Teaching is available to qualified specialists rather than requiring every
instructor to become a mage. This preserves the current Teacher role's sword
route while putting Professor in the academic magic branch.

### 4. Adventuring

**F → D → B → S**

| Rank | Description | Example work for this game |
| --- | --- | --- |
| F | Beginner | Errands, gathering, simple deliveries |
| D | Experienced | Hunting and escort contracts |
| B | Veteran | Dangerous monsters and expeditions |
| S | Elite | Exceptional, high-risk guild requests |

Start new guild careers at F even if combat skills are already strong. Sword,
magic, and mixed characters can participate. Completed contracts and demonstrated
ability drive advancement, with visible next-rank requirements. Promotion can be
accepted or deferred. Rank is independent of spell/sword mastery and Seven Great
Powers positions. Show rewards, prerequisites, and failure risks before commitment.

**Research basis:** the [Adventure Guild wiki](https://mushokutensei.fandom.com/wiki/Adventure_Guild)
describes seven ranks, advancement through successful requests, requests normally
within one rank above/below, and demotion after repeated failures. It references
light novel guild explanations. This session checked search-indexed wiki content;
direct page retrieval failed and the novel passages were not independently
verified. The selected four ranks, job examples, pacing, and eventual balance are
authored adaptations. Do not present wiki request counts as verified canon rules
or import them unchanged into an annual simulation.

**Author recommendation for the first implementation:** use an explicitly
defined annual work period representing routine requests, with occasional manual
consequential contracts. Avoid requiring hundreds of clicks or a separate daily
simulation. List eligible work directly for each of the four ranks; do not apply
letter adjacency arithmetic after removing intermediate ranks. Repeated-failure
demotion, contract debt, parties, and guild withdrawal penalties are outside the
first scope unless separately approved. A failed request can lose its disclosed
reward/resources without adding these systems.

### 5. Magic and scholarship

**Apprentice → Practicing Mage**, then either:

- **Senior Mage → Master Practitioner** through commissions and applied magic.
- **Magic Teacher → Researcher → Professor** through university, teaching,
  research, and reputation.

University is optional for practical employment and required for Professor.
Academic titles do not automatically mean superior spellcasting. Spell knowledge,
instruction caps, and talent learning remain independent. Identity: practical
expertise or discovery. Teaching and research should be actual recorded activities
rather than titles that claim work the character never performed.

### 6. Healing and religious service

**Healing Apprentice → Healer**, then either:

- **Senior Healer → Clinic Leader** through patient care and independent practice.
- **Cleric → Senior Cleric** through healing, institutional trust, and community
  duties.

Both branches develop healing expertise; the religious branch adds obligations
and institutional service. It does not automatically join a political faction.
Identity: care for people, independently or through an institution.

## Complete existing-role mapping

| Existing role | Future path or treatment |
| --- | --- |
| Laborer | Everyday starting work; optional preparation for other paths |
| Farmer | Farming and everyday work |
| Merchant | Trade |
| Swordsman, Guard, Knight | Martial service foundation and branches |
| Adventurer | Adventuring; F/D/B/S progression |
| Mage, Professor | Magic and scholarship, professional/academic branches |
| Teacher | Magic teaching or martial instructor work; preserve earned records |
| Healer, Cleric | Healing and religious service branches |
| Child, Student, Retired | Life states outside the six career choices |

## Constraints and author recommendations for implementation planning

- Retain one paid primary role. Instruction, contracts, and research must not
  silently become a second annual salary or double-count advancement.
- Keep ordinary beginner access reliable, working age fifteen, existing paid
  full-time/part-time training, and optional interest-free education finance.
  Do not force qualified workers to repeat training or insert prestige gates
  before ordinary entry. Preserve Knight/Professor prestige conditions and
  vacancy rules unless a later approved plan explicitly replaces them.
- Path previews show branches and the next achievable milestone. Retain existing
  chronicle/character disclosures, EN/TH, keyboard behavior, responsive reading
  order, visible effects, pause-on-decision, manual Watch-mode choices, and prompt
  saving. No new visual theme or six additional navigation pages are required.
- Domain rules remain pure and seeded. Rendering/listing careers consumes no RNG.
  New work outcomes must be deterministic and avoid per-frame randomness.
- Legacy lives retain original rules and seeded futures. Completed lives and
  archives retain their actual historical facts and wording.
- For active expanded lives, plan versioned validation/migration covering role,
  retained levels/years/XP/reputation, appointments, courses, reserved tuition,
  placement, loans, university, pending/queued choices, history, and RNG.
  Do not infer whether an existing teacher taught magic or sword from whichever
  discipline happens to be selected now; preserve unspecified historical teaching.
- **Proposed migration policy:** existing adventurer levels 0/1/2/3 receive
  F/D/B/S recognition respectively, explicitly marked as inherited recognition,
  without inventing completed requests or rerolling outcomes. Fresh entrants start
  F. Already-earned titles/pay and accepted placements are protected; numerical
  mapping for other paths belongs in the implementation plan. Old pending offers
  resolve under their original terms before entering new progression.
- Before approval of an implementation plan, the builder must supply a concrete
  balance table: entry/promotion gates, pay, annual-work/request credit, reward
  budgets, and disclosed failure consequences. Tune against the existing economy
  (18 silver/year basic adult necessities), training stipends, dependants, and
  loan surplus rules. Numeric values remain builder proposals for review.
- Use bounded original decisions and reusable domain work outcomes to distinguish
  the six paths. No tactical combat, full business/land/clinic simulation, party
  management, new backend, external services, dependencies, or generated art is
  implied by the example activities.

## Acceptance and later verification

The implementation plan must cover all six paths, both branches where present,
ordinary entry, promotion/deferral, switching and re-entry, career-specific work,
and the F/D/B/S contract ladder. An identical timer with six labels is insufficient.

Require meaningful seeded tests for qualifications/work results, protection
against duplicate annual rewards, retained progress, legacy isolation, every
existing-role migration, teacher ambiguity, loans/reserves, completed snapshots,
and original pending-offer resolution. Verify reloads of old/new saves, career
decisions in Watch mode, pauses, immediate persistence and storage failure recovery.

Run `npm test` and `npm run build` from `six-faced-life/` after code changes.
Inspect desktop/narrow mobile EN/TH, keyboard interaction, overflow and console
errors, using isolated QA saves on a separate origin such as port 5174. Do not
touch the player's port-5173 storage. Update product/design documentation and the
checkpoint to describe only verified built behavior.

For this documentation delivery, verify local links, source accuracy, agreed versus
proposed decisions, the full diff, and whitespace. Application tests/build/browser
QA are not required or claimed for this documentation-only change.

## Next gate

Review this written design, particularly the explicitly proposed annual-work and
migration policies. After written-design approval, create a separate detailed
implementation plan using the writing-plans workflow. Do not begin application
changes from the conversation's structural approval alone. Git delivery remains
through a PR to main; the user merges manually. Publishing is not authorized.

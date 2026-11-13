# Standing: privileges, burdens, and family consequences

Status: **design for user review; no gameplay implementation yet**.
Date: 2026-11-13. Task branch: `codex/standing-impact-design`.

## Intent and scope

Standing should change the opportunities, obligations, dangers, and decisions a
character encounters throughout a life. Wealth, noble standing, and royal family
membership must have distinct meanings. Advantages should create commitments;
disadvantages should have several playable responses and a possible recovery.

This document records the Standing interview and selected staged approach. It
supersedes conflicting proposals in the [earlier Asura succession design](2026-10-28-asura-succession-paths-design.md).
Neither document describes implemented gameplay. Existing historical outcomes,
completed lives, and compatibility paths must remain factual for their ruleset.
New story content and probabilities are authored game design, not canon claims.

## Confirmed user decisions

### Identity and social movement

- Dynasty means membership in Asura's royal family, with a possible claim to the
  throne. It is distinct from simply being wealthy or holding an ordinary title.
- The player can become ruler. A dynasty player who declares a throne claim leads
  the opposition: Ariel retains her 80% chance, and the player's side has 20%.
  Coronation continues the same life with royal income and occasional kingdom
  decisions, within the existing life-simulator format.
- Wealth and Standing are independent. Poor nobles and poor royal relatives can
  exist, including at birth. Financial and political obligations can overlap.
- Earned nobles receive the same ordinary privileges and duties as born nobles.
  Becoming noble does not erase debt or rewrite birth history; losing money does
  not automatically remove a title. Ennoblement alone does not confer dynasty.
- Ordinary noble privileges and duties apply across kingdoms, with local houses
  and crowns. The Asura succession route is specific to that kingdom.

### Asura succession and exile

- The succession directly involves nobles and dynasty members living in Asura.
  Commoners are outside this compulsory political route.
- From age 18, eligible characters personally choose allegiance. Under-18
  characters face a household-survival version with protection/escape choices;
  they are not required to fight or make an adult political pledge.
- Ariel wins 80% of the time; the opposition wins 20%. The player cannot change
  the winner. Preparation affects personal contribution, rewards, and survival.
- Refusing allegiance can mean fleeing Asura, sacrificing wealth and political
  standing. **Asura exile is permanent: no return and no pardon route.** This
  later correction replaces the assistant's rejected pardon recommendation.
- A defeated supporter gets a final survival decision: surrender for imprisonment
  and confiscation, attempt escape using money/allies with capture risk, or resist
  using combat ability with serious death risk. Show the costs and danger first.
- Victory gives a one-time cash reward, recognition, and court opportunities.
  Existing nobles retain their title; royal relatives gain influence. Important
  appointments still require qualifications or service. The crown relationship
  continues through privileges and requests for money or service.

### Parental debt

- Only some poor households carry parental debt; it is not universal poverty.
- Debt reduces household resources during childhood. Personal debt decisions
  begin at age 15, matching the existing personal-earnings/living-cost boundary.
- The player may accept affordable instalments, negotiate a defined creditor
  service term, or refuse responsibility. Refusal can put family housing at risk
  and damage family relationships; disclose those consequences before commitment.
- Accepted debt has a fixed balance, no compounding interest, repayments from
  earnings left after basic living and dependant costs, and hardship pauses.
  Debt service has a stated duration and clear debt reduction. Paying debt can
  delay education, travel, and protection, but recovery must remain possible.

### Sponsorship, duties, and royal marriage

- Nobles can request limited house-funded education/training in exchange for
  future service. Aptitude and qualification requirements remain real. The
  interview's two-year guard-service example was illustrative, not a universal
  agreed term or a promise that every sponsored student becomes a guard.
- Repeated, deliberate refusal of duties can cost sponsorship, protection, and
  title. Escalation is warning, suspended support, then a final decision explicitly
  disclosing title loss. Inability to afford a demand allows negotiation or service
  alternatives; inability is not automatically deliberate refusal.
- Adult dynasty characters can receive optional political-marriage proposals.
  Acceptance brings court favor, family protection, and obligations to another
  house. Refusal may cost influence or family support. Never assign a spouse
  automatically. Marriage alliances do not change the 80/20 succession result.

## Current project and constraints

The app is React/TypeScript/Vite with browser-local persistence and a pure seeded
simulation. Existing expanded-state origins have wealth and commoner/noble birth
status; current legal standing is separate. Noble births currently always roll
comfortable/extreme wealth, start with basic education, patron support and
political contact. There is no distinct dynasty state or parental-debt system.

The existing K424/K425 succession records local exposure and distant news; adult
local service is optional. It does not yet implement the earlier 80/20 proposal.
Education finance already tracks voluntary, interest-free loans with hardship
handling and source-aware reserves. Existing education loans are not inherited.
There is one primary paid occupation; training, mentorship, university, family,
and other factions already have their own persisted progress and commitments.

Reuse those domain boundaries, stable IDs, history, queue and bilingual Effects
and outcome conventions. Keep `standing.title` for Seven Great Powers positions
5-7: it must never become a noble or royal title field. Asura court allegiance
must not replace Orsted/Hitogami membership.

## Approaches and selected delivery

1. **Selected: connected system, delivered in stages.** Design the interactions
   together; deliver Standing/debt, succession/exile, then sponsorship/royal
   marriages separately. Each stage is playable, reviewable, migrated, and tested.
   The tradeoff is that the full set of privileges arrives over several releases.
2. **One large release.** Every interaction arrives together, but finance,
   family, careers, political history and migration all change in one larger diff,
   increasing review and verification difficulty.

The user selected the recommendation. All agreed features remain in scope;
later stages are planned, not completed. Stage approval does not authorize
deployment, merging PRs, or automatic implementation before design approval.

### Stage 1: Standing foundations and parental debt

Introduce persistent social identity and household association, independent
wealth/rank generation including poor nobles/royals, and the complete parental
debt route. Preserve current earned-nobility access and its recorded facts.
Show present legal standing, birth origin, dynasty ancestry, known privileges,
debt and active commitments distinctly. Later-stage opportunities must not appear
as available actions before their functionality exists.

### Stage 2: Asura succession, defeat, captivity, and permanent exile

Deliver adult allegiance, household-survival choices, stable 80/20 world outcome,
victory recognition, the final defeat decision, captivity and permanent exile.
Introduce the crown relationship and its usable requests/rewards in this stage;
do not advertise an empty relationship as an implemented privilege. Shared duties
support its warnings, negotiations and possible title loss. Other kingdoms do
not acquire invented versions of the Asura succession event.

Include the newly confirmed opposition-claimant route, coronation and a small set
of continuing ruler duties here as one complete path. This expands Stage 2 beyond
the first delivery discussion; do not ship a cosmetic crown without its income
and ruling decisions. Split its implementation into reviewable tasks in the stage
plan; sponsorship and royal-marriage expansion still follow in Stage 3.

### Stage 3: broader house sponsorship and royal marriages

Complete recurring local house privileges/duties across kingdoms, provider-funded
sponsorship tied to service, and adult royal marriage proposals. Integrate existing
marriage eligibility and family records rather than introducing a second spouse
system. Retain the Stage 2 crown relationship without duplicate requests/rewards.

Each stage gets its own implementation plan and PR targeting `main`; follow-up
commits use that stage's open PR. This document itself uses a design-only draft PR.

## Domain design and interactions

### Wealth, legal standing, ancestry, and affiliation

Keep immutable birth facts separate from present resources and legal privileges.
Proposed builder model: ordinary legal standing remains commoner/noble, with
independent royal-house ancestry/membership and a local house/crown association.
Display dynasty explicitly when applicable. Equivalent representation is fine if
title revocation cannot erase royal birth or turn a Seven Great Powers rank into
a noble title. Loss of a title can remove privileges while retaining royal ancestry
and its recorded history; ancestry alone is not immunity from political danger.

Builder calls for design approval: introduce rare Asura royal-branch births within
the existing supported race/region setting. The playable ruler route is confirmed,
with the explicit alternate-history branch described below. An eligible noble
currently living in Asura faces the local crisis regardless of birthplace; no new
citizenship gate is required. Being outside Asura at the crisis does not create personal allegiance
or a retroactive punishment. Ordinary travel is not automatically political exile.

The exact birth frequencies, wealth weights and supported royal-branch identities
remain balance/content decisions for the implementation plan. Do not reuse the
old guaranteed-comfortable noble wealth roll. Never infer dynasty from a large
purse, earned nobility, surname, or an old generic noble save.

### Debt state and annual accounting

Track original household liability, creditor/collateral, outstanding balance,
childhood payments, personal acceptance/refusal, service contract and completed
payments as explicit validated facts. State transitions must be idempotent.
Only qualifying new poor-household origins roll a debt; do not add liabilities
merely because an established character temporarily runs short of cash.

Before age 15, use household resources, not the child's purse or an automatic
personal loan. Builder call: make childhood payments affordable against the
household budget and show their impact; do not create a guaranteed childhood
death spiral. At 15, offer one manual responsibility decision for the remaining
balance, preserving it through reload or another already-pending event. Parents
dying earlier do not silently accelerate personal responsibility below age 15.

Acceptance explicitly transfers the quoted outstanding obligation to the player.
Refusal leaves it a household problem, not a secretly accepted personal loan.
Resolve the disclosed housing/relationship consequences once; no endless retry
popups, invented personal liability, or automatic debt-based execution. Housing
loss must affect actual shelter/support rather than just negative prose. A poor
household without property may have tenancy/security at risk; do not confiscate
nonexistent assets. Record which family members and resources were affected.

Personal debt repayment, existing education-loan repayment, support costs, and
tuition must share one real annual budget. Neither ledger may spend the same
surplus twice. Preserve source-aware education reserves; reserved tuition is not
cash available to a creditor. Hardship pauses add no interest, penalty debt, or
deliberate-refusal strike. Do not automatically pass either loan type to children.

Creditor service has quoted term, credit per completed year, living-cost support
and exit terms. Reuse qualified existing occupations where appropriate. Service
cannot create a second simultaneous wage, free training years, or debt credit for
years spent imprisoned or otherwise unable to serve. Default builder call: an
early exit preserves earned credit and the unpaid balance, without hidden fees.

### Succession progression

Builder timing proposal: use the existing K424 allegiance/K425 resolution anchors.
At the allegiance checkpoint, an eligible local adult must choose Ariel, opposition,
or permanent flight. There is no consequence-free local neutral route for this
group. Make all pledges manual even in Watch mode; no side switching after the
pledge or reward by joining a known winner after resolution. Late arrivals get
truthful crisis/outcome information and no backdated supporter reward. The plan
must specify arrival/18th-birthday boundaries before implementation.

Under-18 noble/royal households have an explicitly recorded household alignment
and danger. Proposed builder behavior: the player can seek family protection or
choose guardian-assisted flight; no combat test or adult pledge is imposed.
Household involvement is not an adult-service record. Do not silently enrol a
child as a soldier or backdate adult cash/recognition on their 18th birthday.
Player choices and household consequences must remain factual when parents are
dead, absent or in a different region. Exact guardian/protection options are left
to the builder with those constraints.

Sample and store the world result once from a dedicated seeded world stream.
Do not consume personal or family RNG to determine the winner, reroll on reload,
or let allegiance, marriage, skill, or escape change that result. New births after
K425 get the historical result as news, never personal participation/rewards.

An eligible adult dynasty member may explicitly declare their own throne claim
instead of merely supporting Ariel or another opposition claimant. Declaration
records the player as the opposition candidate before the outcome. Opposition
victory then crowns that surviving, still-committed, non-exiled candidate; Ariel
victory sends them through the losing-side survival decision. It does not add a
second contested-crown roll after the fixed 20% opposition victory.

Commoners and distant residents receive news without compulsory allegiance,
supporter rewards or supporter punishment. This restriction concerns the Asura
succession route; existing regional conflicts and independent survival hazards
retain their own rules. Becoming noble after resolution grants future ordinary
rights/duties, not retroactive political rewards or a second succession.

Ordinary supporter victory records recognition, one cash reward and the new crown
relationship; neither an automatic estate nor passive rent is proposed. The earlier 500-silver
amount was unapproved balance and is not adopted here. Ordinary nobles cannot
earn a redundant title by replay. Royal birth or backing a winning side alone does
not automatically confer the crown; explicit prior claimant status is required.

On defeat, **replace the old automatic execution/prison/escape lottery** with the
agreed final manual decision. Surrender guarantees the imprisonment/confiscation
route rather than a hidden execution roll. Escape odds must use disclosed money
or genuine recorded allies; resistance odds must use actual combat competence.
Freeze a quoted attempt and resolve it once. Builder call: failed escape means
capture/imprisonment, not a second unannounced execution roll; resistance can
kill immediately as disclosed. Exact prices, probabilities, confiscation amounts
and sentence length are proposed in the stage plan, not claimed as user decisions.

### Captivity and permanent exile

Captivity is real: normal travel, courtship, assignments, work earnings, course,
university and mentor progress cannot continue as if free. Preserve progress for
release; custody supplies basic necessities, while real dependant costs continue.
Education and parental debt use their hardship pauses. Normal aging, family aging
and unrelated history continue. Do not add secret sentence-based execution rolls,
unsafe-work gains, or stale queued actions that bypass custody. Show the release
year and process release once. Exact duration remains a builder balance call;
the earlier three-year sentence is not a confirmed new decision.

Permanent exile is a persistent restriction distinct from withdrawing a pledge.
Explain it before committing to political flight. It removes the player from
Asura, applies disclosed property/privilege losses, and ends local supporter
eligibility. The destination must be accessible without an impossible fee; flight
cannot leave a character stuck with no legal region. The defeat escape route can
have its separately disclosed capture risk before successful exile.

Block Asura destinations in travel menus **and domain execution**, including saved
pending choices, career/school invitations, mentor offers, marriage moves and any
relocation path. No automatic relocation may return the exiled player there.
There is no pardon, expiry, paid return, new-ruler exception, or reclaimed property
by visiting. Declining allegiance flight is distinct from ordinary travel before
the crisis; leaving after a binding local pledge must disclose/resolve withdrawal
and exile rather than provide a return-and-collect-reward loophole.

Builder calls: apply the ban to this protagonist, not automatically to every
descendant. Do not teleport all adult relatives with them: record who actually
leaves and who stays, using existing family-location facts. Royal ancestry and
history remain. Exile does not create an unapproved worldwide pursuit system.

### Noble privileges and duties

Use explicit house/crown relationships and concrete commitments. A request states
its benefit, affordable alternatives, deadline, completion requirements and refusal
consequences. Track refusal separately from hardship, deferral and inability.
Earned nobles use the same opportunities and escalation as born nobles.

Support sponsorship through provider reserves and source-aware accounting, not
free cash or waived academic/skill requirements. Quote the covered costs and
service term before acceptance; do not pay a scholarship and sponsor twice for
one cost. Withdrawal refunds unused sponsor money to its source and states any
remaining earned service requirement. Never convert it silently into a loan.

Proposed builder safeguards: at most one major active house-service commitment;
service starts only when adult and qualified, after the funded study can finish.
Offer alternative qualified service rather than assigning an impossible career.
Captivity, medical hardship and study already authorized by the same sponsor do
not accumulate refusal strikes. A poor noble must have a possible non-cash answer
to a cash demand. Repeated deliberate refusal escalates through warning, suspended
support and a final manual title-loss decision. The sanction changes actual
privileges, not just text, and does not erase completed education or birth facts.

### Political marriage

Use adult, living, eligible existing family/relationship records and ordinary
marriage rules. No underage offer, automatic spouse, duplicate marriage, or
replacement of an existing spouse. Disclose household benefit, new obligations,
and refusal cost. Respect the existing partner's actual home and family location;
an exiled protagonist cannot accept an offer that requires return to Asura.

Builder calls: royal ancestry is not granted merely by earning a noble title;
marriage does not fabricate the player's biological descent. Whether marriage can
affect a future generation's lineage must be specified consistently in the stage
plan. Default for design approval: marriage alone does not create this protagonist's
throne eligibility. Exact spouse-house membership and children's inherited lineage
must be specified consistently without silently rewriting parentage.
Ordinary marriage remains available to qualified characters outside this route.

### Playable ruler after coronation

The user chose continued life as ruler, not a royal-story ending. Retain ordinary
aging, family, health, personal progression, ending and archive. Introduce an
explicit office/tenure with accession and end facts; do not equate dynasty birth,
noble title, or a Seven Great Powers position with the office of ruler.

Proposed builder implementation boundaries for approval:

- Offer the claim to adult, legitimate dynasty members physically in Asura before
  resolution and not exiled. Ordinary noble supporters cannot self-crown. Personal
  skill, wealth and allies can affect personal challenges and governance, never
  change the fixed 80/20 result. Court authority does not forgive parental debt.
- Royal income replaces ordinary primary job wages while in office; retain earned
  job qualifications/history without a second simultaneous salary. Keep public
  funds distinct from the personal purse, source-aware study funds and household
  debt. Paying for public relief must have a real disclosed funding source.
- Use occasional manual chronicle decisions, for example relief spending,
  security/protection and court disputes. Provide a small bounded kingdom budget
  and stability/legitimacy state with visible effects on future requests,
  resources or threats. Do not imply management through flavor text alone. Exact
  amounts, cadence, choices and risk thresholds are stage-plan balance calls.
- Good/bad governance changes personal rule and kingdom conditions after accession;
  it does not rerun or rewrite the K425 succession. Serious failure can produce a
  disclosed deposition/abdication crisis with survival choices; the complete loss
  of office must remove its salary and authority. All newly proposed governance
  consequences require design approval with this document, rather than being
  described as separately confirmed interview answers.
- Resolve incompatible service/training commitments explicitly at accession,
  retaining earned debt/service credit and qualifications. Do not request vassal
  duties from the ruler to their own crown or treat governing as free concurrent
  guard service. Family membership and prior obligations remain factual.

No world-map conquest, army movement, playable child succession, or separate
strategy-game interface is proposed. At death, archive the real reign and family;
do not automatically change the controlled protagonist to an heir. World-guide
and ending records must acknowledge the alternate player ruler rather than
continuing to state that Ariel certainly acceded. Existing compatibility lives
retain their original history.

## Existing saves and rollout: proposed compatibility policy

The interview did not decide rollout for already-active lives. Proposed policy
for design approval: preserve frozen legacy lives and completed snapshots; migrate
active expanded lives only at safe boundaries, retaining pending choices, queue,
RNG and all lived facts. Existing lives receive no newly invented royal birth,
parental debt, childhood deductions, or retroactive obligations. Their current
noble status can participate in prospective house opportunities once migrated.

For succession, retain old behavior when a K424/K425 event is pending/queued or
already recorded. Earlier, unexposed lives may adopt the new route only before
the new eligibility checkpoint. Never reinterpret old relief/service as an oath,
reroll a recorded accession, or impose permanent exile on a past ordinary trip.
New IDs and versioned state distinguish new facts; preserve old choice IDs and
validation paths. New-identity rolls use dedicated streams without changing the
seeded future of frozen/compatibility lives. Stage migrations must compose in
order; never treat an absent later-stage field as permission to reset a save.

## Presentation and accessibility

Reuse the illustrated chronicle and character/world disclosures, existing paper,
forest ink, restrained gold and self-hosted fonts. This is a behavior expansion,
not a visual redesign. Tell players what their current status unlocks, what they
owe, when a duty is due, and which outcomes are permanent. Separate birth identity
from present title and resources. Keep dynasty, court allegiance, other factions,
and Seven Great Powers positions distinct in English and Thai.

Every consequential offer has accurate bilingual Effects, actual outcome and
stored history. Pending decisions pause time and remain manual in Watch mode;
preserve hidden-tab handling and immediate choice persistence. Retain the earlier
confirmed constraint: no added "Continue to next decision" button. Use normal time
movement with existing Play/Pause behavior. Maintain visible keyboard focus,
reduced motion and mobile reading order; show disabled-return reasons for exile.

## Builder decisions, non-goals, and acceptance

### Product decisions resolved after the builder check

The independent builder review found one material gap: what a royal claim does.
The user answered that the **player can become ruler**, expanding the earlier
draft, then confirmed the opposition's 20% claimant route and continuation of the
same life with ruler income and occasional kingdom decisions. The detailed ruler
model above is a builder proposal for full-document approval. The initial builder
check found all other branches sufficiently specified or explicitly delegated;
the follow-up check of the expanded design reported **nothing important left**.
This review is a planning-readiness check, not user approval or gameplay testing.

### Implementation choices and limits

The builder chooses internal modules/state schema, seeded stream keys and bounded
collections; exact birth/debt frequencies, liability amounts, surplus allocation,
request cadence, sentence length, service terms, rewards and disclosed risk curves
must be listed as **proposed balance** in each stage plan. The full design must be
approved before implementation planning; each stage plan precedes its code.
No presently proposed number beyond the confirmed ages and 80/20 world outcome
should be presented as an agreed user requirement.

Out of scope: player-controlled changes to the fixed 80/20 succession odds, extra
succession wars in every kingdom, a land-rent economy, new server/accounts,
unbounded creditors/pursuit, free mastery or automatic prestige jobs, save resets,
automated spouse selection, automatic PR merges, or publishing the playable game.
These non-goals and the builder calls above are proposals for document approval,
not statements that the user separately specified each technical policy.

Acceptance for implementation, stage by stage:

- Deterministic births and repeated-seed/reload flows; poor commoner/noble/royal
  combinations; debt-free poor origins; earned titles and preserved birth history.
- Real household support effects, age-15 decisions, all three debt routes,
  aggregate affordable repayment alongside education loans, hardship, service
  interruption, household death, refusal consequences and no duplicate deductions.
- Noble/royal-only local succession; children/adults, distant news, late arrivals,
  age boundaries, both winners, all defeat choices, genuine skill/ally effects,
  80/20 distribution over seeds, no personal/family RNG use for the world result;
  explicit player claimant, coronation once, real ruler income/duties, budget and
  stability effects, end-of-office transitions and truthful alternate history.
- Captivity accounting/progress/release, permanent exile at UI and domain entry
  points, old queued-action bypasses, family separation, crown duties/title loss,
  sponsor refunds/qualification gates, adult eligible marriages and refusal costs.
- Before/during/after-event save migrations, reload idempotence, legacy futures,
  archives, EN/TH Effects/outcomes/history, manual Watch decisions and storage
  failures; full `npm test` and `npm run build` from `six-faced-life/` for code
  stages. Desktop/mobile/keyboard/console/overflow and isolated persistence QA;
  preserve player port 5173 saves and use an isolated origin such as port 5174.

For this design-only task: inspect document links, terminology, confirmed versus
proposed decisions and complete diff; obtain an independent builder check; run
`git diff --check`. Application tests/build/browser QA are not required or claimed.
After design approval, use `superpowers:writing-plans` for Stage 1; no code has
been authorized merely by choosing this delivery approach.

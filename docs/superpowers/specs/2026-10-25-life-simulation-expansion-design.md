# Unequal Lives and Historical Turning Points

Status: **draft for user review**. The interview decisions below are confirmed;
the detailed rules marked as design proposals still require approval of this
document. This task produces a specification and implementation plan, not game
code or a deployment. Branch: `codex/life-simulation-spec`, based on `origin/main`
at `9d19b9a` on 2026-10-25 (Asia/Bangkok).

## Review these proposed details first

Your interview decisions are recorded separately below. The following important
details are Codex proposals, not decisions you have already made:

1. **Historical adaptation:** use K417/K425 as working anchors; faction offers
   end at K430 and player ranking challenges start afterward. Exact years rely
   on a secondary chronology; later stories are authored continuation.
2. **Origin restriction:** Demon Continent-only births apply to new protagonists;
   children born during a family's migration use the actual family home.
3. **Balance:** start new-bloodline Laplace Factor at 0.1%; use Superd lifespan
   600/maximum 800; use the proposed wealth distributions and survival benchmarks.
4. **Bounded family simulation:** initially allow six distinct spouses and twelve
   direct children per protagonist; preserve later generations through compact
   records. These are implementation-scope limits, not setting lore.

## Intent

Make a character's origin, material circumstances, education, inherited traits,
relationships, and historical circumstances determine a substantially different
life. A good ordinary life is a valid outcome. Exceptional power is possible,
but neither reincarnation, deliberate training, wealth, nor rare genetics should
guarantee it. Early death must be a real outcome, not an event confined to
obviously dangerous choices.

Keep the existing reincarnated protagonist, browser-local play, original prose,
English/Thai support, and illustrated chronicle. No account, backend, online AI
story generation, tactical battle system, or playable dynasty is included.

## Confirmed interview decisions

### History and delivery

- Use a shared world calendar. Birth year determines which historical events
  overlap a life; age, location, and circumstances determine involvement.
- Major historical outcomes remain fixed. Players affect personal and local
  outcomes rather than preventing the Mana Calamity or rewriting the setting.
- Randomize birth year uniformly from 20 years before the Mana Calamity through
  10 years afterward, inclusive: 31 possible years. Show it on the birth record.
- Include original regional conflicts alongside named historical events. Identify
  invented conflicts and numerical balance as authored game material.
- Use a separate, versioned simulation for new lives. Existing lives continue
  under their existing rules. Reuse presentation and safe shared utilities.

### Origin, education, and achievement

- Add **Superd as the only new playable race**. Keep human, elf, Beastfolk,
  Migurd, and dwarf. Do not introduce a broader Demon/tribe taxonomy.
- Superd target approximately **90% mortality before age 15 under typical starting
  conditions**. This is a population balance target, not a predetermined verdict
  on each newborn. Protection, resources, and decisions can improve survival.
- University is normally funded by family wealth. **Special talent can earn a
  scholarship**, including for a poor character. Poverty alone is not eligibility.
- Nobility/social status, occupation, faction affiliation, and exceptional titles
  coexist. A noble can also be a knight or mage.
- Only Seven Great Powers positions **5, 6, and 7** are attainable. Positions
  **1–4 are inaccessible**.

### Factions and inheritance

- Random encounters generate faction recruitment offers. Joining Orsted's
  organization or Hitogami's apostles requires accepting a player decision.
- Laplace Factor inheritance operates from parents to protagonist and protagonist
  to children. The next playable run is a separate reincarnation.
- The factor is fixed at generation and discovered gradually through observable
  signs, training, or assessment. Reloading cannot reroll it.

### Family and legacy

- Allow remarriage and simultaneous adult marriages where local customs permit.
  Track each spouse independently and reflect household consequences.
- Children can form families and have children during the protagonist's lifetime.
  Use lightweight simulation, named close relatives, and compact later-generation
  records. Count surviving descendants at the protagonist's death.
- Existing lives and old archives receive summaries only from recorded facts;
  do not invent missing marriages, education, wars, ancestry, or descendants.

The original request also requires easier noble starts; stronger economic and
social barriers for demon peoples and Beastfolk; poverty-related mortality;
Demon Continent-only demon protagonist births; diverse gated careers; and a
detailed retrospective. The following sections make these implementable.

## Approaches

1. **Separate versioned simulation — selected.** Keep the existing engine's rules
   for legacy lives and add a focused expanded simulation for new lives. Share
   rendering, catalogues where safe, and the pure seeded RNG implementation.
   Costs: two rule sets need explicit routing and compatibility tests.
2. One shared engine with version checks. Less duplicated orchestration, but
   every new economic, mortality, event, and career rule can accidentally alter
   legacy futures. The user selected the first approach to reduce that risk.

Do not rewrite the application shell or refactor the legacy engine merely to
make the new simulation fit. Build the expansion in independently verified
phases; expose it as the default new-life rules only after the whole flow passes.

## What exists today

`six-faced-life/src/game/engine.ts` creates seeded births, picks a family
background independently of race, selects a starting old-age limit, and manages
choices, annual growth, income, and endings. There is no world year, material
deprivation model, structured education, faction state, or inherited factor.

`types.ts` stores one career and a small family list; `progression.ts` has five
working promotion tracks and five magic disciplines. `events.ts` combines 55
events with fixed-age milestones and spaced random decisions. `storage.ts`
validates version-1 lives, caps family at 30 and age at 300, and retains one active
life plus the 20 most recent completed lives. These limits cannot simply be
applied to the new family model or long-lived Superd.

`components/Archive.tsx` already shows death cause, a short legacy, rank snapshots,
timeline, and chronicle. Extend it into a structured retrospective rather than
creating an unrelated memorial product. Current historical verification in
CONTINUE.md is context, not fresh evidence for this expansion.

## Architecture and compatibility contract

These are proposed engineering decisions for approval with this document.

- Keep the current save key, `six-faced-life.v1`, and outer envelope version 1.
  Treat an absent rules discriminator as `legacy-1`. New lives use
  `ruleset: "expanded-1"` plus a versioned, validated expansion record. The current
  life `version: 1` remains the base record version; ruleset is a separate concept.
- Define a discriminated legacy/expanded life union. Separate validators and
  engine routing must cover creation, begin, advance, choices, yearly focus,
  study, progression views, ending, and archive restoration. An unknown ruleset
  is unsupported data: show recovery and preserve the original storage.
- Freeze legacy birth pools, event catalogue, progression rules, RNG draw order,
  pending choices, and future behavior at the current baseline. An expanded
  catalogue must not leak new events or races into a legacy life.
- Give new events and choices stable namespaced IDs. Existing IDs remain valid;
  legacy pending decisions must resolve through the legacy registry. Validate
  seen/pending IDs against that life's ruleset, not one global expanded map.
- Store the expanded world's seed separately from its mutable personal RNG.
  Regional schedules are pure functions of world seed, region, and year, so
  visiting a region or opening a view cannot create, move, or reroll a conflict.
- At fixed inputs, complete saves, pending outcomes, family simulation, and
  summaries are deterministic. Rendering and language never consume RNG.
- Expanded records contain structured origin, locality, economy, education,
  career history, public standing, faction history, genetics, relationships,
  descendants, historical exposure, and summary facts. Retain the existing base
  fields required by shared views; do not encode new rules in translated prose.
- Store a completed summary snapshot on death. Opening an archive must not run
  the simulation, reinterpret old facts using new balance, or change RNG.
- A legacy retrospective can display known identity, age/cause, location, final
  skills/career, recorded events, and identifiable family. Explicitly mark
  unrecorded requested fields as unavailable. Do not equate a partner flag with
  a legally recorded marriage, or absent descendants with zero descendants.

### Bounds and storage

Expanded simulation supports ages through 1,000; the initial race maximum is 800.
Keep legacy age validation at 300. The exact lifecycle of each person is stored
in world years, with a validated relationship to the protagonist's birth year.

Proposed caps per expanded life: 600 chronicle entries, 64 individually recorded
close relatives, 32 other named relationships, 256 demographic descendant
cohorts, 64 achievements, 128 historical/faction records, and 512 compact summary
facts. Careers have one ledger per supported profession. Spouse and direct-child
records take priority over replaceable distant-relative detail.

Compaction must retain counts, close relationships, marriage/career history,
major failures and achievements, historical exposure, and facts needed for the
summary. Never silently turn untracked people into dead people or lose an
inherited-factor count. Later generations aggregate by generation, birth year,
race/lifespan band, and survival status; counts use safe integers.

Stay within the current 6,000,000-character loader ceiling. A worst-case seeded
fixture with one active and 20 completed expanded lives must remain loadable;
measure serialized size and browser write/read behavior. Exact compact encoding
is left to the builder. Browser quota failure still uses the existing visible
not-saved state and retry behavior; never silently delete archive members,
overwrite unreadable storage, or clear player saves to recover.

## World calendar and historical participation

Use integer world years and character age. Proposed working anchors are Mana
Calamity **K417**, Asura succession climax **K425**, and a named-event catalogue
ending at **K430**. This gives birth years **K397–K427**, uniformly sampled.
K-year mapping is sourced from the secondary chronology below, not an official
statistical dataset; publisher descriptions corroborate the story arcs but do
not establish those exact years. Record that limitation in the world guide.

The fixed Asura outcome is Ariel's accession. Describe the event as the
**Asura succession conflict**, including the user's civil-war theme through
political struggle, violence, displacement, and local military involvement.
Do not imply an independently verified kingdom-wide, multi-year war chronology.

Proposed named-event exposure:

| Event | Direct exposure | Other possible involvement |
| --- | --- | --- |
| Mana Calamity, K417 | In the Fittoa locality when it occurs | Missing relatives, refugees, relief work, disrupted trade, later news |
| Asura succession, K424–425 | Asura court/military/political ties and locality | Escorts, supply work, healing, displacement, choosing neutrality |
| Other conflicts | Affected region/year or an accepted assignment | Migration, prices, conscription pressure, aid, bereavement |

Add locality beneath region; all of Asura must not be treated as Fittoa. Proposed
new Asura birthplace weights are Fittoa 20%, capital 15%, other countryside 65%.
Travel updates locality as well as region. A character can be directly affected
as a child without being offered an adult political or military role.

Store exposure as direct participant, civilian affected, aid/support, remote
news, or no exposure, with actual actions/outcomes. Hearing news is not war
service. A life born after an event never receives it as an active encounter.
Pre-birth losses may shape generated family circumstances, but are labeled family
background rather than something the protagonist remembers personally.

Every region receives a deterministic schedule of original conflicts, with at
least five quiet years between conflict starts in the same region. Proposed
annual start probability outside that cooldown is 3%; duration is 1–3 years.
Severity, exposure, and local costs vary. Original conflicts never replace fixed
anchors or change their outcomes. Beyond K430, use explicitly authored regional
continuation rather than pretending to reproduce unverified future canon wars.

Named faction recruitment is confined to the researched story window: Hitogami
offers K417–430; Orsted organization offers K425–430. No pre-founding Orsted
Corporation encounters. Lives missing these opportunities remain valid lives.
Existing members can retain their affiliation afterward, but later missions are
identified as authored continuation and do not claim new canon outcomes.

### Scheduling and playback

The new engine keeps pause-on-decision, hidden-tab suspension, safe reload, and
immediate persistence. Regular random decisions retain the 25% eligible-year
chance and three-year minimum gap. Scheduled historical and important family
milestones may bypass that gap, as fixed milestones already do.

An annual transaction applies economic/health/aging consequences and checks
survival before offering new opportunities. Never offer decisions to a dead
character. Surviving characters receive due historical consequences once, then
calendar decisions, personal fixed milestones, family milestones, and finally a
possible random opportunity, in that order. Resolve ties by stable event ID.
Persist the bounded due-decision queue; resolving a decision does not advance
another year. Revalidate remaining offers after each choice; invalid offers
expire with a factual record where relevant. Annual effects must never replay
while draining the queue. A character born in an anchor year receives applicable
birth-year history after the first-memory choice, before the first annual tick.

Watch mode remains affordable and cautious. It must not silently commit a
faction allegiance, new spouse, dangerous military service, or legendary duel:
these consequential offers pause for a manual decision even with watch enabled.

## Birth, inequality, and race paths

Preserve optional name, optional starting region, and language selection. Race
and family remain seeded birth lotteries; this update adds no race picker or
birth-year picker. A chosen region conditions its existing eligible race pool.
Add Superd only to the Demon Continent pool, proposed pool weights there:
Migurd 65%, dwarf 30%, Superd 5%. Leave other regional birth weights unchanged.

Migurd and Superd are the two playable demon peoples for these rules. New
**protagonists** of either are born only on the Demon Continent. This is a
new-life origin restriction, not a ban on migration. Proposed family-simulation
interpretation: children born after migration use their parents' actual home;
their birth is not relocated to enforce the protagonist's starting lottery.

Use separate family wealth and social status. Initial non-noble wealth weights
are proposed balance, not canon demographics:

| Race | Poor | Modest | Comfortable | Extremely wealthy |
| --- | ---: | ---: | ---: | ---: |
| Human | 45% | 35% | 17% | 3% |
| Elf | 35% | 40% | 22% | 3% |
| Dwarf | 35% | 40% | 22% | 3% |
| Beastfolk | 70% | 23% | 6% | 1% |
| Migurd | 80% | 16% | 3.5% | 0.5% |
| Superd | 90% | 9% | 0.9% | 0.1% |

Generate noble status separately in states with an applicable nobility. Proposed
birth chances: Asura human 6%/elf 2%; Ranoa human 3%/elf 2%/dwarf 1%; Millis
human 4%/dwarf 1%; other starts 0%. A noble start replaces the non-noble wealth
draw with comfortable 80%/extremely wealthy 20%, plus a recognized family contact,
basic education access, and family-funded equipment/training opportunities.
Nobility does not grant combat competence or guarantee protection from war.
Locally influential non-noble families remain possible elsewhere.

Distinct race paths should be visible through context and opportunity, not an
assertion that a people are inherently inferior:

- Humans: shorter lifespan, strongest access to dominant human institutions.
- Elves: long planning horizon; displacement and changing relationships matter.
- Dwarves: craft/trade apprenticeship access and durable livelihood alternatives.
- Beastfolk: kinship/local community opportunities; economic and outsider barriers
  when entering distant institutions, with education improving mobility.
- Migurd: Demon Continent origin, strong poverty weight, local survival/community
  routes, and difficult but possible travel and educational mobility.
- Superd: these material barriers plus extreme childhood survival pressure and
  persecution; protection, community, migration, and trust can make a difference.

Keep existing lifespans for the five existing races in new lives unless balance
verification requires an explicitly reviewed change. Proposed Superd aging values
are lifespan 600, maximum age 800; these are authored simulation values. Qualify
as adult for romance at age 18 in every race, preserving the current adult-only
boundary. Age 15 remains the ordinary working-age milestone, not romance age.

## Economy, danger, and mortality

Replace automatic positive annual savings with income minus actual necessities,
education, travel, dependants, and chosen spending. A poor household may fail to
cover needs. Keep coins nonnegative; record unmet food, shelter, and care instead
of hiding deprivation behind a zero balance. No lending/debt system is required.

Children depend on household resources, not an adult salary. Material household
support is separate from the protagonist's spendable purse. Noble family access
helps education and knight equipment but is not unlimited free money. Status,
assets, household support, and personal savings are separate summary concepts.

New lives draw an aging limit as one input, but childhood and adult survival
also use yearly cause-specific risks: malnutrition, illness, unsafe work,
violence/conflict, travel, and later-life decline. Race lifespan affects aging;
poverty, access, exposure, training, and health affect danger. Resting helps
health but cannot conjure food or eliminate persecution.

Use cause-specific survival checks in a stable documented order; record the
actual lethal cause and relevant circumstance. Do not label starvation or
war deaths as a gentle generic health decline. Harmful choices can also kill
immediately, retaining the selected cause and preventing later queued decisions.

The Superd target is measured with a frozen cohort of at least 10,000 uniformly
sampled new-life seeds, using balanced focus and the first enabled free,
non-dangerous, non-allegiance option. Report the fraction with death age **<15**;
accept 87–93%, centered on 90%. Do not count deaths at age 15 as childhood deaths.
Calibrate an explicit Superd exposure coefficient; do not preassign the 90% at
birth or force deaths to make a running quota. Matched protection/adequate-care
cohorts must improve survival materially, by at least 10 percentage points.

For other races, exact base hazards and resource prices are builder-authored
balance configuration. Freeze and document their values before implementation
completion. Acceptance requires matched poor cohorts to have at least twice the
pre-15 mortality of comfortable cohorts, and a difference of at least 5 percentage
points, without making every poor life terminal. Wealth and safety improve odds;
they never make mortality zero.

Show plain-language danger and material-need warnings, with actionable mitigations
where available. Birth records explicitly identify Superd as an extreme survival
start and explain the population-level 90% target. The player may start again
through the existing new-life action; do not add automatic rerolls or guaranteed
hero protection.

## Talent, education, and careers

Talent is distinct from current skill, educational access, and social standing.
Generate persistent magical and academic potential independently of Laplace
Factor; propose a 1% exceptional tail for each, using independent seeded draws.
Potential modifies learning or eligibility but grants no learned spells or titles.

University admission requires demonstrated magical or academic readiness as well
as funding. Scholarship qualification requires the corresponding exceptional
talent plus observed performance through basic practice, an examination, or a
teacher's assessment. At least one discovery route must be available without
paid schooling, so poverty does not make qualification circular. A Laplace
Factor alone is not an admission letter. Martial talent can open sword-school
opportunities; it is not automatically a magic-university scholarship.

Family-funded education must budget admission, tuition, living expenses, and
travel. Extremely wealthy demon/Beastfolk families can realistically fund this;
most poorer families cannot. Higher travel and reduced access arise from actual
location and social circumstances, not an unexplained race-only tuition surcharge.
A talent scholarship covers all necessary tuition, living, and travel costs.
Maintenance requires study and progress: warn on failure, allow one probation
year, then withdraw funding if progress still fails. No surprise retrospective
debt. Graduation requires successful completion; attendance alone is not a degree.

Education improves eligible employment, contacts, and mobility without erasing
prejudice or guaranteeing a prestigious position. Record attendance, scholarships,
interruption/failure, graduation, and relevant research achievements.

Retain merchant, healer, guard, and retirement alongside the requested paths.
The following gates are semantic requirements; the plan will pin numerical skill,
cost, experience, and reputation thresholds in a single balance manifest.

| Path | Entry requirements | Progression and meaningful limits |
| --- | --- | --- |
| Farmer / ordinary work | Working age, local work access, suitable health | Farmhand/smallholder or local labor; modest pay, harvest/work risks; no hero prerequisite |
| Adventurer | Guild registration, basic survival readiness | Guild rank, completed work, skill and reputation; lethal work is optional and labeled |
| Swordsman | Demonstrated sword training and access to a school/employer | School ranks and paid instruction/retainer work; skill is separate from knight status |
| Mage | Demonstrated discipline mastery and instruction | Paid practice/research roles; advanced mastery needs teachers and achievements |
| Priest / cleric | Institutional acceptance, relevant knowledge and healing skill | Service, trust, training, and doctrinal obligations; distinct from secular healer |
| Knight | Martial qualification, equipment, recognized service and patronage | Noble contacts lower access barriers; commoners need a credible service/merit route |
| Teacher | Literacy, subject competence, suitable reputation | Experience and teaching achievements; ordinary teaching need not require university |
| Professor | Degree, advanced subject mastery, research and teaching record | Scarce appointment opportunity; wealth alone cannot buy competence |
| Noble status | Birth, or exceptional service plus recognized grant | Land/obligations/political risk; not a replacement for the person's occupation |
| Seven Great Powers 5–7 | Exceptional combat mastery, major feats, public renown, qualified challenge | Extremely rare title; never an ordinary promotion and never positions 1–4 |

Keep one primary paid occupation at a time. Preserve per-career experience,
qualifications, and history on a switch; no automatic wages from every past job.
Changing into an unrelated job starts its own entry requirements. Re-entry can
reuse experience but still needs an actual available appointment. Record the
whole career timeline, promotions, dismissals, voluntary changes, and retirement.

Eligibility is not a guaranteed offer. Show met/unmet requirements and the
remaining access barrier. Nobles qualify for knight opportunities considerably
more easily through training, equipment, and patronage, while still needing
martial competence. Every adult has an ordinary-work route appropriate to their
health/location; having access to work does not guarantee adequate income.

### Exceptional titles and fixed history

Proposed boundary: fixed historical outcomes do not freeze every personal title.
Player challenges for positions 5–7 are authored personal divergences, outside
fixed canon battles. They cannot kill/displace an essential canon participant
before that participant's scheduled historical role. Gate title contests until
after K430; use an abstract contender ledger rather than inventing quotations or
claiming an exhaustive canonical ranking history. Explain this adaptation in the
world guide. Qualification requires mastery, multiple distinct major feats,
renown, and victory; losing or declining remains possible. The Laplace Factor
is neither required nor sufficient. A title can later be lost and remains in
the achievement/history record.

## Factions and political involvement

Availability depends on year, age (18+), contact/exposure, ability, reputation,
and existing allegiance. Ordinary lives can encounter an offer, but most do not.
Proposed qualified-offer chance is 2% per eligible year/contact; after refusal,
wait at least five years before another offer from the same faction. This is
part of the normal random-opportunity system, not an extra annual interruption.

Show material benefits, obligations, and visible danger before acceptance.
Affiliation can alter assignments, political relationships, hostile encounters,
trust, safety, and family exposure. Do not provide a permanent free-stat buff.
Accepting an offer does not make the player central to canon events.

One active allegiance at a time. Defection is possible only through a dedicated
event; it leaves recorded obligations, lost trust, and possible pursuit. No
instant safe side-switching. Refusal does not secretly count as membership.
Hitogami encounters use advice, dependency, manipulation, and consequences;
Orsted contacts use work, trust, and strategic obligations. Authored missions
must not pretend to be additional verified scenes from the source novels.

Keep political involvement independently from paid occupation. A neutral farmer,
court mage, campaigning knight, or refugee healer can have distinct records.

## Laplace Factor

Proposed first-release genetics are a bounded, explicit model rather than a
claim about biological Mendelian inheritance:

- A new bloodline has a **0.1%** spontaneous-factor probability. With one known
  carrier parent use **20%**; with two use **40%**. Do not stack an extra
  spontaneous roll after a successful inherited roll. Parent genetics exist
  before generating the child; infer no parentage from current player stats.
- A carrier receives one primary manifestation: mana potential 60%, unusual
  appearance 25%, physical potential 15%. Manifests gradually; some carriers
  remain unrecognized for their whole life. An appearance-only case grants
  no hidden combat bonus.
- Mana potential increases capacity and training ceiling, not current skill.
  Physical potential affects aptitude, not instant proficiency. Half the mana
  cases also have impaired battle-aura compatibility, limiting the corresponding
  sword/combat development route. Training, instruction, health, and environment
  still determine results. The plan must define this limitation explicitly rather
  than implying the current sword stat already models battle aura.
- Keep Superd's natural identifying features separate from factor signs; green
  hair alone cannot diagnose the factor. Likewise appearance is not a reason to
  classify an elf or human child as Superd.
- Parents and descendants use persistent genetics. In mixed families, retain both
  ancestries and a seeded primary race identity; lifespan blends parent race
  bands. Mixed ancestry adds no seventh playable race in the new-life form.
  Specific race modifiers to manifestation and training are left to the builder,
  documented as balance and verified not to create automatic success.

The simulation may store latent traits, but the live interface exposes only
observed signs and discovered knowledge. Summary narration cannot reveal a
diagnosis never established in life. Genetics tests can inspect latent data;
player text cannot. Exact factors and percentages above are authored proposals;
the cited lore establishes varied manifestations, not these probabilities.

## Relationships, spouses, and descendants

Use named relationship records with identity, role, ancestry, birth/death years,
relationship strength, important shared events, and alive/dead/estranged state.
Parenthood, marriage, friendship, rivalry, enmity, and faction ties are distinct.
An aggregate bonds stat cannot substitute for individual relationship history.

Marriage requires both people to be adults. Record start/end, separation,
widowhood, divorce, and later remarriage. Count distinct spouses ever married,
not relationship events, and distinguish current spouses from total spouses.
All first-release marriages require mutual agreement. Proposed regional customs:
Millis institutions recognize one current spouse; other regions can recognize
multiple spouses subject to existing partners' acceptance. These are simplified
game rules; individual beliefs can create conflict. A marriage rejected by local
institutions is not silently granted official recognition.

Proposed household bounds are six distinct spouses over a lifetime and twelve
direct children. When a limit is reached, do not keep producing unauditable family
events: explain the simulation limit and offer family-focused alternatives.
No existing family is deleted on migration, job change, or a new marriage.

Lightweight annual family simulation handles schooling, livelihoods, partnerships,
births, illness, deaths, and major relationship changes. It uses its own stored RNG
stream so adding a cousin's event does not reroll the protagonist's next danger.
Children can have children; distant generations become cohorts within the stated
bounds. Track enough ancestry to avoid duplicate descendant counting across
branches; the first version does not generate partnerships between relatives.
Do not recursively run the full player engine for each person.

Choices affect support, education, safety, time, affection, and trust. Wealth does
not automatically create loving relatives. Family deaths and displacement in a
conflict must match exposure and actual survival checks. Social encounters can
create important friends, rivals, and enemies, with persistent consequences.
Provide non-romantic lives and childless lives as normal, complete outcomes.

## Death and life retrospective

Generate the completed retrospective synchronously from stored facts and authored
English/Thai templates. No online model call or invented biography. The snapshot
must include the following, grouping details into readable sections:

| Section | Required facts |
| --- | --- |
| Identity and ending | Age and world year at death; actual cause; birthplace/locality, race/ancestry, family wealth/status |
| Childhood and opportunity | Upbringing, deprivation/protection, discovered talents, schooling, scholarship, graduation or interruption |
| Work and public life | Full occupation progression, status changes, major achievements/failures, historical exposure, war roles, affiliations and political involvement |
| Family and relationships | All marriages and distinct spouse count; children born, surviving children and total surviving descendants; significant parent/spouse/child relationships; key friends/rivals/enemies |
| Material legacy | Wealth at death, peak personal wealth, assets/status, reputation, exceptional titles won/lost, community/family impact |
| Narrative | A coherent life story linking circumstances, decisions, struggles, relationships, and observed consequences |

A cause, count, career, or achievement may be absent because it did not occur;
say so accurately. Distinguish zero from unknown in legacy lives. A failed
scholarship, lost title, bereavement, or failed venture remains part of the
story after later success. Never claim to know a character's unrecorded motives.

Narrative length follows lived experience: roughly 80–180 words for short lives,
200–450 for ordinary adult lives, and at most 650 for extensive lives, alongside
the structured facts. These are English editorial targets; Thai needs equivalent
content and readable paragraphs, not English word-count enforcement. Childhood
deaths receive a respectful short account without inventing adult milestones.
Long lifetimes need durable facts independent of the last 600 chronicle entries.

The ending and archive show the same immutable snapshot. Statistics and narrative
must agree. An ordinary farmer or teacher can leave a strong family/community
legacy without combat fame; reputation is not just a proxy for martial strength.

## Interface and accessibility

Reuse parchment, forest ink, restrained gold, original artwork, literary serif,
practical sans-serif, and the self-hosted English/Thai fonts. Add useful details
to the birth record, character/progression views, world guide, family section,
and retrospective. Do not replace the established navigation with a dashboard.

Show age and world year together for expanded lives. Explain origin restrictions,
material need, survival danger, university requirements, social access, career
readiness, faction obligations, and discovered traits in plain language. Use
disclosures for genealogical detail and full career/marriage histories. Do not
make the main chronicle require reading an entire family tree before continuing.

All new choices, outcomes, requirements, histories, warnings, summaries, help,
errors, and accessible labels ship in English and Thai. Canonical IDs and saved
facts remain language-independent. Names remain as entered/generated. Preserve
life-fixed language, mixed archives, focus restoration, keyboard playback,
mobile reading order, reduced motion, and the existing visible save recovery.

## Acceptance and verification

### Compatibility and deterministic play

- Freeze fixtures for pre-expansion legacy births, pending choices, promoted
  careers, English/Thai lives, endings, and mixed archives. Identical legacy
  actions preserve future outputs and RNG at each checkpoint, not just loadability.
- Restore expanded saves during a historical event, economic crisis, scholarship,
  faction offer, family milestone, discovered/latent factor, and after death.
  Future state equals uninterrupted play; views and locale never mutate it.
- Validate malformed/unknown rulesets, foreign pending IDs, impossible ages/year
  relationships, invalid genetics, cyclic ancestry, duplicate person IDs, unsafe
  counts, negative resources, and corrupted summary data without data loss.
- Exercise due-event queues, same-year births, decisions that invalidate later
  offers, early death, hidden tabs, fast playback, watch/manual boundaries,
  immediate persistence, and repeated read/write failure recovery.

### Population and opportunity

- At least 10,000 seeded births verify the 31-year range, region-conditioned
  race restrictions, higher demon/Beastfolk poverty, and noble advantages.
- Run the Superd and matched-resource survival cohorts described above. Measure
  actual death ages, causes, and protective effects. Do not force counts or
  condition the cohort on survivors.
- Exercise every career, ordinary work, switching/re-entry, noble/commoner knight
  access, funded university, talent scholarship, probation/withdrawal, and degree
  requirements. Eligibility and actual income agree with displayed requirements.
- Verify low-rate faction opportunities, explicit acceptance/refusal, date gates,
  obligations and defection. Verify Seven Great Powers positions 1–4 cannot be
  obtained through any event, migration, career switch, or save-normalization path.
- Test spontaneous/inherited factors, all manifestations and drawbacks, hidden
  discovery, training dependence, and poor outcomes despite rare talent. Batch
  reports include ordinary careers, childless lives, and early deaths.

### Family, history, and summary

- Test multiple spouses, regional marriage constraints, remarriage, spouse death,
  independent relationship changes, children/grandchildren/cohort compaction,
  long-lived races, inheritance, distinct descendant counts, and record limits.
- Direct Fittoa victims, other Asura residents, distant observers, post-event
  births, neutral civilians, soldiers and aid workers receive different accurate
  historical records. Fixed outcomes do not depend on player rank or faction.
- Compare every retrospective category to recorded facts, including failed
  careers, multiple marriages, zero/unknown descendants, lost titles, old lives,
  and very early deaths. Locale changes do not alter the facts.
- Measure worst-case save size and bounded long-life simulation; compacted facts
  and aggregate counts survive reload and reproduce the same completed summary.

### Application verification and delivery

Run `npm test` and `npm run build` from `six-faced-life/`. During implementation,
add targeted failing behavior tests before each feature and run them to green.
Do not claim nonexistent lint/typecheck/e2e scripts or unrun remote checks.

Use a separate QA origin, never the player's `127.0.0.1:5173` storage. Check desktop
and narrow mobile English/Thai flows: birth, deprivation, career eligibility,
scholarship, historical event, faction refusal/acceptance, family, death, archive,
reload, keyboard focus, overflow and console errors. A seeded QA harness may
prepare bounded scenarios without weakening production rules or exposing a
player-facing cheat system. No deployment is part of this task.

Review full diffs and `git diff --check`; update relevant product/setup/design
documentation and CONTINUE.md only as behavior is actually implemented. Commit,
push the task branch, and create/update a PR explicitly targeting `main` under
AGENTS.md. Incomplete/unverified implementation stays draft. The user merges.

## Proposed implementation phases

These phases explain dependency order; they are not a substitute for the detailed
implementation plan. No phase is implemented by this documentation task.

1. **Versioned foundation:** legacy fixtures and routing, expanded validated
   state, deterministic streams, summary ledger, calendar and coherent origins.
2. **Survival and opportunity:** household economy, race/social differences,
   mortality calibration, talent, education, ordinary/advanced careers and status.
3. **Historical and political lives:** localities, fixed events, original
   conflicts, factions, consequences, and exceptional title challenges.
4. **Family and inherited legacy:** individual relationships, marriages,
   descendants/cohorts, genetics/discovery, and complete death snapshots.
5. **Playable presentation and release verification:** incremental UI integration
   throughout earlier phases, full English/Thai coverage, end-to-end browser QA,
   population reports, final review and documentation. Only then enable expanded
   new lives by default; retain legacy routing indefinitely for existing saves.

Every phase includes focused tests and serialization boundaries. Interface names,
exact files and per-task checks belong in the plan written after spec approval.

## Source notes and authority

Existing application requirements come from [PRODUCT.md](../../../six-faced-life/PRODUCT.md),
[README.md](../../../six-faced-life/README.md), [DESIGN.md](../../../six-faced-life/DESIGN.md),
the [first-release design](2026-10-23-six-faced-life-design.md), and the
[Thai-language design](2026-10-25-thai-language-design.md). This draft supersedes
their behavior only for expanded new lives after approval and implementation.

Sources consulted 2026-10-25:

- [Seven Seas, light novel volume 3](https://sevenseasentertainment.com/books/mushoku-tensei-jobless-reincarnation-light-novel-vol-3/): official publisher corroboration for the teleportation-disaster journey and Superd encounter. Promotional language is not a demographic or moral judgment about a people.
- [Seven Seas, light novel volume 17](https://sevenseasentertainment.com/books/mushoku-tensei-jobless-reincarnation-light-novel-vol-17/): official publisher corroboration for Orsted's plan, the Asura succession and political danger.
- [Mushoku Tensei Wiki, Timeline](https://mushokutensei.fandom.com/wiki/Timeline): secondary working reference for K417, K425 and K430. Search-index content was accessible; direct retrieval returned HTTP 402. It mixes light/web-novel material and labels some later dates approximate. No exact primary-text date audit is claimed.
- [Mushoku Tensei Wiki, Laplace Factor](https://mushokutensei.fandom.com/wiki/Laplace_Factor): secondary reference for inheritance and differing manifestations, including mana, appearance and physical/battle-aura effects. Search-index content was accessible; direct retrieval returned HTTP 402. The proposed probability model and race effects are game balance, not sourced genetics.

No source establishes the 90% mortality target, socioeconomic distributions,
scholarship rates, lifespans used by the simulation, or genetic percentages in
this document. Those are user choices or explicit authored proposals. Do not
copy source prose, scrape artwork, or treat captured material as executable code.

## Review status and next gate

The user approved the interview decisions and versioned-engine approach. The
full specification has not yet been approved. A fresh read-only builder review
on 2026-10-25 reported **"nothing important left"**: no unanswered material
question prevented planning. This is a specification review, not implementation
verification or a primary-source lore audit.

After review, resolve any consequential ambiguity with the user, update this
document, and ask for approval of the concrete spec. Then write and self-review
`docs/superpowers/plans/2026-10-25-life-simulation-expansion.md` using the
writing-plans workflow. The user requested planning; do not begin game
implementation merely because the plan exists.

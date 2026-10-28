# Talent frequency and learning

Approved in chat on 2026-10-28: the user accepted one mutually exclusive talent
roll per new character (20% magic, 20% academic, 20% swordsmanship, 40% none),
then approved a 25% bonus to relevant learning with "yes, pls update it".

## Behavior

- New expanded characters and individually modeled relatives use these birth
  odds. No new character has multiple talents. Talents remain independent of
  inherited-factor carrier status and manifestation.
- Magical talent multiplies positive magic experience by 1.25; swordsmanship
  talent multiplies positive sword experience by 1.25; academic talent multiplies
  positive knowledge learning by 1.25. Apply to yearly focuses, learning choices,
  training skill milestones and existing occupation skill gains. Preserve
  fractional progress and existing knowledge caps. Do not multiply losses.
- Keep inherited-factor bonuses and gates; annual practice combines their
  existing multiplier with the relevant talent multiplicatively.
- Talent works before discovery, but its name/bonus remains hidden until the
  free assessment. EN/TH results describe each relevant +25% bonus. No-talent
  results continue to explain that skills develop through practice.
- Preserve existing assessment +20 and scholarship rules for magic/academic
  talent. Sword talent alone grants neither an academic bonus nor a university
  scholarship. Ordinary career entry still requires no talent.

## Compatibility and boundaries

Existing expanded lives retain magic/academic flags, even when both are true.
Missing sword talent migrates to false for active protagonists/individual
relatives without RNG consumption, resetting, or editing historical snapshots.
Old archives remain readable without rewriting their summaries. Validate new
fields and reject malformed flags. Legacy rules remain frozen.

Implementation choices: retain two talent RNG draws per birth (use the first
for the categorical outcome) to preserve unrelated random-stream alignment.
Training retains its approved 2–3/full-time and 4–6/part-time years, prices,
funding, qualifications and placement; boost the skill milestone, not attendance
units. Bonuses affect future gains only, with no retrospective XP grants.

## Approach

Independent 20% rolls would produce 48.8% with any talent, so use one categorical
roll to meet the approved 60% total. Extend the current genetics flags with a
compatible sword flag rather than replacing persisted data with an incompatible
enum. Use shared pure multipliers at existing learning boundaries.

No broader career rebalance, new dependencies, publishing or main integration.

# Family in the pixel life scene

Status: approved in chat, implemented and verified, 2026-11-11.
[PR #24](https://github.com/ny147/1-in-mushoku-tensei/pull/24) targets main;
the user merges manually. No publication.

## Intent and confirmed scope

Show the protagonist's partner and children in pixel art so the scene conveys
that they are together. The user confirmed that only living family who share
the protagonist's current region should appear. Hide absent family members.

## Approach

Reuse the existing layered body and everyday-outfit sprites in the chronicle.
This is the recommended approach: it matches the approved artwork, includes
race and age variants, and shares the existing motion and fallback behavior.
New standalone family paintings would not adapt to individual family facts;
a separate canvas renderer adds unnecessary complexity for this small addition.
The user approved this design and requested implementation in chat.

## Visibility

- For expanded lives, derive companions from individual family records without
  modifying the life, consuming randomness, or adding save fields.
- A spouse must be alive, share `life.region`, have an active marriage, and
  remain partnered with `self`. Mere introductions and former spouses do not count.
- A direct child must be alive, already born, and share `life.region`.
  A child's visibility is independent of the parents' marriage status.
- Use each person's recorded race and age, with existing life-stage boundaries.
  Do not infer gender or reveal latent genetics. Adult children look like adults.
- Region equality is the available proxy for living together; the simulation
  records no individual addresses or moment-to-moment whereabouts.
- Legacy lives do not record individual family homes. Keep their existing scene
  rather than inventing household members. Completed lives retain settled scenes.

## Presentation

Keep the existing protagonist, caption and controls. Add a compact, wrapping
family group beside/below the protagonist within the performer area, with
readable integer-scale sprites. Let the scene grow for large households instead
of clipping people or covering text. Family members use gentle idle poses,
not the protagonist's weapons, rank equipment or work activity.

Add an English/Thai `Together here` caption naming the present partners and
children with their relationship labels. Include the same factual information
in the scene's accessible description. Omit the family group and caption
entirely when no eligible family is present. Update immediately after state
changes and on reload; loading the scene never replays a historical celebration.

Use the existing Scene motion, reduced-motion, hidden-tab and offscreen rules.
Retain the painted fallback on failed or loading art. Preserve phone decision
visibility, existing keyboard order, and the warm-paper/forest-ink interface.

## Scope boundaries and verification

No changes to marriage, childbirth, relocation, mortality, playback, saves or
archive rules. No new dependencies, generated artwork or publishing.

Test marriage versus introduction/separation/widowhood, living versus dead or
away children, protagonist travel, child age/race, no-family/legacy states,
read-only sampling and immediate scene updates. Run the full app tests and
production build. Inspect desktop and narrow-phone EN/TH layouts, large
households, keyboard focus, reduced motion, fallback and console errors using
an isolated QA origin. Update product/design docs and CONTINUE.md with actual
verification, then deliver the task branch in a PR targeting main for manual merge.

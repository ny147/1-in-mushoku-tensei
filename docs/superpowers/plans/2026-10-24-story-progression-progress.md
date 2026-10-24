# Implementation ledger — plan: 2026-10-24-story-progression.md

Historical implementation record. The local-only and running-preview statements below describe the expansion handoff. The user later authorized task commits, Git pushes, and PRs; read [AGENTS.md](../../../AGENTS.md) and [CONTINUE.md](../../../CONTINUE.md) for the current workflow and checkpoint. Playable-site deployment remains separately authorized.

User chose: more story events and deeper magic/career progression. Local-only remains in force.
Resumed the October 23 checkpoint without repeating setup or original reference investigation. Main preview restarted at port5173; isolated QA at5174 preserves player saves.

Task 1: implemented. Optional versioned progression keeps existing Life/save version1 compatible. Five school XP/spell records; shared instruction gate; explicit study selection; working-role experience, reputation, three promotion steps, new titles and salary. Changing vocation resets its career track; retired salary stays at base9. Migration preserves old fields/RNG/choices and derives existing magical study without adding fake history.
Task 2: implemented. Added30 original conditional events, bringing total to55. Includes age8 specialization, mentorship/inventions, three-stage research, profession-specific dilemmas, six regional stories, adult living-family events, later-life legacy, and promotion offers. All original25 event IDs and69 literal choice IDs retained, independently checked against checkpoint.
Task 3: implemented. Study dropdown, learned/next spells, complete spellbook, career title/income/requirements in existing interface. Rapid study changes save immediately.

Validation: targeted tests observed RED before implementation, then GREEN. Added legacy migration/corruption checks, promotion affordability/skill gates, actual increased annual earnings, research follow-up outcomes, and25 full school/vocation combinations. Existing100-seed lifetime checks remain.
Fresh code review: no Important/Critical defects. Reviewer found a minor incorrect negative-silver hint for knowledge-gated assessments; reproduced RED and fixed GREEN. Shared instruction rank across schools was confirmed as the intended model.
Browser: isolated life reached age8, chose fire, changed to earth, reloaded with study retained, entered merchant career, followed invention branch, and accepted promotion at20. Title changed to Established trader and base annual income29→41 silver. Desktop1265 and mobile375 content/client widths match; console clean. UX reviewer approved the new sections.

Final verification complete:39/39 tests passed after the affordability/type fix; TypeScript/Vite production build exited0. Includes100 seeded lives plus25 school/vocation combinations. Main preview HTTP200. DESIGN.md and sidecar were merged with new component guidance/previews while preserving foundations. Design detector emitted palette/type documentation advisories; the approved visual system was retained rather than redesigned. No Important/Critical issue remains open.

Updated README, in-game help, PRODUCT.md, CONTINUE.md, and component documentation. New source checkpoint at checkpoints/six-faced-life-2026-10-24.zip; original checkpoint untouched. Main local preview retained; isolated QA preview is shut down for handoff. No external source upload/deployment.

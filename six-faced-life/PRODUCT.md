# Six-Faced Life

A single-player browser life simulator inspired by 1 in 8 Billion, in the world of Mushoku Tensei. The original protagonist is reincarnated with memories of a previous life. Players experience random family circumstances, train, make consequential choices, live to an ending, and begin another life.

Audience: fans who want a thoughtful, replayable second-life story on desktop or phone. First release in English. Original narrative, character names, code, and artwork; setting references acknowledge the original series. Fantasy probabilities are authored balance, not canon statistics.

Approved visual commitment: warm parchment, dark ink, restrained green/gold accents, serif narrative titles and sans-serif controls. The main screen is a readable chronicle with character identity, an atmospheric scene, meaningful choices, training, family, and time controls. The user approved this direction and requested implementation; do not reopen visual discovery.

Browser-local saves and archive. No account, multiplayer, payments, or AI backend. React, TypeScript, Vite; pure seeded simulation. The [original approved specification](../docs/superpowers/specs/2026-10-23-six-faced-life-design.md) records the first release; the implemented expansion below and current user decisions supersede its earlier proposals.

The user chose a story and progression expansion on 2026-10-24. The current game has 55 authored events, five separate magic study tracks and 30 spells, and experience/reputation-based promotion paths for five working vocations. Study/career requirements are visible in the existing training/character interface. Older saves migrate without resetting the life or its pending decision. The user authorized automatic task commits, branch pushes and PR delivery, then switched from Cloudflare to Vercel on 2026-10-25. GitHub Actions checks PRs; Vercel's native Git integration runs the tests and production build independently before publishing main. No deployment API token is needed in GitHub. Migration PR #5 is merged, the project is imported, and the game is live at [six-faced-life.vercel.app](https://six-faced-life.vercel.app); the first hosted release passed tests/build and isolated browser smoke checks. Browser-local saves remain origin-specific. Sites publishing remains outside this request.

## Current behavior

- Expanded careers have reliable direct access for qualified ordinary applicants
  and optional beginner training for all ten ordinary roles. Full-time training
  pays 24 coins/year instead of job wages and takes 2–3 years; part-time keeps the
  current job and takes 4–6. Courses retain progress through pauses, withdrawal
  and switches; completion retains a manual guaranteed placement, including
  during injury recovery. Advanced mastery, knight and professor remain earned.
- Voluntary education loans cover quoted unmet course/university costs through
  provider reserves. They have no interest, affordable income-surplus repayment,
  hardship/university pauses, source-aware unused-funding refunds, and no inherited
  obligations. University academic readiness, scholarships, probation and four
  successful study years remain. New controls are manual in Watch mode and save
  immediately. Existing active expanded lives migrate with no course/debt; old
  completed snapshots and frozen legacy lives remain intact.

- Expanded lives have an Optional activities menu below yearly focus from age eight. Players can browse careers and seek education/instruction, plan travel, meet people, or open legendary challenges when age/era permits. Opening an activity pauses time, persists the decision and stays manual in Watch mode. It cannot replace another pending decision. Career qualifications and fees remain real; ordinary entry is guaranteed when qualified, and prestige retains yearly vacancies. Seven Great Powers challenges are initiated voluntarily, with a safe decline option, rather than appearing randomly.

- New lives use the separate `expanded-1` ruleset. Existing lives retain legacy rules and seeded futures. Expanded origins include a uniformly sampled K397–K427 birth year, separate wealth/status, locality and Superd Demon Continent starts. Economic needs and cause-specific hazards create real early endings; care and protection improve odds.
- Expanded education has free talent assessment, readiness/funding requirements, full scholarships for demonstrated exceptional talent, probation, withdrawal and successful graduation. Independent occupation ledgers cover ordinary work and the requested specialized paths; one primary occupation earns pay. Noble standing, faction allegiance and Seven Great Powers positions 5–7 remain separate tracks.
- Named history has fixed major outcomes and local exposure. Regional conflicts and post-K430 continuation are authored adaptations. Faction recruitment, adult marriage, dangerous service and legendary challenges remain manual in Watch mode. The world guide distinguishes chronology evidence from game balance.
- Expanded family records distinguish individual relatives, adult marriages, separation, widowhood, direct children and later descendant cohorts. Genetics remain latent until observed/discovered. Death stores an immutable factual bilingual retrospective; old archives explicitly leave unrecorded facts unknown.
- Distant relatives compact into demographic profiles retaining ages, ancestry, carrier state, living/dead counts and independent random state. The one-million modeled distant-birth safety bound is disclosed if reached; further distant births are then outside the projection, while recorded people continue to age. Direct children and spouses remain individually recorded.
- Calendar/resource details and full requirement/family histories extend the existing illustrated chronicle through disclosures. English/Thai remain fixed per life. Large expanded archives use optional lossless repeated-text encoding without deleting history or silently evicting past lives.

The original-rule behavior below continues to apply to legacy lives; shared playback,
language, accessibility and recovery behavior applies to both rulesets.

- New lives offer full English or Thai. Language is fixed when the life is created, retained after reload and in the completed-life archive; legacy lives remain English. The new-life form previews its selected language without changing existing progress. Mixed archives label each life and use that life's language when reading its retrospective. Thai prose, controls, help, requirements, errors and accessible labels are authored locally; no translation backend is required.
- Water, fire, earth, wind, and healing each retain their own experience and learned spells. Study selection unlocks at age eight; changing it preserves prior study and grants no experience. Instruction rank is shared across disciplines.
- Adventurer, merchant, healer, guard, and teacher careers have three earned promotion steps. Experience, reputation, and vocation-specific skills determine eligibility; the player accepts an event offer for a new title and increased base pay. Changing vocation resets its career track while preserving magical study and savings.
- Childhood milestones, linked research, regional stories, profession dilemmas, and family/legacy events use age, location, living-family, and story prerequisites. Stable event/choice identifiers preserve pending decisions in existing saves.
- Decisions interrupt time advancement. Hidden tabs suspend timed playback and automatic choices; reload starts paused. Choice, focus, and study changes persist promptly, with immediate saving for focus and study.
- Random decisions have a 25% chance in an eligible year, with at least three years between random decisions. Fixed-age milestones keep their dates and neither obey nor reset this random-event spacing. Quiet years still develop the character and chronicle. Existing saves use their recorded event ages without resetting progress; already-pending choices remain available.
- The user approved the UX review fixes after identifying next-action/time-control clarity as the first priority. Current guidance names the time state, explains automatic choices, and offers Review choices. Manual outcomes show their actual consequences in place with a continuation action and keyboard focus; automatic choices preserve focus. Mobile help remains accessible, utility targets are larger, and compact study guidance links to the spellbook.
- Save failures provide persistent recovery: Retry save writes the latest in-memory life; Retry loading reopens untouched data after a read failure. No retry clears storage or replaces unreadable data with an empty game. Storage assurances reflect the current status. Completed timelines show only lived years; small-screen world selection uses the readable region list.
- Saves retain one active life and the most recent 20 completed lives in browser localStorage. Profiles and origins have separate saves; there is no cloud sync or save export/import interface. Legacy migration preserves history, random state, pending decisions, savings, and aggregate training; passed childhood milestones do not replay.

## Documentation and delivery

[DESIGN.md](DESIGN.md) and the [structured design sidecar](.impeccable/design.json) describe the built interface. [README.md](README.md) describes setup and implementation. The root [CONTINUE.md](../CONTINUE.md) distinguishes current repository state from historical verification and ignored source backups. Follow [AGENTS.md](../AGENTS.md) for task PRs, usage checks, save points, and manual integration. Git delivery does not authorize publishing the playable game.

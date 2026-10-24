# Six-Faced Life

A single-player browser life simulator inspired by 1 in 8 Billion, in the world of Mushoku Tensei. The original protagonist is reincarnated with memories of a previous life. Players experience random family circumstances, train, make consequential choices, live to an ending, and begin another life.

Audience: fans who want a thoughtful, replayable second-life story on desktop or phone. First release in English. Original narrative, character names, code, and artwork; setting references acknowledge the original series. Fantasy probabilities are authored balance, not canon statistics.

Approved visual commitment: warm parchment, dark ink, restrained green/gold accents, serif narrative titles and sans-serif controls. The main screen is a readable chronicle with character identity, an atmospheric scene, meaningful choices, training, family, and time controls. The user approved this direction and requested implementation; do not reopen visual discovery.

Browser-local saves and archive. No account, multiplayer, payments, or AI backend. React, TypeScript, Vite; pure seeded simulation. The [original approved specification](../docs/superpowers/specs/2026-10-23-six-faced-life-design.md) records the first release; the implemented expansion below and current user decisions supersede its earlier proposals.

The user chose a story and progression expansion on 2026-10-24. The current game has 55 authored events, five separate magic study tracks and 30 spells, and experience/reputation-based promotion paths for five working vocations. Study/career requirements are visible in the existing training/character interface. Older saves migrate without resetting the life or its pending decision. The playable game remains local. On 2026-10-24 the user authorized automatic task commits, branch pushes, and PR delivery; Sites source uploads and deployment still require a separate request.

## Current behavior

- Water, fire, earth, wind, and healing each retain their own experience and learned spells. Study selection unlocks at age eight; changing it preserves prior study and grants no experience. Instruction rank is shared across disciplines.
- Adventurer, merchant, healer, guard, and teacher careers have three earned promotion steps. Experience, reputation, and vocation-specific skills determine eligibility; the player accepts an event offer for a new title and increased base pay. Changing vocation resets its career track while preserving magical study and savings.
- Childhood milestones, linked research, regional stories, profession dilemmas, and family/legacy events use age, location, living-family, and story prerequisites. Stable event/choice identifiers preserve pending decisions in existing saves.
- Decisions interrupt time advancement. Hidden tabs suspend timed playback and automatic choices; reload starts paused. Choice, focus, and study changes persist promptly, with immediate saving for focus and study.
- Saves retain one active life and the most recent 20 completed lives in browser localStorage. Profiles and origins have separate saves; there is no cloud sync or save export/import interface. Legacy migration preserves history, random state, pending decisions, savings, and aggregate training; passed childhood milestones do not replay.

## Documentation and delivery

[DESIGN.md](DESIGN.md) and the [structured design sidecar](.impeccable/design.json) describe the built interface. [README.md](README.md) describes setup and implementation. The root [CONTINUE.md](../CONTINUE.md) distinguishes current repository state from historical verification and ignored source backups. Follow [AGENTS.md](../AGENTS.md) for task PRs, usage checks, save points, and manual integration. Git delivery does not authorize publishing the playable game.

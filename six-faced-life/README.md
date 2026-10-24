# Six-Faced Life

A playable reincarnated-life simulator in the world of Mushoku Tensei, inspired by the life-simulation structure of [1 in 8 Billion](https://1in8b.life/en/).

Your original protagonist remembers another life. Discover a birthplace and family, make childhood discoveries, study magic or swordsmanship, earn a living, form relationships, travel, grow older, and begin again after an ending.

## Run locally

Use Node.js 22.12+ or a supported Node.js 24 release. From the repository root:

```powershell
Set-Location 'six-faced-life'
npm ci
npm run dev
```

Open http://127.0.0.1:5173/. Vite binds to loopback and uses a strict port; reuse the existing preview if it is already running. Install dependencies only when needed. All npm commands below run inside `six-faced-life/`.

```sh
npm test
npm run build
npm run preview
```

`npm test` runs Vitest and React Testing Library. `npm run build` checks TypeScript and creates `dist/`; `npm run preview` serves that build on the URL printed by Vite. A preview on another port has separate browser saves. No `lint`, `typecheck`, or `test:e2e` script is configured.

For QA that creates or replaces a life, use a separate origin so the player's save remains intact:

```sh
npm run dev -- --port 5174
```

## Playing

- Begin a new life, optionally supplying a name and birthplace.
- Open the birth record and make your first memory-driven choice.
- Play/pause, select a speed, advance one year, or jump to the next decision. Decisions always stop time. Space toggles playback outside form controls.
- The time guidance explains what is happening and what to do next. Use Review choices to go directly to a waiting decision. After a manual choice, read its actual outcome and changes in place, then Continue to next decision or let playback proceed. The result stays in the chronicle after its temporary feedback closes.
- Change the yearly focus to train, learn, work, connect, explore, or recover. Higher skill ranks require both experience and instruction.
- From age eight, choose water, fire, earth, wind, or healing as your current magic study. Each discipline has its own experience and six learnable spells. Your character page shows the complete spellbook, including what still needs practice or instruction.
- Working careers earn experience and reputation. Three promotion steps offer new titles and increased yearly pay when you meet the requirements. You can also change vocation through a later-life decision.
- Watch mode makes affordable, low-risk choices while playback is active. Progress pauses in hidden tabs and when the page is closed.
- How to play is available from both desktop and phone navigation. The training section explains yearly focus versus magic discipline and links to the full spellbook.
- Completed lives appear in Past lives. The most recent 20 are kept.

Saves live only in the current browser's local storage, under `six-faced-life.v1`. The browser profile, hostname, and port must match: `localhost`, `127.0.0.1`, and different ports have separate saves. Reload starts paused and preserves pending decisions; there is no offline catch-up. Source ZIPs and Git commits do not include browser progress. No account or server database is required. The game shows a recovery message when storage cannot be read, and a not-saved indicator when writing fails.

If saving fails, keep the tab open and use Retry save to write the latest in-memory progress after storage becomes available. If an existing save cannot be read, Retry loading attempts to reopen it without writing an empty replacement. Creating a new life remains an explicit player action. Clearing browser data is not a recovery step.

## Implementation

- `src/game/engine.ts`: seeded random births, time progression, choices, training, careers, aging, and endings.
- `src/game/events.ts`: the 25 original events and combined 55-event catalogue.
- `src/game/expanded-events.ts`: 30 additional stories, including branching research, study choices, profession-specific problems, regional events, and legacy decisions.
- `src/game/progression.ts`: five magic disciplines, 30 learnable spells, career experience/reputation, promotion gates, titles/pay, and legacy-save migration.
- `src/game/world.ts`: six starting regions, five playable races, focus rules, careers, and instruction-gated ranks.
- `src/game/storage.ts`: versioned save validation and completed-life archive.
- `src/App.tsx`: playback, navigation, local persistence, and the responsive game interface.
- `src/components/`: chronicle, character, world guide, birth record, and retrospectives.

The test suite covers complete lifetimes across 100 seeds and all races, every combination of five study paths and five working vocations, deterministic restore, instruction-gated spells, promotions and actual yearly pay, linked research outcomes, malformed saves, legacy-save migration, storage failures, hidden-tab watch mode, immediate focus/study saving, and relationship/travel prerequisites. Historical browser QA played an entire original lifetime and the expansion's study, restore, and promotion flows through the visible interface; see [CONTINUE.md](../CONTINUE.md) for the dated results. Rerun relevant checks for application changes.

Existing first-release saves remain supported. Migration preserves the life, random state, pending decision, history, savings, and aggregate training. Existing magic experience seeds the named discipline; newly added career experience starts counting with this update. Instruction rank is shared across magic disciplines, while their experience and learned spells are separate. The new events can occur in existing lives once their age, location, and story prerequisites are met; already-passed childhood milestones are not replayed.

## Scope and credits

The playable game remains local. The user authorized automatic task commits, branch pushes, and PRs targeting `main` on 2026-10-24; follow-up commits update the task's open PR, and the user merges manually. Sites source uploads, deployment, and new remote services still require a separate request. Follow the root [AGENTS.md](../AGENTS.md) for Git delivery, usage monitoring, and save points; the [repository README](../README.md) indexes the project documentation.

This is an unofficial fan creation. Mushoku Tensei and its setting belong to their respective creators. The code, protagonist names, event prose, and landscape artwork in this project are original. Game lifespans, demographics, probabilities, regional weights, and event timing are authored balance; the map is an illustrated schematic. The first release uses a bounded event catalogue and choice-based danger rather than tactical combat.

The reference HTML and JavaScript captured during investigation live outside this project and are never included in its build. See the parent `docs/research/reference-findings.md` for evidence and analysis limitations.

Typography: Cormorant Garamond and DM Sans, self-hosted under the SIL Open Font License. License files are in `public/assets/`. See [ASSETS.md](ASSETS.md) for the original illustration's generation record.

# Six-Faced Life

A playable reincarnated-life simulator in the world of Mushoku Tensei, inspired by the life-simulation structure of [1 in 8 Billion](https://1in8b.life/en/).

Your original protagonist remembers another life. Discover a birthplace and family, make childhood discoveries, study magic or swordsmanship, earn a living, form relationships, travel, grow older, and begin again after an ending.

Play online at **[six-faced-life.vercel.app](https://six-faced-life.vercel.app)**. Keep using that stable hostname to continue a hosted life; local development and unique deployment URLs have separate browser saves.

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

GitHub Actions and Vercel's native GitHub integration both use `npm run build:vercel`, which runs the complete tests before the TypeScript/Vite build. Vercel builds from source independently of GitHub's diagnostic artifact and automatically publishes only main. No deployment API token or GitHub secret is needed. The project is already imported and live with Root Directory `six-faced-life`, Vite preset, Node 22.x, Production Branch `main`, and output `dist`; the app-local `vercel.json` supplies build settings and SPA routing. The [deployment guide](../docs/deployment.md) covers the current release and rollback. `npm run preview -- --port 5177 --strictPort` serves an isolated local production build. Hosted browser saves are separate from local saves.

For QA that creates or replaces a life, use a separate origin so the player's save remains intact:

```sh
npm run dev -- --port 5174
```

## Playing

New lives use **expanded-1**. Birth years range uniformly from K397 to K427;
age and world year appear together. Family wealth and noble status affect
resources and access, while occupation, affiliation and exceptional titles remain
separate. Migurd and Superd protagonists begin on the Demon Continent; migration
and children born at the family's actual home remain possible. Superd is an
explicit extreme-survival start: approximately 90% mortality before 15 under the
documented typical policy, improved by protection and care. These are authored
game-balance choices, not setting statistics.

Food, shelter, care, dependants, education and travel consume resources. Children
receive household support rather than adult wages. Warnings identify unmet needs.
From age 15, qualified applicants can enter ordinary work immediately; knight and
professor appointments retain their advanced requirements and scarce vacancies.
Career changes retain per-occupation experience. **Career training** offers all ten
ordinary roles without prior skills or rare talent: 2–3 years full-time, paying
24 coins/year instead of job wages, or 4–6 years part-time alongside the current job.
Pause, change attendance or withdraw while retaining earned progress. Completion
keeps a guaranteed manual placement; injury can delay safe acceptance without
requiring retraining. Farmer/laborer courses are optional and free; other tuition
is 16/24 coins, with merchant/adventurer starter fees quoted once.

Training and university can use explicitly accepted, interest-free loans for the
unfunded amount after family/personal contributions. Borrowed money pays the
provider rather than entering the purse. Repayment takes 10% of positive annual
earned surplus after necessities (at least 1 coin when affordable), shares one
ceiling across debts, and pauses during hardship or university. Unused borrowed
reserves cancel debt on withdrawal; consumed costs are not refundable. Debt closes
at death and is not inherited. The education finance disclosure shows the balance
and last repayment.

University retains age, knowledge and demonstrated-readiness requirements; credit
does not bypass them. Admission 80 plus the tuition/living reserve 232 and regional
travel 40/90/120 are quoted before commitment. A free assessment still lets an
exceptional pupil qualify for a full scholarship without borrowing. Attendance
and graduation remain distinct, and failed progress can interrupt study.

Calendar events distinguish Fittoa displacement, other civilian exposure, relief,
service and distant news. Major historical outcomes remain fixed. Regional
conflicts and post-K430 continuation are original game material. Faction allegiance,
marriage, dangerous service and legendary challenges require manual decisions even
in Watch mode. Only Seven Great Powers positions 5–7 are attainable after K430.

Family details retain adult marriages, separations, widowhood, individual children,
social ties and later descendants. Traits are generated once and inherited;
unobserved latent genetics are not revealed by the interface or retrospective.
Completed lives store a factual English/Thai snapshot. Legacy retrospectives mark
unrecorded marriages/descendants as unknown rather than inventing a zero.

Existing lives without a discriminator, or with `legacy-1`, keep the original
birth pools, event registry, progression and random draw order. They are not
converted into expanded lives. See the [specification](../docs/superpowers/specs/2026-10-25-life-simulation-expansion-design.md)
and [verification report](../docs/verification/life-simulation-expansion.md).

- Choose **English** or **ไทย** in the new-life form. The form previews that language before creation; the choice stays with that life through reload and archived retrospectives. Existing lives without a language remain English. Canceling setup preserves the current life, and replacing an unfinished life still requires confirmation.
- Thai covers story events and choices, chronicle entries, spells/careers/world information, help, accessibility labels and save-recovery messages. Personal names remain as entered or generated. Mixed-language past lives show their language; opening one uses its own language, and returning restores the active language.
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

- `src/i18n/`: English/Thai presentation catalogues and language context, with a separate `six-faced-life.language` preference for the next new-life form. Preference failure does not affect game-save recovery. No translation service is contacted while playing.
- `src/game/narrative.ts`: bounded presentation references captured with new chronicle entries. Canonical English title/text and stable game identifiers remain in saves; seeded rules do not depend on language. Unknown future references retain their original text, and older English histories need no rewrite.
- `src/game/engine.ts`: routes creation and actions by ruleset; new lives default to expanded rules.
- `src/game/legacy/engine.ts`: frozen original births, annual progression, choices and endings for existing lives.
- `src/game/expanded/`: validated structured origin/calendar, independent RNG streams, economic survival, education, occupations, history, politics, genetics, family and immutable summary modules.
- `src/game/simulation.ts`: safe shared presentation/study adapters and manual Watch boundaries.
- `src/game/events.ts`: the 25 original events and combined 55-event catalogue.
- `src/game/expanded-events.ts`: 30 additional stories, including branching research, study choices, profession-specific problems, regional events, and legacy decisions.
- `src/game/progression.ts`: five magic disciplines, 30 learnable spells, career experience/reputation, promotion gates, titles/pay, and legacy-save migration.
- `src/game/world.ts`: six starting regions, five playable races, focus rules, careers, and instruction-gated ranks.
- `src/game/storage.ts`: ruleset-specific save validation, recovery and completed-life archive. `storage-codec.ts` optionally dictionary-encodes repeated prose in large mixed/expanded saves, retaining all facts and the same version-1 envelope/key. Unknown encodings are preserved through recovery, and oversized writes fail visibly rather than creating an unreadable save.
- `src/App.tsx`: playback, navigation, local persistence, and the responsive game interface.
- `src/components/`: chronicle, character, world guide, birth record, and retrospectives.

The test suite covers complete lifetimes across 100 seeds and all races, every combination of five study paths and five working vocations, deterministic restore, instruction-gated spells, promotions and actual yearly pay, linked research outcomes, malformed saves, legacy-save migration, storage failures, hidden-tab watch mode, immediate focus/study saving, and relationship/travel prerequisites. Historical browser QA played an entire original lifetime and the expansion's study, restore, and promotion flows through the visible interface; see [CONTINUE.md](../CONTINUE.md) for the dated results. Rerun relevant checks for application changes.

Existing first-release saves remain supported. Migration preserves the life, random state, pending decision, history, savings, and aggregate training. Existing magic experience seeds the named discipline; newly added career experience starts counting with this update. Instruction rank is shared across magic disciplines, while their experience and learned spells are separate. The new events can occur in existing lives once their age, location, and story prerequisites are met; already-passed childhood milestones are not replayed.

Expanded lives: open **Optional activities** below this year's focus to browse
careers, seek instruction/education, travel, meet someone or review a legendary
challenge. The menu unlocks activities by age and era. Career choices show missing
qualifications and fees; qualified ordinary applicants can enter immediately.
Prestigious appointments retain yearly vacancies. The first livelihood decision
also links to other careers. Opening an
activity pauses time and saves it; Watch mode leaves that choice to you. Finish
any pending story decision before opening another activity. Seven Great Powers
challenges are voluntary and retain their mastery/renown requirements.

Career browsing also links directly to training. Ordinary qualifications and fees
remain visible; yearly vacancy waiting applies to prestigious appointments only.
Training, borrowing, attendance changes and placement always remain manual in
Watch mode. New training/finance state migrates into existing active expanded
lives without resetting their records; frozen legacy lives and old completed
snapshots are preserved. See the [verification report](../docs/verification/accessible-careers.md).

## Scope and credits

The user authorized automatic task commits, branch pushes, and PRs targeting `main` on 2026-10-24; follow-up commits update the task's open PR, and the user merges manually. On 2026-10-25 the user switched from Cloudflare to Vercel, manually merged migration PR #5 and authorized the first deployment. That deployment is live and its tests/build and hosted smoke checks passed. Sites publishing, other new remote services, and paid upgrades remain outside this request. Follow the root [AGENTS.md](../AGENTS.md) for Git delivery, usage monitoring, and save points; the [repository README](../README.md) indexes the project documentation.

This is an unofficial fan creation. Mushoku Tensei and its setting belong to their respective creators. The code, protagonist names, event prose, and landscape artwork in this project are original. Game lifespans, demographics, probabilities, regional weights, and event timing are authored balance; the map is an illustrated schematic. The first release uses a bounded event catalogue and choice-based danger rather than tactical combat.

The reference HTML and JavaScript captured during investigation live outside this project and are never included in its build. See the parent `docs/research/reference-findings.md` for evidence and analysis limitations.

Typography: Cormorant Garamond and DM Sans for English, with Noto Serif Thai and Noto Sans Thai for Thai, all self-hosted under the SIL Open Font License. Original license files and pinned Thai font provenance are recorded in [ASSETS.md](ASSETS.md), alongside the illustration's generation record.

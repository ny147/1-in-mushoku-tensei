# Reference investigation: 1 in 8 Billion

Investigated 2026-10-23. Target: https://1in8b.life/en/ (v0.8.22 beta).

## Question checklist

- Birth and entry flow: answered through direct browser observation.
- Time progression and decision interruption: answered through browser controls and manual static inspection.
- Yearly focus and event selection: answered through manual static inspection; runtime outcomes sampled only in infancy.
- Persistence: source implementation inspected; reload recovery not exercised.
- Full event catalogue, statistical balance, and end-of-life runtime: unresolved; unnecessary to reproduce every original subsystem for an original adaptation.
- Mushoku Tensei direction: user selected an original reincarnated protagonist with memories of a previous life.

## Observed behavior

The landing page offers world era, birth weighting, and session length. Starting a life reveals a birth record with a name, family circumstances, birthplace, and four contemporaries. The player then enters a dashboard with age, time controls, identity, health/happiness/knowledge/relationships, family, income, annual focus, event history, a life grid, and survival context.

One directly observed run generated a child in Uganda. The simulation advanced from infancy to age two and added events to the history. No personal user information was entered and no life was shared or published.

The public page describes education, work, relationships, migration, healthcare, automatic choices, milestones, and records of completed lives. Those statements describe advertised functionality; this investigation did not play through every branch.

## Manual source findings

Captured HTML: `research/reference/index.html`, 239399 bytes.
Captured JavaScript: https://1in8b.life/a/en.cbef3f9f55.js, saved as `research/reference/game.js`, 4496683 bytes.
JavaScript SHA-256: `cbef3f9f5587ea174ecbee50011b85726661121007f85df3232268e143c58e8b`.

These observations are from ordinary source inspection, not completed REA semantic analysis:

- `game.js:3813`: FOCUS defines yearly priorities and their numeric effects. `focusOptions()` selects priorities by life stage.
- `game.js:5044`: `tick(dtSec)` returns when paused, when a decision is pending, or outside the active-life phase. Time advances using speed and seconds per year. Queued events fire before the year ends.
- `game.js:5080` onward: `chooseFeed()` filters events by age and circumstances, changes weights for recently repeated events, and selects a weighted candidate.
- `game.js:30277`: `save()` serializes the active state and timestamp through a local-storage helper. A storage failure can trigger a visible warning.
- `game.js:30286` onward: restoration reopens the birth or active-life view according to the saved phase.

## REA execution and limitations

No REA MCP tools were exposed in this session. CLI acquisition used npm's public `rea-agents@6.7.0` package in a workspace-local cache. The system Node 22.16 did not meet its engine declaration; an already installed bundled Node 24.19 was used for analysis. No global runtime, MCP registration, or skill configuration was changed.

The first static-analysis attempt failed while transferring the source into a temporary file. A corrected attempt used a workspace-local temporary directory and failed at the same source-transfer phase with Windows EPERM. The output preserves partial inventory evidence, not a successful semantic analysis:

- Evidence: `ev_ae29e046e66d2173e92bc154b7c6df868b5ed847a712e9ad203a11ab7b2c346b`.
- Complete returned failure and partial observation: `research/rea-evidence.json`.
- Scope: selected `game.js`; HTML inventoried but outside semantic analysis scope.
- Unknown: REA call graph, event/data-flow reconstruction, and other semantic relationships.

This partial record must not be described as proof that REA analyzed the game's internals successfully. The browser observations and manual source findings above provide independent, narrower evidence.

## Adaptation boundaries

Reimplement the life-simulation structure with original code, narrative, balance, and artwork. Reference downloads remain research material and must not be bundled into the game. Fantasy probabilities are authored game balance, not population statistics or established canon.

The official anime story index (https://mushokutensei.jp/story/) supplies context for magic-school, adventuring, family, and turning-point themes. The adaptation's protagonist and outcomes are original. Detailed canon encounter dates and a complete lore audit remain outside the initial investigation.

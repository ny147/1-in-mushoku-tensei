# Six-Faced Life — proposed first playable version

Status: approved by the user on 2026-10-23 and implemented as the local `six-faced-life` project. The user explicitly chose to keep the game local.

Historical specification: proposal wording below is retained as the approval record. The current [PRODUCT.md](../../../six-faced-life/PRODUCT.md), [DESIGN.md](../../../six-faced-life/DESIGN.md), and [CONTINUE.md](../../../CONTINUE.md) document the implemented expansion and repository state. Any suggestion of Sites hosting below was superseded by the user's explicit local-only decision; it is not deployment authorization.

Later delivery decision (2026-10-24): the user authorized task commits, Git pushes, and PRs under the current [AGENTS.md](../../../AGENTS.md). The playable game remains local; Sites uploads and deployment still need separate authorization.

## Intent

Build a browser life-simulation game inspired by https://1in8b.life/en/, set in the world of Mushoku Tensei. The user explicitly selected **an original reincarnated protagonist with memories of a previous life**. The player lives from birth to an ending, making choices that change an individual life rather than replaying Rudeus's biography.

Keep the reference's emotional loop: discover circumstances, watch time pass, choose priorities, respond to turning points, and look back on the resulting life. Replace real-world statistical simulation with an authored fantasy simulation whose rules are visible and consistent.

## Approaches

1. Random ordinary life: closest to the reference, with the birth lottery providing most of the variation.
2. **Reincarnated protagonist: selected by the user.** Preserve random circumstances while giving the player past-life memories, early planning opportunities, and decisions about concealing unusual knowledge.
3. Quest-and-combat RPG: emphasizes encounters and progression, but would shift the core experience away from a whole-life simulation.

## First release scope

A complete, replayable single-player loop, including a new-life setup, generated birth record, childhood, adulthood, aging, ending, and reincarnation into another run. The game starts in English, matching the supplied reference URL. The player may name their protagonist; blank input generates an appropriate original name.

Birthplace, race, family resources, aptitude, and personality vary. Proposed starting regions are Asura, the northern territories around Ranoa, Millis, the Great Forest, the Demon Continent, and Begaritt. Race and region combinations have explicit restrictions rather than being independently shuffled into implausible combinations. The exact roster and weights are builder-authored balance, not claims about canon demographics.

The default era is broadly Rudeus's generation. The interface uses age and an internal scenario year; precise canon dates are not presented until verified. Familiar places and institutions anchor the setting, while original people and events carry the player's story.

## Past-life memories

Every run begins with memories. They unlock early literacy, deliberate mana practice, practical reasoning, and special dialogue choices. Childhood physiology, money, teachers, and social circumstances still limit what the protagonist can do.

Memory choices carry tradeoffs: displaying unusual knowledge can attract a mentor or suspicion; solitary training competes with relationships; risky experimentation can injure the character. Memories are not an automatic all-stat bonus. The first release does not require the player to write a previous-life biography or assume knowledge of later novel spoilers.

## Life engine

Maintain a serializable state with character identity, age, elapsed-year progress, birthplace/current region, race, family, resources, stats, training, vocation, relationships, event history, pending decision, visited milestones, and seeded randomness.

The player selects a yearly priority: magic, sword training, study, earning money, family/friends, exploration, or rest. Available priorities depend on age, access, and circumstances. Core stats are health, happiness, knowledge, bonds, mana development, and sword proficiency. Learned skills and ranks are separate from temporary condition.

Training uses recognizable magic disciplines and sword schools, with progression from beginner upward. Higher ranks need accumulated training, access to instruction, and milestone decisions; a single positive event cannot instantly grant a legendary rank. Early mana development offers a long-term opportunity.

Adulthood can lead to magical study, adventuring, teaching, trading, healing, guard work, or family life. Guild work offers risk/reward choices and rank progression. Combat is resolved through readable decisions and skill/risk calculations in this version; a tactical battle screen is outside this scope.

Use a bounded event catalogue covering infancy, childhood, training, education, travel, livelihoods, friendship, adult romance/family, danger, aging, and retirement. Events declare prerequisites, weights, repeat cooldowns, choices, costs, and consequences. Major milestones can recur across runs, but choice outcomes and intervening events vary. No graphic sexual or violent scenes.

Fantasy lifespan, danger, and economic values are authored balance. Different race lifespans change aging thresholds and session pacing. Low-risk lives can reach old age; injury, illness, and dangerous choices can produce earlier endings. Death produces a readable cause and a retrospective rather than a dead-end screen.

## Controls and persistence

Provide play/pause, multiple speeds, advance one year, and advance to the next decision. A pending decision always pauses simulation, including in fast-forward. Advancing one year must still stop for intervening decisions and must not skip consequences.

Offer automatic choices as an optional watch mode. Autosave locally after meaningful state changes. Reload resumes safely without simulating unbounded offline time or rerolling a pending decision. Provide a visible saved/unsaved state, restart/new-life controls, and a local archive of completed lives. Corrupt or unsupported saves show a recovery message rather than a blank screen. No accounts or multiplayer in this release.

## Interface direction — builder proposal

A readable fantasy chronicle: warm parchment, dark ink, restrained green/gold accents, serif narrative headings, and compact sans-serif controls. The protagonist's identity and current age lead the page; the current scene, pending decision, and life history form the main reading area. Training, family, resources, and the year's focus sit alongside it on desktop and stack coherently on phones.

The first viewport should look and function as a game. Starting a life, seeing consequences, inspecting progress, pausing, and saving must work; no ornamental dashboard controls. Use original atmospheric illustration or code-native scenery, never scraped reference assets. All controls support keyboard access, readable contrast, reduced motion, and narrow screens.

## Technical approach — builder proposal

React, TypeScript, and Vite, with a framework-independent simulation module and versioned local-storage persistence. This is a new, currently empty workspace. Start with browser-local state and no backend. Keep captured research files outside the shipped assets.

Sites hosting may provide a private playable preview after implementation if the connector is available; source remains in this workspace. Any hosting constraint must be reported explicitly rather than presenting an unverified URL.

## Validation and acceptance

- A new run generates coherent identity and circumstances and enters an active life.
- Memory-specific decisions appear early and produce real, persistent effects.
- Different priorities change training, relationships, resources, and opportunities.
- Decisions interrupt normal play, fast-forward, and single-year advancement.
- Costs cannot create unintended negative balances; stats stay within valid bounds.
- A full run reaches an ending, produces a retrospective, and can start another run.
- Saves restore deterministically, including a pending decision; invalid saves recover visibly.
- Seeded simulations exercise childhood, adult paths, long-lived races, danger, and aging without becoming stuck.
- Desktop and mobile browser checks confirm the start flow, choices, controls, archive, and console state.

## Non-goals and limits

The first release does not reproduce the reference's complete event catalogue, public memorial/community backend, payment system, worldwide statistics, or artwork. It does not simulate every canon character or guarantee canon plot outcomes. All authored probabilities and personal stories are game design. Detailed multiplayer, tactical combat, and a generative-AI story backend can be considered separately after the core loop is playable.

## Evidence and open decisions

The user selected the reincarnated-protagonist approach. The remaining concrete decisions above—working title, English UI, technical stack, visual direction, bounded content scope, and local persistence—are builder proposals for approval. No additional preferences are required to begin once this document is approved.

See `docs/research/reference-findings.md` for observed reference behavior, source locations, and the incomplete REA analysis boundary.

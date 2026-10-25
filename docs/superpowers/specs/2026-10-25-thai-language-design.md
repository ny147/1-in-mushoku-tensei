# Thai language for new lives

Status: approved by the user on 2026-10-25 with an explicit request to implement.
Implementation and verification are complete, including the final review fixes.
PR #7 remains draft for the user-owned CONTINUE.md conflict with newer main; see the plan's ledger.

## Intent and confirmed decisions

The user requested Thai language as the next feature, chose full-game coverage
rather than interface-only translation, and then chose **language selection for
new lives only**, rather than instant language switching for existing lives.

The result should let a Thai reader play an entire new life without needing
English to understand controls, story, choices, requirements, or consequences.
Existing lives and archives remain English. A life keeps its selected language
through reload, completion, and later reading from the archive.

## Approaches considered

1. Instant English/Thai switching, including compatibility translation for old
   chronicle prose. This makes every life bilingual but requires reconstructing
   meaning from previously saved English text. The user did not choose this.
2. Choose English or Thai when creating a life. Persist the language with that
   life and localize its presentation. Old lives default to English. **Selected
   by the user.** This avoids retroactively changing existing stories.

Implementation choice proposed by Codex: use explicit translation catalogues and
language-independent game data, rather than duplicating the engine or replacing
English strings in the DOM. Preserve canonical English values wherever existing
rules compare them. Thai is a presentation concern; language is persistent life
metadata. No online translation service or new runtime dependency is needed.

## Player experience

- Add a visibly labeled `Language / ภาษา` selector to the new-life form with
  `English` and `ไทย`. English remains the default for the first visit.
- Selecting Thai immediately previews the new-life page in Thai, including form
  instructions, replacement warning, and relevant navigation/help text. It does
  not create a life, replace a save, advance time, or change an existing life.
- Explain beside the selector, in the selected language, that this choice applies
  to the new life and stays with it. There is no language switch inside a life.
- Remember the most recently created life's language as the next form's default,
  using a separate, validated local preference. A preference read/write failure
  must not prevent play, hide game-save errors, or overwrite a game save. It is
  acceptable not to remember this convenience preference when storage is blocked.
- Canceling new-life setup returns to the current life's original language.
  Creating a replacement still requires the existing explicit confirmation.
- The active life's language controls navigation, help, world, training, character,
  playback, save/recovery messages, and the archive list. With no active life,
  use the selected new-life language or remembered preference, otherwise English.
- An archive list may contain both languages. Keep each person's name as entered
  or generated; show a small explicit language label on each life. Opening a
  retrospective uses that life's language for the whole view, including its
  navigation. Returning to the archive restores the active/session language.
- Keep the document language (`en` or `th`) and document title consistent with
  the currently displayed view. Preserve focus, scroll behavior, menu access,
  keyboard controls, live announcements, and reduced-motion support.

These defaults and archive rules are proposals by Codex, not additional decisions
already confirmed by the user.

## Translation coverage and voice

Translate all player-facing authored content: opening/birth record, navigation,
55 event titles/bodies/categories, every choice label/description/outcome,
failure outcomes, annual entries, family farewells, spell-learning records,
endings/legacies, biography labels/descriptions, race/region/focus names and
descriptions, careers/promotions/pay/requirements, all 30 spells and their
requirements, ranks, timelines, help, archive, save/recovery, tooltips, accessible
names, image alternative text, and choice announcements.

Use natural, restrained Thai prose consistent with the intimate illustrated
chronicle. Translate complete messages with parameters; avoid stitching Thai
sentences together from translated English fragments. Keep costs, signs,
requirements, age restrictions, risks, and actual outcome deltas accurate.
Use Arabic digits for values in both languages and appropriate Thai units.
Preserve player names exactly. Generated personal names and the product name
Six-Faced Life may remain in Latin script; authored world names receive consistent
Thai transliterations. Keep lettered guild ranks, keyboard key names, and numeric
speed values recognizable. Do not introduce new canon or game-balance claims.

## Data and simulation boundaries

- Add optional per-life language metadata with supported values `en` and `th`.
  Missing metadata means English, including legacy active and archived lives.
  The storage key and outer save version remain compatible; no reset is needed.
- Validate any present language value. Invalid metadata uses the existing visible
  unreadable-save recovery path, retaining the original payload. Do not silently
  discard an invalid active life or archive member.
- Existing event/choice/spell IDs, flags, career/rank identifiers, biography rule
  comparisons, history order, pending decision, random state, and progression
  remain stable. No language-dependent random call or rendering mutation.
- Event and choice translation lookup uses their stable IDs. World/progression
  translation lookup uses domain IDs. Keep canonical values used by rules intact.
- New history entries can carry optional bounded presentation metadata: an
  authored message key and scalar parameters for names, spell IDs, region IDs,
  and other variable values. Keep existing English title/text fields for backward
  compatibility. Validate optional metadata during load. Both languages should
  produce the same keys/parameters for equivalent seeded actions.
- New Thai lives must have enough metadata to localize every generated entry,
  including spell lists, risky failures, family farewells, and endings. Do not
  derive a past event's values from the character's later state.
- Existing English entries remain readable without metadata. Unknown future
  message keys retain canonical text safely rather than crashing or losing data;
  catalogue completeness checks must prevent this fallback for current Thai
  content. Do not attempt to translate old English histories retroactively.
- Changing the draft form language must never write or mutate active/archive
  life data. Locale preferences use a separate storage key and recovery boundary.

## Typography and layout

Preserve warm paper, forest ink, restrained gold, illustration, and the existing
desktop/mobile reading order. Add properly licensed self-hosted Thai font coverage
for narrative headings and practical controls; retain existing English fonts and
their licenses. Verify font provenance and include license/source records.
Adjust Thai line height and tracking where necessary so combining marks are not
clipped. Avoid English-style uppercase/letterspacing assumptions for Thai labels.
Allow labels, choice text, and status messages to wrap without hiding content.
Font selection and small spacing adjustments are left to the implementer within
the approved visual system; a redesign is outside scope.

## Verification and delivery

Meaningful automated checks must cover catalogue completeness, generated choice
variants, parameterized history, legacy English saves, mixed-language archives,
invalid language/metadata recovery, fixed language after reload, form preview and
cancel/replacement behavior, storage failure boundaries, and identical seeded
simulation outcomes across languages apart from language metadata. Exercise
choice feedback, pending decisions, playback, and immediate persistence in Thai.

Run the full `npm test` and `npm run build` from `six-faced-life/`. Browser QA uses
an isolated origin and covers English and Thai opening, birth, a choice, actual
outcome, training/spellbook, help/world, ending/archive, reload, keyboard controls,
console errors, Thai font rendering, and desktop plus narrow mobile overflow.
Do not touch the player's port 5173 storage.

Update PRODUCT.md, README.md, DESIGN.md and its structured sidecar where needed,
font provenance, CONTINUE.md, and the implementation plan's progress ledger.
Commit and push only task-owned files on `codex/thai-language`; create/update a
single PR targeting `main`. Until implementation and required checks are complete,
keep the PR draft. Fetch before final handoff; report upstream advancement without
merging/rebasing. The user merges manually. No deployment, Sites upload, new remote
service, billing change, or automatic merge is authorized by this feature request.

## Next gate

The builder review found no consequential missing decisions; the user approved
the design, implementation plan and native execution. Tasks 1–6 are complete.
Integration of newer main remains user-owned; do not merge or deploy automatically.

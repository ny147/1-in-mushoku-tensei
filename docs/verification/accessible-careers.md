# Accessible careers and education finance verification

Date: 2026-10-27, Asia/Bangkok. Branch: `codex/accessible-career-design`.
Delivery: [PR #12](https://github.com/ny147/1-in-mushoku-tensei/pull/12), base `main`.

## Implemented scope

All ten ordinary roles have lower direct-entry requirements and guaranteed
availability once qualified. Optional full-time training pays 24 coins/year and
takes 2–3 participating years; part-time keeps the job and takes 4–6. Progress,
locked magic discipline and qualification survive pause, withdrawal, switches,
injury and restoration. Knight/professor and advanced mastery retain their gates.

Training and university use voluntary provider-paid funding, source-aware unused
reserve refunds, interest-free earned-surplus repayment and no inherited debt.
University retains its readiness, scholarship and academic progression rules.
New active expanded saves validate/migrate without resetting the life; frozen
legacy rules and existing completed summaries are preserved. Controls use the
existing EN/TH chronicle, manual decisions and immediate persistence.

## Automated evidence

- Baseline before implementation: **197/197** tests passed.
- New behavior tests were run before implementation. Direct-entry, migration,
  university finance, deferred placement and summary tests demonstrated missing
  behavior; finance/training modules initially failed to load because absent.
- Targeted app/storage/i18n/manual-control set: **58/58** passed. This includes
  EN/TH Watch/manual quotes and reload, the real App enrollment path, and a
  reproduced same-panel pause/mode-save failure fixed by immediate choice saves.
- Seed 1: actual engine farmer-to-swordsman and farmer-to-mage flows with 0 and
  400 starting coins; uninterrupted/restored years and choices remain identical.
- All ten courses, both modes, are tested for exact duration/targets. Funding
  tests cover actual provider reserves, stale/declined quotes, withdrawal before
  and after repayment, old savings, dependants, tiny surplus, multiple purposes
  sharing one ceiling, and death cancellation/closure. Historical university
  attendance remains grandfathered without retroactive debt.
- Full suite with `npm test -- --maxWorkers=2`: **252/252** passed in the final post-review run (41 files, 89.21 seconds).
  The final `npm run build` passed; the existing large-chunk warning remains.
- The full engine's 10,000 Superd births retain **8,972 deaths**, versus **7,302**
  with protection, over **2,207,675** sampled origins. The original sample and
  assertions were preserved. The separate frozen cohort retained 9,149 deaths
  and 6,893 protected deaths. Legacy compatibility covers 200 original lives;
  expanded restoration covers 500 complete lives and a 20-record archive.

Initial full runs exposed four historical fixtures whose shifted birth year did
not shift the new empty-state guards; the fixture markers were corrected.
The old automatic test policy now excludes the newly introduced manual training
browser, keeping it from looping over pause/resume instead of advancing time.
Default-worker runs also exceeded timing/RPC limits on this machine. The mortality
test allows 180 seconds rather than 90 for the larger cloned state; the 500-life
test keeps its 60-second limit. Two-worker full execution completed in 101 seconds,
with the 500-life test in 37 seconds and mortality test in 63 seconds. This changes
neither game rules nor assertions. Quotes now preview refunded funds without
cloning the entire chronicle; empty course initialization avoids temporary arrays.

## Browser evidence

Used the in-app browser at **127.0.0.1:5174**, with disposable seed-1 fixtures in
ignored `.sites-workflow/education-qa.html`. Port 5173 storage was never opened,
read, replaced or cleared. No production browser save was used.

| Actual browser flow | Observed result |
| --- | --- |
| English poor farmer → swordsman | Quote loan 24, no purse proceeds, income 24 instead of farmer wages, progress 2/4/6 units, manual placement, restored swordsman pay 34 |
| Pause and mode change | Earned units retained, paused income reverted to the job, part-time remaining duration doubled; resume/full-time continued the same course |
| Thai poor farmer → mage | Thai quote/loan, saved yearly units, manual guaranteed placement and restored mage pay 38 |
| Poor ready university applicant | Exact 352 quote: 80 admission, 40 travel, 160 tuition and 72 living; voluntary loan, saved debt 352 |
| Thai scholarship applicant | Explicit funded route with no borrowing; principal and balance zero after reload |
| Wealthy unready university applicant | Funded acceptance disabled; Knowledge 0/40 and readiness 0/1 explained |
| Injured adventurer graduate | Qualification retained through reload, Health 19/30 explained; after four rest years and an intervening story, placement remained available and could be accepted |
| Responsive/keyboard | Desktop 1280px and phone 360px; Thai quote wraps, no horizontal overflow (345px content/scroll widths), heading focus and Tab navigation work |
| Console | No browser error entries in inspected flows |

Watch mode, hidden-tab suspension, write-failure Retry save and unreadable-save
recovery additionally have automated App coverage. They were not all repeated as
separate live-browser scenarios. Quantitative repayment/refund edge cases are
covered by the domain tests rather than manual browser arithmetic.

## Independent review and limitations

A fresh read-only reviewer found no critical or important code defects and checked
2,837 legal action/year transitions across seeds 1–20, all passing `isLife`.
One UX finding identified an unexplained university placement blocker. This was
treated as required disabled-state guidance: an EN/TH regression was observed
failing, then passed after the explanation was added.

The reviewer left final docs/delivery and independent browser assessment to the
implementer; those checks are recorded here and in CONTINUE.md. No second review
was dispatched. No deferred review issues remain.

The design detector reported existing token/font-size warnings across the shared
stylesheet; no new fonts, colors or radii were introduced. Existing design-system
previews were preserved and the training/finance preview added. Existing Vite
production output still warns that its single JS chunk exceeds 500 kB; no new
dependency or unrelated bundling redesign was added.

## Final delivery checks

Final post-review full suite: 252/252 passed; production build passed.
`git diff --check` passed. The delivered checkpoint commit and final fetch are
recorded in CONTINUE.md and the PR. The user requested stopping at a saved
checkpoint, so PR #12 remains draft for later review. Git publication updates PR #12 only; the user merges
manually. No playable-site publication or deployment was performed.

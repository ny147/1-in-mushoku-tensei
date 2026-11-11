# Career paths verification — 2026-11-11

Implemented on `codex/career-paths-design`, PR #23, base main. Native execution;
one independent whole-branch review. User merges manually; no publication.

## Automated evidence

- Baseline: 396/396 tests; production build passed.
- Final after review fixes: **478/478 tests in 70 files**, 87.39s, using
  `npm test -- --maxWorkers=2` from `six-faced-life/`.
- Final `npm run build`: PASS. Existing >500kB bundle advisory remains;
  JS output 785.84kB, gzip234.27kB.
- Failing-first checks cover qualification boundaries, migration, occupation pay
  floors, once/year work/projects, course completion attendance, frozen teaching
  school, manual path navigation, actual bilingual outcomes, and prestige reentry.
- Real production flows cover F/D/B/S, ordinary branch promotions/reentry/endings,
  save/reload futures, and 500 complete seeded lives. App tests include manual
  Watch/hidden-tab projects, immediate save, and existing storage recovery.

## Browser observations

Disposable fixtures on 127.0.0.1:5174 only. Player5173 storage never opened or
changed. EN1280/TH1280 desktop and EN390/TH390 narrow layouts had no horizontal
page overflow in DOM measurements. Inspected mobile screenshots, keyboard
Enter/Space native disclosures and focus, six-path root/detail navigation,
Farmer promotion + reload, inherited B rank with zero fabricated requests,
unspecified Teacher with preserved pay, Cleric requirements, academic promotion,
Thai research cost8/chance80%/actual success + reload, and part-time Merchant
training with26-silver provider loan. Part-time retained20-silver Farmhand wages.
Completed-life view and archive navigation checked on resumption; the fixture's
archive was empty, so populated archive record preservation is automated evidence.
No app console errors observed. Initial rank QA fixture was invalid because its
compatibility mirror was not synchronized; corrected fixture uses appointment.
Resumption initially had a stopped preview server; restarting5174 restored access.
OS reduced-motion, assistive-technology listening and browser-level storage-fault
injection were not manually exercised; automated coverage is distinguished above.

## Independent review and decisions

Reviewer found one Important defect: restoring the highest node in a whole branch
could mismatch occupation after Professor/Knight reentry and make a save unloadable.
Fix restores only earned nodes in the occupation actually appointed. Production
menu + save/reload regressions cover both newly earned and inherited recognition,
including absent prestige vacancies, and went RED→GREEN.

Outcome-language finding was regraded Important: English needs actual effects and
Thai needs Thai records. New career messages now retain canonical English text
and independent Thai parameters; both language cases went RED→GREEN. Existing
historical message keys and prose were preserved.

Ruling: first Knight/Professor appointments retain existing qualifications and
vacancies, without an additional branch-year apprenticeship; tradeoff is faster
prestige access for already-qualified experienced characters. Remaining minor:
career descriptions repeat in the Effects section, increasing reading overhead.
No unresolved Critical/Important finding. No second independent review claimed.

Mechanical design detector ran on changed UI targets; it reported advisory color
entries in the existing shared stylesheet. No new literal color was introduced.
Impeccable reported older product/sidecar schema drift; no unrelated schema repair
or skill update was performed. Browser fixtures/logs remain ignored local evidence.

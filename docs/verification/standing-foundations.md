# Standing foundations verification

Browser checks ran on 2026-11-14 against `codex/standing-foundations` through
final implementation `1132b5e`. These results describe Stage 1 only; they do not verify the
later crown, exile, sponsorship or marriage stages.

## Browser method and safety

Used the existing local Vite preview on `http://127.0.0.1:5174/`, Playwright and
installed Chrome in headless mode. Each script launched a fresh temporary Chrome
profile and isolated context. No existing browser profile, existing tab or port
5173 was accessed. The harness backed up its context's prior QA save and restored
it before closing. No full save payloads were logged.

Fixtures were generated from the app's actual origin/domain helpers, checked by
`isLife` before saving, and loaded through the app's normal storage path. Fixtures
set ages and financial conditions to reach specific boundaries; this was not a
single uninterrupted natural life. Responsibility choices, service review/exit,
year advancement, Watch controls and playback were exercised through browser UI
actions. Additional service/study and overlapping-loan starting states were
prepared with domain helpers rather than earned through the admission UI.

The temporary runner, fixtures and Playwright runtime live only in ignored
`six-faced-life/.openai/standing-qa/`. Screenshots and bounded results live only in
ignored `checkpoints/standing-foundations/`. There is no configured Playwright npm
script and no source dependency or lockfile change for this QA.

## Observed results

The final main runner passed **23 assertions/cases** and the supplemental layout
runner passed **31 assertions/cases**. Both exited 0, each reporting zero browser
console warnings/errors, uncaught page errors and HTTP responses of 400 or above.
Every recorded layout check had no horizontal document overflow and no added
`Continue to next decision` button.

| Area | Observed browser result |
| --- | --- |
| Responsibility | Instalments, service and refusal remained pending/manual after Watch playback. No automatic personal pledge occurred. |
| Keyboard | Styled Watch checkbox toggled with keyboard Space; each responsibility choice received focus with a visible outline and activated with Enter. |
| Persistence | Pending responsibility survived reload. Each of the three actual choices persisted immediately and restored the same bounded debt/purse state on reload, including across EN/TH layouts. |
| Service review | Review was manual in Watch. Keeping the contract preserved earned credit. Exiting retained 12 silver credit and 22 silver outstanding, changed to instalments, and survived reload. |
| Childhood | One annual UI advance deducted one household silver while preserving the child's 100 silver purse; reload did not replay the deduction. |
| Shared repayment | With earned income 24, necessities 18, a consumed education loan of 1 and parental balance 34, the year paid education 1 and parental 0; the next year paid parental 1 after education was settled. |
| Study pause | A validated university-attendance starting fixture advanced a year without service credit. |
| Service completion | Annual UI advances credited 12/12/10 against balance 34. Recorded cash income was zero throughout those years. The following year restored positive cash income. |
| Refusal housing | Four annual UI advances recorded actual expenses 22/22/22/18. The additional shelter cost expired after three years; the historical security-loss state remained. |
| Same-year playback | A partial Play/Pause cycle kept the same age, balance, purse and service credit. Paused state remained unchanged during a further wait and after reload. |
| Responsive/localized UI | English and Thai at widths 1280, 390 and 320: responsibility, all three outcomes and poor noble/royal origins rendered without horizontal overflow. Actual route choices survived reload at every width/language combination. |

The earlier birth probe separately passed four snapshots: poor commoner/noble/royal
at desktop width 1280 and royal at phone width 390, also reporting zero errors and
overflow. It is supplementary evidence, not included in the 54 final-run cases.

## Reproduction and artifacts

From `six-faced-life/`, with the isolated Vite preview already running on 5174:

```powershell
node .openai/standing-qa/release-probe.cjs
node .openai/standing-qa/matrix-probe.cjs
```

The runners require the ignored local Playwright runtime and installed Chrome;
they are local evidence helpers, not committed tests or a portable CI command.
Earlier runner attempts exposed harness locator/fixture assumptions, which were
corrected before the final passing runs; they did not identify an application bug.

Useful ignored evidence:

- `release-browser-results.json` and `matrix-browser-results.json`: case names,
  bounded accounting values and error lists.
- `responsibility-en-390.png`, `responsibility-th-390.png`: phone decisions.
- `responsibility-th-320.png`: narrow Thai disclosure layout.
- `outcome-service-th-390.png`, `outcome-refused-th-390.png`: Thai outcomes.
- `birth-noble-th-390.png`, `birth-royal-th-390.png`: poor resources and standing.
- `birth-desktop.png`, `birth-phone.png`: earlier birth inspection evidence.

## Final automated verification and review

- `npm test`: **693/693 tests across 80 files PASS**, 100.86s, exit0.
- `npm run build`: TypeScript/Vite **PASS**, exit0; existing >500kB advisory
  remains (JS829.34kB, CSS61.80kB). No new dependency/configuration changes.
- Final browser rerun on `1132b5e`: main23 + matrix31 cases **PASS**, no errors
  or overflow. Additional main-run assertions verify the work panel shows zero
  silver throughout all three credited service years and that the preacceptance
  offer includes Asura, 18-silver basic support and no exit fee. The credited-year
  screenshot was visually inspected, alongside desktop and narrow Thai layouts.
- Whole-source review found two Important presentation issues: raw career pay
  bypassed service compensation, and the quote omitted region/support/exit terms.
  Both were reproduced with RED tests, fixed in `1132b5e` and independently
  rereviewed as addressed. Refusal wording now names the actual household region.
- Earlier full-suite run exposed40 failures in15 older adult age-jump/catalogue
  fixtures. Targeted reproduction confirmed the new responsibility guard and
  stricter birth facts invalidated those synthetic adult assumptions. Commit
  `211f964` explicitly uses absent-ledger compatibility fixtures for unrelated
  tests, preserving assertions, while new release/App tests retain actual social
  lives and the registry test builds real bilingual debt decisions. All102
  affected focused tests passed before the final full-suite pass.
- New release coverage includes paired save/reload futures, raw-save corruption
  recovery, frozen old expanded/legacy fixtures, unchanged archives, manual Watch,
  immediate choice persistence, write failure/retry and malformed-load retry.

## Limits and handoff

These were automated real-browser interactions, not a full operating-system
keyboard, screen-reader, reduced-motion or hidden-operating-system-tab audit.
Browser storage failure/recovery and the broader illness/relocation/job-change,
migration and archive boundaries were not manually injected in this browser run;
their automated test evidence must be reported separately. No production publish
or upload occurred. Final full-suite/build and source review passed as recorded above. Branch freshness
was verified against origin/main e7fa05b; code/docs1ed99cc reached the matching
remote branch. [GitHub CI](https://github.com/ny147/1-in-mushoku-tensei/actions/runs/43567646381/job/132364867826)
passed test/build/config validation on1ed99cc, and PR28 was marked ready for human
review. This documentation-only handoff may start another CI run. The user merges
the PR manually; no publication or automatic merge was performed.

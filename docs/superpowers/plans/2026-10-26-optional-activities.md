# Optional activities and accessible careers

User feedback: careers feel restricted to farmer; Seven Great Powers challenges
should be among optional choices players can open whenever they choose. The user
confirmed an optional activities menu on 2026-10-26. This is a focused follow-up
to merged PR #10, on `codex/career-choice-access` from `origin/main` at `271f718`.

Design: add an optional activities disclosure to the chronicle, with careers,
instruction, talent assessment, university, travel, meeting people and legendary
challenges. Reuse the existing decision presentation. Opening an activity pauses
time, saves immediately, consumes no time/resources/random draws, and cannot
replace another pending decision. Player-opened activities remain manual in Watch
mode, including after reload. Existing lives stay loadable. Legendary challenges
leave the random event pool; old pending challenge saves remain actionable.

Career browsing is available from age 15, including from the first work choice.
Keep real qualifications, costs and deterministic yearly vacancies; explain each
job's requirements and vacancy status in English/Thai before commitment. Preserve
independent career histories and charge appointment costs exactly once.

Plan:
1. Reproduce inaccessible careers/manual activity requirements with failing domain
   and App tests. Implement guarded activity requests and existing-save validation.
2. Add the compact menu and bilingual job availability descriptions. Cover opening,
   cancellation, changing job, pending-choice protection and Watch/reload behavior.
3. Run complete tests/build, inspect desktop/mobile/keyboard flows on isolated
   port 5180, review the diff, update PRODUCT/DESIGN and CONTINUE, commit/push a
   follow-up PR targeting main. User merges manually; no deployment.

Diagnosis: first work offered only farmer/laborer; other jobs required a rare
career event plus a 10% yearly vacancy (2% professor) without visible explanation.
Challenges already had a decline choice, but randomly interrupted ordinary lives.

Complete: guarded activity requests, bilingual menu/requirements/vacancies/fees,
persisted manual marker, first-work career entry and opt-in legendary challenges.
Domain and App tests reproduced the inaccessible actions RED→GREEN. One fresh
read-only review identified a required fee-disclosure repair; English/Thai UI test
reproduced it RED→GREEN. Final `npm test`: **197/197 across 33 files**, 64.04 seconds;
`npm run build` passed, with existing nonblocking >500 kB bundle advisory.

Browser QA on isolated 5180: desktop menu, merchant appointment charges 30 once
and retains 170 coins/age 35 after reload; voluntary challenge opens/restores and
can be declined without fighting; Thai menu opens by Enter, Thai career fees and
vacancy reasons display. No overflow at 1280/390/320px or captured warning/error
logs. Detector reported no findings for the changed UI targets. Owned QA server/
tab closed; viewport reset; player 5173 storage untouched.

Final: minor (deferred): specific instruction XP/cap/aura lock reasons remain
generic in the instruction decision; existing requirements still apply.
Final: minor (deferred): university menu is disabled after graduation without
a specific completed-degree explanation; existing degree remains intact.

Ruling: retain yearly vacancies and qualification/cost rules, remove only the
random-event gate to access — preserves the approved simulation balance while
making opportunities discoverable — a desired job may still have no vacancy
in a given year, which is now explicitly explained.

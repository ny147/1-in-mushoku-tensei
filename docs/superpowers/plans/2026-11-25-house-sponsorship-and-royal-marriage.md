# House sponsorship and royal marriage — Stage 3 implementation plan

> **For agentic workers:** After review, use superpowers:executing-plans or superpowers:subagent-driven-development. Run the focused regression before and after each implementation step.

**Goal:** Let noble households fund eligible education in exchange for service, and give adult Asuran dynasty characters an optional political marriage through the existing family system.

**Architecture:** Add a versioned house ledger beside the social and succession ledgers. Route sponsorship through the existing education reserve, house obligations through annual settlement, and political marriage through the existing marriage record. Preserve the Stage 2 crown as a separate relationship with a shared limit on overlapping service.

**Tech stack:** TypeScript, React, Vite, Vitest, React Testing Library and browser localStorage.

**Spec:** [Standing consequences, Stage 3](../specs/2026-11-13-standing-consequences-design.md#stage-3-broader-house-sponsorship-and-royal-marriages). [Stage 2 implementation](2026-11-23-asura-succession.md).

**Status:** Approved and implemented in PR #36 from `55315b9`. See the [checkpoint](../../../CONTINUE.md) for verification.

## Implementation record

- Eligible house petitions grant protection for the next local annual settlement with a three-year cooldown. Stage 2 crown benefits retain their own terms.
- Royal marriage proposals require a local existing courtship prospect and open once the succession is settled. Reigning protagonists can consider new proposals after leaving office.
- Reviews added regressions for the first age-15 university offer, precedence for historical choices, tuition separated from living costs, and refusal after a title is regained. House service pauses ordinary career advancement and its work hazards.

## Rules for review

| Topic | Proposed first release |
| --- | --- |
| Providers | Use the existing local associations in Asura, Ranoa and Millis. Match the current home region. Born and earned nobles qualify on the same terms. An Asuran dynasty member still needs current local access. |
| Sponsorship | A house starts with a 72-silver education reserve per life. A sponsorship covers up to 48 silver of remaining eligible tuition on a new university or career-training enrollment. A scholarship and sponsorship cannot cover the same tuition. Family, personal funds and an explicitly chosen education loan can cover the remainder. |
| Service | One full eligible year after sponsored study ends if the house spent any tuition. A single year covers the service obligation for that sponsorship. Returning unused money closes the reserve. Withdrawing after tuition was spent leaves the disclosed service term. |
| House requests | At most one major commitment at a time. On the third anniversary of local access and every third year thereafter, offer 8 silver, one eligible year of local service, or a one-year extension. Stage 2 crown recognition owns duty scheduling while applicable. |
| Refusal | First explicit refusal warns. A second suspends new local house benefits. A third opens a manual choice between negotiated service and title relinquishment. Hardship and conflicting commitments defer the request. Completing the negotiated year clears strikes. |
| Marriage | Offer an eligible existing local partner to an unmarried adult dynasty member after the K425 outcome. Acceptance gives two annual settlements of local protection and one eligible year of household service. Refusal costs one proposal from that house for three years. It never counts as a duty refusal. |
| Lineage | Keep the marriage alliance as an affiliation. Keep both parents and children's existing origin and ancestry records. Stage 3 confers no new biological lineage or throne eligibility through marriage. |

The amounts, cadence, provider list, and marriage benefits above are proposed balance. The agreed rules include equivalent standing rights for earned and born nobles, source-aware sponsor refunds, adult manual marriage, and no change to the succession odds from a marriage.

## Global constraints

- Use a pure seeded simulation. Quotes, previews and reloads consume no random draws. Keep K424/K425 history, prior saves, archive snapshots and pending IDs stable.
- Preserve the 16-event queue limit. Use due ledgers for binding decisions and the existing manual Watch pause and immediate save paths.
- Check eligibility in the domain as well as the UI. Exile blocks Asuran privileges and any move to Asura. Custody, governing and incompatible commitments gate service. Use original English and Thai copy.
- Provider funds stay outside the personal purse, education debt, and the ruler's treasury. Existing obligations and reserved education money retain their owners through marriage, relocation and title loss.

## Review focus

- A partial scholarship or previously reserved tuition must leave exactly one source paying each silver.
- A title lost or a move made with a pending quote must trigger a fresh eligibility check before funds or status change.
- An earned title followed by authority recognition must not queue two duties or award two years of service in the same year.
- A partner who dies, relocates or becomes ineligible while a proposal is queued must leave a dismissible proposal.
- A return of unused sponsor money after withdrawal, death or reload must be applied once to its original house.

## Implementation sequence

Paths beginning with `src/` are relative to `six-faced-life/`. Run focused tests from that directory. Use a failing regression first, rerun it after the change, and commit the verified task.

### 1. Add prospective house access and save validation

- [ ] Add `src/game/expanded/house-state.test.ts`. Cover active born and earned nobles in each supported region, relocation, exiled dynasty members, an existing Stage 2 crown request, and legacy and ended snapshots. Assert exact equality of pending choices, dated facts and RNG when migrating an older save.
- [ ] Add `src/game/expanded/house-state.ts` with `activateHouseState(life: ExpandedLife): ExpandedLife`, `eligibleHouse(life: ExpandedLife): HouseAssociation | null` and `validateHouseState(life: ExpandedLife): boolean`. Extend `expanded/types.ts`, `expanded/engine.ts` and `src/game/storage.ts`. Activate after social and succession migration at a boundary with no pending/queued choices. Record the first eligible year when access opens. Persist per-provider balances, due records, active service and marriage proposal facts. Suspend access on relocation and retain the original anniversary, funding ownership and history.
- [ ] Run `npm test -- src/game/expanded/house-state.test.ts src/game/storage-codec.test.ts`. Reject impossible balances, duplicate service and invalid endpoint references. Preserve completed snapshots byte for byte.

### 2. Fund eligible tuition and return unused funds

- [ ] Add `src/game/expanded/house-sponsorship.test.ts`. Demonstrate a 60-silver tuition charge quoted with 48 sponsor silver and a 12-silver remainder, a fully covered scholarship with zero sponsor funds, a partly completed withdrawal, a stale quote and repeat refund after reload.
- [ ] Add `src/game/expanded/house-sponsorship.ts` with `quoteHouseSponsorship(life: ExpandedLife, cost: EducationCost): HouseSponsorQuote | null`. Carry exact provider, purpose, covered tuition and service term. Use existing admission and placement requirements in `education.ts`, `training.ts` and their decision paths. Bind approval to enrollment so a stale, unaffordable or ineligible quote spends zero silver. Never retrofit an already reserved course.
- [ ] Add an optional sponsor source to `FundingRecord` in `career-access.ts`. Update `education-finance.ts` and `education-access-state.ts` to consume this source only for tuition. Pass expense purpose at annual charge sites in `economy.ts` and `training.ts`. Preserve the existing family, personal and loan order for the remainder. Assert provider opening + refunds − reservations equals its current balance, and that spent funds never become debt.
- [ ] Exercise completion, pause, withdrawal, changed qualification and death. Return unspent sponsor funds to the original provider before releasing the reservation. Run `npm test -- src/game/expanded/house-sponsorship.test.ts src/game/expanded/education-finance.test.ts src/game/expanded/debt-budget.test.ts`.

### 3. Run local duties and honor existing commitments

- [ ] Add `src/game/expanded/house-service.test.ts`. Include a penniless noble, deferred service during custody or study, a missed year during illness, relocation, crown duties already scheduled and boundaries around offer/reload. Assert only explicit refusal adds a strike.
- [ ] Add `src/game/expanded/house-service.ts` with `advanceHouseYear(life: ExpandedLife): void` and `nextHouseDecision(life: ExpandedLife): string | null`. Wire into `expanded/engine.ts`, `events.ts`, `balance.ts` and `activities.ts`. Schedule after historical and existing crown decisions. Use a shared availability check for household, crown, creditor and marriage service with priority for the oldest accepted eligible term. Pause the others and record the reason. A year credits one term at most. House service replaces ordinary wages and progression for that year.
- [ ] Final refusal opens a manual decision. Title relinquishment removes actual local access, protection and new sponsorship eligibility. Preserve ancestry, education, earlier house spending and existing balances. Reuse the same benefit gate for optional petitional access and generated requests.
- [ ] Run `npm test -- src/game/expanded/house-service.test.ts src/game/expanded/crown-service.test.ts src/game/expanded/debt-service.test.ts`.

### 4. Offer royal marriage through the existing family record

- [ ] Add `src/game/expanded/royal-marriage.test.ts`. Test adult vs underage, currently married, dead/absent prospects, proposal refresh, no eligible partner, refusal cooldown, divorce or death ending protection, and no change to the existing succession record.
- [ ] Add `src/game/expanded/royal-marriage.ts` with `quoteRoyalMarriage(life: ExpandedLife): RoyalMarriageQuote | null` and `acceptRoyalMarriage(life: ExpandedLife, candidateId: string): boolean`. Use an eligible adult already introduced through ordinary courtship and living in the same region. Select the earliest eligible local person by birth-independent stable record order. Revalidate via `family.ts` and call `marry` only after explicit acceptance. Keep location and relationships intact. Store the political affiliation alongside that specific marriage. Use the same partner death and divorce hooks to end benefits. Completed service remains recorded. Unstarted marriage service ends when the alliance ends.
- [ ] Register the optional proposal in `activities.ts` and make it manual in `events.ts`. Display terms, cooldown and protection dates. Confirm ordinary courtship and the current regional marriage rules still work. Run `npm test -- src/game/expanded/royal-marriage.test.ts src/game/expanded/family.test.ts src/game/expanded/succession-restrictions.test.ts`.

### 5. Verify and deliver the playable stage

- [ ] Render provider, original funding source, spent and reserved amounts, obligations and alliance status in `src/components/StandingDetails.tsx`, `EducationProgress.tsx`, `OptionalActivities.tsx` and the chronicle. Surface actual source refunds, title loss and alliance changes in EN/TH outcomes and `expanded/summary.ts`. Verify late title-loss and financial failure text truthfully describes what happened.
- [ ] Extend `src/App.test.tsx` and `src/language.test.tsx` for manual Watch pause, stale offer, keyboard action, immediate reload, hidden tab and recoverable storage failure. Run `npm test` and `npm run build`. Use isolated Chromium on port 5174 for mobile and desktop, both languages, and sponsor withdrawal, duty refusal and marriage acceptance. Check keyboard focus, overflow and console.
- [ ] Document delivered behavior and results in the README, PRODUCT and CONTINUE. Review the complete diff and fetch before pushing. Update the Stage 3 PR against `main` for manual merge.

## Decisions to review

Confirm the 48-silver tuition cap and one-year return of service, whether a dynasty offer should require an existing courtship prospect, and whether marriage should grant temporary protection without changing lineage. These choices determine the funding quotes, marriage eligibility and archive wording.

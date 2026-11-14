import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { quoteDebtService, debtServiceYear, creditDebtServiceYear, creditorServiceReplacesWork } from "./parental-debt";
import { worldYear } from "./facts";
import { annualIncomeExpanded, appoint } from "./careers";
import { applyEconomyYear } from "./economy";
import { enterCareerNode } from "./career-paths";
import { careerProject, applyCareerProject } from "./career-work";
import { advanceExpanded, finishExpanded } from "./engine";
import { validateSocialState } from "./social-validation";
import { enrollTraining, quoteTraining } from "./training";
import { getExpandedDecision, applyExpandedChoice } from "./events";
import { applySwordApproach, swordApproach } from "./sword-events";
import { allocateSwordStyle } from "./sword-state";
import { chooseExpanded } from "./engine";

function servant() {
  const l = Array.from({ length: 100 }, (_, seed) => createExpandedLife({ seed })).find(l => l.expansion.social?.debt)!;
  l.phase = "alive"; l.age = 20; l.pending = null; l.expansion.queue = [];
  l.stats.health = 100; l.deathAge = 1000; l.focus = "work"; l.coins = 20;
  enterCareerNode(l, "laborer");
  const d = l.expansion.social!.debt!, y = worldYear(l);
  Object.assign(d, { balance: 34, childhoodPaid: 14, lastChildhoodYear: l.expansion.birthYear + 14, status: "service", decisionYear: y, lastRepaymentYear: y, pauseReason: "service" });
  d.service = { acceptedBalance: 34, region: l.region, startedYear: y, requiredYears: 3, completedYears: 0, lastYear: y, endedYear: null, endReason: null };
  return l;
}
describe("elapsed creditor service years", () => {
  it.each(["assignment", "service"] as const)("retains credited work through annual health loss and rejects %s rewards", event => {
    let l = servant(); l.stats.health = 20;
    l = advanceExpanded(l, "year");
    expect(l.stats.health).toBeLessThan(20);
    expect(l.expansion.social!.debt!.servicePaid).toBe(12);
    expect(l.expansion.social!.debt!.service!.lastCreditYear).toBe(worldYear(l));
    expect(annualIncomeExpanded(l)).toBe(0);
    expect(creditorServiceReplacesWork(l, worldYear(l))).toBe(true);
    l.pending = `expanded.${event}`; l.expansion.politics.faction = "orsted";
    l.expansion.history.push({ year: worldYear(l), code: "conflict", region: l.region, locality: l.expansion.origin.locality, exposure: "civilian" });
    l.expansion.serviceContext = { year: worldYear(l), code: "conflict", region: l.region, locality: l.expansion.origin.locality };
    allocateSwordStyle(l, "north-god"); l.expansion.swords!.tracks["north-god"].xp = 110;
    expect(getExpandedDecision(l)!.choices.filter(c => !c.id.endsWith(".later")).every(c => c.disabled)).toBe(true);
    expect(swordApproach(l, event)).toBeNull();
    const before = structuredClone(l);
    expect(chooseExpanded(l, `expanded.${event}.accept`)).toBe(l);
    applyExpandedChoice(l, `expanded.${event}.accept`);
    applySwordApproach(l, event, "north-god");
    expect(l).toEqual(before);
    l.region = l.region === "asura" ? "ranoa" : "asura"; l.expansion.career.role = "farmer";
    expect(creditorServiceReplacesWork(l, worldYear(l))).toBe(true);
  });
  it("keeps wage and project replacement after this year's credit has been recorded", () => {
    const l = servant(); l.age++;
    creditDebtServiceYear(l, debtServiceYear(l, worldYear(l)));
    expect(debtServiceYear(l, worldYear(l)).eligible).toBe(true);
    expect(annualIncomeExpanded(l)).toBe(0);
    expect(careerProject(l, "risk")).toBeNull();
  });
  it.each(["assignment", "service"] as const)("rejects competing %s cash assignments and sword rewards, including stale saved actions", event => {
    const l = servant(); l.age++; l.pending = `expanded.${event}`;
    l.expansion.politics.faction = "orsted";
    l.expansion.history.push({ year: worldYear(l), code: "conflict", region: l.region, locality: l.expansion.origin.locality, exposure: "civilian" });
    l.expansion.serviceContext = { year: worldYear(l), code: "conflict", region: l.region, locality: l.expansion.origin.locality };
    allocateSwordStyle(l, "north-god");
    l.expansion.swords!.tracks["north-god"].xp = 110;
    const decision = getExpandedDecision(l)!;
    expect(decision).not.toBeNull();
    expect(decision.choices.filter(c => !c.id.endsWith(".later")).every(c => c.disabled)).toBe(true);
    expect(swordApproach(l, event)).toBeNull();
    const before = structuredClone(l);
    expect(chooseExpanded(l, `expanded.${event}.accept`)).toBe(l);
    applyExpandedChoice(l, `expanded.${event}.accept`);
    applyExpandedChoice(l, `expanded.${event}.north-god`);
    applySwordApproach(l, event, "north-god");
    expect(l).toEqual(before);
    l.expansion.swords!.compatibilityDecision = { ...decision, choices: decision.choices.map(c => ({ ...c, disabled: false })) };
    expect(getExpandedDecision(l)!.choices.find(c => c.id.endsWith(".accept"))!.disabled).toBe(true);
  });
  it("quotes without RNG, excludes acceptance year and caps12/12/10 credit", () => {
    const l = servant(), d = l.expansion.social!.debt!, before = structuredClone(l);
    expect(quoteDebtService(l)).toEqual({ balance: 34, region: l.region, requiredYears: 3, annualCredit: 12 });
    expect(debtServiceYear(l, worldYear(l))).toMatchObject({ eligible: false, credit: 0, pauseReason: "not-started" });
    expect(l).toEqual(before);
    for (const credit of [12, 12, 10]) {
      l.age++; const y = debtServiceYear(l, worldYear(l));
      expect(y).toMatchObject({ eligible: true, credit, support: 18 });
      expect(annualIncomeExpanded(l)).toBe(0);
      const coins = l.coins; const accounting = applyEconomyYear(l, y);
      expect(accounting).toMatchObject({ creditorService: true, earnedIncome: 0, unmetNeeds: false });
      expect(l.coins).toBe(coins);
      creditDebtServiceYear(l, y); const after = structuredClone(l);
      creditDebtServiceYear(l, y); expect(l).toEqual(after);
      expect(validateSocialState(l.expansion.social, l)).toBe(true);
    }
    expect(d).toMatchObject({ balance: 0, servicePaid: 34, status: "settled", service: { completedYears: 3, endReason: "completed" } });
    l.age++; expect(annualIncomeExpanded(l)).toBeGreaterThan(0);
  });
  it.each(["health", "study", "region", "occupation"] as const)("pauses both support and credit for %s", reason => {
    const l = servant(); l.age++;
    if (reason === "health") l.stats.health = 19;
    if (reason === "study") l.expansion.education.stage = "university";
    if (reason === "region") l.region = l.region === "ranoa" ? "asura" : "ranoa";
    if (reason === "occupation") l.expansion.career.role = "farmer";
    const y = debtServiceYear(l, worldYear(l));
    expect(y).toMatchObject({ eligible: false, support: 0, credit: 0, pauseReason: reason });
    creditDebtServiceYear(l, y); expect(l.expansion.social!.debt!.servicePaid).toBe(0);
    expect(l.expansion.social!.debt!.service!.lastYear).toBe(worldYear(l));
  });
  it("covers actual dependants in kind without depositing spare necessities", () => {
    const l = servant(); l.age++;
    l.expansion.family.people.push({ ...l.expansion.family.people[0], id: "dependent", role: "child", born: worldYear(l) - 1, died: null });
    l.expansion.family.people.push({ ...l.expansion.family.people[0], id: "dependent-spouse", role: "spouse", died: null });
    l.expansion.family.marriages.push({ person: "dependent-spouse", start: worldYear(l) - 1, end: null, reason: null });
    const y = debtServiceYear(l, worldYear(l));
    expect(y.support).toBe(28); applyEconomyYear(l, y);
    expect(l.coins).toBe(20); expect(l.expansion.economy.lastExpenses).toBe(28);
  });
  it("blocks projects at quote and execution and preserves RNG", () => {
    const l = servant(); l.age++; const before = structuredClone(l);
    expect(careerProject(l, "safe")).toBeNull(); expect(applyCareerProject(l, "risk")).toBe(false); expect(l).toEqual(before);
  });
  it("part-time study consumes its own funding once while service credits only laborer work", () => {
    let l = servant(); l.expansion.economy.familyFunds = 100;
    expect(enrollTraining(l, quoteTraining(l, "mage", "part-time"), false)).toBe(true);
    const remaining = l.expansion.finance!.purposes.mage!.reserved.family;
    l = advanceExpanded(l, "year");
    expect(l.expansion.training!.records.mage.units).toBe(1);
    expect(l.expansion.finance!.purposes.mage!.reserved.family).toBe(remaining - 4);
    expect(l.expansion.careerPaths!.work.everyday.years).toBe(1);
    expect(l.expansion.standing.service).toBe(0);
    expect(l.expansion.social!.debt!.servicePaid).toBe(12);
    expect(l.coins).toBe(20);
  });
  it("retains the health snapshot when rest restores eligibility during the year", () => {
    const l = servant(); l.stats.health = 19; l.focus = "rest";
    const n = advanceExpanded(l, "year");
    expect(n.stats.health).toBeGreaterThan(20);
    expect(n.expansion.economy.lastIncome).toBe(18);
    expect(n.coins).toBe(20);
    expect(n.expansion.social!.debt!.servicePaid).toBe(0);
  });
  it("retains eligible support and credit when work lowers health during the year", () => {
    const l = servant(); l.stats.health = 20;
    const n = advanceExpanded(l, "year");
    expect(n.stats.health).toBeLessThan(20);
    expect(n.expansion.economy).toMatchObject({ lastIncome: 0, unmetFood: 0, unmetShelter: 0, unmetCare: 0 });
    expect(n.coins).toBe(20);
    expect(n.expansion.social!.debt!.servicePaid).toBe(12);
  });
  it("retains support in the capped final year and resumes ordinary wages next year", () => {
    let l = servant();
    // A higher ordinary pay floor must never change quoted service compensation.
    l.expansion.careerPaths!.payFloor.laborer = 58;
    l.expansion.career.records.laborer.level = 3;
    for (const total of [12, 24, 34]) {
      l.pending = null; l.expansion.queue = []; l = advanceExpanded(l, "year");
      expect(l.phase).toBe("alive"); expect(l.coins).toBe(20);
      expect(l.expansion.economy.lastIncome).toBe(0);
      expect(l.expansion.social!.debt!.servicePaid).toBe(total);
    }
    expect(l.expansion.social!.debt!.status).toBe("settled");
    expect(annualIncomeExpanded(l)).toBe(0);
    expect(careerProject(l, "risk")).toBeNull();
    l.pending = null; l.expansion.queue = []; l = advanceExpanded(l, "year");
    expect(l.expansion.economy.lastIncome).toBe(64);
    expect(l.coins).toBe(66);
  });
  it("credits only the appointed laborer role and preserves previous earned work", () => {
    let l = servant();
    expect(enterCareerNode(l, "farmhand")).toBe(true);
    l.expansion.careerPaths!.work.farming = { years: 7, units: 10, milestones: 2 };
    l.expansion.career.records.farmer.years = 7;
    expect(appoint(l, "laborer")).toBe(true);
    l = advanceExpanded(l, "year");
    expect(l.expansion.career.records.farmer.years).toBe(7);
    expect(l.expansion.career.records.laborer.years).toBe(1);
    expect(l.expansion.careerPaths!.work.farming).toEqual({ years: 7, units: 10, milestones: 2 });
    expect(l.expansion.careerPaths!.work.everyday).toEqual({ years: 1, units: 2, milestones: 0 });
    expect(l.expansion.training!.records.laborer.units).toBe(0);
    expect(l.expansion.standing.service).toBe(0);
  });
  it("retains completed year's work after early exit instead of enabling another cash project", () => {
    const l = servant(); l.age++;
    creditDebtServiceYear(l, debtServiceYear(l, worldYear(l)));
    const d = l.expansion.social!.debt!;
    d.status = "accepted"; d.service!.endedYear = worldYear(l); d.service!.endReason = "exit";
    expect(l.expansion.careerPaths!.lastProjectYear).toBe(worldYear(l));
    expect(careerProject(l, "risk")).toBeNull();
    expect(debtServiceYear(l, worldYear(l))).toMatchObject({ eligible: false, pauseReason: "ended" });
    expect(d.servicePaid).toBe(12); expect(d.balance).toBe(22);
    l.age++;
    expect(annualIncomeExpanded(l)).toBeGreaterThan(0);
    expect(careerProject(l, "risk")).not.toBeNull();
  });
  it("does not consume a paused year's project opportunity on exit", () => {
    const l = servant(); l.age++; l.stats.health = 19;
    l.expansion.social!.debt!.service!.lastCreditYear = null;
    const marker = l.expansion.careerPaths!.lastProjectYear;
    creditDebtServiceYear(l, debtServiceYear(l, worldYear(l)));
    expect(l.expansion.social!.debt!.service!.lastCreditYear).toBeNull();
    expect(l.expansion.careerPaths!.lastProjectYear).toBe(marker);
    const d = l.expansion.social!.debt!;
    d.status = "accepted"; d.service!.endedYear = worldYear(l); d.service!.endReason = "exit";
    expect(careerProject(l, "risk")).not.toBeNull();
    expect(annualIncomeExpanded(l)).toBe(24);
  });
  it("does not credit the year of death and never attaches debt to a child", () => {
    const l = servant(); l.age++; creditDebtServiceYear(l, debtServiceYear(l, worldYear(l)));
    l.expansion.family.people.push({ ...l.expansion.family.people[0], id: "child-death", role: "child", born: worldYear(l) - 1, died: null });
    const child = structuredClone(l.expansion.family.people.at(-1));
    l.deathAge = l.age + 1;
    const n = advanceExpanded(l, "year");
    expect(n.phase).toBe("ended");
    expect(n.expansion.social!.debt).toMatchObject({ servicePaid: 12, balance: 0, closedUnpaid: 22, status: "closed" });
    expect(n.expansion.family.people.at(-1)).toEqual(child);
    expect(validateSocialState(n.expansion.social, n)).toBe(true);
  });
  it("full-time study finishing this year retains the paused service snapshot", () => {
    let l = servant(); l.expansion.economy.familyFunds = 100;
    expect(enrollTraining(l, quoteTraining(l, "laborer", "full-time"), false)).toBe(true);
    l.expansion.training!.records.laborer.units = 2;
    l = advanceExpanded(l, "year");
    expect(l.expansion.training!.active).toBeNull();
    expect(l.expansion.social!.debt!.servicePaid).toBe(0);
    expect(l.expansion.economy.lastIncome).toBe(24);
  });
  it("closes unpaid debt before death summary and grants no incomplete-year credit", () => {
    const l = servant(); l.age++; creditDebtServiceYear(l, debtServiceYear(l, worldYear(l)));
    l.age++; finishExpanded(l, "illness");
    expect(l.expansion.social!.debt).toMatchObject({ balance: 0, servicePaid: 12, closedUnpaid: 22, status: "closed", service: { endReason: "death" } });
    expect(validateSocialState(l.expansion.social, l)).toBe(true);
  });
});

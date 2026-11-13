import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { quoteDebtService, debtServiceYear, creditDebtServiceYear } from "./parental-debt";
import { worldYear } from "./facts";
import { annualIncomeExpanded } from "./careers";
import { applyEconomyYear } from "./economy";
import { enterCareerNode } from "./career-paths";
import { careerProject, applyCareerProject } from "./career-work";
import { advanceExpanded, finishExpanded } from "./engine";
import { validateSocialState } from "./social-validation";
import { enrollTraining, quoteTraining } from "./training";

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
    const y = debtServiceYear(l, worldYear(l));
    expect(y.support).toBe(22); applyEconomyYear(l, y);
    expect(l.coins).toBe(20); expect(l.expansion.economy.lastExpenses).toBe(22);
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

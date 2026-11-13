import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { repayDebtsYear } from "./debt-budget";
import { quoteEducation, reserveEducation, consumeEducation } from "./education-finance";
import { worldYear } from "./facts";

function debtor() {
  const l = Array.from({ length: 100 }, (_, seed) => createExpandedLife({ seed })).find(l => l.expansion.social?.debt)!;
  l.phase = "alive"; l.age = 20; l.pending = null; l.coins = 0;
  l.expansion.economy.familyFunds = 0;
  const d = l.expansion.social!.debt!;
  Object.assign(d, { initial: 10, balance: 10, status: "accepted", decisionYear: worldYear(l) });
  reserveEducation(l, quoteEducation(l, { purpose: "mage", admission: 0, travel: 0, tuition: 8, living: 0, starterFee: 0, remainingUnits: 2, school: null }), true);
  consumeEducation(l, "mage", 3);
  l.coins = 100;
  return l;
}
const year = { worldYear: 0, earnedIncome: 58, necessaryEducationCosts: 0, dependantCosts: 0, universityAttendance: false, unmetNeeds: false };
describe("one affordable annual debt budget", () => {
  it("pays education3 then parental1 under one4 cap and protects reserved loan5", () => {
    const l = debtor(), y = { ...year, worldYear: worldYear(l) };
    repayDebtsYear(l, y);
    expect(l.coins).toBe(96);
    expect(l.expansion.finance!.purposes.mage).toMatchObject({ balance: 5, repaid: 3, reserved: { loan: 5 } });
    expect(l.expansion.social!.debt).toMatchObject({ balance: 9, personalPaid: 1, lastRepayment: 1 });
    const before = structuredClone(l); repayDebtsYear(l, y); expect(l).toEqual(before);
  });
  it.each([
    [{}, 2, 2], [{ earnedIncome: 18 }, 100, 0], [{ unmetNeeds: true }, 100, 0],
    [{ universityAttendance: true }, 100, 0], [{ creditorService: true }, 100, 0],
    [{ additionalShelterCosts: 4 }, 100, 3], [{ dependantCosts: 40 }, 100, 0],
  ])("honors purse, necessities and pauses %j", (extra, coins, paid) => {
    const l = debtor(); l.coins = coins;
    repayDebtsYear(l, { ...year, worldYear: worldYear(l), ...extra });
    expect(l.coins).toBe(coins - paid);
    expect(l.expansion.finance!.lastYear).toBe(worldYear(l));
    expect(l.expansion.social!.debt!.lastRepaymentYear).toBe(worldYear(l));
  });
  it("honors either ledger's guard without granting a fresh cap", () => {
    const l = debtor(); l.expansion.finance!.lastYear = worldYear(l);
    repayDebtsYear(l, { ...year, worldYear: worldYear(l) });
    expect(l.coins).toBe(100); expect(l.expansion.social!.debt!.lastRepaymentYear).toBe(worldYear(l));
  });
});

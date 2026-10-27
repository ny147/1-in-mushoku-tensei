import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import {
  quoteEducation,
  reserveEducation,
  consumeEducation,
  refundEducation,
  repayEducationYear,
  closeEducationDebt,
} from "./education-finance";
const poor = () => {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 20;
  l.coins = 0;
  l.expansion.economy.familyFunds = 0;
  return l;
};
const cost = {
  purpose: "swordsman" as const,
  admission: 0,
  travel: 0,
  tuition: 24,
  living: 0,
  starterFee: 0,
  remainingUnits: 6,
  school: null,
};
describe("education provider finance", () => {
  it("shares one repayment ceiling across two borrowed purposes",()=>{
    const l=poor();
    reserveEducation(l,quoteEducation(l,cost),true);consumeEducation(l,"swordsman",24);
    reserveEducation(l,quoteEducation(l,{...cost,purpose:"mage"}),true);consumeEducation(l,"mage",24);
    l.coins=100;
    repayEducationYear(l,{worldYear:440,earnedIncome:38,necessaryEducationCosts:0,dependantCosts:0,universityAttendance:false,unmetNeeds:false});
    expect(l.coins).toBe(98);expect(l.expansion.finance!.lastRepayment).toBe(2);
    expect(l.expansion.finance!.purposes.swordsman!.balance).toBe(22);
    expect(l.expansion.finance!.purposes.mage!.balance).toBe(24);
  });
  it("requires voluntary borrowing, rejects stale quotes and never grants cash", () => {
    const l = poor(),
      q = quoteEducation(l, cost),
      before = structuredClone(l);
    expect(q.loan).toBe(24);
    expect(reserveEducation(l, q, false)).toBe(false);
    expect(l).toEqual(before);
    l.coins = 1;
    expect(reserveEducation(l, q, true)).toBe(false);
    l.coins = 0;
    expect(reserveEducation(l, q, true)).toBe(true);
    expect(l.coins).toBe(0);
    expect(reserveEducation(l, q, true)).toBe(false);
  });
  it("refunds unused loan principal instead of converting it to cash", () => {
    const l = poor();
    reserveEducation(l, quoteEducation(l, cost), true);
    consumeEducation(l, "swordsman", 8);
    refundEducation(l, "swordsman");
    expect(l.expansion.finance!.purposes.swordsman).toMatchObject({
      borrowed: 24,
      cancelled: 16,
      repaid: 0,
      balance: 8,
      reserved: { family: 0, personal: 0, loan: 0 },
    });
    expect(l.coins).toBe(0);
    refundEducation(l, "swordsman");
    expect(l.coins).toBe(0);
  });
  it("consumes own contributions first and returns each unused source to its owner", () => {
    const l = poor();
    l.coins = 4;
    l.expansion.economy.familyFunds = 4;
    reserveEducation(l, quoteEducation(l, cost), true);
    consumeEducation(l, "swordsman", 8);
    refundEducation(l, "swordsman");
    expect(l.expansion.finance!.purposes.swordsman?.balance).toBe(0);
    expect(l.coins).toBe(0);
    expect(l.expansion.economy.familyFunds).toBe(0);
    const m = poor();
    m.coins = 10;
    m.expansion.economy.familyFunds = 10;
    reserveEducation(m, quoteEducation(m, cost), true);
    consumeEducation(m, "swordsman", 8);
    refundEducation(m, "swordsman");
    expect(m.coins).toBe(10);
    expect(m.expansion.economy.familyFunds).toBe(2);
  });
  it.each([
    [18, 0],
    [19, 1],
    [27, 1],
    [38, 2],
  ])(
    "repays earned income %i only by %i after necessities",
    (income, payment) => {
      const l = poor();
      reserveEducation(l, quoteEducation(l, cost), true);
      consumeEducation(l, "swordsman", 24);
      l.coins = 10000;
      const y = {
        worldYear: l.expansion.birthYear + l.age,
        earnedIncome: income,
        necessaryEducationCosts: 0,
        dependantCosts: 0,
        universityAttendance: false,
        unmetNeeds: false,
      };
      repayEducationYear(l, y);
      expect(l.expansion.finance!.lastRepayment).toBe(payment);
      expect(l.coins).toBe(10000 - payment);
      repayEducationYear(l, y);
      expect(l.coins).toBe(10000 - payment);
    },
  );
  it("protects reserves, savings, dependants and university attendance, sharing one ceiling", () => {
    const l = poor();
    reserveEducation(l, quoteEducation(l, cost), true);
    l.coins = 10000;
    const y = {
      worldYear: 420,
      earnedIncome: 100,
      necessaryEducationCosts: 0,
      dependantCosts: 0,
      universityAttendance: false,
      unmetNeeds: false,
    };
    repayEducationYear(l, y);
    expect(l.expansion.finance!.lastRepayment).toBe(0);
    consumeEducation(l, "swordsman", 8);
    reserveEducation(l, quoteEducation(l, { ...cost, purpose: "mage" }), true);
    consumeEducation(l, "mage", 24);
    repayEducationYear(l, { ...y, worldYear: 421, earnedIncome: 0 });
    expect(l.coins).toBe(9976);
    repayEducationYear(l, { ...y, worldYear: 422, universityAttendance: true });
    expect(l.expansion.finance!.lastRepayment).toBe(0);
    repayEducationYear(l, { ...y, worldYear: 423, dependantCosts: 90 });
    expect(l.expansion.finance!.lastRepayment).toBe(0);
    repayEducationYear(l, { ...y, worldYear: 424, earnedIncome: 38 });
    expect(l.expansion.finance!.lastRepayment).toBe(2);
    refundEducation(l, "swordsman");
    expect(l.expansion.finance!.purposes.swordsman!.balance).toBe(6);
    closeEducationDebt(l);
    expect(l.expansion.finance!.purposes.swordsman!.balance).toBe(0);
    expect(l.expansion.finance!.purposes.swordsman!.closedUnpaid).toBe(6);
  });
});

import { describe, expect, it } from "vitest";
import type { ExpandedLife } from "../types";
import { createExpandedLife } from "./origins";
import {
  applyHouseholdDebtYear,
  housingSurcharge,
  parentalResponsibilityDue,
} from "./parental-debt";
import { validateSocialState } from "./social-validation";
import { quoteEducation, reserveEducation } from "./education-finance";

function debtor() {
  for (let seed = 0; seed < 100; seed++) {
    const l = createExpandedLife({ seed });
    if (!l.expansion.social?.debt) continue;
    l.phase = "alive";
    l.pending = null;
    l.age = 1;
    l.coins = 37;
    l.expansion.economy.support = 10;
    l.expansion.economy.familyFunds = 115;
    reserveEducation(l, quoteEducation(l, {
      purpose: "mage", admission: 0, travel: 0, tuition: 24, living: 0,
      starterFee: 0, remainingUnits: 6, school: null,
    }), false);
    return l;
  }
  throw Error("expected a poor indebted household");
}
describe("childhood household deductions", () => {
  it.each([
    [0, 10, 0, 48],
    [1, 10, 1, 47],
    [14, 10, 1, 47],
    [15, 10, 0, 48],
    [1, 8, 0, 48],
    [1, 9, 0, 48],
  ])("age %s support %s pays %s without touching personal funds", (age, support, paid, balance) => {
    const l = debtor();
    l.age = age;
    l.expansion.economy.support = support;
    const rng = [l.rng, l.expansion.familyRng, l.expansion.worldSeed];
    const finance = structuredClone(l.expansion.finance);
    expect(applyHouseholdDebtYear(l)).toBe(paid);
    expect(l.expansion.social!.debt).toMatchObject({ balance, childhoodPaid: paid, personalPaid: 0 });
    expect(l.expansion.economy.support).toBe(support);
    expect(l.expansion.economy.familyFunds).toBe(91);
    expect(l.coins).toBe(37);
    expect(l.expansion.finance).toEqual(finance);
    expect([l.rng, l.expansion.familyRng, l.expansion.worldSeed]).toEqual(rng);
    expect(validateSocialState(l.expansion.social, l)).toBe(true);
  });
  it("uses a durable year guard rather than bounded history and pays only once", () => {
    const l = debtor();
    expect(applyHouseholdDebtYear(l)).toBe(1);
    l.history = [];
    l.seen = [];
    l.expansion.facts = [];
    const saved = structuredClone(l);
    expect(applyHouseholdDebtYear(l)).toBe(0);
    expect(l).toEqual(saved);
    l.age++;
    expect(applyHouseholdDebtYear(l)).toBe(1);
    expect(l.expansion.social!.debt!.balance).toBe(46);
  });
  it.each<[string, (l: ExpandedLife) => void]>([
    ["dead", l => l.expansion.family.people.forEach(p => p.died = l.expansion.birthYear)],
    ["absent", l => l.expansion.family.people.forEach(p => p.home = l.region === "asura" ? "ranoa" : "asura")],
    ["unrecorded", l => l.expansion.social!.household.parentIds = []],
  ])("pauses when recorded parents are %s", (_label, alter) => {
    const l = debtor();
    alter(l);
    expect(applyHouseholdDebtYear(l)).toBe(0);
    expect(l.expansion.social!.debt!.balance).toBe(48);
    // A pause cannot create a second collection opportunity in the same year.
    l.expansion.family.people.forEach(p => { p.died = null; p.home = l.birthRegion; });
    l.expansion.social!.household.parentIds = ["mother", "father"];
    expect(applyHouseholdDebtYear(l)).toBe(0);
  });
  it("collects with one living recorded local parent and settles the last silver", () => {
    const l = debtor();
    const s = l.expansion.social!, d = s.debt!;
    l.age = 14;
    d.initial = 14;
    d.balance = 1;
    d.childhoodPaid = 13;
    d.lastChildhoodYear = l.expansion.birthYear + 13;
    l.expansion.family.people.find(p => p.id === "mother")!.died = l.expansion.birthYear;
    expect(applyHouseholdDebtYear(l)).toBe(1);
    expect(d).toMatchObject({ balance: 0, childhoodPaid: 14, status: "settled" });
    l.age = 15;
    expect(parentalResponsibilityDue(l)).toBe(false);
    expect(validateSocialState(s, l)).toBe(true);
  });
  it("leaves absent ledgers and ended lives untouched", () => {
    const l = debtor();
    l.phase = "ended";
    const before = structuredClone(l);
    expect(applyHouseholdDebtYear(l)).toBe(0);
    expect(l).toEqual(before);
    delete l.expansion.social;
    expect(applyHouseholdDebtYear(l)).toBe(0);
  });
});

describe("age-15 household responsibility", () => {
  it.each([[14, false], [15, true], [18, true]])("is due at age %s: %s even without living parents", (age, due) => {
    const l = debtor();
    l.age = age;
    l.expansion.family.people.forEach(p => p.died = l.expansion.birthYear);
    const before = structuredClone(l);
    expect(parentalResponsibilityDue(l)).toBe(due);
    expect(l).toEqual(before);
  });
  it("never creates liability or repeats a recorded decision", () => {
    const l = debtor();
    l.age = 15;
    l.coins = 0;
    l.expansion.social!.debt!.decisionYear = l.expansion.birthYear + 15;
    l.expansion.social!.debt!.status = "refused";
    expect(parentalResponsibilityDue(l)).toBe(false);
    l.expansion.social!.debt = null;
    expect(parentalResponsibilityDue(l)).toBe(false);
    delete l.expansion.social;
    expect(parentalResponsibilityDue(l)).toBe(false);
  });
});

describe("bounded replacement housing", () => {
  it.each([[420, 0], [421, 4], [422, 4], [423, 4], [424, 0]])("at K%s charges %s for the bounded subsequent cycles", (year, cost) => {
    const l = debtor();
    const h = l.expansion.social!.household;
    h.housing = "security-lost";
    h.housingLossYear = 420;
    const before = structuredClone(l);
    expect(housingSurcharge(l, year)).toBe(cost);
    expect(l).toEqual(before);
    l.region = h.home === "asura" ? "ranoa" : "asura";
    expect(housingSurcharge(l, year)).toBe(0);
  });
  it("does not invent loss from secure tenancy, missing dates or absent ledgers", () => {
    const l = debtor();
    expect(housingSurcharge(l, 421)).toBe(0);
    l.expansion.social!.household.housing = "security-lost";
    expect(housingSurcharge(l, 421)).toBe(0);
    delete l.expansion.social;
    expect(housingSurcharge(l, 421)).toBe(0);
  });
});

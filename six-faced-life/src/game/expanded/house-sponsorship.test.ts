import { describe, expect, it } from "vitest";
import { associationForRegion } from "./social-state";
import { createExpandedLife } from "./origins";
import { enrollUniversity, universityQuote } from "./education";
import { closeEducationDebt, quoteEducation, refundEducation } from "./education-finance";
import { applyEconomyYear } from "./economy";
import { applyTrainingYear, enrollTraining, pauseTraining, quoteTraining, withdrawTraining } from "./training";
import type { ExpandedLife } from "../types";
import { advanceExpanded, chooseExpanded } from "./engine";
import { getExpandedDecision } from "./events";
import { activateHouseState } from "./house-state";

function noble() {
  const life = createExpandedLife({ seed: 1, region: "ranoa" });
  life.phase = "alive";
  life.age = 15;
  life.coins = 0;
  life.stats.knowledge = 40;
  life.training.magicXp = 60;
  life.expansion.economy.familyFunds = 0;
  life.expansion.genetics.magicTalent = false;
  life.expansion.genetics.academicTalent = false;
  life.expansion.standing.status = "noble";
  life.expansion.social!.association = associationForRegion("ranoa", "earned", life.expansion.birthYear + life.age);
  return activateHouseState(life);
}

describe("house tuition sponsorship", () => {
  it("offers sponsorship on the first qualifying university card at age fifteen", () => {
    const life = noble();
    life.age = 14;
    life.coins = 500;
    life.stats.health = 100;
    life.expansion.social!.debt = null;
    delete life.expansion.house;
    const atFifteen = advanceExpanded(life, "year");
    const university = chooseExpanded(atFifteen, "expanded.work.later");
    expect(university.pending).toBe("expanded.university");
    expect(getExpandedDecision(university)?.choices.some(choice => choice.id.includes(".sponsor-enroll-"))).toBe(true);
  });

  it("covers at most 48 of a 60 silver tuition quote", () => {
    const life = noble();
    const quote = quoteEducation(life, { ...universityQuote(life), admission: 0, travel: 0, living: 0, tuition: 60 }, true);
    expect(quote.sponsor).toMatchObject({ providerId: "ranoa-local", amount: 48, serviceYears: 1 });
    expect(quote.loan).toBe(12);
  });

  it("keeps a scholarship fully separate from house funding", () => {
    const life = noble();
    life.expansion.genetics.magicTalent = true;
    life.expansion.education.assessed = true;
    life.expansion.education.assessment = 60;
    const quote = universityQuote(life, true);
    expect(quote.sponsor).toBeUndefined();
    expect(quote.total).toBe(0);
    expect(enrollUniversity(life, { quote, borrow: false })).toBe(true);
    expect(life.expansion.house!.balances["ranoa-local"]).toBe(72);
    expect(life.expansion.house!.sponsorship).toBeNull();
  });

  it("charges admission and travel to the other sources and honors explicit borrowing", async () => {
    const life = noble();
    life.coins = 20;
    life.expansion.economy.familyFunds = 30;
    const quote = universityQuote(life, true);
    expect(quote).toMatchObject({ family: 30, personal: 20, loan: 254, sponsor: { amount: 48 } });
    const before = structuredClone(life);
    expect(enrollUniversity(life, { quote, borrow: false })).toBe(false);
    expect(life).toEqual(before);
    expect(enrollUniversity(life, { quote, borrow: true })).toBe(true);
    expect(life.expansion.house!.sponsorship).toMatchObject({ status: "studying", spent: 0 });
    expect(life.expansion.finance!.purposes.university).toMatchObject({ borrowed: 254, reserved: { loan: 184, sponsor: 48 } });
    const { isLife } = await import("../storage");
    expect(isLife(life)).toBe(true);
    life.age++;
    applyEconomyYear(life);
    expect(life.expansion.house!.sponsorship!.spent).toBe(40);
    expect(life.expansion.finance!.purposes.university!.reserved.sponsor).toBe(8);
    expect(isLife(life)).toBe(true);
  });

  it("keeps prepaid university tuition out of the living-cost budget", () => {
    const life = noble();
    const quote = universityQuote(life, true);
    expect(enrollUniversity(life, {quote, borrow: true})).toBe(true);
    const housing = life.expansion.social!.household;
    housing.housing = "security-lost";
    housing.home = "ranoa";
    housing.housingLossYear = life.expansion.birthYear + life.age;
    life.age++;
    const year = applyEconomyYear(life);
    expect(life.expansion.house?.sponsorship?.spent).toBe(40);
    expect(life.expansion.economy.unmetCare).toBe(4);
    expect(year.unmetNeeds).toBe(true);
  });

  it.each([
    (life: ExpandedLife) => { life.region = "millis"; },
    (life: ExpandedLife) => { life.expansion.standing.status = "commoner"; },
    (life: ExpandedLife) => { life.stats.knowledge = 39; },
  ])("rejects changes in local access or admission after the quote", (change) => {
    const life = noble();
    const quote = universityQuote(life, true);
    expect(quote.sponsor?.amount).toBe(48);
    change(life);
    const before = structuredClone(life);
    expect(enrollUniversity(life, { quote, borrow: true })).toBe(false);
    expect(life).toEqual(before);
  });

  it("keeps the old university option when a displayed sponsor action expires", async () => {
    const life = noble();
    life.pending = "expanded.university";
    const { getExpandedDecision } = await import("./events");
    const { chooseExpanded } = await import("./engine");
    const decision = getExpandedDecision(life)!;
    const sponsored = decision.choices.find(c => c.id.includes(".sponsor-enroll-"))!;
    expect(decision.requiresManual).toBe(true);
    expect(sponsored.cost).toBeUndefined();
    life.coins = 10;
    expect(chooseExpanded(life, sponsored.id)).toBe(life);
    expect(chooseExpanded(life, "expanded.university.enroll-loan").expansion.education.stage).toBe("university");
    expect(life.expansion.house!.balances["ranoa-local"]).toBe(72);
  });

  it("returns only unused training silver to its original house after reload and relocation", async () => {
    const life = noble();
    const quote = quoteTraining(life, "merchant", "part-time", true);
    expect(quote).toMatchObject({ loan: 10, sponsor: { amount: 16 } });
    expect(enrollTraining(life, quote, true)).toBe(true);
    pauseTraining(life, true);
    life.age++;
    applyTrainingYear(life);
    expect(life.expansion.house!.sponsorship!.spent).toBe(0);
    pauseTraining(life, false);
    applyTrainingYear(life);
    life.region = "millis";
    const { isLife } = await import("../storage");
    expect(isLife(life)).toBe(true);
    const restored: ExpandedLife = JSON.parse(JSON.stringify(life));
    expect(withdrawTraining(restored)).toBe(true);
    expect(restored.expansion.house!.balances).toMatchObject({ "ranoa-local": 68 });
    expect(restored.expansion.house!.sponsorship).toMatchObject({ status: "owed", spent: 4 });
    expect(restored.expansion.finance!.purposes.merchant).toMatchObject({ balance: 0, cancelled: 10 });
    refundEducation(restored, "merchant");
    expect(restored.expansion.house!.balances["ranoa-local"]).toBe(68);
    expect(isLife(restored)).toBe(true);
  });

  it("starts the service obligation upon training completion", async () => {
    const life = noble();
    expect(enrollTraining(life, quoteTraining(life, "merchant", "full-time", true), true)).toBe(true);
    life.age++;
    applyTrainingYear(life);
    life.age++;
    applyTrainingYear(life);
    expect(life.expansion.house!.sponsorship).toMatchObject({ status: "owed", spent: 16 });
    expect(life.expansion.finance!.purposes.merchant!.reserved.loan).toBe(10);
    const { isLife } = await import("../storage");
    expect(isLife(life)).toBe(true);
  });

  it("records the original house's refund when switching to an ordinary course", async () => {
    const life = noble();
    expect(enrollTraining(life, quoteTraining(life, "merchant", "part-time", true), true)).toBe(true);
    life.age++;
    applyTrainingYear(life);
    life.pending = "expanded.training-quote";
    life.expansion.training!.selection = { role: "mage", mode: "part-time" };
    const { chooseExpanded } = await import("./engine");
    const next = chooseExpanded(life, "expanded.training-quote.enroll-loan");
    expect(next.expansion.training!.active).toBe("mage");
    expect(next.history.at(-1)?.text).toContain("12 silver to the Ranoan local house");
    expect(next.history.at(-1)?.text).toContain("One year of house service is due");
  });

  it("rejects a balance that does not reconcile with the house's tuition spending", async () => {
    const life = noble();
    expect(enrollTraining(life, quoteTraining(life, "merchant", "part-time", true), true)).toBe(true);
    life.age++;
    applyTrainingYear(life);
    withdrawTraining(life);
    const { isLife } = await import("../storage");
    expect(isLife(life)).toBe(true);
    life.expansion.house!.balances["ranoa-local"] = 67;
    expect(isLife(life)).toBe(false);
  });

  it("returns remaining funds once on death", () => {
    const life = noble();
    expect(enrollUniversity(life, { quote: universityQuote(life, true), borrow: true })).toBe(true);
    life.age++;
    applyEconomyYear(life);
    closeEducationDebt(life);
    closeEducationDebt(life);
    expect(life.expansion.house!.balances["ranoa-local"]).toBe(32);
    expect(life.expansion.house!.sponsorship).toMatchObject({ status: "closed", spent: 40 });
    expect(life.expansion.finance!.purposes.university!.closedUnpaid).toBe(138);
  });
});

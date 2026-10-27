import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import {
  universityQuote,
  enrollUniversity,
  applyEducationYear,
} from "./education";
import { applyEconomyYear } from "./economy";
import { isLife } from "../storage";
const ready = () => {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 15;
  l.coins = 0;
  l.stats.knowledge = 40;
  l.training.magicXp = 60;
  l.expansion.economy.familyFunds = 0;
  l.expansion.genetics.magicTalent = false;
  l.expansion.genetics.academicTalent = false;
  return l;
};
describe("voluntary university finance", () => {
  it.each([
    ["ranoa", 352],
    ["demon", 432],
    ["begaritt", 402],
  ] as const)(
    "funds ready poor students from %s for %i without cash proceeds",
    (region, total) => {
      const l = ready();
      l.region = region;
      const quote = universityQuote(l);
      expect(quote.total).toBe(total);
      expect(quote.loan).toBe(total);
      const before = structuredClone(l);
      expect(enrollUniversity(l)).toBe(false);
      expect(l).toEqual(before);
      expect(enrollUniversity(l, { quote, borrow: true })).toBe(true);
      expect(l.coins).toBe(0);
      expect(l.expansion.education.budget).toBe(232);
      expect(l.expansion.finance!.pauseReason).toBe("university");
      expect(isLife(l)).toBe(true);
      l.age++;
      const annual = applyEconomyYear(l);
      expect(annual.earnedIncome).toBe(0);
      expect(l.expansion.education.budget).toBe(174);
      expect(l.coins).toBe(0);
      expect(isLife(l)).toBe(true);
    },
  );
  it("refuses academic blockers, stale quotes and concurrent courses without changing the life", () => {
    for (const change of [
      (l: ReturnType<typeof ready>) => {
        l.age = 14;
      },
      (l: ReturnType<typeof ready>) => {
        l.stats.knowledge = 39;
      },
      (l: ReturnType<typeof ready>) => {
        l.training.magicXp = 59;
      },
    ]) {
      const l = ready();
      change(l);
      const before = structuredClone(l);
      expect(
        enrollUniversity(l, { quote: universityQuote(l), borrow: true }),
      ).toBe(false);
      expect(l).toEqual(before);
    }
    const l = ready(),
      q = universityQuote(l);
    l.coins = 10;
    expect(enrollUniversity(l, { quote: q, borrow: true })).toBe(false);
  });
  it("keeps scholarships debt-free and refunds only unused loan principal on withdrawal", () => {
    const s = ready();
    s.expansion.genetics.magicTalent = true;
    s.expansion.education.assessed = true;
    s.expansion.education.assessment = 60;
    expect(enrollUniversity(s)).toBe(true);
    expect(s.expansion.finance!.purposes.university?.borrowed ?? 0).toBe(0);
    const l = ready();
    enrollUniversity(l, { quote: universityQuote(l), borrow: true });
    l.focus = "rest";
    l.age++;
    applyEconomyYear(l);
    applyEducationYear(l);
    l.age++;
    applyEconomyYear(l);
    applyEducationYear(l);
    expect(l.expansion.education.stage).toBe("withdrawn");
    expect(l.expansion.education.budget).toBe(0);
    expect(l.coins).toBe(0);
    expect(l.expansion.finance!.purposes.university).toMatchObject({
      borrowed: 352,
      cancelled: 116,
      balance: 236,
    });
  });
});

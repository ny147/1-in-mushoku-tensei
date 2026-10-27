import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { enrollTraining, quoteTraining } from "./training";
import { advance, choose, getDecision, finishLife } from "../engine";
import { isLife, loadGame } from "../storage";
import { appoint } from "./careers";
import type { ExpandedLife } from "../types";
const restore = (l: ExpandedLife) => {
  const result = loadGame({
    getItem: () => JSON.stringify({ version: 1, active: l, archive: [] }),
    setItem: () => {
      throw Error("no write");
    },
  });
  expect(result.error).toBe(null);
  return result.data.active as ExpandedLife;
};
describe("education full flows and endings", () => {
  it.each(["swordsman", "mage"] as const)(
    "moves poor and comfortable farmers into %s with identical restored futures",
    (role) => {
      for (const coins of [0, 400]) {
        let l = createExpandedLife({ seed: 1 });
        l.phase = "alive";
        l.age = 20;
        l.pending = null;
        l.coins = coins;
        l.expansion.economy.peak = Math.max(l.expansion.economy.peak, coins);
        l.stats.health = 100;
        l.focus = "bonds";
        l.training.swordXp = 0;
        l.training.magicXp = 0;
        l.progression!.magic.water.xp = 0;
        l.expansion.economy.familyFunds = 0;
        appoint(l, "farmer");
        expect(
          enrollTraining(l, quoteTraining(l, role, "full-time"), true),
        ).toBe(true);
        for (let i = 0; i < 3; i++) {
          while (l.pending)
            l = choose(
              l,
              getDecision(l)!.choices.find((c) => c.id.endsWith(".later"))
                ?.id ??
                getDecision(l)!.choices.find((c) => !c.disabled && !c.cost)!.id,
            ) as ExpandedLife;
          const before = restore(l);
          const a = advance(l, "year") as ExpandedLife,
            b = advance(before, "year") as ExpandedLife;
          expect(b).toEqual(a);
          l = a;
          expect(l.phase).toBe("alive");
        }
        while (l.pending && l.pending !== "expanded.training-placement")
          l = choose(
            l,
            getDecision(l)!.choices.find((c) => c.id.endsWith(".later"))?.id ??
              getDecision(l)!.choices.find((c) => !c.disabled && !c.cost)!.id,
          ) as ExpandedLife;
        expect(l.pending).toBe("expanded.training-placement");
        l = choose(
          restore(l),
          `expanded.training-placement.accept-${role}`,
        ) as ExpandedLife;
        expect(l.expansion.career.role).toBe(role);
        expect(l.expansion.career.records.farmer.years).toBe(0);
        expect(isLife(l)).toBe(true);
      }
    },
  );
  it("rejects an active course without funding instead of paying an endless stipend", () => {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = 20;
    l.coins = 0;
    l.expansion.economy.familyFunds = 0;
    enrollTraining(l, quoteTraining(l, "mage", "full-time"), true);
    delete l.expansion.finance;
    expect(isLife(l)).toBe(false);
  });
  it("stores actual completed training and closed loan totals in both languages once", () => {
    let l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = 20;
    l.pending = null;
    l.stats.health = 100;
    l.coins = 0;
    l.expansion.economy.familyFunds = 0;
    enrollTraining(l, quoteTraining(l, "mage", "full-time"), true);
    l = advance(l, "year") as ExpandedLife;
    finishLife(l, "illness");
    const summary = l.expansion.summary!;
    expect(summary.sections.find((s) => s.key === "legacy")!.en).toContain(
      "borrowed 24",
    );
    expect(summary.sections.find((s) => s.key === "legacy")!.en).toContain(
      "unpaid 8",
    );
    expect(summary.sections.find((s) => s.key === "work")!.en).toContain(
      "Training",
    );
    expect(summary.sections.find((s) => s.key === "legacy")!.th).toContain(
      "24",
    );
    const snapshot = JSON.stringify(summary);
    finishLife(l, "aging");
    expect(JSON.stringify(restore(l).expansion.summary)).toBe(snapshot);
  });
});

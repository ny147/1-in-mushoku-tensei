import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { applyEconomyYear, survivalRisks } from "./economy";
import { choose } from "../engine";
import { loadGame, saveGame } from "../storage";
import type { ExpandedLife } from "../types";

describe("purchased household aid", () => {
  function purchase(age: number) {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = age;
    l.pending = "expanded.aid";
    l.coins = 8;
    l.focus = "balanced";
    l.expansion.economy.support = 10;
    l.expansion.career.role = "child";
    return choose(l, "expanded.aid.accept") as ExpandedLife;
  }
  it("feeds an adult after paying the eight-coin fee, without inventing wages", () => {
    const l = purchase(18);
    expect(l.coins).toBe(0);
    l.age++;
    applyEconomyYear(l);
    expect(l.expansion.economy).toMatchObject({
      unmetFood: 0,
      unmetShelter: 2,
      unmetCare: 4,
      lastIncome: 0,
    });
    expect(l.coins).toBe(0);
  });
  it("applies child support once and keeps the child purse separate", () => {
    const l = purchase(8);
    l.age++;
    applyEconomyYear(l);
    expect(l.expansion.economy).toMatchObject({
      unmetFood: 0,
      unmetShelter: 0,
      unmetCare: 0,
    });
    expect(l.coins).toBe(0);
  });
  it("retains purchased aid across age 15, save restoration and the inclusive expiry", () => {
    const l = purchase(14);
    let raw = "";
    expect(
      saveGame(
        {
          getItem: () => raw,
          setItem: (_, v) => {
            raw = v;
          },
        },
        { version: 1, active: l, archive: [] },
      ),
    ).toBe(true);
    const restored = loadGame({ getItem: () => raw, setItem: () => {} }).data
      .active as ExpandedLife;
    expect(restored).toEqual(l);
    for (const age of [15, 16]) {
      restored.age = age;
      applyEconomyYear(restored);
      expect(restored.expansion.economy.unmetFood).toBe(0);
      expect(restored.expansion.economy.unmetShelter).toBe(2);
    }
    restored.age = 17;
    applyEconomyYear(restored);
    expect(restored.expansion.economy.unmetFood).toBe(8);
  });
});
describe("material needs and actual danger", () => {
  it("uses household resources for children rather than an adult salary", () => {
    const l = createExpandedLife({ seed: 1 });
    l.age = 4;
    l.coins = 0;
    l.expansion.economy.support = 10;
    applyEconomyYear(l);
    expect(l.coins).toBe(0);
    expect(l.expansion.economy.lastIncome).toBe(0);
    expect(l.expansion.economy.unmetCare).toBe(4);
    expect(l.expansion.economy.unmetShelter).toBe(4);
    expect(
      survivalRisks(l).find((r) => r.cause === "illness")!.chance,
    ).toBeGreaterThan(0.002);
  });
  it("records starvation when food is unavailable and rest cannot create food", () => {
    const l = createExpandedLife({ seed: 1 });
    l.age = 16;
    l.coins = 0;
    l.focus = "rest";
    l.expansion.career.role = "child";
    l.expansion.economy.support = 0;
    applyEconomyYear(l);
    expect(l.expansion.economy.unmetFood).toBe(8);
    expect(l.coins).toBe(0);
    expect(survivalRisks(l)[0]).toMatchObject({
      cause: "malnutrition",
      chance: 0.018,
    });
  });
  it("protection and care improve rather than guarantee Superd survival", () => {
    const l = createExpandedLife({ seed: 1 });
    l.race = "superd";
    l.age = 3;
    l.expansion.economy.protectionUntil = 1500;
    const risk = survivalRisks(l).find((r) => r.cause === "violence")!.chance;
    expect(risk).toBeGreaterThan(0);
    expect(risk).toBeLessThan(0.135);
  });
});

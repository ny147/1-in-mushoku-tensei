import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { ORDINARY_ROLES, ordinaryEntry } from "./career-access";
import {
  quoteTraining,
  enrollTraining,
  applyTrainingYear,
  acceptTrainingPlacement,
  pauseTraining,
  setTrainingMode,
  withdrawTraining,
} from "./training";
import { careerRequirements, appoint } from "./careers";
import { advance } from "../engine";
import { isLife, loadGame } from "../storage";
const adult = () => {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 20;
  l.deathAge = 100;
  l.focus = "bonds";
  l.pending = null;
  l.coins = 0;
  l.expansion.economy.familyFunds = 0;
  l.stats.health = 50;
  l.stats.knowledge = 0;
  l.training.swordXp = 0;
  l.training.magicXp = 0;
  l.training.magicCap = 0;
  l.training.swordCap = 0;
  for (const t of Object.values(l.progression!.magic)) t.xp = 0;
  return l;
};
describe("ordinary career training", () => {
  it.each(ORDINARY_ROLES)(
    "qualifies an ordinary beginner as %s in either attendance mode",
    (role) => {
      for (const mode of ["full-time", "part-time"] as const) {
        const l = adult();
        const q = quoteTraining(l, role, mode);
        expect(enrollTraining(l, q, true)).toBe(true);
        const years =
          ordinaryEntry(role).units / (mode === "full-time" ? 2 : 1);
        for (let i = 0; i < years; i++) {
          l.age++;
          applyTrainingYear(l);
        }
        expect(l.expansion.training!.records[role].completedYear).toBe(
          l.expansion.birthYear + l.age,
        );
        expect(
          careerRequirements(l, role)
            .filter((r) => r.id !== "capital")
            .every((r) => r.met),
        ).toBe(true);
        expect(acceptTrainingPlacement(l, role)).toBe(true);
        expect(l.expansion.career.role).toBe(role);
        expect(acceptTrainingPlacement(l, role)).toBe(false);
        expect(enrollTraining(l, quoteTraining(l, role, mode), true)).toBe(
          false,
        );
        expect(isLife(l)).toBe(true);
      }
    },
  );
  it("preserves half-time progress, pauses, withdrawals and the trained magic school", () => {
    const l = adult();
    enrollTraining(l, quoteTraining(l, "mage", "part-time"), true);
    l.age++;
    applyTrainingYear(l);
    expect(l.progression!.magic.water.xp).toBe(5);
    pauseTraining(l, true);
    l.age++;
    applyTrainingYear(l);
    expect(l.expansion.training!.records.mage.units).toBe(1);
    pauseTraining(l, false);
    setTrainingMode(l, "full-time");
    l.expansion.study = "fire";
    l.progression!.specialization = "fire";
    for (let i = 0; i < 3; i++) {
      l.age++;
      applyTrainingYear(l);
    }
    expect(l.progression!.magic.water.xp).toBe(30);
    expect(l.progression!.magic.fire.xp).toBe(0);
    expect(acceptTrainingPlacement(l, "mage")).toBe(true);
    const m = adult();
    enrollTraining(m, quoteTraining(m, "swordsman", "full-time"), true);
    m.age++;
    applyTrainingYear(m);
    withdrawTraining(m);
    expect(m.expansion.training!.records.swordsman.units).toBe(2);
    expect(quoteTraining(m, "swordsman", "part-time").tuition).toBe(16);
    expect(m.expansion.finance!.purposes.swordsman!.balance).toBe(8);
  });
  it("defers injured placement through restoration and never charges the starter fee twice", () => {
    const l = adult();
    enrollTraining(l, quoteTraining(l, "adventurer", "full-time"), true);
    for (let i = 0; i < 2; i++) {
      l.age++;
      applyTrainingYear(l);
    }
    l.stats.health = 19;
    expect(acceptTrainingPlacement(l, "adventurer")).toBe(false);
    const restored = loadGame({
      getItem: () => JSON.stringify({ version: 1, active: l, archive: [] }),
      setItem: () => {},
    }).data.active!;
    if (restored.ruleset !== "expanded-1") throw Error("expanded");
    restored.stats.health = 30;
    expect(acceptTrainingPlacement(restored, "adventurer")).toBe(true);
    expect(restored.coins).toBe(0);
    expect(restored.expansion.finance!.purposes.adventurer!.balance).toBe(21);
  });
  it("pays only the full-time stipend and preserves the original career years", () => {
    const l = adult();
    l.stats.health = 100;
    appoint(l, "farmer");
    l.focus = "work";
    enrollTraining(l, quoteTraining(l, "swordsman", "full-time"), true);
    const n = advance(l, "year");
    if (n.ruleset !== "expanded-1") throw Error("expanded");
    expect(n.expansion.economy.lastIncome).toBe(24);
    expect(n.expansion.career.records.farmer.years).toBe(0);
    expect(n.coins).toBe(6);
    const m = adult();
    m.stats.health = 100;
    appoint(m, "farmer");
    enrollTraining(m, quoteTraining(m, "swordsman", "part-time"), true);
    const p = advance(m, "year");
    if (p.ruleset !== "expanded-1") throw Error("expanded");
    expect(p.expansion.economy.lastIncome).toBe(20);
    expect(p.expansion.career.records.farmer.years).toBe(1);
  });
});

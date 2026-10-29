import { describe, expect, it } from "vitest";
import { allocateSwordStyle, syncSwordCompatibility } from './sword-state';
import type { ExpandedLife } from "../types";
import { advance, choose } from "../engine";
import { isLife, loadGame } from "../storage";
import { createExpandedLife } from "./origins";
import { applyCareerYear, appoint } from "./careers";
import { assessTalent, scholarshipEligible } from "./education";
import { quoteTraining, enrollTraining, applyTrainingYear } from "./training";

function ready(talent: "magic" | "sword" | "academic" | "none" = "none") {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 20;
  l.pending = null;
  l.coins = 1000;
  l.expansion.economy.peak = 1000;
  l.stats.health = 100;
  l.stats.knowledge = 20;
  l.training.magicXp = l.training.swordXp = 0;
  l.training.magicCap = l.training.swordCap = 1;
  for (const t of Object.values(l.progression!.magic)) {
    t.xp = 0;
    t.spells = [];
  }
  Object.assign(l.expansion.genetics, {
    carrier: false,
    manifestation: "none",
    auraImpaired: false,
    magicTalent: talent === "magic",
    academicTalent: talent === "academic",
    swordTalent: talent === "sword",
  });
  allocateSwordStyle(l,'sword-god');
  return l;
}
function expanded(life: ReturnType<typeof advance>): ExpandedLife {
  if (life.ruleset !== "expanded-1") throw Error("expanded");
  return life;
}

describe("talent learning benefits", () => {
  it.each(["magic", "sword"] as const)(
    "adds exactly 25% to annual %s practice with no unrelated boost",
    (kind) => {
      const l = ready(kind);
      l.focus = kind;
      const n = expanded(advance(l, "year"));
      expect(n.training[kind === "magic" ? "magicXp" : "swordXp"]).toBe(11.25);
      expect(n.training[kind === "magic" ? "swordXp" : "magicXp"]).toBe(0);
      if (kind === "magic") expect(n.progression!.magic.water.xp).toBe(11.25);
      expect(l.training.magicXp + l.training.swordXp).toBe(0);
      expect(isLife(n)).toBe(true);
      const plain = ready();
      plain.focus = kind;
      expect(
        advance(plain, "year").training[
          kind === "magic" ? "magicXp" : "swordXp"
        ],
      ).toBe(9);
    },
  );
  it("boosts positive academic learning by 25%, respects the knowledge cap and preserves losses", () => {
    const l = ready("academic");
    l.focus = "study";
    const n = advance(l, "year");
    expect(n.stats.knowledge).toBe(25);
    expect(n.stats.happiness).toBe(l.stats.happiness - 1);
    l.stats.knowledge = 99;
    expect(advance(l, "year").stats.knowledge).toBe(100);
    const plain = ready();
    plain.focus = "study";
    expect(advance(plain, "year").stats.knowledge).toBe(24);
  });
  it("boosts actual learning choices once, preserves fractions and restores identical futures", () => {
    for (const kind of ["magic", "sword", "academic"] as const) {
      const l = ready(kind);
      l.pending =
        kind === "academic" ? "expanded.reading" : "expanded.practice";
      const id =
        kind === "academic"
          ? "expanded.reading.learn"
          : `expanded.practice.${kind}`;
      const n = expanded(choose(l, id));
      if (kind === "academic") expect(n.stats.knowledge).toBe(30);
      else
        expect(n.training[kind === "magic" ? "magicXp" : "swordXp"]).toBe(15);
      if (kind === "magic") expect(n.progression!.magic.water.xp).toBe(15);
      const data = loadGame({
        getItem: () => JSON.stringify({ version: 1, active: l, archive: [] }),
        setItem: () => {},
      });
      expect(data.error).toBeNull();
      expect(choose(data.data.active!, id)).toEqual(n);
      expect(choose(n, id)).toBe(n);
    }
    const memory = ready("academic");
    memory.pending = "expanded.memory";
    expect(choose(memory, "expanded.memory.observe").stats.knowledge).toBe(
      23.75,
    );
  });
  it("combines magical talent and the existing conditional inherited-factor bonus", () => {
    const l = ready("magic");
    l.focus = "magic";
    Object.assign(l.expansion.genetics, {
      carrier: true,
      manifestation: "mana",
    });
    expect(advance(l, "year").training.magicXp).toBe(9 * 1.25 * 1.25);
    l.training.magicCap = 0;
    expect(advance(l, "year").training.magicXp).toBe(11.25);
  });
  it.each(["mage", "swordsman", "teacher"] as const)(
    "boosts the relevant %s training milestone without compounding or changing course length",
    (role) => {
      const l = ready(
        role === "mage" ? "magic" : role === "swordsman" ? "sword" : "academic",
      );
      l.stats.knowledge = 0;
      expect(
        enrollTraining(l, quoteTraining(l, role, "full-time"), false),
      ).toBe(true);
      for (let i = 0; i < 3; i++) {
        l.age++;
        applyTrainingYear(l);
      }
      if (role === "teacher") expect(l.stats.knowledge).toBe(31.25);
      else
        expect(l.training[role === "mage" ? "magicXp" : "swordXp"]).toBe(37.5);
      if (role === "mage") expect(l.progression!.magic.water.xp).toBe(37.5);
      expect(l.expansion.training!.records[role].completedYear).toBe(
        l.expansion.birthYear + l.age,
      );
      const raw = JSON.stringify(l);
      applyTrainingYear(l);
      expect(JSON.stringify(l)).toBe(raw);
    },
  );
  it.each(["mage", "guard"] as const)(
    "boosts existing %s occupation learning without changing career XP",
    (role) => {
      const l = ready(role === "mage" ? "magic" : "sword");
      l.training.magicXp =
        l.training.swordXp =
        l.progression!.magic.water.xp =
          30;
      l.expansion.swords!.tracks['sword-god'].xp=30; syncSwordCompatibility(l);
      expect(appoint(l, role)).toBe(true);
      const previous =
        role === "mage" ? l.training.magicXp : l.training.swordXp;
      applyCareerYear(l);
      expect(
        (role === "mage" ? l.training.magicXp : l.training.swordXp) - previous,
      ).toBe(role === "mage" ? 5 : 6.25);
      expect(l.expansion.career.records[role].xp).toBe(8);
    },
  );
  it("never grants a university scholarship or academic assessment bonus for sword talent alone", () => {
    const l = ready("sword");
    l.stats.knowledge = 80;
    assessTalent(l);
    expect(l.expansion.education.assessment).toBe(80);
    expect(scholarshipEligible(l)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { allocateSwordStyle, syncSwordCompatibility } from './sword-state';
import { createExpandedLife } from "./origins";
import {
  careerRequirements,
  appoint,
  applyCareerYear,
  careerIncomeExpanded,
  promote,
} from "./careers";
import type { Occupation } from "./types";
describe("independent careers and access", () => {
  it('records earned promotions and health-related dismissal without erasing past work',()=>{
    const l=createExpandedLife({seed:1});l.age=25;appoint(l,'farmer');const r=l.expansion.career.records.farmer;r.xp=60;r.years=2;r.reputation=10;
    expect(promote(l)).toBe(true);expect(careerIncomeExpanded(l)).toBe(28);
    l.stats.health=10;applyCareerYear(l);expect(l.expansion.career.role).toBe('child');expect(r.level).toBe(1);expect(l.expansion.career.timeline.at(-1)?.reason).toBe('dismissal');
  });
  it.each<[Occupation, number]>([
    ["laborer", 12],
    ["farmer", 20],
    ["merchant", 30],
    ["guard", 28],
    ["adventurer", 32],
    ["swordsman", 34],
    ["mage", 38],
    ["healer", 30],
    ["cleric", 28],
    ["knight", 45],
    ["teacher", 28],
    ["professor", 60],
    ["retired", 0],
  ])(
    "supports qualified %s appointments at their actual base pay",
    (role, pay) => {
      const l = createExpandedLife({ seed: 1 });
      l.age = 30;
      l.coins = 10000;
      l.stats.knowledge = 90;
      l.stats.health = 90;
      l.training.magicXp = 800;
      l.training.swordXp = 500;
      l.training.magicCap = 3;
      l.training.swordCap = 3;
      allocateSwordStyle(l,'sword-god'); l.expansion.swords!.tracks['sword-god']={xp:500,cap:3}; syncSwordCompatibility(l);
      for (const school of Object.values(l.progression!.magic)) school.xp = 600;
      const x = l.expansion;
      x.standing.trust = 50;
      x.standing.reputation = 70;
      x.standing.service = 5;
      x.origin.patron = true;
      x.education.stage = "graduated";
      x.education.successfulYears = 4;
      x.education.research = 2;
      x.career.records.teacher.years = 5;
      expect(appoint(l, role)).toBe(true);
      expect(careerIncomeExpanded(l)).toBe(pay);
    },
  );
  it("has ordinary work with no hero prerequisite and pays only the primary occupation", () => {
    const l = createExpandedLife({ seed: 1 });
    l.age = 15;
    expect(appoint(l, "farmer")).toBe(true);
    expect(careerIncomeExpanded(l)).toBe(20);
    applyCareerYear(l);
    expect(l.expansion.career.records.farmer.years).toBe(1);
    expect(appoint(l, "laborer")).toBe(true);
    expect(careerIncomeExpanded(l)).toBe(12);
    expect(l.expansion.career.records.farmer.years).toBe(1);
  });
  it("does not let wealthy untrained characters become knights or professors", () => {
    const l = createExpandedLife({ seed: 1 });
    l.age = 25;
    l.coins = 10000;
    l.expansion.origin.patron = true;
    expect(appoint(l, "knight")).toBe(false);
    expect(appoint(l, "professor")).toBe(false);
    l.training.swordXp = 150;
    allocateSwordStyle(l,'sword-god'); l.expansion.swords!.tracks['sword-god'].xp=150; syncSwordCompatibility(l);
    l.expansion.standing.service = 3;
    expect(careerRequirements(l, "knight").every((r) => r.met)).toBe(true);
    expect(appoint(l, "knight")).toBe(true);
    expect(l.coins).toBe(9880);
  });
  it("retains per-career progress on switch and requires an appointment for reentry", () => {
    const l = createExpandedLife({ seed: 1 });
    l.age = 25;
    appoint(l, "farmer");
    l.expansion.career.records.farmer.xp = 180;
    l.expansion.career.records.farmer.years = 5;
    l.expansion.career.records.farmer.reputation = 25;
    appoint(l, "laborer");
    appoint(l, "farmer");
    expect(l.expansion.career.records.farmer.xp).toBe(180);
    expect(l.expansion.career.timeline).toHaveLength(3);
  });
});

import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import {
  allocateSwordStyle,
  creditSwordCourse,
  grantSwordXp,
  syncSwordCompatibility,
} from "./sword-state";
import { advanceExpanded, chooseExpanded } from "./engine";
import { applyCareerYear, careerRequirements } from "./careers";
import { titleEligible } from "./politics";
const adult = () => {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 30;
  l.pending = null;
  l.region = "asura";
  l.focus = "sword";
  l.coins = 1000;
  l.expansion.genetics.auraImpaired = false;
  l.expansion.genetics.manifestation = "none";
  l.expansion.genetics.swordTalent = false;
  allocateSwordStyle(l, "sword-god");
  return l;
};
describe("sword learning", () => {
  it("credits_only_selected_style", () => {
    const l = adult();
    const n = advanceExpanded(l, "year");
    expect(n.expansion.swords!.tracks["sword-god"].xp).toBe(9);
    expect(n.expansion.swords!.tracks["water-god"].xp).toBe(0);
  });
  it("stacks_talent_once", () => {
    const l = adult();
    l.expansion.genetics.swordTalent = true;
    expect(
      advanceExpanded(l, "year").expansion.swords!.tracks["sword-god"].xp,
    ).toBe(11.25);
    l.expansion.genetics.manifestation = "physical";
    expect(
      advanceExpanded(l, "year").expansion.swords!.tracks["sword-god"].xp,
    ).toBeCloseTo(9 * 1.25 * 1.15);
    l.pending = "expanded.practice";
    expect(
      chooseExpanded(l, "expanded.practice.sword").expansion.swords!.tracks[
        "sword-god"
      ].xp,
    ).toBe(15);
    l.pending = null;
    l.expansion.career.role = "guard";
    applyCareerYear(l);
    expect(l.expansion.swords!.tracks["sword-god"].xp).toBe(6.25);
  });
  it("cannot_farm_course_milestones_by_switching", () => {
    const l = adult();
    creditSwordCourse(l, "swordsman", 10);
    allocateSwordStyle(l, "water-god");
    creditSwordCourse(l, "swordsman", 20);
    allocateSwordStyle(l, "north-god");
    creditSwordCourse(l, "swordsman", 30);
    creditSwordCourse(l, "swordsman", 30);
    expect(Object.values(l.expansion.swords!.tracks).map((t) => t.xp)).toEqual([
      10, 10, 10,
    ]);
    expect(l.expansion.swords!.courseCredit.swordsman).toBe(30);
  });
  it("qualified_job_survives_switch", () => {
    const l = adult();
    grantSwordXp(l, 150);
    allocateSwordStyle(l, "north-god");
    expect(careerRequirements(l, "swordsman").every((r) => r.met)).toBe(true);
  });
  it("challenge_uses_selected_style", () => {
    const l = adult();
    l.expansion.swords!.tracks["sword-god"] = { xp: 2500, cap: 6 };
    l.expansion.standing.reputation = 100;
    l.expansion.standing.feats = ["a", "b", "c"];
    syncSwordCompatibility(l);
    expect(titleEligible(l, 7)).toBe(true);
    allocateSwordStyle(l, "north-god");
    expect(titleEligible(l, 7)).toBe(false);
    l.training.magicXp = 2500;
    l.training.magicCap = 5;
    expect(titleEligible(l, 7)).toBe(true);
    l.training.magicCap = 0;
    expect(titleEligible(l, 7)).toBe(false);
  });
});

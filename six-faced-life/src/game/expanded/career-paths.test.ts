import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { CAREER_NODES, CAREER_PATHS } from "./career-catalogue";
import { emptyCareerPaths } from "./career-state";
import { careerNode, pathIncome, pathRequirements } from "./career-paths";
import { allocateSwordStyle, syncSwordCompatibility } from "./sword-state";

function applicant() {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 30;
  l.pending = null;
  l.expansion.queue = [];
  l.stats.health = 80;
  l.stats.knowledge = 50;
  l.coins = 200;
  l.expansion.careerPaths = emptyCareerPaths(l.expansion.birthYear + l.age);
  return l;
}
const met = (
  l: ReturnType<typeof applicant>,
  node: keyof typeof CAREER_NODES,
) => pathRequirements(l, node).every((r) => r.met);

describe("career paths and visible qualifications", () => {
  it("offers six paths and only four adventurer ranks", () => {
    expect(CAREER_PATHS.map((p) => p.id)).toEqual([
      "livelihood",
      "trade",
      "martial",
      "adventure",
      "magic",
      "healing",
    ]);
    expect(
      Object.values(CAREER_NODES)
        .filter((n) => n.branch === "adventure")
        .map((n) => n.id),
    ).toEqual(["adventure-f", "adventure-d", "adventure-b", "adventure-s"]);
    expect(CAREER_NODES["adventure-s"].pay).toBe(64);
    expect(CAREER_NODES.professor.path).toBe("magic");
    expect(CAREER_NODES.cleric.path).toBe("healing");
  });
  it("makes ordinary entry reliable without predecessor employment", () => {
    const l = applicant();
    expect(met(l, "laborer")).toBe(true);
    expect(met(l, "farmhand")).toBe(true);
    expect(met(l, "trade-assistant")).toBe(true);
    allocateSwordStyle(l, "water-god");
    l.expansion.swords!.tracks["water-god"] = { xp: 20, cap: 2 };
    syncSwordCompatibility(l);
    expect(met(l, "guard")).toBe(true);
    l.age = 14;
    expect(met(l, "guard")).toBe(false);
  });
  it("requires real branch work and a milestone for farming advancement", () => {
    const l = applicant(),
      s = l.expansion.careerPaths!;
    s.active = "farmhand";
    l.expansion.career.role = "farmer";
    s.earned.farmhand = { year: null, source: "inherited" };
    s.work.farming = { years: 2, units: 6, milestones: 0 };
    expect(met(l, "farmer")).toBe(false);
    s.work.farming.milestones = 1;
    expect(met(l, "farmer")).toBe(true);
    s.work.farming.units = 5;
    expect(met(l, "farmer")).toBe(false);
  });
  it("cannot combine unrelated magic schools to qualify for adventurer ranks", () => {
    const l = applicant(),
      s = l.expansion.careerPaths!;
    s.active = "adventure-d";
    l.expansion.career.role = "adventurer";
    s.earned["adventure-d"] = { year: null, source: "inherited" };
    s.requests = 40;
    l.expansion.study = "fire";
    l.progression!.magic.fire.xp = 100;
    l.progression!.magic.water.xp = 100;
    expect(met(l, "adventure-b")).toBe(false);
    l.progression!.magic.fire.xp = 150;
    expect(met(l, "adventure-b")).toBe(true);
    s.requests = 39;
    expect(met(l, "adventure-b")).toBe(false);
  });
  it("cannot combine sword styles to qualify for martial leadership", () => {
    const l = applicant(),
      s = l.expansion.careerPaths!;
    s.active = "guard";
    l.expansion.career.role = "guard";
    s.earned.guard = { year: null, source: "inherited" };
    s.work.guard = { years: 5, units: 16, milestones: 2 };
    allocateSwordStyle(l, "sword-god");
    l.expansion.swords!.tracks["sword-god"] = { xp: 100, cap: 2 };
    l.expansion.swords!.tracks["water-god"] = { xp: 100, cap: 2 };
    expect(met(l, "guard-captain")).toBe(false);
    l.expansion.swords!.tracks["water-god"].xp = 150;
    expect(met(l, "guard-captain")).toBe(true);
  });
  it("keeps pay floors occupation-specific and reads without consuming randomness", () => {
    const l = applicant(),
      s = l.expansion.careerPaths!;
    s.active = "laborer";
    l.expansion.career.role = "laborer";
    s.payFloor.professor = 92;
    const before = JSON.stringify(l);
    expect(pathIncome(l)).toBe(18);
    expect(careerNode(l)?.id).toBe("laborer");
    pathRequirements(l, "professor");
    expect(JSON.stringify(l)).toBe(before);
    s.active = "professor";
    l.expansion.career.role = "professor";
    expect(pathIncome(l)).toBe(92);
    l.expansion.education.stage = "university";
    expect(pathIncome(l)).toBe(0);
  });
  it("keeps prestige qualifications independent from fortune", () => {
    const l = applicant();
    l.coins = 10000;
    l.expansion.origin.patron = true;
    expect(met(l, "knight")).toBe(false);
    expect(met(l, "professor")).toBe(false);
    expect(met(l, "magic-teacher")).toBe(false);
    l.progression!.magic.water.xp = 25;
    l.expansion.study = "water";
    l.expansion.standing.reputation = 5;
    expect(met(l, "magic-teacher")).toBe(true);
  });
});

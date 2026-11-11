import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import {
  enterCareerNode,
  promoteCareerNode,
  syncCareerNode,
} from "./career-paths";
import {
  appoint,
  annualIncomeExpanded,
  careerIncomeExpanded,
  applyCareerYear,
} from "./careers";
import { activateCareerPaths } from "./career-migration";
import { enrollUniversity } from "./education";
import { isLife } from "../storage";

function worker() {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 30;
  l.pending = null;
  l.stats.health = 90;
  l.stats.knowledge = 80;
  l.coins = 1000;
  l.expansion.economy.peak = 1000;
  return l;
}
describe("career employment integration", () => {
  it("initializes new lives and pays the single active node", () => {
    const l = worker();
    expect(l.expansion.careerPaths?.version).toBe(1);
    expect(enterCareerNode(l, "laborer")).toBe(true);
    expect(careerIncomeExpanded(l)).toBe(18);
    l.focus = "work";
    expect(annualIncomeExpanded(l)).toBe(24);
    expect(enterCareerNode(l, "trade-assistant")).toBe(true);
    expect(l.coins).toBe(990);
    expect(careerIncomeExpanded(l)).toBe(24);
    expect(isLife(l)).toBe(true);
  });
  it("requires a manual promotion and preserves unlocks through reentry", () => {
    const l = worker();
    enterCareerNode(l, "farmhand");
    l.expansion.careerPaths!.work.farming = {
      years: 2,
      units: 6,
      milestones: 1,
    };
    expect(careerIncomeExpanded(l)).toBe(20);
    expect(promoteCareerNode(l, "farmer")).toBe(true);
    expect(careerIncomeExpanded(l)).toBe(28);
    expect(promoteCareerNode(l, "farm-steward")).toBe(false);
    enterCareerNode(l, "laborer");
    enterCareerNode(l, "farmhand");
    expect(l.expansion.careerPaths!.active).toBe("farmer");
    expect(careerIncomeExpanded(l)).toBe(28);
  });
  it("dismissal and retirement clear employment while retaining earned progress", () => {
    const l = worker();
    enterCareerNode(l, "farmhand");
    l.stats.health = 10;
    applyCareerYear(l);
    expect(l.expansion.careerPaths!.active).toBeNull();
    expect(l.expansion.careerPaths!.earned.farmhand).toBeDefined();
    l.stats.health = 90;
    enterCareerNode(l, "farmhand");
    appoint(l, "retired");
    expect(l.expansion.careerPaths!.active).toBeNull();
    expect(careerIncomeExpanded(l)).toBe(0);
  });
  it("preserves old Professor pay without carrying it to another occupation", () => {
    const old = worker();
    delete old.expansion.careerPaths;
    old.expansion.career.role = "professor";
    old.career = "teacher";
    old.expansion.career.records.professor.level = 3;
    const l = activateCareerPaths(old);
    expect(careerIncomeExpanded(l)).toBe(92);
    expect(enterCareerNode(l, "laborer")).toBe(true);
    expect(careerIncomeExpanded(l)).toBe(18);
  });
  it("uses training stipends and no university wages", () => {
    const l = worker();
    enterCareerNode(l, "laborer");
    l.expansion.training!.active = "mage";
    l.expansion.training!.mode = "full-time";
    expect(annualIncomeExpanded(l)).toBe(24);
    l.expansion.training!.active = null;
    l.training.magicXp = 60;
    expect(enrollUniversity(l)).toBe(true);
    expect(l.expansion.careerPaths!.active).toBeNull();
    expect(annualIncomeExpanded(l)).toBe(0);
  });
  it("rejects invalid advancement atomically and keeps old appointment callers synchronized", () => {
    const l = worker(),
      before = JSON.stringify(l);
    expect(enterCareerNode(l, "professor")).toBe(false);
    expect(JSON.stringify(l)).toBe(before);
    expect(appoint(l, "farmer")).toBe(true);
    expect(l.expansion.careerPaths!.active).toBe("farmhand");
    l.expansion.career.role = "student";
    syncCareerNode(l);
    expect(l.expansion.careerPaths!.active).toBeNull();
  });
});

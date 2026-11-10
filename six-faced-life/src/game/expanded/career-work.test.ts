import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { enterCareerNode } from "./career-paths";
import {
  applyCareerProject,
  careerProject,
  creditCareerWork,
} from "./career-work";
import { draw } from "./random";
import { worldYear } from "./facts";
import { advanceExpanded } from "./engine";
import { enrollTraining, quoteTraining } from "./training";

function worker(node: "laborer" | "farmhand" | "trade-assistant" = "farmhand") {
  const l = createExpandedLife({ seed: 1 });
  l.age = 30;
  l.phase = "alive";
  l.pending = null;
  l.stats.health = 100;
  l.coins = 200;
  l.expansion.economy.peak = 200;
  l.stats.knowledge = 50;
  l.deathAge = 1000;
  enterCareerNode(l, node);
  return l;
}
describe("real work and bounded career projects", () => {
  it("credits a work year once, never opening a menu", () => {
    const l = worker(),
      s = l.expansion.careerPaths!,
      y = worldYear(l);
    const before = JSON.stringify(l);
    careerProject(l, "safe");
    expect(JSON.stringify(l)).toBe(before);
    creditCareerWork(l, y, { fullTime: false, university: false });
    expect(s.work.farming).toEqual({ years: 1, units: 1, milestones: 0 });
    creditCareerWork(l, y, { fullTime: false, university: false });
    expect(s.work.farming.years).toBe(1);
    expect(l.coins).toBe(200);
  });
  it.each([
    { fullTime: true, university: false },
    { fullTime: false, university: true },
  ])("does not award employment for attendance %j", (attendance) => {
    const l = worker();
    creditCareerWork(l, worldYear(l), attendance);
    expect(l.expansion.careerPaths!.work.farming.years).toBe(0);
  });
  it("safe farming charges upfront, consumes no random draw and cannot repeat after switching", () => {
    const l = worker(),
      rng = l.rng;
    expect(applyCareerProject(l, "safe")).toBe(true);
    expect(l.coins).toBe(196);
    expect(l.rng).toBe(rng);
    expect(l.expansion.careerPaths!.work.farming).toEqual({
      years: 0,
      units: 2,
      milestones: 1,
    });
    enterCareerNode(l, "trade-assistant");
    const before = JSON.stringify(l);
    expect(applyCareerProject(l, "safe")).toBe(false);
    expect(JSON.stringify(l)).toBe(before);
  });
  it("rejects an unaffordable project before any state or RNG change", () => {
    const l = worker();
    l.coins = 3;
    const before = JSON.stringify(l);
    expect(applyCareerProject(l, "safe")).toBe(false);
    expect(JSON.stringify(l)).toBe(before);
  });
  it("risk projects use one draw and charge their cost on failure", () => {
    const l = worker();
    const fail = Array.from({ length: 100 }, (_, i) => i).find(
      (seed) => draw({ rng: seed }) >= 0.75,
    )!;
    l.rng = fail;
    const expected = { rng: fail };
    draw(expected);
    expect(applyCareerProject(l, "risk")).toBe(true);
    expect(l.rng).toBe(expected.rng);
    expect(l.coins).toBe(192);
    expect(l.expansion.careerPaths!.work.farming.milestones).toBe(0);
  });
  it("adventurer yearly requests are included in wages and require actual work", () => {
    const l = worker();
    l.training.magicXp = 30;
    expect(enterCareerNode(l, "adventure-f")).toBe(true);
    const money = l.coins;
    l.focus = "work";
    creditCareerWork(l, worldYear(l), { fullTime: false, university: false });
    expect(l.expansion.careerPaths!.requests).toBe(6);
    expect(l.coins).toBe(money);
    expect(careerProject(l, "risk")?.successChance).toBe(0.9);
    expect(careerProject(l, "risk")?.failureHealth).toBe(2);
  });
  it("does not retroactively award the year when full-time training finishes", () => {
    let l = worker();
    l.expansion.economy.familyFunds = 1000;
    expect(
      enrollTraining(l, quoteTraining(l, "laborer", "full-time"), false),
    ).toBe(true);
    for (let i = 0; i < 2; i++) {
      l.pending = null;
      l.expansion.queue = [];
      l = advanceExpanded(l, "year");
    }
    expect(l.expansion.training!.active).toBeNull();
    expect(l.expansion.careerPaths!.work.farming.years).toBe(0);
    expect(l.expansion.economy.lastIncome).toBe(24);
  });
  it("research cannot be farmed outside the shared project budget", () => {
    const l = worker("laborer");
    l.expansion.education.stage = "graduated";
    l.training.magicXp = 500;
    const success = Array.from({ length: 100 }, (_, i) => i).find(
      (seed) => draw({ rng: seed }) < 0.8,
    )!;
    l.rng = success;
    expect(applyCareerProject(l, "research")).toBe(true);
    expect(l.expansion.education.research).toBe(1);
    expect(l.expansion.careerPaths!.work.academic.units).toBe(0);
    expect(applyCareerProject(l, "research")).toBe(false);
    expect(l.expansion.education.research).toBe(1);
  });
});

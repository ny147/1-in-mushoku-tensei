import { describe, expect, it } from "vitest";
import { CAREER_NODES, CAREER_PATHS } from "../game/expanded/career-catalogue";
import { careerNodeText, careerPathText, careerProjectText } from "./careers";
import { createExpandedLife } from '../game/expanded/origins';
import { enterCareerNode } from '../game/expanded/career-paths';
import { openExpandedActivity } from '../game/expanded/activities';
import { chooseExpanded } from '../game/expanded/engine';
import { expandedEntryText } from './expanded';
describe("career localization", () => {
  it("renders a recorded project outcome in English and Thai", () => {
    const life = createExpandedLife({ seed: 1, language: "th" });
    life.phase = "alive";
    life.pending = null;
    life.age = 25;
    life.stats.health = 90;
    life.coins = 100;
    life.expansion.economy.peak = 100;
    delete life.expansion.social; // This compatibility fixture skips childhood decisions.
    enterCareerNode(life, "farmhand");
    const project = openExpandedActivity(life, "career-work");
    const completed = chooseExpanded(project, "expanded.career-work.safe");
    const entry = completed.history.at(-1)!;
    const english = expandedEntryText(entry, "en")?.text;
    const thai = expandedEntryText(entry, "th")?.text;
    expect(english).toContain("Work completed");
    expect(english).toContain("Savings change -4 silver");
    expect(thai).toContain("งานสำเร็จ");
    expect(thai).not.toContain("Work completed");
  });
  it("provides original English and Thai for every node and path", () => {
    for (const n of Object.values(CAREER_NODES)) {
      expect(careerNodeText(n.id, "en").length).toBeGreaterThan(2);
      expect(careerNodeText(n.id, "th")).toMatch(/[ก-๙]/);
    }
    for (const p of CAREER_PATHS)
      expect(careerPathText(p.id, "th")).toMatch(/[ก-๙]/);
  });
  it("discloses upfront costs, chance and failure without promising success", () => {
    const q = {
      branch: "adventure" as const,
      cost: 4,
      successChance: 0.75,
      failureHealth: 8,
      success: {
        units: 0,
        milestones: 1,
        requests: 4,
        silver: 16,
        service: 0,
        trust: 0,
        research: 0,
      },
    };
    expect(careerProjectText(q, "en")).toContain("Upfront cost: 4 silver");
    expect(careerProjectText(q, "en")).toContain("Success chance 75%");
    expect(careerProjectText(q, "th")).toContain("สุขภาพ −8");
  });
});

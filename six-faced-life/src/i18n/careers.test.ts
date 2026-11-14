import { describe, expect, it } from "vitest";
import { CAREER_NODES, CAREER_PATHS } from "../game/expanded/career-catalogue";
import { careerNodeText, careerPathText, careerProjectText } from "./careers";
import { createExpandedLife } from '../game/expanded/origins';
import { enterCareerNode } from '../game/expanded/career-paths';
import { openExpandedActivity } from '../game/expanded/activities';
import { chooseExpanded } from '../game/expanded/engine';
import { expandedEntryText } from './expanded';
describe("career localization", () => {
  it.each(['en','th'] as const)('stores a real %s project outcome readable in both languages',language=>{
    let l=createExpandedLife({seed:1,language});l.phase='alive';l.pending=null;l.age=25;l.stats.health=90;l.coins=100;l.expansion.economy.peak=100;
    delete l.expansion.social; // Existing adult project compatibility fixture skips childhood decisions.
    enterCareerNode(l,'farmhand');l=openExpandedActivity(l,'career-work');l=chooseExpanded(l,'expanded.career-work.safe');
    const e=l.history.at(-1)!;
    expect(expandedEntryText(e,'en')?.text).toContain('Work completed');
    expect(expandedEntryText(e,'en')?.text).toContain('Savings change -4 silver');
    expect(expandedEntryText(e,'th')?.text).toContain('งานสำเร็จ');
    expect(expandedEntryText(e,'th')?.text).not.toContain('Work completed');
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

import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { chooseExpanded, advanceExpanded, finishExpanded } from "./engine";
import { getExpandedDecision } from "./events";
import { openExpandedActivity } from "./activities";
import {
  enterCareerNode,
  promoteCareerNode,
  careerVacancy,
} from "./career-paths";
import { CAREER_NODES, type CareerNodeId } from "./career-catalogue";
import { loadGame, saveGame, isLife } from "../storage";
import { allocateSwordStyle, syncSwordCompatibility } from "./sword-state";
import type { ExpandedLife } from "../types";
import { activateCareerPaths } from './career-migration';

function qualified() {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 25;
  l.pending = null;
  l.region = "ranoa";
  l.deathAge = 1000;
  l.stats.health = 100;
  l.stats.knowledge = 90;
  l.coins = 10000;
  l.expansion.economy.peak = 10000;
  l.focus = "work";
  l.training.magicXp = 500;
  l.training.magicCap = 2;
  l.progression!.magic.water.xp = 500;
  l.progression!.magic.healing.xp = 500;
  l.expansion.study = "water";
  allocateSwordStyle(l, "sword-god");
  l.expansion.swords!.tracks["sword-god"] = { xp: 500, cap: 2 };
  syncSwordCompatibility(l);
  l.expansion.standing.trust = 50;
  l.expansion.standing.reputation = 70;
  l.expansion.standing.service = 10;
  l.expansion.origin.patron = true;
  return l;
}
function reload(l: ExpandedLife) {
  let raw = "";
  const storage = {
    getItem: () => raw,
    setItem: (_: string, v: string) => {
      raw = v;
    },
  };
  expect(saveGame(storage, { version: 1, active: l, archive: [] })).toBe(true);
  const result = loadGame(storage);
  expect(result.error).toBeNull();
  return result.data.active as ExpandedLife;
}
function settle(l: ExpandedLife) {
  for (let guard = 0; l.pending && guard < 30; guard++) {
    const d = getExpandedDecision(l)!;
    const c =
      d.choices.find((c) => c.id.endsWith(".later")) ??
      d.choices.find((c) => !c.disabled && !c.cost)!;
    l = chooseExpanded(l, c.id);
  }
  expect(l.pending).toBeNull();
  return l;
}
describe("complete career journeys and save futures", () => {
  it.each(['professor','knight'] as const)('re-enters ordinary work after %s without restoring a different occupation or bypassing vacancies',prestige=>{
    for(const inherited of [false,true]) {
      let l=qualified();l.expansion.education.stage='graduated';l.expansion.education.successfulYears=4;l.expansion.education.research=2;l.expansion.career.records.teacher.years=5;
      const ordinary=prestige==='professor'?'magic-teacher':'sworn-service';
      expect(enterCareerNode(l,ordinary)).toBe(true);
      for(let seed=0;seed<1000;seed++){l.expansion.worldSeed=seed;if(careerVacancy(l,prestige))break;}
      expect(enterCareerNode(l,prestige)).toBe(true);
      if(inherited){delete l.expansion.careerPaths;l=activateCareerPaths(l);}
      expect(enterCareerNode(l,'laborer')).toBe(true);
      for(let seed=0;seed<1000;seed++){l.expansion.worldSeed=seed;if(!careerVacancy(l,prestige))break;}
      l=openExpandedActivity(l,'career');l=chooseExpanded(l,`expanded.career.path-${prestige==='professor'?'magic':'martial'}`);
      l=chooseExpanded(l,`expanded.career-path.enter-${ordinary}`);
      expect(l.expansion.career.role).toBe(prestige==='professor'?'teacher':'guard');
      expect(CAREER_NODES[l.expansion.careerPaths!.active!].occupation).toBe(l.expansion.career.role);
      expect(l.expansion.careerPaths!.active).not.toBe(prestige);
      expect(isLife(l)).toBe(true);expect(reload(l)).toEqual(l);
    }
  });
  it.each<[CareerNodeId, CareerNodeId, number]>([
    ["farmhand", "farmer", 2],
    ["trade-assistant", "merchant", 2],
    ["swordsman", "senior-swordsman", 5],
    ["guard", "guard-captain", 5],
    ["mage", "senior-mage", 2],
    ["healer", "senior-healer", 2],
    ["cleric", "senior-cleric", 5],
  ])(
    "earns %s → %s through work and manual acceptance",
    (start, target, years) => {
      let l = qualified();
      expect(enterCareerNode(l, start)).toBe(true);
      for (let i = 0; i < years; i++) {
        const restored = reload(l),
          a = advanceExpanded(l, "year"),
          b = advanceExpanded(restored, "year");
        expect(b).toEqual(a);
        l = settle(a);
        expect(l.phase).toBe("alive");
        l = openExpandedActivity(l, "career-work");
        l = chooseExpanded(l, "expanded.career-work.safe");
        expect(isLife(l)).toBe(true);
      }
      expect(l.expansion.careerPaths!.active).toBe(start);
      l = openExpandedActivity(l, "career");
      l = chooseExpanded(
        l,
        `expanded.career.path-${CAREER_NODES[target].path}`,
      );
      l = chooseExpanded(reload(l), `expanded.career-path.promote-${target}`);
      expect(l.expansion.careerPaths!.active).toBe(target);
      enterCareerNode(l, "laborer");
      expect(enterCareerNode(l, start)).toBe(true);
      expect(l.expansion.careerPaths!.active).toBe(target);
      finishExpanded(l, "aging");
      expect(isLife(l)).toBe(true);
      expect(reload(l)).toEqual(l);
    },
  );
  it("advances F → D → B → S only when manually accepted, keeping reload futures identical", () => {
    let l = qualified();
    enterCareerNode(l, "adventure-f");
    for (const [target, requests] of [
      ["adventure-d", 12],
      ["adventure-b", 40],
      ["adventure-s", 100],
    ] as const) {
      while (l.expansion.careerPaths!.requests < requests) {
        l = settle(advanceExpanded(reload(l), "year"));
        expect(l.phase).toBe("alive");
      }
      const previous = l.expansion.careerPaths!.active;
      l = openExpandedActivity(l, "career");
      l = chooseExpanded(l, "expanded.career.path-adventure");
      expect(l.expansion.careerPaths!.active).toBe(previous);
      l = chooseExpanded(reload(l), `expanded.career-path.promote-${target}`);
      expect(l.expansion.careerPaths!.active).toBe(target);
    }
    expect(l.expansion.careerPaths!.requests).toBeGreaterThanOrEqual(100);
    expect(l.expansion.careerPaths!.earned["adventure-s"]?.source).toBe(
      "earned",
    );
    expect(isLife(reload(l))).toBe(true);
  });
  it("does not require a second equipment purchase for a Knight Commander promotion", () => {
    const l = qualified();
    for (let seed = 0; seed < 1000; seed++) {
      l.expansion.worldSeed = seed;
      if (careerVacancy(l, "knight")) break;
    }
    expect(enterCareerNode(l, "knight")).toBe(true);
    l.coins = 0;
    l.expansion.career.records.knight.years = 5;
    l.expansion.careerPaths!.work.knight = {
      years: 5,
      units: 16,
      milestones: 2,
    };
    expect(promoteCareerNode(l, "knight-commander")).toBe(true);
    expect(l.coins).toBe(0);
  });
  it("keeps a qualifying academic career accessible and prestige vacancies real", () => {
    const l = qualified();
    l.expansion.education.stage = "graduated";
    l.expansion.education.successfulYears = 4;
    l.expansion.education.research = 2;
    l.expansion.career.records.teacher.years = 5;
    for (let seed = 0; seed < 1000; seed++) {
      l.expansion.worldSeed = seed;
      if (!careerVacancy(l, "professor")) break;
    }
    const before = JSON.stringify(l);
    expect(enterCareerNode(l, "professor")).toBe(false);
    expect(JSON.stringify(l)).toBe(before);
    for (let seed = 0; seed < 1000; seed++) {
      l.expansion.worldSeed = seed;
      if (careerVacancy(l, "professor")) break;
    }
    expect(enterCareerNode(l, "professor")).toBe(true);
    expect(isLife(reload(l))).toBe(true);
  });
});

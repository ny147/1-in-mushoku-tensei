import { describe, expect, it } from "vitest";
import { sampleSceneFacts, resolveScene } from "./model";
import { expandedSceneLife, legacySceneLife } from "./fixtures";
import { FOCUSES, RACES, REGIONS } from "../../game/world";
import { OCCUPATIONS } from "../../game/expanded/balance";
import { getProgression } from "../../game/progression";
import { allocateSwordStyle } from "../../game/expanded/sword-state";
import { CAREER_NODES } from '../../game/expanded/career-catalogue';

describe("read-only life scene", () => {
  it('uses underlying outfits for every new career title without title parsing',()=>{
    for(const n of Object.values(CAREER_NODES)) {
      const l=expandedSceneLife();l.age=25;l.focus='balanced';l.expansion.career.role=n.occupation;
      const before=JSON.stringify(l);
      expect(sampleSceneFacts(l).occupation).toBe(n.occupation);
      resolveScene(sampleSceneFacts(l));expect(JSON.stringify(l)).toBe(before);
    }
  });
  it("settles an ended infant into an ending pose", () => {
    const l = expandedSceneLife();
    l.age = 1;
    l.phase = "ended";
    expect(resolveScene(sampleSceneFacts(l)).activity).toBe("ending");
  });
  it("uses the expanded occupation instead of its legacy mirror", () => {
    const l = expandedSceneLife();
    l.expansion.career.role = "farmer";
    l.career = "merchant";
    expect(resolveScene(sampleSceneFacts(l)).outfit).toBe("farmer");
    for (const occupation of OCCUPATIONS) {
      l.expansion.career.role = occupation;
      expect(resolveScene(sampleSceneFacts(l)).occupation).toBe(occupation);
    }
  });
  it("uses selected magic XP and its earned cap, independently of career", () => {
    const l = expandedSceneLife();
    l.focus = "magic";
    l.career = "guard";
    l.progression = getProgression(l);
    l.progression.specialization = "water";
    l.progression.magic.water.xp = 110;
    l.progression.magic.fire.xp = 10000;
    l.training.magicCap = 6;
    expect(resolveScene(sampleSceneFacts(l))).toMatchObject({
      outfit: "magic-training",
      activity: "magic",
      training: { discipline: "water", rank: 2 },
    });
    l.training.magicCap = 1;
    expect(resolveScene(sampleSceneFacts(l)).training?.rank).toBe(1);
  });
  it("does not allocate unselected swords and respects the selected capped track", () => {
    const l = expandedSceneLife();
    l.focus = "sword";
    expect(resolveScene(sampleSceneFacts(l)).activity).toBe("prepare");
    allocateSwordStyle(l, "water-god");
    l.expansion.swords!.tracks["water-god"] = { xp: 10000, cap: 2 };
    l.expansion.swords!.tracks["sword-god"] = { xp: 10000, cap: 6 };
    expect(resolveScene(sampleSceneFacts(l))).toMatchObject({
      activity: "water-god",
      training: { rank: 2 },
    });
  });
  it("uses existing race lifespan boundaries", () => {
    const l = expandedSceneLife();
    for (const race of Object.keys(RACES) as (keyof typeof RACES)[]) {
      l.race = race;
      for (const [age, stage] of [
        [2, "infant"],
        [3, "child"],
        [11, "child"],
        [12, "teen"],
        [17, "teen"],
        [18, "adult"],
        [RACES[race].lifespan * 0.7 - 0.01, "adult"],
        [RACES[race].lifespan * 0.7, "elder"],
      ] as const) {
        l.age = age;
        expect(resolveScene(sampleSceneFacts(l)).stage).toBe(stage);
      }
    }
  });
  it("respects focus age locks and actual regions", () => {
    const l = expandedSceneLife();
    for (const focus of Object.keys(FOCUSES) as (keyof typeof FOCUSES)[]) {
      l.focus = focus;
      l.age = 0;
      expect(resolveScene(sampleSceneFacts(l)).activity).toBe("rest");
      l.age = 25;
      expect(resolveScene(sampleSceneFacts(l)).activity).toBeTruthy();
    }
    for (const region of Object.keys(REGIONS) as (keyof typeof REGIONS)[]) {
      l.region = region;
      expect(resolveScene(sampleSceneFacts(l)).region).toBe(region);
    }
  });
  it("never mutates either ruleset, allocates styles or consumes RNG", () => {
    for (const l of [expandedSceneLife(), legacySceneLife()]) {
      if (l.ruleset === "expanded-1") delete l.expansion.swords;
      const before = JSON.stringify(l);
      const freeze = (value: unknown): void => {
        if (value && typeof value === "object") {
          Object.freeze(value);
          Object.values(value).forEach(freeze);
        }
      };
      freeze(l);
      for (let i = 0; i < 4; i++) resolveScene(sampleSceneFacts(l));
      expect(JSON.stringify(l)).toBe(before);
    }
  });
  it("uses known legacy sword schools without allocating expanded state", () => {
    const l = legacySceneLife();
    l.focus = "sword";
    l.training.school = "Water God";
    l.training.swordXp = 10000;
    l.training.swordCap = 1;
    expect(resolveScene(sampleSceneFacts(l))).toMatchObject({
      activity: "water-god",
      training: { rank: 1 },
    });
    l.training.school = "Not yet chosen";
    expect(resolveScene(sampleSceneFacts(l))).toMatchObject({
      activity: "prepare",
      training: { rank: null },
    });
  });
  it("applies the exact age gates and focus actions", () => {
    const l = expandedSceneLife();
    const actions = {
      balanced: "observe",
      magic: "magic",
      sword: "prepare",
      study: "read",
      work: "work",
      bonds: "social",
      explore: "walk",
      rest: "rest",
    };
    for (const focus of Object.keys(FOCUSES) as (keyof typeof FOCUSES)[]) {
      l.focus = focus;
      l.age = Math.max(3, FOCUSES[focus].minAge);
      expect(resolveScene(sampleSceneFacts(l)).activity).toBe(actions[focus]);
      if (FOCUSES[focus].minAge > 3) {
        l.age = FOCUSES[focus].minAge - 1;
        expect(resolveScene(sampleSceneFacts(l)).activity).toBe("observe");
      }
    }
  });
});

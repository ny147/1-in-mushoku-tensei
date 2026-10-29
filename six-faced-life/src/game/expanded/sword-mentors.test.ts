import { describe, it, expect } from "vitest";
import { createExpandedLife } from "./origins";
import {
  allocateSwordStyle,
  SWORD_STYLES,
  SWORD_XP,
  type AdvancedSwordRank,
} from "./sword-state";
import {
  quoteSwordMentor,
  enrollSwordMentor,
  creditSwordMentorship,
  completeSwordTrial,
  abandonSwordMentorship,
} from "./sword-mentors";
export const trainee = () => {
  const l = createExpandedLife({ seed: 1 });
  l.age = 30;
  l.phase = "alive";
  l.pending = null;
  l.region = "asura";
  l.focus = "sword";
  l.coins = 1000;
  l.expansion.genetics.auraImpaired = false;
  allocateSwordStyle(l, "sword-god");
  l.expansion.swords!.tracks["sword-god"].xp = 1800;
  return l;
};
describe("sword mentors", () => {
  it.each(SWORD_STYLES)("quotes each consecutive rank for %s", (style) => {
    const l = trainee();
    allocateSwordStyle(l, style);
    l.region =
      style === "sword-god"
        ? "asura"
        : style === "water-god"
          ? "millis"
          : "demon";
    for (const target of [3, 4, 5, 6] as AdvancedSwordRank[]) {
      l.expansion.swords!.tracks[style] = {
        xp: SWORD_XP[target],
        cap: (target - 1) as 2 | 3 | 4 | 5,
      };
      const q = quoteSwordMentor(l)!;
      expect(q.fee).toBe(16 * 2 ** (target - 3));
      expect(enrollSwordMentor(l, q)).toBe(true);
      expect(enrollSwordMentor(l, q)).toBe(false);
      creditSwordMentorship(l, 1);
      expect(completeSwordTrial(l)).toBe(true);
      expect(completeSwordTrial(l)).toBe(false);
      expect(l.expansion.swords!.tracks[style].cap).toBe(target);
    }
    expect(quoteSwordMentor(l)).toBeNull();
  });
  it("blocks invalid conditions and rechecks stale quotes", () => {
    for (const change of [
      (l: ReturnType<typeof trainee>) => {
        l.age = 7;
      },
      (l: ReturnType<typeof trainee>) => {
        l.region = "ranoa";
      },
      (l: ReturnType<typeof trainee>) => {
        l.coins = 15;
      },
      (l: ReturnType<typeof trainee>) => {
        l.expansion.genetics.auraImpaired = true;
      },
      (l: ReturnType<typeof trainee>) => {
        l.expansion.swords!.tracks["sword-god"].xp = 100;
      },
    ]) {
      const l = trainee(),
        q = quoteSwordMentor(l)!;
      change(l);
      expect(enrollSwordMentor(l, q)).toBe(false);
      expect(l.expansion.swords!.mentorship).toBeNull();
    }
  });
  it("retains paid paused progress and promotes one cap only", () => {
    const l = trainee(),
      q = quoteSwordMentor(l)!;
    expect(enrollSwordMentor(l, q)).toBe(true);
    expect(l.coins).toBe(984);
    creditSwordMentorship(l, 0.25);
    l.focus = "rest";
    creditSwordMentorship(l, 1);
    expect(l.expansion.swords!.mentorship!.progress).toBe(0.25);
    l.focus = "sword";
    l.region = "ranoa";
    creditSwordMentorship(l, 1);
    l.region = "asura";
    allocateSwordStyle(l, "north-god");
    creditSwordMentorship(l, 1);
    allocateSwordStyle(l, "sword-god");
    l.expansion.education.stage = "university";
    creditSwordMentorship(l, 1);
    l.expansion.education.stage = "none";
    creditSwordMentorship(l, 0.75);
    expect(completeSwordTrial(l)).toBe(true);
    expect(l.expansion.swords!.tracks["sword-god"].cap).toBe(3);
    expect(l.coins).toBe(984);
  });
  it("abandons without refund or lost XP", () => {
    const l = trainee();
    enrollSwordMentor(l, quoteSwordMentor(l)!);
    creditSwordMentorship(l, 0.5);
    expect(abandonSwordMentorship(l)).toBe(true);
    expect(l.coins).toBe(984);
    expect(l.expansion.swords!.tracks["sword-god"].xp).toBe(1800);
  });
  it("does not resell a grandfathered ceiling", () => {
    const l = trainee();
    l.expansion.swords!.tracks["sword-god"] = { xp: 260, cap: 5 };
    const q = quoteSwordMentor(l)!;
    expect(q.target).toBe(6);
    expect(enrollSwordMentor(l, q)).toBe(false);
  });
});

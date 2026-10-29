import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import {
  emptySwordState,
  selectSwordStyle,
  swordMeets,
  swordRank,
  grantSwordXp,
} from "./sword-state";
const adult = () => {
  const l = createExpandedLife({ seed: 1 });
  l.age = 30;
  l.phase = "alive";
  l.pending = null;
  return l;
};
describe("sword ledger", () => {
  it("keeps_three_independent_tracks", () => {
    const l = adult();
    l.expansion.swords = emptySwordState();
    expect(Object.values(l.expansion.swords.tracks)).toEqual(
      Array(3).fill({ xp: 0, cap: 2 }),
    );
    const a = selectSwordStyle(l, "sword-god") as typeof l;
    grantSwordXp(a, 11.25);
    const b = selectSwordStyle(a, "water-god") as typeof l;
    grantSwordXp(b, 3);
    expect(b.expansion.swords!.tracks["sword-god"].xp).toBe(11.25);
    expect(b.expansion.swords!.tracks["water-god"].xp).toBe(3);
    expect(b.rng).toBe(l.rng);
    expect(b.age).toBe(l.age);
    expect(b.focus).toBe(l.focus);
    expect(swordRank({ xp: 1800, cap: 2 })).toBe(2);
  });
  it("locks_selection_during_pending_or_queued_decisions", () => {
    const l = adult();
    l.pending = "expanded.practice";
    expect(selectSwordStyle(l, "water-god")).toBe(l);
    l.pending = null;
    l.expansion.queue = ["expanded.practice"];
    expect(selectSwordStyle(l, "water-god")).toBe(l);
    l.expansion.queue = [];
    l.age = 4;
    expect(selectSwordStyle(l, "water-god")).toBe(l);
    l.age = 30;
    l.phase = "ended";
    expect(selectSwordStyle(l, "water-god")).toBe(l);
    expect(selectSwordStyle(adult(), "bad" as "water-god")).toBeDefined();
  });
  it("does_not_mix_requirements", () => {
    const l = adult();
    l.expansion.swords = emptySwordState();
    l.expansion.swords.tracks["sword-god"] = { xp: 110, cap: 2 };
    l.expansion.swords.tracks["water-god"] = { xp: 35, cap: 4 };
    expect(swordMeets(l, 110, 4, "career")).toBe(false);
    expect(swordMeets(l, 110, 2, "career")).toBe(true);
    l.expansion.swords.selected = "north-god";
    expect(swordMeets(l, 35, 1, "event")).toBe(false);
  });
  it("never_sums_tracks", () => {
    const l = adult();
    l.expansion.swords = emptySwordState();
    l.expansion.swords.tracks["sword-god"].xp = 30;
    l.expansion.swords.tracks["water-god"].xp = 30;
    expect(swordMeets(l, 35, 1, "career")).toBe(false);
  });
});

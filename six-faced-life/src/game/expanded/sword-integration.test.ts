import { describe, it, expect } from "vitest";
import { createExpandedLife } from "./origins";
import {
  advance,
  choose,
  openActivity,
  selectSwordStyle,
  finishLife,
  getDecision,
} from "../engine";
import { loadGame, isLife, archiveLife } from "../storage";
import type { ExpandedLife } from "../types";
import { canAutoChoose } from "../simulation";
const restore = (l: ExpandedLife) => {
  const r = loadGame({
    getItem: () => JSON.stringify({ version: 1, active: l, archive: [] }),
    setItem: () => {},
  });
  expect(r.error).toBeNull();
  return r.data.active as ExpandedLife;
};
describe("sword full flow", () => {
  it("honors an already offered old title challenge but uses paired paths for new offers", () => {
    let l = createExpandedLife({ seed: 0 });
    delete l.expansion.swords;
    l.phase = "alive";
    l.age = 40;
    l.pending = "expanded.challenge";
    l.training.magicXp = 2200;
    l.training.magicCap = 2;
    l.training.swordXp = 110;
    l.training.swordCap = 5;
    l.expansion.standing.reputation = 100;
    l.expansion.standing.feats = ["a", "b", "c"];
    expect(
      getDecision(l)!.choices.find((c) => c.id.endsWith("rank-7"))!.disabled,
    ).toBe(false);
    l = restore(l);
    expect(
      getDecision(l)!.choices.find((c) => c.id.endsWith("rank-7"))!.disabled,
    ).toBe(false);
    const n = choose(l, "expanded.challenge.rank-7") as ExpandedLife;
    expect(n.expansion.standing.titles).toHaveLength(1);
  });
  it("preserves an old paid offer then allocates, trains, defers, restores and promotes once", () => {
    let l = createExpandedLife({ seed: 0 });
    delete l.expansion.swords;
    l.phase = "alive";
    l.age = 30;
    l.region = "asura";
    l.coins = 1000;
    l.expansion.economy.peak = 1000;
    l.stats.health = 100;
    l.deathAge = 100;
    l.training.swordXp = 1800;
    l.training.swordCap = 2;
    l.training.school = "";
    l.pending = "expanded.instruction";
    l.expansion.genetics.auraImpaired = false;
    const old = getDecision(l);
    l = restore(l);
    expect(getDecision(l)).toEqual(old);
    l = choose(l, "expanded.instruction.sword") as ExpandedLife;
    expect(l.coins).toBe(992);
    expect(l.expansion.swords!.legacy!.cap).toBe(3);
    l = selectSwordStyle(l, "sword-god") as ExpandedLife;
    l = selectSwordStyle(l, "water-god") as ExpandedLife;
    l.focus = "sword";
    l = advance(l, "tick", 0.25) as ExpandedLife;
    l = selectSwordStyle(l, "sword-god") as ExpandedLife;
    l = openActivity(l, "sword-mentor") as ExpandedLife;
    expect(canAutoChoose(l)).toBe(false);
    l = choose(l, "expanded.sword-mentor.enroll") as ExpandedLife;
    expect(l.coins).toBe(960);
    l.focus = "rest";
    const p = l.expansion.swords!.mentorship!.progress;
    l = advance(l, "tick", 0.25) as ExpandedLife;
    expect(l.expansion.swords!.mentorship!.progress).toBe(p);
    l = restore(l);
    l.focus = "sword";
    for (let i = 0; i < 12 && l.pending !== "expanded.sword-trial"; i++) {
      while (l.pending) {
        const c =
          getDecision(l)!.choices.find((c) => c.id.endsWith(".later")) ??
          getDecision(l)!.choices.find((c) => !c.disabled && !c.risk)!;
        l = choose(l, c.id) as ExpandedLife;
      }
      l = advance(l, "tick", 0.25) as ExpandedLife;
    }
    expect(l.pending).toBe("expanded.sword-trial");
    l = choose(l, "expanded.sword-trial.defer") as ExpandedLife;
    l = restore(l);
    l = openActivity(l, "sword-mentor") as ExpandedLife;
    l = choose(l, "expanded.sword-mentor.trial") as ExpandedLife;
    const year = l.expansion.birthYear + l.age;
    l = choose(l, "expanded.sword-trial.complete") as ExpandedLife;
    expect(l.expansion.swords!.tracks["sword-god"].cap).toBe(4);
    expect(l.expansion.swords!.completed["sword-god"][4]).toBe(year);
    expect(choose(l, "expanded.sword-trial.complete")).toBe(l);
    l.expansion.politics.faction = "orsted";
    l.pending = "expanded.assignment";
    l = selectSwordStyle(l, "north-god") as ExpandedLife;
    expect(l.expansion.swords!.selected).toBe("sword-god");
    l.rng = 0;
    l = choose(l, "expanded.assignment.sword-god") as ExpandedLife;
    expect(l.expansion.standing.service).toBe(1);
    finishLife(l, "aging");
    expect(isLife(l)).toBe(true);
    const save = archiveLife({ version: 1, active: null, archive: [] }, l);
    const loaded = loadGame({
      getItem: () => JSON.stringify(save),
      setItem: () => {},
    });
    expect(loaded.error).toBeNull();
    expect(loaded.data.archive[0]).toEqual(l);
  });
  it("honors a low-cap old offer without reducing the new free ceiling", () => {
    let l = createExpandedLife({ seed: 0 });
    delete l.expansion.swords;
    l.phase = "alive";
    l.age = 8;
    l.pending = "expanded.instruction";
    l.coins = 20;
    l.expansion.economy.peak = 20;
    l.training.swordCap = 0;
    l.training.swordXp = 0;
    l = restore(l);
    l = choose(l, "expanded.instruction.sword") as ExpandedLife;
    expect(l.expansion.swords!.legacy!.cap).toBe(2);
  });
});

import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { advance, beginLife, choose, getDecision, setFocus } from "../engine";
import { isLife, loadGame, saveGame } from "../storage";
import type { ExpandedLife, Life } from "../types";
const safeChoice = (l: Life) =>
  getDecision(l)?.choices.find(
    (c) =>
      !c.disabled &&
      (c.cost ?? 0) === 0 &&
      !c.risk &&
      !["expanded.orsted.accept", "expanded.hitogami.accept", "expanded.career.training"].includes(c.id),
  );
describe("expanded seeded lifetimes and storage", () => {
  it("applies choice practice to the selected discipline and preserves it across a study change", () => {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.pending = "expanded.practice";
    l.age = 8;
    const next = choose(l, "expanded.practice.magic");
    expect(next.progression!.magic.water.xp).toBe(12);
    expect(next.progression!.magic.water.spells).toContain("water-drop");
  });
  it("keeps 500 complete lives valid and restoration futures identical at every decision", async () => {
    for (let seed = 0; seed < 500; seed++) {
      let life = beginLife(createExpandedLife({ seed }));
      for (let step = 0; step < 2000 && life.phase !== "ended"; step++) {
        const choice = safeChoice(life);
        const next = choice ? choose(life, choice.id) : advance(life, "year");
        if (life.pending)
          expect(choice, `blocked ${life.pending}`).toBeDefined();
        expect(
          isLife(next),
          `seed ${seed} age ${next.age} event ${next.pending}`,
        ).toBe(true);
        if (choice)
          expect(choose(JSON.parse(JSON.stringify(life)), choice.id)).toEqual(
            next,
          );
        life = next;
      }
      expect(life.phase, `seed ${seed}`).toBe("ended");
      if(seed%20===0)await new Promise(resolve=>setTimeout(resolve,0));
    }
  }, 60000);
  it("loads one active and twenty maximum-length chronicle records without eviction", () => {
    let end: Life = beginLife(createExpandedLife({ seed: 1 }));
    while (end.phase !== "ended") {
      const c = safeChoice(end);
      end = c ? choose(end, c.id) : advance(end, "year");
    }
    if (end.ruleset !== "expanded-1") throw Error("expanded");
    const sample = end.history[0];
    end.history = Array.from({ length: 600 }, (_, i) => ({
      ...sample,
      id: i + 1,
      age: Math.min(end.age, i),
    }));
    const archive = Array.from({ length: 20 }, (_, i) => ({
      ...structuredClone(end),
      id: `ended-${i}`,
    }));
    const active = createExpandedLife({ seed: 20 });
    const save = { version: 1 as const, active, archive };
    let raw = "";
    expect(
      saveGame(
        {
          getItem: () => raw,
          setItem: (_, v) => {
            raw = v;
          },
        },
        save,
      ),
    ).toBe(true);
    expect(raw.length).toBeLessThan(6_000_000);
    expect(
      loadGame({ getItem: () => raw, setItem: () => {} }).data.archive,
    ).toHaveLength(20);
    console.info(
      JSON.stringify({
        fixture: "active+20x600-entry archives",
        characters: raw.length,
      }),
    );
  });
  it("measures actual engine childhood mortality under a frozen safe balanced policy", async () => {
    let attempted = 0,
      births = 0,
      deaths = 0,
      protectedDeaths = 0;
    const run = (birth: ExpandedLife) => {
      let l: Life = beginLife(birth);
      for (
        let step = 0;
        step < 250 && l.phase !== "ended" && l.age < 15;
        step++
      ) {
        const c = safeChoice(l);
        l = c ? choose(l, c.id) : advance(setFocus(l, "balanced"), "year");
      }
      return l.phase === "ended" && l.age < 15;
    };
    while (births < 10000) {
      const l = createExpandedLife({
        seed: Math.imul(attempted++, 2654435761) >>> 0,
      });
      if (l.race !== "superd") continue;
      births++;
      if(births%100===0)await new Promise(resolve=>setTimeout(resolve,0));
      const protectedLife = structuredClone(l);
      protectedLife.expansion.economy.support = 40;
      protectedLife.expansion.economy.protectionUntil = 1500;
      if (run(l)) deaths++;
      if (run(protectedLife)) protectedDeaths++;
    }
    console.info(
      JSON.stringify({
        cohort: "full-engine Superd balanced safe",
        attempted,
        births,
        deaths,
        protectedDeaths,
      }),
    );
    expect(deaths).toBeGreaterThanOrEqual(8700);
    expect(deaths).toBeLessThanOrEqual(9300);
    expect(deaths - protectedDeaths).toBeGreaterThanOrEqual(1000);
  // The enlarged saved training/finance state is cloned throughout this 10,000-life cohort.
  }, 180000);
});

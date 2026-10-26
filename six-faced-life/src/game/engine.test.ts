import { describe, expect, it } from "vitest";
import {
  advance,
  beginLife,
  choose,
  createLife,
  getDecision,
  setFocus,
} from "./engine";
import { RACES, REGIONS } from "./world";
import { EVENT_MAP } from "./events";

function ready(seed = 123) {
  let life = beginLife(createLife({ ruleset: 'legacy-1', seed, name: "Aster" }));
  const decision = getDecision(life)!;
  life = choose(life, decision.choices[0].id);
  return life;
}

describe("birth and memory", () => {
  it("generates deterministic, coherent births and trims player names", () => {
    const a = createLife({ ruleset: 'legacy-1', seed: 42, name: "  Aster  " });
    const b = createLife({ ruleset: 'legacy-1', seed: 42, name: "Aster" });
    expect(a).toEqual(b);
    expect(a.name).toBe("Aster");
    expect(REGIONS[a.birthRegion].races).toContain(a.race);
    expect(a.phase).toBe("birth");
    expect(a.age).toBe(0);
    expect(a.memories).toBe(true);
  });

  it("opens a memory choice and makes a lasting consequence", () => {
    const life = beginLife(createLife({ ruleset: 'legacy-1', seed: 42 }));
    expect(getDecision(life)?.id).toBe("first-memory");
    const next = choose(life, "observe");
    expect(next.stats.knowledge).toBeGreaterThan(life.stats.knowledge);
    expect(next.flags.observant).toBe(true);
    expect(next.pending).toBeNull();
  });

  it("does not mutate the previous state", () => {
    const life = ready();
    const original = JSON.stringify(life);
    advance(life, "year");
    expect(JSON.stringify(life)).toBe(original);
  });
});

describe("time and choices", () => {
  it("leaves three years between random decisions, including restored lives", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const life = ready(seed);
      life.age = 25;
      life.seen.journey = 25;
      const restored = JSON.parse(JSON.stringify(life));
      const firstQuietYear = advance(restored, "year");
      expect(firstQuietYear.pending, `seed ${seed}, age 26`).toBeNull();
      expect(advance(firstQuietYear, "year").pending).toBeNull();
      expect(firstQuietYear.history.length).toBeGreaterThan(life.history.length);
    }
  });

  it("keeps major milestones even immediately after a random decision", () => {
    const life = ready(22);
    life.age = 29;
    life.seen.journey = 29;
    expect(advance(life, "year").pending).toBe("old-life-truth");
  });

  it("offers occasional random decisions once the spacing has elapsed", () => {
    let decisions = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const life = ready(seed);
      life.age = 35;
      life.seen.journey = 33;
      if (advance(life, "year").pending) decisions++;
    }
    // Fixed seed cohort: sparse opportunities, while stories remain reachable.
    expect(decisions).toBeGreaterThanOrEqual(10);
    expect(decisions).toBeLessThanOrEqual(40);
  });

  it("stops every advance mode for a pending decision", () => {
    const life = beginLife(createLife({ ruleset: 'legacy-1', seed: 42 }));
    expect(advance(life, "year")).toEqual(life);
    expect(advance(life, "decision")).toEqual(life);
    expect(advance(life, "tick", 100)).toEqual(life);
  });

  it("stops fast-forward at a decision and bounds a tick", () => {
    const life = advance(ready(), "decision");
    expect(life.pending).not.toBeNull();
    expect(life.age).toBeLessThanOrEqual(3);
    const tick = advance(ready(), "tick", 9999);
    expect(tick.age).toBeLessThanOrEqual(1);
  });

  it("ignores invalid choices and unaffordable choices", () => {
    const life = ready();
    expect(choose(life, "invalid")).toEqual(life);
    const pending = { ...life, pending: "reading" };
    const poor = { ...pending, coins: 0 };
    const paidOptions = getDecision(poor)!.choices.filter(
      (c) => (c.cost ?? 0) > 0,
    );
    expect(paidOptions.length).toBeGreaterThan(0);
    for (const option of paidOptions) {
      expect(choose(poor, option.id)).toEqual(poor);
    }
  });

  it("trains the selected skill rather than giving identical progression", () => {
    let magic = ready(99);
    magic.age = 6;
    magic = setFocus(magic, "magic");
    const rest = setFocus(magic, "rest");
    const trained = advance(magic, "year");
    const rested = advance(rest, "year");
    expect(trained.training.magicXp).toBeGreaterThan(rested.training.magicXp);
    expect(rested.stats.health).toBeGreaterThanOrEqual(trained.stats.health);
  });

  it("has accessible priorities and rejects inaccessible ones", () => {
    const baby = ready();
    expect(setFocus(baby, "work").focus).not.toBe("work");
  });
});

describe("relationship and travel prerequisites", () => {
  it("does not offer a shared-parenthood decision after the partner has died", () => {
    const life = ready(22);
    life.age = 80;
    life.flags.partnered = true;
    life.flags["farewell-partner"] = true;
    expect(EVENT_MAP.get("child")!.condition!(life)).toBe(false);
  });

  it("makes every other region an available travel destination", () => {
    for (const region of Object.keys(REGIONS) as (keyof typeof REGIONS)[]) {
      const life = { ...ready(22), age: 30, region, pending: "journey" };
      const choices = getDecision(life)!.choices;
      for (const destination of Object.keys(REGIONS).filter(
        (id) => id !== region,
      )) {
        expect(
          choices.some((choice) => choice.region === destination),
          `${region} → ${destination}`,
        ).toBe(true);
      }
    }
  });
});

describe("full life simulation", () => {
  it("finishes many seeds including long-lived races with valid state", () => {
    const seenRaces = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      let life = ready(seed);
      seenRaces.add(life.race);
      let steps = 0;
      while (life.phase !== "ended" && steps++ < 1800) {
        const decision = getDecision(life);
        if (decision) {
          const option = decision.choices.find(
            (c) => (c.cost ?? 0) <= life.coins && !c.disabled,
          );
          expect(option).toBeDefined();
          life = choose(life, option!.id);
        } else life = advance(life, "decision");
        expect(life.coins).toBeGreaterThanOrEqual(0);
        for (const value of Object.values(life.stats)) {
          expect(Number.isFinite(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
        }
      }
      expect(life.phase, `seed ${seed}, age ${life.age}`).toBe("ended");
      expect(life.ending?.cause).toBeTruthy();
      expect(life.age).toBeLessThanOrEqual(RACES[life.race].maxAge);
    }
    expect(seenRaces.size).toBeGreaterThan(2);
  }, 30_000); // 100 complete lifetimes need headroom on shared CI runners.

  it("restores a pending choice without changing future outcomes", () => {
    const life = advance(ready(22), "decision");
    const restored = JSON.parse(JSON.stringify(life));
    const option = getDecision(life)!.choices.find((c) => !c.cost)!;
    expect(advance(choose(restored, option.id), "decision")).toEqual(
      advance(choose(life, option.id), "decision"),
    );
  });
});

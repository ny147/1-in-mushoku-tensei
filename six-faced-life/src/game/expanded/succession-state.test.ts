import { describe, it, expect } from "vitest";
import { createExpandedLife } from "./origins";
import { activateSuccession, winnerFromRoll, successionWinner } from "./succession-state";
import { isLife } from "../storage";

describe("the Asura world result", () => {
  it("assigns Ariel the first 80% of a dedicated stream", () => {
    expect(winnerFromRoll(0.799999)).toBe("ariel");
    expect(winnerFromRoll(0.8)).toBe("opposition");
    const count = Array.from({length: 10_000}, (_, seed) => successionWinner(seed)).filter(w => w === "opposition").length;
    expect(count).toBeGreaterThan(1800);
    expect(count).toBeLessThan(2200);
  });

  it("adopts only unobstructed pre-crisis expanded lives without touching personal or family RNG", () => {
    const life = createExpandedLife({seed: 15});
    delete life.expansion.succession;
    life.phase = "alive";
    life.expansion.birthYear = 401;
    life.age = 22;
    life.pending = "expanded.practice";
    expect(activateSuccession(life)).toBe(life);
    life.pending = null;
    life.expansion.queue.push("expanded.succession");
    expect(activateSuccession(life)).toBe(life);
    life.expansion.queue = [];
    const migrated = activateSuccession(life);
    expect(migrated.expansion.succession?.winner).toBe(successionWinner(life.expansion.worldSeed));
    expect(migrated.rng).toBe(life.rng);
    expect(migrated.expansion.familyRng).toBe(life.expansion.familyRng);
    expect(activateSuccession(migrated)).toBe(migrated);
    for (const age of [23, 24, 25]) {
      life.age = age;
      expect(activateSuccession(life)).toBe(life);
    }
  });

  it("preserves the stored result and rejects a malformed succession ledger", () => {
    const life = createExpandedLife({seed: 1});
    expect(isLife(JSON.parse(JSON.stringify(life)))).toBe(true);
    expect(life.expansion.succession?.version).toBe(1);
    expect(isLife({...life, expansion: {...life.expansion, succession: {version: 1, winner: "unknown"}}})).toBe(false);
  });
});

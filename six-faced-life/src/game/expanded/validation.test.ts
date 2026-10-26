import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { isLife } from "../storage";
import { finishLife } from "../engine";
describe("expanded semantic validation", () => {
  it("rejects impossible phase, RNG, queue and retrospective relationships", () => {
    const base = createExpandedLife({ seed: 1 });
    for (const mutate of [
      (l: typeof base) => {
        l.age = 8;
      },
      (l: typeof base) => {
        l.rng = 0.5;
      },
      (l: typeof base) => {
        l.phase = "alive";
        l.pending = "expanded.memory";
        l.expansion.queue = ["expanded.memory"];
      },
      (l: typeof base) => {
        finishLife(l, "illness");
        l.expansion.summary!.spouseCount = 1;
      },
      (l: typeof base) => {
        finishLife(l, "illness");
        l.expansion.summary!.survivingDescendants = 9;
      },
    ]) {
      const bad = structuredClone(base);
      mutate(bad);
      expect(isLife(bad)).toBe(false);
    }
  });
});

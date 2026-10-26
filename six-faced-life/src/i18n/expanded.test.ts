import { describe, expect, it } from "vitest";
import {
  EXPANDED_COPY,
  expandedDecisionText,
  expandedEntryText,
} from "./expanded";
import { EXPANDED_EVENT_IDS } from "../game/expanded/balance";
import { createExpandedLife } from "../game/expanded/origins";
import { getDecision, choose } from "../game/engine";
describe("expanded bilingual catalogue", () => {
  it("provides original Thai titles, bodies, options and outcomes for every registered event", () => {
    for (const id of EXPANDED_EVENT_IDS) {
      const copy = EXPANDED_COPY[id];
      expect(copy, id).toBeDefined();
      expect(copy.title[1]).toMatch(/[ก-๙]/);
      expect(copy.text[1]).toMatch(/[ก-๙]/);
      for (const c of Object.values(copy.choices)) {
        expect(c[1]).toMatch(/[ก-๙]/);
        expect(c[3]).toMatch(/[ก-๙]/);
      }
    }
  });
  it("localizes dynamic jobs, destinations and actual saved outcomes without changing rules", () => {
    const l = createExpandedLife({ seed: 1, language: "th" });
    l.phase = "alive";
    l.age = 20;
    for (const id of ["career", "travel", "work", "assessment"]) {
      l.pending = `expanded.${id}`;
      const d = getDecision(l)!;
      const th = expandedDecisionText(d, "th");
      expect(th.id).toBe(d.id);
      expect(th.choices.map((c) => c.id)).toEqual(d.choices.map((c) => c.id));
      for (const c of th.choices) {
        expect(c.label).toMatch(/[ก-๙]/);
        expect(c.description).toMatch(/[ก-๙]/);
      }
    }
    l.pending = "expanded.work";
    const n = choose(l, "expanded.work.farmer");
    expect(expandedEntryText(n.history.at(-1)!, "th")?.text).toMatch(/[ก-๙]/);
  });
});

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

// Pin the existing generation/localization path before changing live economic UI.
import { entryText } from "./story";
it("preserves literal monetary history in both languages", () => {
  const records = [];
  for (const language of ["en", "th"] as const) {
    for (const event of ["aid", "instruction", "work", "university"]) {
      const l = createExpandedLife({seed: 1, language});
      l.phase = "alive"; l.age = 25; l.coins = 500;
      l.pending = `expanded.${event}`;
      const d = getDecision(l)!;
      const c = d.choices.find(c => !c.disabled) ?? d.choices[0];
      const after = choose(l, c.id);
      const e = after.history.at(-1)!;
      records.push({language, event, entry: entryText(e, language), expanded: expandedEntryText(e, language)});
    }
    const fallback = {id: 999, age: 20, kind: "choice" as const, title: "Old fee", text: "Paid 4 coins", message: {key:"unknown.old",params:{}}};
    records.push({language, fallback: entryText(fallback, language)});
  }
  expect(records).toMatchSnapshot();
});

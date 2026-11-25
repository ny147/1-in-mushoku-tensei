import { describe, expect, it } from "vitest";
import {
  EXPANDED_COPY,
  expandedDecisionText,
  expandedEntryText,
} from "./expanded";
import { EXPANDED_EVENT_IDS } from "../game/expanded/balance";
import { createExpandedLife } from "../game/expanded/origins";
import { getDecision, choose, openActivity } from "../game/engine";
import { applySuccessionYear } from "../game/expanded/succession-events";
import { accede } from "../game/expanded/governance";
import { recognizeAtCourt } from "../game/expanded/crown-service";

function politicalFixture(id: string) {
  const life = createExpandedLife({seed: 6, region: "asura"});
  life.phase = "alive";
  life.expansion.social!.debt = null;
  life.expansion.standing.status = "noble";
  life.age = id === "asura-household" ? 17 : 18;
  life.expansion.birthYear = 424 - life.age;
  applySuccessionYear(life);
  const s = life.expansion.succession!;
  if (id === "asura-result" || id === "asura-defeat" || id === "succession-withdrawal") {
    life.pending = "expanded.asura-oath";
    const side = s.winner === "ariel" ? "opposition" : "ariel";
    const pledged = choose(life, `expanded.asura-oath.${side}`);
    if (pledged.ruleset !== "expanded-1") throw Error("Expanded life required");
    if (id === "succession-withdrawal") {
      pledged.pending = "expanded.succession-withdrawal";
      return pledged;
    }
    pledged.age++;
    applySuccessionYear(pledged);
    pledged.pending = "expanded.asura-result";
    return id === "asura-result" ? pledged : choose(pledged, "expanded.asura-result.read");
  }
  if (id.startsWith("crown-")) {
    life.age++;
    recognizeAtCourt(life, true);
    if (id !== "crown-petition") {
      life.age += 3;
      s.court.request = {openedYear:428, dueYear:428, extended:false, status:id === "crown-request" ? "open" : "final", resolutionYear:null};
    }
  }
  if (id.startsWith("govern-")) {
    life.age++;
    accede(life);
    const issue = id.slice(7);
    if (issue === "relief" || issue === "dispute" || issue === "crisis") s.court.office!.pending = issue;
  }
  life.pending = `expanded.${id}`;
  return life;
}
describe("expanded bilingual catalogue", () => {
  it("provides original Thai titles, bodies, options and outcomes for every registered event", () => {
    for (const id of EXPANDED_EVENT_IDS) {
      if (/^(asura-|succession-withdrawal$|crown-|govern-)/.test(id)) {
        const decision = getDecision(politicalFixture(id));
        expect(decision?.id, id).toBe(`expanded.${id}`);
        const thai = expandedDecisionText(decision!, "th");
        expect(thai.title).toMatch(/[ก-๙]/);
        expect(thai.text).toMatch(/[ก-๙]/);
        for (const choice of thai.choices) {
          expect(choice.label).toMatch(/[ก-๙]/);
          expect(choice.description).toMatch(/[ก-๙]/);
          expect(choice.outcome).toMatch(/[ก-๙]/);
        }
        continue;
      }
      if (id === "parental-debt" || id === "debt-service-exit") {
        const responsibility = createExpandedLife({ seed: 1 });
        expect(responsibility.expansion.social?.debt).toBeTruthy();
        responsibility.phase = "alive";
        responsibility.age = 15;
        responsibility.pending = "expanded.parental-debt";
        const life = id === "parental-debt" ? responsibility :
          openActivity(choose(responsibility, "expanded.parental-debt.service"), "debt-service-exit");
        const decision = getDecision(life)!;
        expect(decision, id).toBeTruthy();
        expect(decision.id).toBe(`expanded.${id}`);
        const translated = expandedDecisionText(decision, "th");
        expect(translated.title).toMatch(/[ก-๙]/);
        expect(translated.text).toMatch(/[ก-๙]/);
        expect(translated.choices.map(c => c.id)).toEqual(decision.choices.map(c => c.id));
        for (const choice of translated.choices) {
          expect(choice.label).toMatch(/[ก-๙]/);
          expect(choice.description).toMatch(/[ก-๙]/);
          expect(choice.outcome).toMatch(/[ก-๙]/);
        }
        continue;
      }
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

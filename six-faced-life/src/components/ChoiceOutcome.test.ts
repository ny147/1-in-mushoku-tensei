import { describe, expect, it } from "vitest";
import { beginLife, choose, createLife } from "../game/engine";
import { describeChoice } from "./ChoiceOutcome";
import { createExpandedLife } from "../game/expanded/origins";
import type { ExpandedLife, Language } from "../game/types";

function expanded(event: string, language: Language = "en"): ExpandedLife {
  const l = createExpandedLife({ seed: 1, language });
  l.phase = "alive";
  l.age = 25;
  l.pending = `expanded.${event}`;
  l.expansion.birthYear = 420;
  l.coins = 500;
  l.focus = "magic";
  return l;
}

describe("actual expanded consequence feedback", () => {
  it("confirms protection expiry and focus without pretending there was a stat gain", () => {
    const l = expanded("protection");
    const after = choose(l, "expanded.protection.accept");
    const changes = describeChoice(l, after).changes;
    expect(changes).toContain("Protection active through K448");
    expect(changes).toContain("Focus → Family & friends");
    expect(changes).not.toContain("Bonds +4");
  });
  it("reports only actual capped reputation and public trust gains", () => {
    const l = expanded("conflict");
    l.expansion.standing.reputation = 98;
    l.expansion.standing.trust = 99;
    const changes = describeChoice(
      l,
      choose(l, "expanded.conflict.aid"),
    ).changes;
    expect(changes).toContain("Reputation +2");
    expect(changes).toContain("Public trust +1");
    expect(changes).not.toContain("Reputation +5");
  });
  it("preserves fractional learning gains in feedback", () => {
    const l = expanded("memory");
    l.expansion.genetics.academicTalent = true;
    expect(
      describeChoice(l, choose(l, "expanded.memory.observe")).changes,
    ).toContain("Knowledge +3.75");
  });
  it("shows a real job change and yearly pay, even though no silver arrives immediately", () => {
    const l = expanded("work");
    l.stats.health = 80;
    const changes = describeChoice(
      l,
      choose(l, "expanded.work.farmer"),
    ).changes;
    expect(changes).toContain("Occupation → Farmer");
    expect(changes).toContain("Yearly income 0 → 20 silver before expenses");
    expect(changes).not.toContain("Silver +20");
  });
  it("does not report successful assignment rewards when the character dies", () => {
    const l = expanded("assignment");
    l.expansion.politics.faction = "orsted";
    let after = l;
    for (let rng = 0; rng < 200; rng++) {
      l.rng = rng;
      after = choose(l, "expanded.assignment.accept") as ExpandedLife;
      if (after.phase === "ended") break;
    }
    expect(after.phase).toBe("ended");
    const result = describeChoice(l, after);
    expect(result.text).toContain("danger ended this life");
    expect(result.changes).not.toContain("Reputation +8");
    expect(result.changes).not.toContain("Silver +20");
  });
  it("localizes domain results and tolerates older saves without training or finance", () => {
    const l = expanded("aid", "th");
    delete l.expansion.training;
    delete l.expansion.finance;
    const before = structuredClone(l);
    const after = choose(l, "expanded.aid.accept");
    expect(describeChoice(l, after).changes).toContain(
      "ความช่วยเหลือครัวเรือนถึงปี K447",
    );
    expect(l).toEqual(before);
  });
  it("explicitly confirms that declining protection does not grant protection", () => {
    const l = expanded("protection");
    const changes = describeChoice(
      l,
      choose(l, "expanded.protection.later"),
    ).changes;
    expect(changes).toContain(
      "Decision recorded; no immediate character change",
    );
    expect(changes.join(" ")).not.toContain("Protection active");
  });
});

describe("actual choice feedback", () => {
  it("reports capped gains instead of promising the choice's uncapped reward", () => {
    const life = beginLife(createLife({ ruleset: "legacy-1", seed: 32 }));
    life.stats.knowledge = 98;
    const result = describeChoice(life, choose(life, "observe"));
    expect(result.changes).toContain("Knowledge +2");
    expect(result.changes).not.toContain("Knowledge +8");
  });

  it("uses the recorded failed-risk outcome rather than the promised reward", () => {
    const life = beginLife(createLife({ ruleset: "legacy-1", seed: 32 }));
    life.age = 20;
    life.pending = "guild-quest";
    life.flags.guildMember = true;
    // This RNG state fails the quest's positive danger threshold deterministically.
    life.rng = 2463401483;
    const next = choose(life, "escort");
    expect(next).not.toBe(life);
    const result = describeChoice(life, next);
    expect(result.text).toMatch(/risk does not pay off/);
    expect(result.changes.some((change) => change.startsWith("Health −"))).toBe(
      true,
    );
    expect(result.changes).not.toContain("Silver +18");
  });
});

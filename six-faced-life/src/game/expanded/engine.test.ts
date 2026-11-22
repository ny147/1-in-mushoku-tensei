import { describe, expect, it } from "vitest";
import { advance, beginLife, choose, createLife, getDecision } from "../engine";
import { createExpandedLife } from "./origins";
import { canAutoChoose } from "../simulation";
import { isLife, loadGame } from "../storage";
import { migrateSwordState } from "./sword-migration";
const ready = () =>
  choose(
    beginLife(createExpandedLife({ seed: 42 })),
    "expanded.memory.observe",
  );
describe("expanded annual transactions", () => {
  it("routes expanded creation and explicit legacy compatibility", () => {
    expect(createLife({ seed: 1, ruleset: "expanded-1" }).ruleset).toBe(
      "expanded-1",
    );
    expect(createLife({ seed: 1, ruleset:'legacy-1' }).ruleset).toBeUndefined();
  });
  it("drains same-year decisions without repeating annual effects and survives reload exactly", () => {
    const life = ready();
    if (life.ruleset !== "expanded-1") throw Error("expanded");
    life.pending = "expanded.reading";
    life.expansion.queue = ["expanded.practice"];
    const next = choose(life, "expanded.reading.learn");
    expect(next.age).toBe(life.age);
    expect(next.pending).toBe("expanded.practice");
    expect(
      choose(JSON.parse(JSON.stringify(next)), "expanded.practice.magic"),
    ).toEqual(choose(next, "expanded.practice.magic"));
    expect(advance(next, "year")).toBe(next);
    expect(isLife(next)).toBe(true);
  });
  it("does not mutate original states or accept invalid ticks and choices", () => {
    const life = ready(),
      raw = JSON.stringify(life);
    expect(advance(life, "tick", NaN)).toBe(life);
    expect(choose(life, "foreign")).toBe(life);
    advance(life, "year");
    expect(JSON.stringify(life)).toBe(raw);
  });
  it("requires manual faction, marriage, military and title decisions", () => {
    const life = ready();
    for (const id of [
      "orsted",
      "hitogami",
      "marriage",
      "service",
      "challenge",
    ]) {
      life.pending = `expanded.${id}`;
      expect(canAutoChoose(life)).toBe(false);
    }
  });
  it("offers each eligible faction in 15–20% of seeded random-event years", () => {
    const life = ready();
    if (life.ruleset !== "expanded-1") throw Error("expanded");
    life.expansion.birthYear = 400;
    life.age = 25;
    life.coins = 500;
    life.training.magicXp = 100;
    life.expansion.politics.contact = true;

    const sampleSize = 2000;
    const offers = { orsted: 0, hitogami: 0 };
    for (let rng = 0; rng < sampleSize; rng++) {
      const next = advance({ ...life, rng }, "year");
      if (next.pending === "expanded.orsted") offers.orsted++;
      if (next.pending === "expanded.hitogami") offers.hitogami++;
    }

    for (const count of Object.values(offers)) {
      expect(count / sampleSize).toBeGreaterThanOrEqual(0.15);
      expect(count / sampleSize).toBeLessThanOrEqual(0.20);
    }
  });
  it.each(["current", "pre-sword", "captured"])("allows a %s saved rival offer to be declined after reload", (saveVersion) => {
    let life = createExpandedLife({ seed: 2 });
    delete life.expansion.social;
    life.phase = "alive";
    life.age = 429 - life.expansion.birthYear;
    life.training.magicXp = 100;
    life.expansion.politics.contact = true;
    life.pending = "expanded.orsted";
    if (saveVersion !== "current") delete life.expansion.swords;
    if (saveVersion === "captured") life = migrateSwordState(life, getDecision(life));
    life.expansion.politics.records = [
      { year: 420, code: "joined-hitogami" },
      { year: 424, code: "defected" },
    ];
    life.expansion.politics.pursuitUntil = 427;

    const loaded = loadGame({
      getItem: () => JSON.stringify({ version: 1, active: life, archive: [] }),
      setItem: () => {},
    });
    expect(loaded.error).toBeNull();
    const restored = loaded.data.active;
    if (restored?.ruleset !== "expanded-1") throw Error("expanded");
    expect(getDecision(restored)?.choices).toEqual([
      expect.objectContaining({ id: "expanded.orsted.accept", disabled: true }),
      expect.objectContaining({ id: "expanded.orsted.refuse" }),
    ]);
    expect(choose(restored, "expanded.orsted.accept")).toBe(restored);
    const declined = choose(restored, "expanded.orsted.refuse");
    expect(declined.pending).toBeNull();
    expect(isLife(declined)).toBe(true);
  });
  it("handles birth-year history after the first memory before any annual tick", () => {
    const life = createExpandedLife({ seed: 1 });
    life.expansion.birthYear = 417;
    const next = choose(beginLife(life), "expanded.memory.observe");
    expect(next.age).toBe(0);
    expect(getDecision(next)?.id).toBe("expanded.calamity");
  });
  it("does not offer military service to a child or drain offers after fatal historical injury", () => {
    const child = createExpandedLife({ seed: 1 });
    child.phase = "alive";
    child.pending = "expanded.succession";
    expect(
      getDecision(child)?.choices.some((c) => c.id.endsWith(".service")),
    ).toBe(false);
    child.expansion.birthYear = 417;
    child.age = 0;
    child.region = "asura";
    child.expansion.origin.locality = "fittoa";
    child.stats.health = 5;
    child.pending = "expanded.memory";
    const next = choose(child, "expanded.memory.observe");
    expect(next.phase).toBe("ended");
    expect(next.pending).toBeNull();
  });
});

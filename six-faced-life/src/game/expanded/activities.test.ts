import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import {
  openActivity,
  choose,
  getDecision,
  createLife,
  advance,
} from "../engine";
import { isLife, loadGame } from "../storage";
import { appointmentAvailable } from "./events";
import { canAutoChoose } from "../simulation";
import { expandedDecisionText } from "../../i18n/expanded";
function adult() {
  const l = createExpandedLife({ seed: 2 });
  l.phase = "alive";
  l.age = 35;
  l.coins = 200;
  l.expansion.economy.peak = 200;
  l.stats.knowledge = 50;
  return l;
}
describe("player-initiated optional activities", () => {
  it("never schedules a legendary challenge during ordinary yearly progression", () => {
    for (let seed = 0; seed < 500; seed++) {
      const l = createExpandedLife({ seed });
      l.phase = "alive";
      l.age = 35;
      l.stats.health = 100;
      l.coins = 500;
      l.expansion.economy.peak = 500;
      expect(advance(l, "year").pending, `seed ${seed}`).not.toBe(
        "expanded.challenge",
      );
    }
  });
  it("validates the saved manual marker and keeps existing pending challenges compatible", () => {
    const l = adult();
    l.pending = "expanded.challenge";
    expect(isLife(l)).toBe(true);
    l.expansion.optionalActivity = "expanded.career";
    expect(isLife(l)).toBe(false);
  });
  it("makes education, training, travel and meeting people available without random offers", () => {
    const l = adult();
    for (const key of [
      "assessment",
      "instruction",
      "university",
      "travel",
      "courtship",
    ] as const) {
      const n = openActivity(l, key);
      expect(n.pending).toBe(`expanded.${key}`);
      expect(canAutoChoose(n)).toBe(false);
      expect(isLife(n)).toBe(true);
    }
  });
  it("opens a career browser without time, coin or RNG changes and preserves manual control on reload", () => {
    const l = adult(),
      before = structuredClone(l),
      n = openActivity(l, "career");
    expect(l).toEqual(before);
    expect(n.pending).toBe("expanded.career");
    expect(n.age).toBe(l.age);
    expect(n.rng).toBe(l.rng);
    expect(n.coins).toBe(l.coins);
    expect(canAutoChoose(n)).toBe(false);
    expect(isLife(n)).toBe(true);
    const restored = loadGame({
      getItem: () => JSON.stringify({ version: 1, active: n, archive: [] }),
      setItem: () => {
        throw Error("no write");
      },
    }).data.active!;
    expect(canAutoChoose(restored)).toBe(false);
    const done = choose(restored, "expanded.career.later");
    expect(done.pending).toBeNull();
    expect(isLife(done)).toBe(true);
  });
  it("allows an eligible non-farmer appointment, charges once, and explains blocked jobs in both languages", () => {
    const l = adult();
    for (let seed = 0; seed < 1000; seed++) {
      l.expansion.worldSeed = seed;
      if (
        appointmentAvailable(l, "merchant") &&
        !appointmentAvailable(l, "guard")
      )
        break;
    }
    const n = openActivity(l, "career"),
      d = getDecision(n)!;
    expect(
      d.choices.find((c) => c.id === "expanded.career.job-merchant")?.disabled,
    ).toBe(false);
    expect(
      expandedDecisionText(d, "en").choices.find(
        (c) => c.id === "expanded.career.job-guard",
      )?.description,
    ).toContain("No vacancy this year");
    expect(
      expandedDecisionText(d, "th").choices.find(
        (c) => c.id === "expanded.career.job-guard",
      )?.description,
    ).toContain("ไม่มีตำแหน่งว่าง");
    const hired = choose(n, "expanded.career.job-merchant");
    if (hired.ruleset !== "expanded-1") throw Error("expanded");
    expect(hired.expansion.career.role).toBe("merchant");
    expect(hired.coins).toBe(170);
    expect(isLife(hired)).toBe(true);
  });
  it("does not overwrite pending decisions or let children/legacy/ended lives open activities", () => {
    const l = adult();
    l.pending = "expanded.memory";
    expect(openActivity(l, "career")).toBe(l);
    l.pending = null;
    l.age = 14;
    expect(openActivity(l, "career")).toBe(l);
    l.phase = "ended";
    expect(openActivity(l, "career")).toBe(l);
    const old = createLife({ ruleset: "legacy-1", seed: 1 });
    expect(openActivity(old, "career")).toBe(old);
  });
  it("opens and declines a legendary challenge voluntarily without fighting", () => {
    const l = adult(),
      n = openActivity(l, "challenge");
    expect(n.pending).toBe("expanded.challenge");
    expect(canAutoChoose(n)).toBe(false);
    const next = choose(n, "expanded.challenge.later");
    expect(next.pending).toBeNull();
    expect(next.stats.health).toBe(l.stats.health);
    expect(next.rng).toBe(l.rng);
  });
  it("offers other careers directly at the first livelihood decision", () => {
    const l = adult();
    l.pending = "expanded.work";
    const next = choose(l, "expanded.work.career");
    expect(next.pending).toBe("expanded.career");
    expect(canAutoChoose(next)).toBe(false);
  });
});

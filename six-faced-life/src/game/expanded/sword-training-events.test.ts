import { describe, it, expect } from "vitest";
import { createExpandedLife } from "./origins";
import { allocateSwordStyle } from "./sword-state";
import { quoteSwordMentor, enrollSwordMentor } from "./sword-mentors";
import { queueReadySwordTrial } from "./sword-events";
import { advanceExpanded, chooseExpanded } from "./engine";
import { getExpandedDecision } from "./events";
import { canAutoChoose } from "../simulation";
import { loadGame } from "../storage";
const training = () => {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 30;
  l.pending = null;
  l.region = "asura";
  l.focus = "sword";
  l.coins = 1000;
  l.stats.health = 100;
  l.expansion.genetics.auraImpaired = false;
  allocateSwordStyle(l, "sword-god");
  l.expansion.swords!.tracks["sword-god"].xp = 1800;
  enrollSwordMentor(l, quoteSwordMentor(l)!);
  return l;
};
describe("sword time and manual events", () => {
  it("discloses actual Thai mentor requirements and routes new generic instruction without payment", () => {
    const l = training();
    l.expansion.swords!.mentorship = null;
    l.region = "millis";
    l.pending = "expanded.sword-mentor";
    const d = getExpandedDecision(l)!;
    expect(d.localized!.text).toContain("260");
    expect(d.localized!.text).toContain("ต้องอยู่");
    l.pending = "expanded.instruction";
    expect(
      getExpandedDecision(l)!.choices.find((c) => c.id.endsWith(".sword"))!
        .label,
    ).toBe("Review sword mentorship");
  });
  it("credits_elapsed_time_not_birthdays", () => {
    for (const [mode, progress, delta, want] of [
      ["tick", 0.9, 0.1, 0.1],
      ["tick", 0.9, 0.25, 0.1],
      ["year", 0.75, 1, 0.25],
    ] as const) {
      const l = training();
      l.progress = progress;
      expect(
        advanceExpanded(l, mode, delta).expansion.swords!.mentorship!.progress,
      ).toBeCloseTo(want);
    }
  });
  it("trial_survives_full_queue_defer_and_reload", () => {
    const l = training();
    l.expansion.swords!.mentorship!.progress = 1;
    l.expansion.queue = Array(16).fill("expanded.practice");
    queueReadySwordTrial(l);
    expect(l.expansion.queue).toHaveLength(16);
    l.expansion.queue = [];
    queueReadySwordTrial(l);
    queueReadySwordTrial(l);
    expect(l.expansion.queue).toEqual(["expanded.sword-trial"]);
    l.expansion.queue = [];
    l.pending = "expanded.sword-trial";
    expect(canAutoChoose(l)).toBe(false);
    const n = chooseExpanded(l, "expanded.sword-trial.defer");
    expect(n.expansion.swords!.mentorship!.deferred).toBe(true);
    queueReadySwordTrial(n);
    expect(n.expansion.queue).toEqual([]);
    const r = loadGame({
      getItem: () => JSON.stringify({ version: 1, active: n, archive: [] }),
      setItem: () => {},
    });
    expect(r.error).toBeNull();
  });
  it("makes initial selection manual without unlocking switching in other events", () => {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = 5;
    l.pending = "expanded.practice";
    expect(getExpandedDecision(l)?.choices.map((c) => c.id)).toContain(
      "expanded.practice.water-god",
    );
    expect(canAutoChoose(l)).toBe(false);
    const n = chooseExpanded(l, "expanded.practice.water-god");
    expect(n.expansion.swords!.selected).toBe("water-god");
    expect(n.expansion.swords!.tracks["water-god"].xp).toBeGreaterThanOrEqual(
      12,
    );
  });
});

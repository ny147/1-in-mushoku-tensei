import { describe, it, expect } from "vitest";
import { createExpandedLife } from "./origins";
import { allocateSwordStyle, SWORD_STYLES } from "./sword-state";
import { swordApproach, applySwordApproach } from "./sword-events";
import { getExpandedDecision } from "./events";
describe("selected sword approaches", () => {
  it.each(SWORD_STYLES)(
    "uses authored %s stakes and one risky draw",
    (style) => {
      for (const event of ["service", "assignment"] as const) {
        const l = createExpandedLife({ seed: 1 });
        l.phase = "alive";
        l.age = 30;
        l.region = "asura";
        l.pending = "expanded.assignment";
        l.expansion.politics.faction = "orsted";
        l.expansion.serviceContext = {
          year: l.expansion.birthYear + l.age,
          code: "authored-conflict",
          region: l.region,
          locality: l.expansion.origin.locality,
        };
        l.expansion.history.push({
          ...l.expansion.serviceContext,
          exposure: "civilian",
        });
        allocateSwordStyle(l, style);
        l.expansion.swords!.tracks[style].xp = 110;
        const a = swordApproach(l, event)!;
        expect(a.risk).toBe(
          style === "north-god"
            ? 0
            : style === "water-god"
              ? event === "service"
                ? 0.05
                : 0.025
              : event === "service"
                ? 0.1
                : 0.05,
        );
        expect(a.reward).toBe(
          style === "north-god"
            ? event === "service"
              ? 10
              : 6
            : style === "sword-god"
              ? event === "service"
                ? 40
                : 30
              : event === "service"
                ? 30
                : 20,
        );
        l.rng = 0;
        const before = l.rng,
          coins = l.coins;
        l.expansion.politics.obligations = 10;
        expect(applySwordApproach(l, event, style)).toBeNull();
        expect(l.coins).toBe(coins + a.reward);
        expect(l.expansion.standing.service).toBe(
          style === "north-god" ? 0 : 1,
        );
        expect(l.expansion.politics.obligations).toBe(
          event === "assignment" ? (style === "north-god" ? 9 : 7) : 10,
        );
        if (style === "north-god") expect(l.rng).toBe(before);
        else expect(l.rng).not.toBe(before);
      }
    },
  );
  it("offers nothing for a novice selected beside an unselected master", () => {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = 30;
    l.pending = "expanded.assignment";
    l.expansion.politics.faction = "orsted";
    allocateSwordStyle(l, "sword-god");
    l.expansion.swords!.tracks["water-god"] = { xp: 1800, cap: 6 };
    expect(swordApproach(l, "assignment")).toBeNull();
    expect(getExpandedDecision(l)!.choices).toHaveLength(2);
  });
});

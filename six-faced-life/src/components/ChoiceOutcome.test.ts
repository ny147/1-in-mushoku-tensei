import { describe, expect, it } from "vitest";
import { beginLife, choose, createLife } from "../game/engine";
import { describeChoice } from "./ChoiceOutcome";

describe("actual choice feedback", () => {
  it("reports capped gains instead of promising the choice's uncapped reward", () => {
    const life = beginLife(createLife({ seed: 32 }));
    life.stats.knowledge = 98;
    const result = describeChoice(life, choose(life, "observe"));
    expect(result.changes).toContain("Knowledge +2");
    expect(result.changes).not.toContain("Knowledge +8");
  });

  it("uses the recorded failed-risk outcome rather than the promised reward", () => {
    const life = beginLife(createLife({ seed: 32 }));
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

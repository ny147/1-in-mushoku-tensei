import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { createSocialState } from "./social-state";
import { saveGame, loadGame } from "../storage";

describe("social birth facts", () => {
  it("uses actual parents and leaves all established random streams untouched", () => {
    const l = createExpandedLife({ seed: 42 });
    const before = structuredClone(l);
    const s = createSocialState(l);
    expect(l).toEqual(before);
    expect(s.household.parentIds).toEqual(["mother", "father"]);
    expect(s.household.home).toBe(l.birthRegion);
    expect(s.activatedYear).toBe(l.expansion.birthYear);
    expect(s).toEqual(l.expansion.social);
    expect(createSocialState(l)).toEqual(s);
  });
  it("keeps ordinary noble access independent from wealth and royal ancestry", () => {
    let checked = false;
    for (let seed = 0; seed < 10_000; seed++) {
      const l = createExpandedLife({ seed });
      if (
        l.expansion.origin.wealth !== "poor" ||
        l.expansion.origin.status !== "noble"
      )
        continue;
      checked = true;
      expect(l.expansion.origin.patron).toBe(true);
      expect(l.expansion.education.stage).toBe("basic");
      expect(l.expansion.politics.contact).toBe(true);
      expect(l.expansion.standing.title).toBeNull();
      expect(l.expansion.social!.association).not.toBeNull();
      expect(l.expansion.career.role).toBe("child");
    }
    expect(checked).toBe(true);
  });
  it.each(["en", "th"] as const)(
    "round trips new %s lives without rerolling identity or debt",
    (language) => {
      const l = createExpandedLife({ seed: 42, language });
      let raw: string | null = null;
      const storage = {
        getItem: () => raw,
        setItem: (_key: string, value: string) => {
          raw = value;
        },
      };
      expect(saveGame(storage, { version: 1, active: l, archive: [] })).toBe(
        true,
      );
      expect(loadGame(storage).data.active).toEqual(l);
    },
  );
});

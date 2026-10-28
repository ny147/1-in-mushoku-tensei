import { describe, expect, it } from "vitest";
import { generateGenetics } from "./genetics";
import { createExpandedLife } from "./origins";
import { draw, weighted } from "./random";
import { beginLife, finishLife } from "../engine";
import { isLife, loadGame } from "../storage";

describe("persistent birth talents", () => {
  it("gives 20% each magic, academic and sword talents, and 40% none, without overlap", () => {
    const counts = { magic: 0, academic: 0, sword: 0, none: 0 };
    for (let seed = 0; seed < 10_000; seed++) {
      const life = createExpandedLife({ seed });
      const g = life.expansion.genetics;
      const talents = [g.magicTalent, g.academicTalent, g.swordTalent].filter(
        Boolean,
      );
      expect(talents.length, `seed ${seed}`).toBeLessThanOrEqual(1);
      if (g.magicTalent) counts.magic++;
      else if (g.academicTalent) counts.academic++;
      else if (g.swordTalent) counts.sword++;
      else counts.none++;
      expect(isLife(life)).toBe(true);
    }
    for (const type of ["magic", "academic", "sword"] as const) {
      expect(counts[type]).toBeGreaterThan(1800);
      expect(counts[type]).toBeLessThan(2200);
    }
    expect(counts.none).toBeGreaterThan(3800);
    expect(counts.none).toBeLessThan(4200);
  });

  it("retains inherited-factor outcomes and random-stream consumption at birth", () => {
    for (let seed = 0; seed < 1000; seed++) {
      const stream = { rng: seed },
        reference = { rng: seed };
      const carrier = draw(reference) < 0.001;
      const manifestation = carrier
        ? weighted(reference, [
            ["mana", 60],
            ["appearance", 25],
            ["physical", 15],
          ] as const)
        : "none";
      const auraImpaired = manifestation === "mana" && draw(reference) < 0.5;
      draw(reference);
      draw(reference);
      const g = generateGenetics(stream);
      expect(g).toMatchObject({ carrier, manifestation, auraImpaired });
      expect(stream.rng).toBe(reference.rng);
      expect(generateGenetics({ rng: seed })).toEqual(g);
    }
  });

  it("migrates missing sword flags without rerolling old dual talents, RNG, pending choices or archives", () => {
    const old = beginLife(createExpandedLife({ seed: 1 }));
    if (old.ruleset !== "expanded-1") throw Error("expanded");
    old.expansion.genetics.magicTalent = true;
    old.expansion.genetics.academicTalent = true;
    delete old.expansion.genetics.swordTalent;
    for (const p of old.expansion.family.people) delete p.genetics.swordTalent;
    const ended = structuredClone(old);
    finishLife(ended, "illness");
    const raw = JSON.stringify({ version: 1, active: old, archive: [ended] });
    const restored = loadGame({ getItem: () => raw, setItem: () => {} });
    expect(restored.error).toBeNull();
    const active = restored.data.active;
    if (active?.ruleset !== "expanded-1") throw Error("expanded");
    expect(active).toEqual({
      ...old,
      expansion: {
        ...old.expansion,
        genetics: { ...old.expansion.genetics, swordTalent: false },
        family: {
          ...old.expansion.family,
          people: old.expansion.family.people.map((p) => ({
            ...p,
            genetics: { ...p.genetics, swordTalent: false },
          })),
        },
      },
    });
    expect(restored.data.archive[0]).toEqual(ended);
    expect(
      loadGame({
        getItem: () => JSON.stringify(restored.data),
        setItem: () => {},
      }).data,
    ).toEqual(restored.data);
  });

  it("rejects malformed sword flags on protagonists and relatives while accepting old missing flags", () => {
    for (const value of ["true", 1, null, []]) {
      const l = createExpandedLife({ seed: 1 });
      Object.assign(l.expansion.genetics, { swordTalent: value });
      expect(isLife(l)).toBe(false);
      const relative = createExpandedLife({ seed: 1 });
      Object.assign(relative.expansion.family.people[0].genetics, {
        swordTalent: value,
      });
      expect(isLife(relative)).toBe(false);
    }
  });
});

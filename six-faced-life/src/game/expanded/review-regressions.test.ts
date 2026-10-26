import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { advance, choose, getDecision } from "../engine";
import { isLife, loadGame } from "../storage";
import { applyHistoryYear } from "./history";
import { introducePartner, marry } from "./family";
import { draw } from "./random";
import { finishLife } from "../engine";
export function adult() {
  const l = createExpandedLife({ seed: 2 });
  const shift = 400 - l.expansion.birthYear;
  for (const p of l.expansion.family.people) p.born += shift;
  l.expansion.birthYear = 400;
  l.age = 31;
  l.expansion.processedYear = 430;
  l.phase = "alive";
  l.pending = null;
  l.coins = 500;
  l.expansion.economy.peak = 500;
  l.stats.health = 99;
  return l;
}
describe("independent review regressions", () => {
  it("revalidates a queued service assignment after travel and reload", () => {
    const l = adult();
    l.age = 24;
    l.region = "asura";
    l.expansion.origin.locality = "capital";
    l.expansion.processedYear = 423;
    applyHistoryYear(l);
    l.pending = "expanded.succession";
    const n = choose(l, "expanded.succession.service");
    if (n.ruleset !== "expanded-1") throw Error("expanded");
    expect(n.pending).toBe("expanded.service");
    expect(isLife(n)).toBe(true);
    n.region = "ranoa";
    expect(getDecision(n)).toBeNull();
    expect(isLife(n)).toBe(false);
  });
  it("rejects malformed history locations and inconsistent widowhood records", () => {
    const l = adult();
    l.expansion.history = [
      {
        year: 431,
        code: "authored-conflict",
        exposure: "civilian",
        region: "asura",
        locality: "capital",
      },
    ];
    expect(isLife(l)).toBe(true);
    (l.expansion.history[0] as unknown as { region: unknown }).region = {};
    expect(isLife(l)).toBe(false);
    l.expansion.history = [];
    const p = introducePartner(l)!;
    p.strength = 100;
    marry(l, p.id);
    expect(isLife(l)).toBe(true);
    p.died = 431;
    expect(isLife(l)).toBe(false);
  });
  it("keeps remote historical news out of military service and attributes aid to its actual event", () => {
    const l = adult();
    l.age = 24;
    l.expansion.processedYear = 423;
    l.region = "ranoa";
    l.expansion.origin.locality = "settlement";
    applyHistoryYear(l);
    l.expansion.history.push({
      year: 424,
      code: "authored-conflict",
      exposure: "civilian",
    });
    l.pending = "expanded.succession";
    expect(getDecision(l)?.choices.some((c) => c.id.endsWith(".service"))).toBe(
      false,
    );
    const n = choose(l, "expanded.succession.aid");
    if (n.ruleset !== "expanded-1") throw Error("expanded");
    expect(
      n.expansion.history.find((h) => h.code === "asura-succession")?.exposure,
    ).toBe("support");
    expect(
      n.expansion.history.find((h) => h.code === "authored-conflict")?.exposure,
    ).toBe("civilian");
  });
  it("closes a marriage when the spouse dies in the Calamity", () => {
    const l = adult();
    for (const p of l.expansion.family.people) p.born -= 3;
    l.expansion.birthYear = 397;
    l.age = 20;
    l.expansion.processedYear = 416;
    l.region = "asura";
    l.expansion.origin.locality = "fittoa";
    const spouse = introducePartner(l)!;
    spouse.strength = 100;
    marry(l, spouse.id);
    for (let seed = 0; seed < 1000; seed++) {
      if (draw({ rng: seed }) < 0.1) {
        l.expansion.familyRng = seed;
        break;
      }
    }
    applyHistoryYear(l);
    expect(spouse.died).toBe(417);
    expect(l.expansion.family.marriages[0]).toMatchObject({
      end: 417,
      reason: "widowhood",
    });
    expect(spouse.partner).toBeNull();
  });
  it("retains named social ties and explicit dismissal reasons in both completed snapshots", () => {
    const l = adult();
    l.expansion.family.friends = [
      { id: "friend-1", name: "Nara Friend", role: "friend", strength: 70 },
      { id: "rival-1", name: "Alden Rival", role: "rival", strength: 40 },
      { id: "enemy-1", name: "Corin Enemy", role: "enemy", strength: 20 },
    ];
    l.expansion.career.timeline = [
      { year: 430, role: "farmer", level: 1, reason: "dismissal" },
    ];
    finishLife(l, "illness");
    const s = l.expansion.summary!;
    expect(s.sections.find((s) => s.key === "family")?.en).toContain(
      "Nara Friend",
    );
    expect(s.sections.find((s) => s.key === "family")?.th).toContain(
      "Alden Rival",
    );
    expect(s.sections.find((s) => s.key === "work")?.en).toContain("Dismissal");
    expect(s.sections.find((s) => s.key === "work")?.th).toContain("ออกจากงาน");
  });
  it("keeps a yielded title loadable at the history limit", () => {
    const l = adult();
    l.expansion.standing.title = 5;
    l.expansion.standing.titles = Array.from({ length: 64 }, () => ({
      year: 431,
      position: 5 as const,
      won: true,
    }));
    l.pending = "expanded.defense";
    expect(isLife(l)).toBe(true);
    const n = choose(l, "expanded.defense.yield");
    if (n.ruleset !== "expanded-1") throw Error("expanded");
    expect(n.expansion.standing.titles).toHaveLength(64);
    expect(n.expansion.standing.titles.at(-1)?.won).toBe(false);
    expect(isLife(n)).toBe(true);
  });
  it("recovers impossible pending decisions without touching saved data", () => {
    for (const id of ["marriage", "school-year"]) {
      const l = adult();
      expect(isLife(l)).toBe(true);
      l.pending = `expanded.${id}`;
      expect(getDecision(l)).toBeNull();
      const raw = JSON.stringify({ version: 1, active: l, archive: [] });
      const loaded = loadGame({
        getItem: () => raw,
        setItem: () => {
          throw Error("untouched");
        },
      });
      expect(loaded.error).toBeTruthy();
    }
  });
  it("supports actual magic-focus university progress and capped academic study", () => {
    for (const focus of ["magic", "study"] as const) {
      let l = adult();
      l.focus = focus;
      l.stats.knowledge = 100;
      l.expansion.education = {
        ...l.expansion.education,
        stage: "university",
        scholarship: true,
        successfulYears: 0,
        previousKnowledge: 100,
        previousXp: 0,
      };
      for (let i = 0; i < 4; i++) {
        const n = advance(l, "year");
        if (n.ruleset !== "expanded-1") throw Error("expanded");
        l = n;
        while (l.pending) {
          const d = getDecision(l)!;
          const c =
            d.choices.find((c) => c.id.endsWith(".later") && !c.disabled) ??
            d.choices.find(
              (c) => !c.disabled && !c.risk && (c.cost ?? 0) === 0,
            )!;
          const next = choose(l, c.id);
          if (next.ruleset !== "expanded-1") throw Error("expanded");
          l = next;
        }
      }
      expect(l.expansion.education.stage, focus).toBe("graduated");
      expect(l.expansion.education.successfulYears).toBe(4);
    }
  });
});

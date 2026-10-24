import { describe, expect, it } from "vitest";
import {
  advance,
  beginLife,
  choose,
  createLife,
  getDecision,
  setFocus,
} from "./engine";
import {
  canPromote,
  careerIncome,
  careerTitle,
  getProgression,
  setSpecialization,
  syncSpells,
  MAGIC_SCHOOLS,
  SCHOOL_IDS,
} from "./progression";
import { EVENTS, EVENT_MAP } from "./events";
import type { Life } from "./types";

function adult(career: Life["career"] = "merchant") {
  const life = choose(beginLife(createLife({ seed: 73 })), "observe");
  life.age = 26;
  life.career = career;
  life.coins = 300;
  life.stats.knowledge = 80;
  life.progression = undefined;
  return life;
}

describe("magic studies", () => {
  it("trains the selected discipline without giving free experience for switching", () => {
    let water = setSpecialization(adult(), "water");
    water = setFocus(water, "magic");
    const fire = setSpecialization(water, "fire");
    expect(fire.training.magicXp).toBe(water.training.magicXp);
    expect(getProgression(fire).magic.fire.xp).toBe(0);
    const a = advance(water, "year");
    const b = advance(fire, "year");
    expect(getProgression(a).magic.water.xp).toBeGreaterThan(
      getProgression(a).magic.fire.xp,
    );
    expect(getProgression(b).magic.fire.xp).toBeGreaterThan(
      getProgression(b).magic.water.xp,
    );
    expect(b.training.magicXp).toBeGreaterThan(fire.training.magicXp);
  });

  it("requires both experience and instruction for higher-rank spells", () => {
    const life = setSpecialization(adult(), "water");
    life.progression!.magic.water.xp = 500;
    life.training.magicCap = 1;
    syncSpells(life);
    const advanced = MAGIC_SCHOOLS.water.spells.find((s) => s.rank === 2)!;
    expect(life.progression!.magic.water.spells).not.toContain(advanced.id);
    life.training.magicCap = 2;
    syncSpells(life);
    expect(life.progression!.magic.water.spells).toContain(advanced.id);
  });

  it("rejects unavailable or invalid study changes without mutating the life", () => {
    const baby = choose(beginLife(createLife({ seed: 5 })), "observe");
    expect(setSpecialization(baby, "fire")).toEqual(baby);
    const life = adult();
    expect(setSpecialization(life, "toString" as "fire")).toEqual(life);
  });
});

describe("careers with a future", () => {
  it("earns career experience from work and requires accepting a promotion", () => {
    const life = setFocus(setSpecialization(adult(), "water"), "work");
    const next = advance(life, "year");
    expect(getProgression(next).career.experience).toBeGreaterThan(
      getProgression(life).career.experience,
    );
    expect(getProgression(next).career.level).toBe(0);
    next.progression!.career.experience = 100;
    next.progression!.career.reputation = 70;
    next.pending = "career-promotion";
    expect(canPromote(next)).toBe(true);
    const promoted = choose(next, "accept-promotion");
    expect(getProgression(promoted).career.level).toBe(1);
    expect(careerIncome(promoted)).toBeGreaterThan(careerIncome(next));
    expect(careerTitle(promoted)).not.toBe(careerTitle(next));
    const staying = choose(next, "keep-role");
    expect(advance(promoted, "year").coins - promoted.coins).toBeGreaterThan(
      advance(staying, "year").coins - staying.coins,
    );
  });

  it("does not let an unqualified character take a promotion", () => {
    const life = setSpecialization(adult(), "water");
    life.pending = "career-promotion";
    expect(canPromote(life)).toBe(false);
    expect(
      getDecision(life)!.choices.find((c) => c.id === "accept-promotion")
        ?.disabled,
    ).toBe(true);
    expect(choose(life, "accept-promotion")).toEqual(life);
  });

  it("resets a changed vocation without losing magic and keeps retirement income fixed", () => {
    let life = setSpecialization(adult(), "water");
    life.progression!.career.level = 3;
    life.progression!.career.experience = 200;
    life.progression!.magic.water.xp = 60;
    life.pending = "midlife";
    life = choose(life, "teach");
    expect(getProgression(life).career.role).toBe("teacher");
    expect(getProgression(life).career.level).toBe(0);
    expect(getProgression(life).magic.water.xp).toBe(60);
    life.pending = "retirement";
    const retired = choose(life, "retire");
    expect(careerIncome(retired)).toBe(9);
  });
});

describe("expanded stories", () => {
  it("provides at least fifty uniquely named events", () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(50);
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(EVENTS.length);
  });

  it("keeps an affordable, enabled fallback in each decision", () => {
    for (const career of [
      "adventurer",
      "merchant",
      "healer",
      "guard",
      "teacher",
    ] as const) {
      const life = setSpecialization(adult(career), "water");
      life.coins = 0;
      for (const event of EVENTS) {
        expect(
          event.choices(life).some((c) => !c.disabled && !c.cost),
          `${event.id}: ${career}`,
        ).toBe(true);
      }
    }
  });

  it("requires earlier research choices to unlock their follow-up", () => {
    const life = setSpecialization(adult("student"), "water");
    life.flags.academy = true;
    expect(EVENT_MAP.get("research-fieldwork")!.condition!(life)).toBe(false);
    life.flags.researchQuestion = true;
    expect(EVENT_MAP.get("research-fieldwork")!.condition!(life)).toBe(true);
  });
  it("carries a research decision through fieldwork to a lasting publication", () => {
    let life = setSpecialization(adult("student"), "wind");
    life.flags.academy = true;
    life.pending = "research-question";
    life = choose(life, "collaborate");
    expect(EVENT_MAP.get("research-fieldwork")!.condition!(life)).toBe(true);
    life.pending = "research-fieldwork";
    life = choose(life, "equipment");
    expect(EVENT_MAP.get("research-paper")!.condition!(life)).toBe(true);
    life.pending = "research-paper";
    life = choose(life, "open");
    expect(life.flags.publishedResearch).toBe(true);
    expect(life.flags.sharedMethod).toBe(true);
    expect(getProgression(life).magic.wind.xp).toBeGreaterThan(0);
  });

  it("finishes all school/vocation combinations with earned spells and actual promotions", () => {
    for (const role of [
      "merchant",
      "adventurer",
      "guard",
      "healer",
      "teacher",
    ] as const) {
      for (const school of SCHOOL_IDS) {
        let life = setFocus(setSpecialization(adult(role), school), "magic");
        let promoted = false;
        let learned = false;
        for (let step = 0; step < 1000 && life.phase === "alive"; step++) {
          const p = getProgression(life);
          promoted ||= p.career.level > 0;
          learned ||= p.magic[school].spells.length > 0;
          const decision = getDecision(life);
          if (!decision) life = advance(life, "decision");
          else {
            const preferred =
              decision.id === "midlife"
                ? "continue"
                : decision.id === "career-crossroads"
                  ? "recommit"
                  : "accept-promotion";
            const available = decision.choices.filter(
              (c) => !c.disabled && (c.cost ?? 0) <= life.coins && !c.risk,
            );
            const selected =
              available.find((c) => c.id === preferred) ?? available[0];
            expect(selected, decision.id).toBeDefined();
            life = choose(life, selected.id);
          }
          expect(life.coins).toBeGreaterThanOrEqual(0);
          expect(getProgression(life).career.level).toBeLessThanOrEqual(3);
        }
        expect(life.phase, `${role}/${school}`).toBe("ended");
        expect(promoted, `${role}/${school} promotion`).toBe(true);
        expect(learned, `${role}/${school} spells`).toBe(true);
      }
    }
  });
});

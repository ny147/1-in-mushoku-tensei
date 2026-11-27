import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { activateCareerPaths } from "./career-migration";
import { OCCUPATIONS, PAY } from "./balance";
import type { Occupation } from "./types";
import type { Career } from "../types";
import { pathIncome } from "./career-paths";

describe("lossless career recognition", () => {
  it("preserves the work record and inherited pay for every occupation and level", () => {
    const mirror: Partial<Record<Occupation, Career>> = {
      laborer: "guard",
      farmer: "merchant",
      swordsman: "guard",
      mage: "healer",
      cleric: "healer",
      knight: "guard",
      professor: "teacher",
    };
    for (const role of OCCUPATIONS) {
      for (const [level, language] of (["en", "th", "en", "th"] as const).entries()) {
        const label = `${role}, level ${level}, ${language}`;
        const life = createExpandedLife({ seed: 1, language });
        delete life.expansion.careerPaths;
        life.phase = "alive";
        life.age = 30;
        life.pending = null;
        life.expansion.queue = [];
        life.expansion.career.role = role;
        life.career = mirror[role] ?? (role as Career);
        life.expansion.career.records[role] = { level, xp: 45, years: 3, reputation: 10 };

        const before = structuredClone(life);
        const migrated = activateCareerPaths(life);
        const { careerPaths, ...expansion } = migrated.expansion;
        expect(life, label).toEqual(before);
        expect({ ...migrated, expansion }, label).toEqual(before);
        expect(careerPaths?.requests, label).toBe(0);
        expect(activateCareerPaths(migrated), label).toBe(migrated);
        if (PAY[role]) {
          expect(pathIncome(migrated), label).toBeGreaterThanOrEqual(
            PAY[role] + [0, 8, 18, 32][level],
          );
        } else {
          expect(careerPaths?.active, label).toBeNull();
        }
        if (role === "teacher") {
          expect(careerPaths?.active, label).toBe("teacher-unspecified");
        }
        if (role === "adventurer") {
          expect(careerPaths?.active, label).toBe(
            ["adventure-f", "adventure-d", "adventure-b", "adventure-s"][level],
          );
        }
      }
    }
  });
  it("does not fabricate unused roles or past requests", () => {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = 20;
    l.pending = null;
    delete l.expansion.careerPaths;
    const n = activateCareerPaths(l);
    expect(n.expansion.careerPaths?.earned).toEqual({});
    expect(n.expansion.careerPaths?.payFloor).toEqual({});
  });
  it("defers pending/queued offers and never modifies completed lives", () => {
    const l = createExpandedLife({ seed: 1 });
    delete l.expansion.careerPaths;
    l.phase = "alive";
    l.age = 20;
    l.pending = "expanded.career";
    expect(activateCareerPaths(l)).toBe(l);
    l.pending = null;
    l.expansion.queue = ["expanded.training"];
    expect(activateCareerPaths(l)).toBe(l);
    l.expansion.queue = [];
    l.phase = "ended";
    expect(activateCareerPaths(l)).toBe(l);
  });
});

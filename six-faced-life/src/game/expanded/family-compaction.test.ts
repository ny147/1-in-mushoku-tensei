import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import {
  applyFamilyYear,
  descendantCounts,
  introducePartner,
  marry,
  addChild,
} from "./family";
import { compactNamedFamily, profiles } from "./demographics";
import { isLife, loadGame } from "../storage";
import { sampleCount } from "./random";
import type { Cohort } from "./types";
const cohort = (born: number, alive: number, dead = 0, rng = 4321): Cohort => ({
  generation: 2,
  born,
  lifespan: 190,
  race: "migurd",
  carrier: true,
  alive,
  dead,
  rng,
});
describe("actual demographic compaction and bounded work", () => {
  it("preserves births when 255 extinct profiles precede a live cohort", () => {
    const room = createExpandedLife({ seed: 1 });
    room.phase = "alive";
    room.age = 100;
    room.expansion.processedYear = room.expansion.birthYear + 99;
    const y = room.expansion.birthYear + 100;
    room.expansion.family.cohorts = [cohort(y - 20, 1000)];
    room.expansion.family.distantBorn = 1000;
    const full = structuredClone(room);
    full.expansion.family.cohorts = [
      ...Array.from({ length: 255 }, (_, i) =>
        cohort(room.expansion.birthYear + 36, 0, 1, 100 + i),
      ),
      cohort(y - 20, 1000),
    ];
    full.expansion.family.distantBorn = 1255;
    full.expansion.family.distantDead = 255;
    expect(isLife(full)).toBe(true);
    applyFamilyYear(room);
    applyFamilyYear(full);
    expect(full.expansion.family.distantBorn - 1255).toBeGreaterThan(0);
    expect(full.expansion.family.distantBorn - 1255).toBe(
      room.expansion.family.distantBorn - 1000,
    );
    expect(descendantCounts(full)).toEqual(descendantCounts(room));
    expect(full.expansion.family.cohorts.length).toBeLessThanOrEqual(256);
    expect(isLife(full)).toBe(true);
  });
  it("rejects inconsistent cohort ledgers without writes or simulation", () => {
    for (const alive of [1000, Number.MAX_SAFE_INTEGER]) {
      const l = createExpandedLife({ seed: 1 });
      l.phase = "alive";
      l.age = 100;
      l.expansion.family.cohorts = [cohort(l.expansion.birthYear + 36, alive)];
      const raw = JSON.stringify({ version: 1, active: l, archive: [] });
      expect(isLife(l)).toBe(false);
      expect(
        loadGame({
          getItem: () => raw,
          setItem: () => {
            throw Error("no writes");
          },
        }).error,
      ).toBeTruthy();
    }
  });
  it("compacts named distant relatives without losing direct family or inherited counts", () => {
    const l = createExpandedLife({ seed: 0 });
    l.phase = "alive";
    l.age = 22;
    const spouse = introducePartner(l)!;
    spouse.strength = 100;
    marry(l, spouse.id);
    for (let i = 0; i < 12; i++) addChild(l);
    const child = l.expansion.family.people.find((p) => p.role === "child")!;
    l.age = 50;
    l.expansion.processedYear = l.expansion.birthYear + 49;
    for (let i = 0; i < 29; i++)
      l.expansion.family.people.push({
        ...structuredClone(child),
        id: `distant-${i}`,
        role: "descendant",
        generation: 2,
        born: l.expansion.birthYear + 40,
        parents: [child.id],
        partner: null,
      });
    l.expansion.family.distantBorn = 29;
    const protectedIds = l.expansion.family.people
        .filter((p) => p.role !== "descendant")
        .map((p) => p.id),
      before = descendantCounts(l);
    expect(isLife(l)).toBe(true);
    compactNamedFamily(l);
    expect(l.expansion.family.people.length).toBeLessThan(44);
    expect(descendantCounts(l)).toEqual(before);
    expect(
      protectedIds.every((id) =>
        l.expansion.family.people.some((p) => p.id === id),
      ),
    ).toBe(true);
    expect(
      l.expansion.family.cohorts
        .flatMap(profiles)
        .reduce((n, p) => n + p.alive, 0),
    ).toBeGreaterThan(0);
    expect(isLife(l)).toBe(true);
    const copy = structuredClone(l);
    for (let i = 0; i < 10; i++) {
      l.age++;
      copy.age++;
      applyFamilyYear(l);
      applyFamilyYear(copy);
    }
    expect(l).toEqual(copy);
    expect(l.expansion.family.people.some((p) => p.role === "inlaw")).toBe(
      true,
    );
  });
  it("samples large aggregates with bounded random draws", () => {
    let draws = 0,
      value = 123;
    const stream = {
      get rng() {
        return value;
      },
      set rng(v: number) {
        value = v;
        draws++;
      },
    };
    const count = sampleCount(stream, 1_000_000, 0.02);
    expect(count).toBeGreaterThan(19000);
    expect(count).toBeLessThan(21000);
    expect(draws).toBeLessThan(256);
  });
  it("discloses the projection bound for named as well as aggregate births", () => {
    const base = createExpandedLife({ seed: 0 });
    base.phase = "alive";
    base.age = 22;
    const spouse = introducePartner(base)!;
    spouse.strength = 100;
    marry(base, spouse.id);
    addChild(base);
    base.age = 42;
    const f = base.expansion.family,
      child = f.people.find((p) => p.role === "child")!;
    const mate = {
      ...structuredClone(spouse),
      id: "inlaw-limit",
      role: "inlaw" as const,
      partner: child.id,
      born: child.born,
    };
    child.partner = mate.id;
    f.people.push(mate);
    f.cohorts = [cohort(base.expansion.birthYear + 36, 0, 1_000_000)];
    f.distantBorn = 1_000_000;
    f.distantDead = 1_000_000;
    let limited = 0;
    for (let seed = 0; seed < 200; seed++) {
      const l = structuredClone(base);
      l.expansion.familyRng = seed;
      applyFamilyYear(l);
      expect(isLife(l), `seed ${seed}`).toBe(true);
      if (l.expansion.family.projectionLimited) limited++;
    }
    expect(limited).toBeGreaterThan(0);
  });
  it("preserves valid family ledgers through 800 years and repeated restoration", () => {
    let l = createExpandedLife({ seed: 0 });
    l.phase = "alive";
    l.age = 22;
    const p = introducePartner(l)!;
    p.strength = 100;
    marry(l, p.id);
    for (let i = 0; i < 12; i++) addChild(l);
    for (let age = 23; age <= 800; age++) {
      l.age = age;
      l.expansion.processedYear = l.expansion.birthYear + age;
      applyFamilyYear(l);
      expect(isLife(l), `age ${age}`).toBe(true);
      if (age % 25 === 0) l = JSON.parse(JSON.stringify(l));
    }
    expect(l.expansion.family.cohorts.length).toBeLessThanOrEqual(256);
    expect(
      l.expansion.family.people.filter((p) => p.role === "child"),
    ).toHaveLength(12);
  });
  it("retains the binomial mean and variance across aggregate draws", () => {
    const s = { rng: 123 },
      n = 10000,
      p = 0.02,
      draws = 20000;
    let sum = 0,
      square = 0;
    for (let i = 0; i < draws; i++) {
      const k = sampleCount(s, n, p);
      sum += k;
      square += k * k;
    }
    const mean = sum / draws,
      variance = square / draws - mean * mean;
    expect(mean).toBeCloseTo(n * p, 0);
    expect(variance).toBeGreaterThan(n * p * (1 - p) * 0.95);
    expect(variance).toBeLessThan(n * p * (1 - p) * 1.05);
  });
});

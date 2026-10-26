import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { generateGenetics } from "./genetics";
import {
  introducePartner,
  marry,
  addChild,
  applyFamilyYear,
  descendantCounts,
  divorce,
} from "./family";
describe("inherited traits and independent families", () => {
  it("uses inherited probabilities, stable manifestations and no appearance combat bonus", () => {
    const base = createExpandedLife({ seed: 1 }).expansion.genetics;
    const parent = {
      ...base,
      carrier: true,
      manifestation: "appearance" as const,
    };
    for (const [parents, lo, hi] of [
      [[], 50, 150],
      [[parent], 19000, 21000],
      [[parent, parent], 39000, 41000],
    ] as const) {
      const stream = { rng: 123 };
      let carriers = 0;
      let invalid=0;
      for (let i = 0; i < 100000; i++) {
        const g = generateGenetics(stream, parents);
        if (g.carrier) carriers++;
        if((g.manifestation==='appearance'&&g.auraImpaired)||g.discovered)invalid++;
      }
      expect(carriers).toBeGreaterThan(lo);
      expect(carriers).toBeLessThan(hi);
      expect(invalid).toBe(0);
    }
  });
  it("requires adults, respects Millis, supports widowhood/remarriage and counts distinct spouses", () => {
    const l = createExpandedLife({ seed: 1 });
    l.age = 18;
    l.region = "millis";
    const p = introducePartner(l)!;
    expect(marry(l, p.id)).toBe(true);
    const second = introducePartner(l)!;
    expect(marry(l, second.id)).toBe(false);
    l.region = "ranoa";
    p.strength = 100;
    second.strength = 100;
    expect(marry(l, second.id)).toBe(true);
    expect(
      new Set(l.expansion.family.marriages.map((m) => m.person)).size,
    ).toBe(2);
    divorce(l, p.id);
    expect(l.expansion.family.marriages[0].reason).toBe("divorce");
  });
  it('allows an explicit separation through a manual family decision', async()=>{
    const {choose}=await import('../engine');const {canAutoChoose}=await import('../simulation');
    const l=createExpandedLife({seed:1});l.age=22;l.phase='alive';const p=introducePartner(l)!;p.strength=100;marry(l,p.id);l.pending='expanded.family';
    expect(canAutoChoose(l)).toBe(false);const n=choose(l,'expanded.family.separate');if(n.ruleset!=='expanded-1')throw Error('expanded');expect(n.expansion.family.marriages[0].reason).toBe('divorce');
  });
  it("preserves actual birthplace, mixed ancestry and independent family random state", () => {
    const l = createExpandedLife({ seed: 1 });
    l.age = 22;
    l.region = "ranoa";
    const p = introducePartner(l)!;
    p.race = "elf";
    p.ancestry = ["elf"];
    p.strength = 100;
    marry(l, p.id);
    const rng = l.rng;
    expect(addChild(l)).toBe(true);
    const child = l.expansion.family.people.find((p) => p.role === "child")!;
    expect(child.home).toBe("ranoa");
    expect(child.ancestry).toContain("elf");
    expect(l.rng).toBe(rng);
    expect(descendantCounts(l).born).toBe(1);
    const copy = structuredClone(l);
    applyFamilyYear(l);
    applyFamilyYear(copy);
    expect(l).toEqual(copy);
  });
  it("keeps direct children bounded and evolves later generations without double counting", () => {
    const l = createExpandedLife({ seed: 1 });
    l.age = 22;
    l.deathAge = 800;
    const p = introducePartner(l)!;
    p.strength = 100;
    marry(l, p.id);
    for (let i = 0; i < 12; i++) expect(addChild(l)).toBe(true);
    expect(addChild(l)).toBe(false);
    for (l.age = 23; l.age <= 250; l.age++) applyFamilyYear(l);
    const counts = descendantCounts(l);
    expect(counts.born).toBe(12);
    expect(counts.survivingDescendants).toBeGreaterThanOrEqual(
      counts.survivingChildren,
    );
    expect(l.expansion.family.people.length).toBeLessThanOrEqual(64);
    expect(l.expansion.family.cohorts.length).toBeLessThanOrEqual(256);
    expect(l.expansion.family.distantBorn).toBeGreaterThan(0);
  });
  it("preserves cohort living counts and inheritance exactly across restoration", () => {
    const l = createExpandedLife({ seed: 1 });
    l.age = 56;
    l.expansion.family.cohorts = [
      {
        generation: 2,
        born: l.expansion.birthYear + 36,
        lifespan: 190,
        race: "migurd",
        carrier: true,
        alive: 1000,
        dead: 0,
        rng: 4321,
      },
    ];
    l.expansion.family.distantBorn = 1000;
    const copy = structuredClone(l);
    applyFamilyYear(l);
    applyFamilyYear(copy);
    expect(l).toEqual(copy);
    expect(descendantCounts(l).survivingDescendants).toBeGreaterThan(990);
    expect(
      l.expansion.family.cohorts.some((c) => c.generation === 3 && c.carrier),
    ).toBe(true);
  });
});

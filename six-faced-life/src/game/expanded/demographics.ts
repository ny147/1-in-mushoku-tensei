import type { ExpandedLife, RaceId } from "../types";
import type { Cohort, CohortProfile } from "./types";
import { RACES } from "../world";
import { draw } from "./random";
import { fact, worldYear } from "./facts";
export const profiles = (c: Cohort): CohortProfile[] => c.bins ?? [c];
const copy = (p: CohortProfile): CohortProfile => ({
  born: p.born,
  lifespan: p.lifespan,
  race: p.race,
  carrier: p.carrier,
  alive: p.alive,
  dead: p.dead,
  rng: p.rng,
  ...(p.ancestry ? { ancestry: [...p.ancestry] } : {}),
});
export function ensureProfiles(c: Cohort): CohortProfile[] {
  if (!c.bins) c.bins = [copy(c)];
  return c.bins;
}
export function refreshCohort(c: Cohort) {
  if (!c.bins) return;
  c.alive = c.bins.reduce((n, p) => n + p.alive, 0);
  c.dead = c.bins.reduce((n, p) => n + p.dead, 0);
  c.born = c.bins.reduce((n, p) => Math.min(n, p.born), Infinity);
  c.rng = c.bins[0].rng;
}
/** Group profiles by generation/carrier, retaining each demographic row and RNG.
 * At <=60 generations there are <=120 groups, with no birth admission guard. */
export function compactCohorts(l: ExpandedLife) {
  const groups = new Map<string, Cohort>();
  for (const c of l.expansion.family.cohorts) {
    const key = `${c.generation}:${c.carrier}`;
    const group = groups.get(key);
    if (!group) {
      groups.set(key, c);
      continue;
    }
    if (!group.bins) group.bins = [copy(group)];
    group.bins.push(...profiles(c).map(copy));
    refreshCohort(group);
  }
  l.expansion.family.cohorts = [...groups.values()];
  for (const group of l.expansion.family.cohorts) {
    if (!group.bins) continue;
    const extinct = new Map<string, CohortProfile>(),
      bins: CohortProfile[] = [];
    for (const p of group.bins) {
      if (p.alive > 0) {
        bins.push(p);
        continue;
      }
      const key = JSON.stringify([
        p.born,
        p.lifespan,
        p.race,
        p.carrier,
        p.ancestry ?? [p.race],
      ]);
      const previous = extinct.get(key);
      if (previous) previous.dead += p.dead;
      else extinct.set(key, p);
    }
    group.bins = [...bins, ...extinct.values()];
    refreshCohort(group);
  }
}
export function insertProfile(
  l: ExpandedLife,
  generation: number,
  p: CohortProfile,
) {
  const f = l.expansion.family;
  let group = f.cohorts.find(
    (c) => c.generation === generation && c.carrier === p.carrier,
  );
  if (!group) {
    f.cohorts.push({ ...copy(p), generation });
    return;
  }
  if (!group.bins) group.bins = [copy(group)];
  group.bins.push(copy(p));
  refreshCohort(group);
}
export function cohortBirth(
  l: ExpandedLife,
  generation: number,
  race: RaceId,
  carrier: boolean,
  count = 1,
  ancestry: RaceId[] = [race],
): boolean {
  const f = l.expansion.family;
  if (count <= 0) return false;
  const allowed = Math.min(count, 1_000_000 - f.distantBorn);
  if (allowed < count) {
    f.projectionLimited = true;
    fact(l, "family", "descendant-projection-limit", "", count - allowed);
  }
  if (allowed <= 0) return false;
  const stream = {
    get rng() {
      return l.expansion.familyRng;
    },
    set rng(v: number) {
      l.expansion.familyRng = v;
    },
  };
  const year = worldYear(l),
    group = f.cohorts.find(
      (c) => c.generation === generation && c.carrier === carrier,
    );
  const existing =
    group &&
    profiles(group).find(
      (p) =>
        p.born === year &&
        p.race === race &&
        p.lifespan === RACES[race].lifespan &&
        JSON.stringify(p.ancestry ?? [p.race]) === JSON.stringify(ancestry),
    );
  if (existing) {
    existing.alive += allowed;
    refreshCohort(group!);
  } else
    insertProfile(l, generation, {
      born: year,
      lifespan: RACES[race].lifespan,
      race,
      carrier,
      alive: allowed,
      dead: 0,
      rng: Math.floor(draw(stream) * 4294967296),
      ancestry,
    });
  f.distantBorn += allowed;
  return true;
}
export function compactNamedFamily(l: ExpandedLife) {
  const f = l.expansion.family;
  if (f.people.length < 40) return;
  while (f.people.length > 32) {
    const p = f.people.find(
      (p) =>
        p.role === "descendant" &&
        !f.people.some((child) => child.parents.includes(p.id)),
    );
    if (!p) break;
    const stream = {
      get rng() {
        return l.expansion.familyRng;
      },
      set rng(v: number) {
        l.expansion.familyRng = v;
      },
    };
    insertProfile(l, p.generation, {
      born: p.born,
      lifespan: p.lifespan,
      race: p.race,
      carrier: p.genetics.carrier,
      alive: p.died === null ? 1 : 0,
      dead: p.died === null ? 0 : 1,
      rng: Math.floor(draw(stream) * 4294967296),
      ancestry: p.ancestry,
    });
    f.people = f.people.filter((q) => q.id !== p.id);
    for (const mate of f.people) if (mate.partner === p.id) mate.partner = null;
    f.people = f.people.filter(
      (q) =>
        q.role !== "inlaw" ||
        q.partner !== null ||
        f.people.some((child) => child.parents.includes(q.id)),
    );
    fact(l, "family", "compacted-relative", p.name);
  }
  compactCohorts(l);
}

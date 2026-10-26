import {
  cohortBirth,
  compactCohorts,
  compactNamedFamily,
  ensureProfiles,
  refreshCohort,
} from "./demographics";
import type { ExpandedLife, RaceId } from "../types";
import type { Relative, Genetics } from "./types";
import { FIRST_NAMES, RACES } from "../world";
import { draw, clamp, sampleCount } from "./random";
import { generateGenetics } from "./genetics";
import { fact, worldYear } from "./facts";
const familyStream = (l: ExpandedLife) => ({
  get rng() {
    return l.expansion.familyRng;
  },
  set rng(v: number) {
    l.expansion.familyRng = v;
  },
});
function person(
  l: ExpandedLife,
  role: Relative["role"],
  race: RaceId,
  born: number,
  generation: number,
  parents: string[] = [],
  genes?: Genetics,
): Relative {
  const x = l.expansion,
    s = familyStream(l);
  return {
    id: `person-${x.nextId++}`,
    name: `${FIRST_NAMES[Math.floor(draw(s) * FIRST_NAMES.length)]} ${l.surname}`,
    role,
    race,
    ancestry: [race],
    born,
    died: null,
    lifespan: Math.floor(RACES[race].lifespan * (0.9 + draw(s) * 0.2)),
    strength: Math.floor(55 + draw(s) * 25),
    genetics: genes ?? generateGenetics(s),
    partner: null,
    parents,
    children: 0,
    generation,
    home: l.region,
    educated: false,
    occupation: yearAge(born, worldYear(l)) >= 18 ? "worker" : "child",
  };
}
const yearAge = (born: number, year: number) => year - born;
export function introducePartner(l: ExpandedLife): Relative | null {
  if (l.age < 18 || l.expansion.family.people.length >= 64) return null;
  const existing = l.expansion.family.people.find(
    (p) => p.role === "spouse" && p.died === null && p.partner === null,
  );
  if (existing) return existing;
  if (l.expansion.family.people.filter((p) => p.role === "spouse").length >= 6)
    return null;
  const p = person(
    l,
    "spouse",
    l.race,
    worldYear(l) - 18 - Math.floor(draw(familyStream(l)) * 8),
    0,
  );
  l.expansion.family.people.push(p);
  fact(l, "family", "met", p.name);
  return p;
}
export function marriageAllowed(l: ExpandedLife, id: string): boolean {
  const f = l.expansion.family,
    p = f.people.find((p) => p.id === id),
    year = worldYear(l);
  const active = f.marriages.filter((m) => m.end === null);
  return (
    !!p &&
    p.role === "spouse" &&
    p.died === null &&
    year - p.born >= 18 &&
    l.age >= 18 &&
    p.strength >= 65 &&
    !active.some((m) => m.person === id) &&
    (new Set(f.marriages.map((m) => m.person)).size < 6 ||
      f.marriages.some((m) => m.person === id)) &&
    f.marriages.length < 64 &&
    (l.region !== "millis" || active.length === 0) &&
    active.every(
      (m) => (f.people.find((p) => p.id === m.person)?.strength ?? 0) >= 65,
    )
  );
}
export function marry(l: ExpandedLife, id: string): boolean {
  if (!marriageAllowed(l, id)) return false;
  const f = l.expansion.family;
  f.marriages.push({
    person: id,
    start: worldYear(l),
    end: null,
    reason: null,
  });
  f.people.find((p) => p.id === id)!.partner = "self";
  fact(l, "family", "married", f.people.find((p) => p.id === id)!.name);
  return true;
}
export function divorce(l: ExpandedLife, id: string) {
  const m = l.expansion.family.marriages.find(
    (m) => m.person === id && m.end === null,
  );
  if (!m) return;
  m.end = worldYear(l);
  m.reason = "divorce";
  const p = l.expansion.family.people.find((p) => p.id === id);
  if (p) {
    p.partner = null;
    p.strength = clamp(p.strength - 30);
  }
  fact(l, "family", "divorced", p?.name ?? id);
}
export function addChild(l: ExpandedLife): boolean {
  const f = l.expansion.family,
    y = worldYear(l),
    spouse = f.marriages
      .map((m) =>
        m.end === null ? f.people.find((p) => p.id === m.person) : undefined,
      )
      .find(
        (p) => p && p.died === null && y - p.born >= 18 && p.strength >= 65,
      );
  if (l.age < 18 || !spouse || f.directBorn >= 12 || f.people.length >= 64)
    return false;
  const s = familyStream(l),
    race = draw(s) < 0.5 ? l.race : spouse.race;
  const child = person(
    l,
    "child",
    race,
    y,
    1,
    ["self", spouse.id],
    generateGenetics(s, [l.expansion.genetics, spouse.genetics]),
  );
  child.ancestry = [
    ...new Set([...l.expansion.origin.ancestry, ...spouse.ancestry]),
  ];
  child.lifespan = Math.min(
    800,
    Math.max(
      1,
      Math.floor(
        ((RACES[l.race].lifespan + RACES[spouse.race].lifespan) / 2) *
          (0.9 + draw(s) * 0.2),
      ),
    ),
  );
  f.people.push(child);
  f.directBorn++;
  spouse.children++;
  fact(l, "family", "child-born", child.name);
  return true;
}
export function applyFamilyYear(l: ExpandedLife) {
  compactCohorts(l);
  compactNamedFamily(l);
  const f = l.expansion.family,
    y = worldYear(l),
    s = familyStream(l);
  for (const p of [...f.people]) {
    if (p.died !== null) continue;
    const age = y - p.born;
    p.strength = clamp(p.strength + (l.focus === "bonds" ? 2 : -0.1));
    if (age >= p.lifespan || draw(s) < 0.002) {
      recordFamilyDeath(l, p.id, y);
      continue;
    }
    if (age >= 8 && age < 18) {
      p.educated = l.expansion.economy.unmetCare === 0;
      p.occupation = p.educated ? "student" : "child";
    }
    if (age >= 18) p.occupation = "worker";
    if (!["child", "descendant"].includes(p.role) || age < 18 || age > 45)
      continue;
    let mate = f.people.find((q) => q.id === p.partner && q.died === null);
    if (!mate && draw(s) < 0.03 && f.people.length < 44) {
      mate = person(l, "inlaw", p.race, y - 20, p.generation);
      mate.partner = p.id;
      p.partner = mate.id;
      f.people.push(mate);
      fact(l, "family", "descendant-married", p.name);
    }
    if (
      mate &&
      y - mate.born >= 18 &&
      y - mate.born <= 45 &&
      p.children < 4 &&
      draw(s) < 0.04
    ) {
      const race = draw(s) < 0.5 ? p.race : mate.race,
        genes = generateGenetics(s, [p.genetics, mate.genetics]);
      if (f.people.length < 44) {
        const child = person(
          l,
          "descendant",
          race,
          y,
          p.generation + 1,
          [p.id, mate.id],
          genes,
        );
        child.ancestry = [...new Set([...p.ancestry, ...mate.ancestry])];
        f.people.push(child);
        f.distantBorn++;
        p.children++;
        mate.children++;
      } else if (
        cohortBirth(l, p.generation + 1, race, genes.carrier, 1, [
          ...new Set([...p.ancestry, ...mate.ancestry]),
        ])
      ) {
        p.children++;
        mate.children++;
      }
    }
  }
  const snapshot = f.cohorts.flatMap((c) =>
    ensureProfiles(c).map((p) => ({ generation: c.generation, p })),
  );
  for (const { generation, p } of snapshot) {
    const stream = { rng: p.rng },
      age = y - p.born;
    const deaths =
      age >= p.lifespan ? p.alive : sampleCount(stream, p.alive, 0.002);
    p.alive -= deaths;
    p.dead += deaths;
    f.distantDead += deaths;
    if (age >= 18 && age <= 45) {
      const births = sampleCount(stream, p.alive, 0.02),
        carriers = sampleCount(stream, births, p.carrier ? 0.2 : 0.001);
      if (births > carriers)
        cohortBirth(
          l,
          generation + 1,
          p.race,
          false,
          births - carriers,
          p.ancestry ?? [p.race],
        );
      if (carriers)
        cohortBirth(
          l,
          generation + 1,
          p.race,
          true,
          carriers,
          p.ancestry ?? [p.race],
        );
    }
    p.rng = stream.rng;
  }
  for (const group of f.cohorts) refreshCohort(group);
}
export function descendantCounts(l: ExpandedLife) {
  const f = l.expansion.family;
  const living = f.people.filter((p) => p.died === null);
  const survivingChildren = living.filter((p) => p.role === "child").length;
  return {
    born: f.directBorn,
    survivingChildren,
    survivingDescendants:
      survivingChildren +
      living.filter((p) => p.role === "descendant").length +
      f.cohorts.reduce((n, c) => n + c.alive, 0),
  };
}
export function recordFamilyDeath(
  l: ExpandedLife,
  id: string,
  year = worldYear(l),
  code = "bereavement",
): boolean {
  const f = l.expansion.family,
    p = f.people.find((p) => p.id === id);
  if (!p || p.died !== null) return false;
  p.died = year;
  if (p.role === "descendant") f.distantDead++;
  const mate = f.people.find((q) => q.id === p.partner);
  if (mate?.partner === p.id) mate.partner = null;
  p.partner = null;
  for (const m of f.marriages)
    if (m.person === id && m.end === null) {
      m.end = year;
      m.reason = "widowhood";
    }
  fact(l, "family", code, p.name);
  return true;
}
export function addSocialTie(
  l: ExpandedLife,
  role: "friend" | "rival" | "enemy",
): boolean {
  const f = l.expansion.family;
  if (f.friends.length >= 32) return false;
  const s = familyStream(l),
    name = FIRST_NAMES[Math.floor(draw(s) * FIRST_NAMES.length)];
  f.friends.push({
    id: `contact-${l.expansion.nextId++}`,
    name,
    role,
    strength: role === "friend" ? 60 : 30,
  });
  if (role === "friend") l.expansion.politics.contact = true;
  fact(l, "family", role, name);
  return true;
}

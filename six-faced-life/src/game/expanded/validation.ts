import type { ExpandedState } from "./types";
import { LIMITS, OCCUPATIONS, validEventId } from "./balance";
const obj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const n = (v: unknown, lo = 0, hi = 1_000_000): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
const int = (v: unknown, lo = 0, hi = 1_000_000): v is number =>
  n(v, lo, hi) && Number.isSafeInteger(v);
const str = (v: unknown, max = 100): v is string =>
  typeof v === "string" && v.length <= max;
const bool = (v: unknown): v is boolean => typeof v === "boolean";
const one = (v: unknown, values: readonly unknown[]) => values.includes(v);
const arr = (
  v: unknown,
  max: number,
  test: (i: unknown) => boolean,
): v is unknown[] => Array.isArray(v) && v.length <= max && v.every(test);
const races = ["human", "elf", "dwarf", "migurd", "beastfolk", "superd"];
const regions = ["asura", "ranoa", "millis", "forest", "demon", "begaritt"];
function profile(
  v: unknown,
  birthYear: number,
  year: number,
  generation: number,
) {
  return (
    obj(v) &&
    int(v.born, birthYear + 18 * generation, year) &&
    int(v.lifespan, 1, 1000) &&
    one(v.race, races) &&
    bool(v.carrier) &&
    int(v.alive, 0, 1_000_000) &&
    int(v.dead, 0, 1_000_000) &&
    int(v.rng, 0, 4294967295) &&
    (v.ancestry === undefined ||
      (arr(v.ancestry, 6, (r) => one(r, races)) && v.ancestry.length > 0))
  );
}
function cohort(v: unknown, birthYear: number, year: number): boolean {
  if (
    !obj(v) ||
    !int(v.generation, 2, 60) ||
    !profile(v, birthYear, year, v.generation)
  )
    return false;
  if (v.bins === undefined) return true;
  if (
    !arr(
      v.bins,
      16384,
      (p) =>
        profile(p, birthYear, year, v.generation as number) &&
        obj(p) &&
        p.carrier === v.carrier,
    ) ||
    !v.bins.length
  )
    return false;
  const bins = v.bins as { alive: number; dead: number; born: number }[];
  return (
    bins.reduce((n, p) => n + p.alive, 0) === v.alive &&
    bins.reduce((n, p) => n + p.dead, 0) === v.dead &&
    Math.min(...bins.map((p) => p.born)) === v.born
  );
}
const genetics = (v: unknown) =>
  obj(v) &&
  [
    "carrier",
    "auraImpaired",
    "discovered",
    "signs",
    "magicTalent",
    "academicTalent",
  ].every((k) => bool(v[k])) &&
  one(v.manifestation, ["none", "mana", "appearance", "physical"]) &&
  (v.carrier ? v.manifestation !== "none" : v.manifestation === "none") &&
  (!v.auraImpaired || v.manifestation === "mana") &&
  (!v.discovered || v.carrier === true);
export function validateExpansion(
  v: unknown,
  age: number,
  phase: unknown,
  coins: number,
): v is ExpandedState {
  if (
    !obj(v) ||
    v.version !== 1 ||
    !int(v.birthYear, 397, 427) ||
    !int(age, 0, 1000) ||
    !int(v.worldSeed, 0, 4294967295) ||
    !int(v.familyRng, 0, 4294967295) ||
    !int(v.nextId, 1, 1_000_000) ||
    !int(v.processedYear, v.birthYear - 1, v.birthYear + age) ||
    !int(v.lastRandom, -3, age)
  )
    return false;
  const birthYear = v.birthYear;
  const year = birthYear + age;
  if (
    !obj(v.origin) ||
    !one(v.origin.wealth, ["poor", "modest", "comfortable", "extreme"]) ||
    !one(v.origin.status, ["commoner", "noble"]) ||
    !str(v.origin.locality, 40) ||
    !str(v.origin.birthplace, 40) ||
    !bool(v.origin.patron) ||
    !arr(v.origin.ancestry, 6, (r) => one(r, races)) ||
    !v.origin.ancestry.length
  )
    return false;
  if (
    !obj(v.economy) ||
    ![
      "support",
      "familyFunds",
      "assets",
      "unmetFood",
      "unmetShelter",
      "unmetCare",
      "peak",
      "lastIncome",
      "lastExpenses",
      "deprivedYears",
    ].every((k) => n((v.economy as Record<string, unknown>)[k])) ||
    !["protectionUntil", "aidUntil", "travelUntil"].every((k) =>
      int((v.economy as Record<string, unknown>)[k], 396, 1500),
    ) ||
    !bool(v.economy.unsafeWork) ||
    !n(v.economy.peak, coins)
  )
    return false;
  if (
    !obj(v.education) ||
    !one(v.education.stage, [
      "none",
      "basic",
      "university",
      "graduated",
      "withdrawn",
    ]) ||
    !["assessed", "scholarship", "probation"].every((k) =>
      bool((v.education as Record<string, unknown>)[k]),
    ) ||
    !n(v.education.assessment, 0, 100) ||
    !int(v.education.successfulYears, 0, 4) ||
    !int(v.education.research, 0, 64) ||
    !n(v.education.previousKnowledge, 0, 100) ||
    !n(v.education.previousXp) ||
    !n(v.education.budget, 0, 232)
  )
    return false;
  if (
    !obj(v.career) ||
    !one(v.career.role, OCCUPATIONS) ||
    !obj(v.career.records) ||
    Object.keys(v.career.records).length !== OCCUPATIONS.length ||
    !OCCUPATIONS.every((k) => {
      const r = (v.career as { records: Record<string, unknown> }).records[k];
      return (
        obj(r) &&
        n(r.xp) &&
        int(r.years, 0, 1000) &&
        int(r.level, 0, 3) &&
        n(r.reputation, 0, 100)
      );
    }) ||
    !arr(
      v.career.timeline,
      128,
      (r) =>
        obj(r) &&
        int(r.year, birthYear, year) &&
        one(r.role, OCCUPATIONS) &&
        int(r.level, 0, 3) &&
        str(r.reason, 40),
    )
  )
    return false;
  if (
    !obj(v.standing) ||
    !one(v.standing.status, ["commoner", "noble"]) ||
    !["reputation", "trust"].every((k) =>
      n((v.standing as Record<string, unknown>)[k], 0, 100),
    ) ||
    !int(v.standing.service, 0, 1000) ||
    !arr(v.standing.feats, 64, (k) => str(k, 80)) ||
    !one(v.standing.title, [null, 5, 6, 7]) ||
    !arr(
      v.standing.titles,
      64,
      (t) =>
        obj(t) &&
        int(t.year, 431, year) &&
        one(t.position, [5, 6, 7]) &&
        bool(t.won),
    )
  )
    return false;
  if (
    !obj(v.politics) ||
    !one(v.politics.faction, [null, "orsted", "hitogami"]) ||
    !n(v.politics.trust, 0, 100) ||
    !int(v.politics.obligations, 0, 1000) ||
    !int(v.politics.pursuitUntil, 396, 1500) ||
    !bool(v.politics.contact) ||
    !obj(v.politics.refused) ||
    !Object.entries(v.politics.refused).every(
      ([k, y]) => one(k, ["orsted", "hitogami"]) && int(y, birthYear, year),
    ) ||
    !arr(
      v.politics.records,
      128,
      (r) => obj(r) && int(r.year, birthYear, year) && str(r.code, 100),
    )
  )
    return false;
  if (
    !genetics(v.genetics) ||
    !one(v.study, ["water", "fire", "earth", "wind", "healing"])
  )
    return false;
  if (
    !obj(v.family) ||
    !int(v.family.directBorn, 0, 12) ||
    !int(v.family.distantBorn, 0, 1_000_000) ||
    !int(v.family.distantDead, 0, v.family.distantBorn) ||
    !arr(
      v.family.people,
      LIMITS.people,
      (p) =>
        obj(p) &&
        str(p.id, 80) &&
        str(p.name, 100) &&
        one(p.role, ["parent", "spouse", "child", "descendant", "inlaw"]) &&
        arr(p.parents, 2, (id) => str(id, 80)) &&
        one(p.race, races) &&
        arr(p.ancestry, 6, (r) => one(r, races)) &&
        int(p.born, -500, year) &&
        (p.died === null || int(p.died, p.born, year)) &&
        int(p.lifespan, 1, 1000) &&
        n(p.strength, 0, 100) &&
        genetics(p.genetics) &&
        (p.partner === null || str(p.partner, 80)) &&
        int(p.children, 0, 12) &&
        int(p.generation, -1, 60) &&
        one(p.home, regions) &&
        bool(p.educated) &&
        one(p.occupation, ["child", "worker", "student"]),
    )
  )
    return false;
  const people = v.family.people as Record<string, unknown>[];
  const ids = new Set(people.map((p) => p.id));
  if (ids.size !== people.length || ids.has("self")) return false;
  for (const p of people) {
    if ((p.parents as string[]).some((id) => id !== "self" && !ids.has(id)))
      return false;
    const visiting = new Set<unknown>();
    const walk = (id: unknown): boolean => {
      if (id === "self") return true;
      if (visiting.has(id)) return false;
      visiting.add(id);
      const r = people.find((p) => p.id === id);
      if (!r) return false;
      const good = (r.parents as string[]).every(walk);
      visiting.delete(id);
      return good;
    };
    if (!walk(p.id)) return false;
    for (const parentId of p.parents as string[]) {
      const born =
        parentId === "self"
          ? v.birthYear
          : people.find((p) => p.id === parentId)?.born;
      if (typeof born !== "number" || (p.born as number) - born < 18)
        return false;
    }
    if (p.partner !== null && p.partner !== "self" && !ids.has(p.partner))
      return false;
  }
  if (
    !arr(v.family.marriages, 64, (m) => {
      if (
        !obj(m) ||
        !str(m.person) ||
        !int(m.start, birthYear + 18, year) ||
        (m.end !== null && !int(m.end, m.start, year)) ||
        !one(m.reason, [null, "divorce", "widowhood"])
      )
        return false;
      const p = people.find((p) => p.id === m.person);
      return !!p && (m.start as number) - (p.born as number) >= 18;
    }) ||
    new Set((v.family.marriages as { person: string }[]).map((m) => m.person))
      .size > 6
  )
    return false;
  if (
    !arr(
      v.family.friends,
      32,
      (p) =>
        obj(p) &&
        str(p.id) &&
        str(p.name) &&
        one(p.role, ["friend", "rival", "enemy"]) &&
        n(p.strength, 0, 100),
    ) ||
    !arr(v.family.cohorts, 256, (c) => cohort(c, birthYear, year))
  )
    return false;
  if (
    !arr(
      v.facts,
      512,
      (f) =>
        obj(f) &&
        int(f.id, 1, v.nextId as number) &&
        int(f.year, birthYear, year) &&
        one(f.kind, [
          "origin",
          "need",
          "education",
          "career",
          "history",
          "politics",
          "family",
          "achievement",
          "ending",
          "discovery",
        ]) &&
        str(f.code, 100) &&
        str(f.detail, 150) &&
        n(f.value, -1_000_000, Number.MAX_SAFE_INTEGER),
    ) ||
    !arr(v.queue, 16, validEventId) ||
    new Set(v.queue).size !== v.queue.length ||
    !arr(
      v.history,
      128,
      (h) =>
        obj(h) &&
        int(h.year, birthYear, year) &&
        str(h.code, 100) &&
        one(h.exposure, ["civilian", "participant", "support", "news"]),
    )
  )
    return false;
  if (
    (v.history as Record<string, unknown>[]).some(
      (h) =>
        (h.region !== undefined && !one(h.region, regions)) ||
        (h.locality !== undefined && !str(h.locality, 40)),
    )
  )
    return false;
  if (phase !== "alive" && (v.queue as unknown[]).length) return false;
  if (v.summary === null) return phase !== "ended";
  const s = v.summary;
  return (
    phase === "ended" &&
    obj(s) &&
    s.version === 1 &&
    s.deathYear === year &&
    str(s.cause, 100) &&
    [
      "spouseCount",
      "childrenBorn",
      "survivingChildren",
      "survivingDescendants",
      "finalWealth",
      "peakWealth",
    ].every((k) => int(s[k], 0, Number.MAX_SAFE_INTEGER)) &&
    s.finalWealth === coins &&
    (s.spouseCount as number) <= 6 &&
    (s.childrenBorn as number) <= 12 &&
    (s.survivingChildren as number) <= (s.childrenBorn as number) &&
    (s.survivingDescendants as number) >= (s.survivingChildren as number) &&
    obj(s.narrative) &&
    str(s.narrative.en, 6000) &&
    str(s.narrative.th, 12000) &&
    arr(
      s.sections,
      8,
      (r) => obj(r) && str(r.key, 40) && str(r.en, 5000) && str(r.th, 10000),
    )
  );
}

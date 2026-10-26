import { EVENT_MAP } from "./events";
import { CAREERS, FOCUSES, RACES, REGIONS } from "./world";
import type { Career, Life, SaveData } from "./types";
import { isProgression, migrateLife } from "./progression";
import { validateExpansion } from "./expanded/validation";
import { validEventId } from "./expanded/balance";
import { encodeSave, decodeSave } from "./storage-codec";
import { getExpandedDecision } from "./expanded/events";

export const SAVE_KEY = "six-faced-life.v1";
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
const empty = (): SaveData => ({ version: 1, active: null, archive: [] });
const object = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const number = (v: unknown, min = 0, max = 1_000_000) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const text = (v: unknown, max = 5000): v is string =>
  typeof v === "string" && v.length <= max;
const ownKey = (record: object, value: unknown) =>
  typeof value === "string" && Object.hasOwn(record, value);
function validMessage(value: unknown): boolean {
  if (!object(value) || !text(value.key, 160) || value.key.length === 0)
    return false;
  if (value.params === undefined) return true;
  return (
    object(value.params) &&
    Object.keys(value.params).length <= 20 &&
    Object.entries(value.params).every(
      ([key, param]) =>
        key.length > 0 &&
        key.length <= 160 &&
        (typeof param === "string"
          ? param.length <= 500
          : typeof param === "number" && Number.isFinite(param)),
    )
  );
}

export function isLife(v: unknown): v is Life {
  if (
    object(v) &&
    v.ruleset !== undefined &&
    v.ruleset !== "legacy-1" &&
    v.ruleset !== "expanded-1"
  )
    return false;
  if (
    !object(v) ||
    v.version !== 1 ||
    !text(v.id, 100) ||
    !text(v.name, 32) ||
    !text(v.surname, 100)
  )
    return false;
  const expanded = v.ruleset === "expanded-1";
  const ageMax = expanded ? 1000 : 300;
  if (
    (!expanded && v.race === "superd") ||
    (expanded &&
      !validateExpansion(
        v.expansion,
        v.age as number,
        v.phase,
        v.coins as number,
      ))
  )
    return false;
  if (expanded) {
    if (
      !Number.isInteger(v.rng) ||
      !Number.isInteger(v.seed) ||
      (v.phase === "birth" && v.age !== 0)
    )
      return false;
    const x = v.expansion as import("./expanded/types").ExpandedState;
    const namedDescendants = x.family.people.filter(
      (p) => p.role === "descendant",
    );
    const totalBorn =
      namedDescendants.length +
      x.family.cohorts.reduce((n, c) => n + c.alive + c.dead, 0);
    const totalDead =
      namedDescendants.filter((p) => p.died !== null).length +
      x.family.cohorts.reduce((n, c) => n + c.dead, 0);
    if (
      !Number.isSafeInteger(totalBorn) ||
      !Number.isSafeInteger(totalDead) ||
      totalBorn !== x.family.distantBorn ||
      totalDead !== x.family.distantDead ||
      x.family.directBorn !==
        x.family.people.filter((p) => p.role === "child").length
    )
      return false;
    if (
      x.family.projectionLimited !== undefined &&
      typeof x.family.projectionLimited !== "boolean"
    )
      return false;
    const active = x.family.marriages.filter((m) => m.end === null);
    if (
      new Set(active.map((m) => m.person)).size !== active.length ||
      active.some((m) => {
        const p = x.family.people.find((p) => p.id === m.person);
        return !p || p.died !== null || p.partner !== "self";
      })
    )
      return false;
    if (
      x.family.marriages.some(
        (m) =>
          m.reason === "widowhood" &&
          x.family.people.find((p) => p.id === m.person)?.died !== m.end,
      )
    )
      return false;
    if (x.serviceContext !== undefined && x.serviceContext !== null) {
      const c = x.serviceContext;
      if (
        !object(c) ||
        !Number.isInteger(c.year) ||
        c.year < x.birthYear ||
        c.year > x.birthYear + (v.age as number) ||
        !text(c.code, 100) ||
        !ownKey(REGIONS, c.region) ||
        !text(c.locality, 40)
      )
        return false;
    }
    if (x.queue.includes(v.pending as string)) return false;
    const children = x.family.people.filter(
      (p) => p.role === "child" && p.died === null,
    ).length;
    const descendants =
      children +
      x.family.people.filter((p) => p.role === "descendant" && p.died === null)
        .length +
      x.family.cohorts.reduce((n, c) => n + c.alive, 0);
    const s = x.summary;
    if (
      s &&
      (s.spouseCount !==
        new Set(x.family.marriages.map((m) => m.person)).size ||
        s.childrenBorn !== x.family.directBorn ||
        s.survivingChildren !== children ||
        s.survivingDescendants !== descendants ||
        s.peakWealth !== x.economy.peak ||
        !object(v.ending) ||
        v.ending.cause !== s.cause)
    )
      return false;
  }
  if (
    Object.hasOwn(v, "language") &&
    v.language !== "en" &&
    v.language !== "th"
  )
    return false;
  if (
    !ownKey(RACES, v.race) ||
    !ownKey(REGIONS, v.birthRegion) ||
    !ownKey(REGIONS, v.region)
  )
    return false;
  if (
    !text(v.phase) ||
    !["birth", "alive", "ended"].includes(v.phase) ||
    v.memories !== true
  )
    return false;
  if (
    !number(v.age, 0, ageMax) ||
    !Number.isInteger(v.age) ||
    !number(v.progress, 0, 1) ||
    !number(v.coins)
  )
    return false;
  if (
    !number(v.seed, 0, 4294967295) ||
    !number(v.rng, 0, 4294967295) ||
    !number(v.deathAge, 1, ageMax)
  )
    return false;
  if (!ownKey(FOCUSES, v.focus) || !ownKey(CAREERS, v.career)) return false;
  if (
    v.progression !== undefined &&
    !isProgression(v.progression, v.career as Career)
  )
    return false;
  if (
    ![v.hometown, v.background, v.aptitude, v.personality].every((item) =>
      text(item, 500),
    )
  )
    return false;
  if (
    !object(v.stats) ||
    !["health", "happiness", "knowledge", "bonds", "mana", "sword"].every(
      (key) => number((v.stats as Record<string, unknown>)[key], 0, 100),
    )
  )
    return false;
  if (
    !object(v.training) ||
    !["magicXp", "swordXp", "guildXp"].every((key) =>
      number((v.training as Record<string, unknown>)[key]),
    )
  )
    return false;
  if (
    !number(v.training.magicCap, 0, 6) ||
    !number(v.training.swordCap, 0, 6) ||
    !Number.isInteger(v.training.magicCap) ||
    !Number.isInteger(v.training.swordCap)
  )
    return false;
  if (!text(v.training.discipline, 100) || !text(v.training.school, 100))
    return false;
  if (
    !Array.isArray(v.family) ||
    v.family.length > (expanded ? 64 : 30) ||
    !v.family.every(
      (p) =>
        object(p) &&
        text(p.id, 100) &&
        text(p.name, 100) &&
        text(p.role, 100) &&
        number(p.bornAt, expanded ? -1000 : -300, ageMax) &&
        number(p.lifespan, 1, ageMax),
    )
  )
    return false;
  if (
    !object(v.flags) ||
    !Object.values(v.flags).every((item) => typeof item === "boolean")
  )
    return false;
  if (
    !object(v.seen) ||
    !Object.entries(v.seen).every(
      ([key, age]) =>
        (expanded ? validEventId(key) : EVENT_MAP.has(key)) &&
        number(age, 0, ageMax),
    )
  )
    return false;
  if (
    v.pending !== null &&
    (!text(v.pending) ||
      !(expanded ? validEventId(v.pending) : EVENT_MAP.has(v.pending)))
  )
    return false;
  if (v.phase !== "alive" && v.pending !== null) return false;
  if (
    v.ending !== null &&
    (!object(v.ending) || !text(v.ending.cause) || !text(v.ending.legacy))
  )
    return false;
  if (v.phase === "ended" && v.ending === null) return false;
  if (
    !Array.isArray(v.history) ||
    v.history.length > 600 ||
    !v.history.every(
      (e) =>
        object(e) &&
        number(e.id) &&
        number(e.age, 0, ageMax) &&
        text(e.title) &&
        text(e.text) &&
        (!Object.hasOwn(e, "message") || validMessage(e.message)) &&
        text(e.kind) &&
        [
          "birth",
          "memory",
          "training",
          "life",
          "world",
          "choice",
          "ending",
        ].includes(e.kind),
    )
  )
    return false;
  if (
    expanded &&
    v.pending !== null &&
    !getExpandedDecision(v as unknown as import("./types").ExpandedLife)
  )
    return false;
  return true;
}

export function loadGame(storage: StorageLike): {
  data: SaveData;
  error: string | null;
} {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return { data: empty(), error: null };
    if (raw.length > 6_000_000) throw Error("too large");
    const data: unknown = decodeSave(JSON.parse(raw));
    if (
      !object(data) ||
      data.version !== 1 ||
      (data.active !== null && !isLife(data.active)) ||
      !Array.isArray(data.archive) ||
      data.archive.length > 20 ||
      !data.archive.every((l) => isLife(l) && l.phase === "ended")
    )
      throw Error("invalid");
    const save = data as unknown as SaveData;
    return {
      data: {
        ...save,
        active: save.active
          ? save.active.ruleset === "expanded-1"
            ? save.active
            : migrateLife(save.active)
          : null,
        archive: save.archive.map((l) =>
          l.ruleset === "expanded-1" ? l : migrateLife(l),
        ),
      },
      error: null,
    };
  } catch {
    return {
      data: empty(),
      error:
        "Your saved chronicle could not be opened. It has been left untouched. You can begin a new life, or try again in a browser with local storage enabled.",
    };
  }
}

export function saveGame(storage: StorageLike, save: SaveData): boolean {
  try {
    const raw = encodeSave(save);
    if (raw.length > 6_000_000) return false;
    storage.setItem(SAVE_KEY, raw);
    return true;
  } catch {
    return false;
  }
}
export function archiveLife(save: SaveData, life: Life): SaveData {
  if (life.phase !== "ended") return { ...save, active: life };
  return {
    version: 1,
    active: life,
    archive: [
      life,
      ...save.archive.filter((item) => item.id !== life.id),
    ].slice(0, 20),
  };
}

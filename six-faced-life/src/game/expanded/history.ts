import type { ExpandedLife, RegionId } from "../types";
import { draw, clamp } from "./random";
import { fact, worldYear } from "./facts";
import { recordFamilyDeath } from "./family";
export interface Conflict {
  start: number;
  end: number;
  severity: 1 | 2 | 3;
  authored: true;
}
export function regionalConflict(
  seed: number,
  region: RegionId,
  year: number,
): Conflict | null {
  let hash = seed;
  for (const char of region)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  const stream = { rng: hash };
  let next = 397;
  for (let y = 397; y <= Math.min(1427, year); y++) {
    if (y < next) continue;
    if (draw(stream) >= 0.03) continue;
    const end = y + Math.floor(draw(stream) * 3),
      severity = (1 + Math.floor(draw(stream) * 3)) as 1 | 2 | 3;
    if (year <= end) return { start: y, end, severity, authored: true };
    next = end + 6;
  }
  return null;
}
export function applyHistoryYear(life: ExpandedLife): string[] {
  const x = life.expansion,
    year = worldYear(life),
    due: string[] = [];
  const record = (
    code: string,
    exposure: "civilian" | "participant" | "support" | "news",
  ) => {
    if (x.history.some((h) => h.code === code && h.year === year)) return false;
    x.history.push({
      year,
      code,
      exposure,
      region: life.region,
      locality: x.origin.locality,
    });
    if (x.history.length > 128) x.history.shift();
    fact(life, "history", code, exposure);
    return true;
  };
  if (
    year === 417 &&
    record(
      "calamity",
      life.region === "asura" && x.origin.locality === "fittoa"
        ? "civilian"
        : "news",
    )
  ) {
    if (life.region === "asura" && x.origin.locality === "fittoa") {
      life.stats.health = clamp(life.stats.health - 15);
      life.coins = Math.floor(life.coins * 0.5);
      life.region = "demon";
      x.origin.locality = "displaced";
      x.economy.travelUntil = year + 1;
      for (const p of x.family.people)
        if (p.home === "asura" && p.died === null) {
          p.home = "demon";
          if (
            draw({
              get rng() {
                return x.familyRng;
              },
              set rng(v) {
                x.familyRng = v;
              },
            }) < 0.1
          )
            recordFamilyDeath(life, p.id, year, "disaster-loss");
        }
    }
    due.push("expanded.calamity");
  }
  if (
    (year === 424 || year === 425) &&
    record(
      year === 425 ? "ariel-accession" : "asura-succession",
      life.region === "asura" ? "civilian" : "news",
    )
  )
    due.push("expanded.succession");
  const conflict = regionalConflict(x.worldSeed, life.region, year);
  if (
    conflict &&
    conflict.start === year &&
    record("authored-conflict", "civilian")
  )
    due.push("expanded.conflict");
  return due;
}
export function historicalRecord(life: ExpandedLife, key: string) {
  const codes =
    key === "succession"
      ? ["asura-succession", "ariel-accession"]
      : key === "conflict"
        ? ["authored-conflict"]
        : key === "calamity"
          ? ["calamity"]
          : [];
  return [...life.expansion.history]
    .reverse()
    .find((h) => h.year === worldYear(life) && codes.includes(h.code));
}
export function canServeHistory(life: ExpandedLife, key: string): boolean {
  const h = historicalRecord(life, key);
  return (
    life.age >= 18 &&
    !!h &&
    h.exposure !== "news" &&
    h.region === life.region &&
    h.locality === life.expansion.origin.locality
  );
}
export function serviceRecord(life: ExpandedLife) {
  const c = life.expansion.serviceContext;
  if (
    !c ||
    c.year !== worldYear(life) ||
    c.region !== life.region ||
    c.locality !== life.expansion.origin.locality
  )
    return undefined;
  return life.expansion.history.find(
    (h) =>
      h.year === c.year &&
      h.code === c.code &&
      h.region === c.region &&
      h.locality === c.locality &&
      h.exposure !== "news",
  );
}

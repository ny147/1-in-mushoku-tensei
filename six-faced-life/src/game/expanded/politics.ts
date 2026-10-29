import type { ExpandedLife } from "../types";
import type { Faction } from "./types";
import { fact, worldYear } from "./facts";
import { draw, clamp } from "./random";
import { maxSwordXp, selectedSwordTrack, swordMeets } from "./sword-state";
export function factionEligible(l: ExpandedLife, faction: Faction) {
  const x = l.expansion,
    y = worldYear(l);
  return (
    l.age >= 18 &&
    y >= (faction === "orsted" ? 425 : 417) &&
    y <= 430 &&
    x.politics.faction === null &&
    x.politics.contact &&
    Math.max(l.training.magicXp, maxSwordXp(l), x.standing.reputation * 5) >=
      100 &&
    y - (x.politics.refused[faction] ?? -100) >= 5 &&
    y > x.politics.pursuitUntil
  );
}
function politicalRecord(l: ExpandedLife, code: string) {
  const x = l.expansion;
  x.politics.records.push({ year: worldYear(l), code });
  if (x.politics.records.length > 128) x.politics.records.shift();
  fact(l, "politics", code);
}
export function acceptFaction(l: ExpandedLife, faction: Faction): boolean {
  if (!factionEligible(l, faction)) return false;
  l.expansion.politics.faction = faction;
  l.expansion.politics.trust = 20;
  l.expansion.politics.obligations = 1;
  politicalRecord(l, `joined-${faction}`);
  return true;
}
export function refuseFaction(l: ExpandedLife, faction: Faction) {
  l.expansion.politics.refused[faction] = worldYear(l);
  politicalRecord(l, `refused-${faction}`);
}
export function defect(l: ExpandedLife) {
  const p = l.expansion.politics;
  if (!p.faction) return;
  p.faction = null;
  p.trust = 0;
  p.pursuitUntil = worldYear(l) + 3;
  p.obligations = 0;
  politicalRecord(l, "defected");
}
export function titleEligible(l: ExpandedLife, position: number): boolean {
  const x = l.expansion;
  const saved = x.swords?.compatibilityDecision?.id;
  const oldOffer =
    !x.swords || saved === "expanded.challenge" || saved === "expanded.defense";
  return (
    [5, 6, 7].includes(position) &&
    worldYear(l) > 430 &&
    l.age >= 18 &&
    (oldOffer
      ? Math.max(l.training.magicXp, l.training.swordXp) >= 2000 &&
        Math.max(l.training.magicCap, l.training.swordCap) >= 5
      : (l.training.magicXp >= 2000 && l.training.magicCap >= 5) ||
        swordMeets(l, 2000, 5, "event")) &&
    x.standing.reputation >= 90 &&
    new Set(x.standing.feats).size >= 3
  );
}
export function contestTitle(l: ExpandedLife, position: 5 | 6 | 7): boolean {
  if (!titleEligible(l, position)) return false;
  const won = draw(l) < titleWinChance(l);
  const x = l.expansion;
  recordTitle(l, position, won);
  if (won) x.standing.title = position;
  else {
    if (x.standing.title === position) x.standing.title = null;
    l.stats.health = clamp(l.stats.health - 35);
    if (draw(l) < 0.12) l.stats.health = 0;
  }
  return won;
}
export function titleWinChance(l: ExpandedLife): number {
  const saved = l.expansion.swords?.compatibilityDecision?.id;
  const sword =
    !l.expansion.swords ||
    saved === "expanded.challenge" ||
    saved === "expanded.defense"
      ? l.training.swordXp
      : (selectedSwordTrack(l)?.xp ?? 0);
  return clamp(
    0.15 + (Math.max(l.training.magicXp, sword) - 2000) / 10000,
    0.15,
    0.6,
  );
}
export function recordTitle(
  l: ExpandedLife,
  position: 5 | 6 | 7,
  won: boolean,
) {
  const titles = l.expansion.standing.titles;
  titles.push({ year: worldYear(l), position, won });
  if (titles.length > 64) titles.splice(0, titles.length - 64);
  fact(l, "achievement", won ? "title-won" : "title-lost", String(position));
}
export function applyPoliticalYear(l: ExpandedLife) {
  const p = l.expansion.politics;
  if (p.faction) {
    p.obligations = Math.min(1000, p.obligations + 1);
    if (p.obligations > 3) {
      p.trust = clamp(p.trust - 5);
      if (p.trust === 0) {
        p.pursuitUntil = worldYear(l) + 3;
        politicalRecord(l, "unfulfilled-obligations");
      }
    }
  }
}

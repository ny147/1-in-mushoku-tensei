import type { Genetics } from "./types";
import type { ExpandedLife } from "../types";
import { draw, weighted } from "./random";
import { fact } from "./facts";
export function generateGenetics(
  stream: { rng: number },
  parents: readonly Genetics[] = [],
): Genetics {
  const carriers = parents.filter((p) => p.carrier).length;
  const carrier =
    draw(stream) < (carriers >= 2 ? 0.4 : carriers === 1 ? 0.2 : 0.001);
  const manifestation = carrier
    ? weighted(stream, [
        ["mana", 60],
        ["appearance", 25],
        ["physical", 15],
      ] as const)
    : "none";
  const auraImpaired = manifestation === "mana" && draw(stream) < 0.5;
  const talent = draw(stream);
  // Keep the second historical talent draw so unrelated birth/family RNG stays aligned.
  draw(stream);
  return {
    carrier,
    manifestation,
    auraImpaired,
    discovered: false,
    signs: false,
    magicTalent: talent < 0.2,
    academicTalent: talent >= 0.2 && talent < 0.4,
    swordTalent: talent >= 0.4 && talent < 0.6,
  };
}
export function migrateTalents(life: ExpandedLife): ExpandedLife {
  const genes = [
    life.expansion.genetics,
    ...life.expansion.family.people.map((p) => p.genetics),
  ];
  if (genes.every((g) => g.swordTalent !== undefined)) return life;
  const next = structuredClone(life);
  next.expansion.genetics.swordTalent ??= false;
  for (const p of next.expansion.family.people)
    p.genetics.swordTalent ??= false;
  return next;
}
export function talentMultiplier(
  life: ExpandedLife,
  kind: "magic" | "sword" | "academic",
): number {
  const g = life.expansion.genetics;
  return (
    kind === "magic"
      ? g.magicTalent
      : kind === "academic"
        ? g.academicTalent
        : g.swordTalent
  )
    ? 1.25
    : 1;
}
export function discoverGenetics(l: ExpandedLife): boolean {
  const g = l.expansion.genetics;
  if (
    !g.carrier ||
    l.age < 8 ||
    (!g.signs && l.training.magicXp < 80 && l.training.swordXp < 80)
  )
    return false;
  g.discovered = true;
  fact(l, "discovery", "factor", g.manifestation);
  return true;
}
export function trainingMultiplier(l: ExpandedLife, kind: "magic" | "sword") {
  const g = l.expansion.genetics;
  if (
    kind === "magic" &&
    g.manifestation === "mana" &&
    l.training.magicCap >= 1 &&
    l.expansion.economy.unmetFood === 0
  )
    return 1.25;
  return kind === "sword" && g.manifestation === "physical" ? 1.15 : 1;
}

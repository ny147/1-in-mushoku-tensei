import type { ExpandedLife, RegionId } from "../types";
import { SOCIAL_BIRTH } from "./balance";
import { worldYear } from "./facts";
import { associationForRegion, type HouseAssociation } from "./social-state";

function inheritedAssociation(life: ExpandedLife): HouseAssociation | null {
  const x = life.expansion;
  if (x.standing.status !== "noble") return null;
  if (x.origin.status === "noble")
    return associationForRegion(life.birthRegion, "inherited-record", x.birthYear);
  const grant = x.facts.find(f => f.kind === "achievement" && f.code === "noble-grant");
  // A missing historical date stays unknown; the present location is recorded.
  if (!grant) return associationForRegion(life.region, "inherited-record", null);
  const moves = x.facts.filter(f =>
    f.kind === "history" && f.code === "migration" &&
    (f.year < grant.year || (f.year === grant.year && f.id < grant.id)),
  ).sort((a, b) => a.year - b.year || a.id - b.id);
  const region = moves.at(-1)?.detail ?? life.birthRegion;
  // Migration details are historical data, not permission to invent a crown.
  return associationForRegion(region as RegionId, "inherited-record", grant.year);
}

/** Adopt only at an unobstructed boundary, without inventing past obligations. */
export function activateSocialState(life: ExpandedLife): ExpandedLife {
  if (
    life.phase === "ended" || life.expansion.social !== undefined ||
    life.pending || life.expansion.queue.length ||
    life.expansion.swords?.compatibilityDecision
  ) return life;
  const next = structuredClone(life);
  next.expansion.social = {
    version: 1,
    source: "migrated",
    activatedYear: worldYear(life),
    royalHouse: null,
    association: inheritedAssociation(life),
    household: {
      home: life.birthRegion,
      parentIds: life.expansion.family.people.filter(p => p.role === "parent").slice(0, 2).map(p => p.id),
      relationship: SOCIAL_BIRTH.relationship,
      housing: "unrecorded",
      affectedParentIds: [],
      housingLossYear: null,
    },
    debt: null,
  };
  return next;
}

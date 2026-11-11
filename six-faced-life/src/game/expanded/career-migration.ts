import type { ExpandedLife } from "../types";
import type { Occupation } from "./types";
import { PAY } from "./balance";
import { CAREER_NODES, type CareerNodeId } from "./career-catalogue";
import { emptyCareerPaths } from "./career-state";
import { worldYear } from "./facts";

export const INHERITED_CAREER_NODES: Partial<
  Record<Occupation, readonly CareerNodeId[]>
> = {
  laborer: ["laborer", "laborer", "laborer", "laborer"],
  farmer: ["farmhand", "farmer", "farmer", "farm-steward"],
  merchant: [
    "trade-assistant",
    "merchant",
    "established-merchant",
    "trade-leader",
  ],
  swordsman: ["swordsman", "swordsman", "senior-swordsman", "senior-swordsman"],
  guard: ["guard", "guard", "guard-captain", "guard-captain"],
  knight: ["knight", "knight", "knight", "knight-commander"],
  adventurer: ["adventure-f", "adventure-d", "adventure-b", "adventure-s"],
  mage: ["mage", "mage", "senior-mage", "master-practitioner"],
  teacher: [
    "teacher-unspecified",
    "teacher-unspecified",
    "teacher-unspecified",
    "teacher-unspecified",
  ],
  professor: ["professor", "professor", "professor", "professor"],
  healer: ["healer", "healer", "senior-healer", "clinic-leader"],
  cleric: ["cleric", "cleric", "senior-cleric", "senior-cleric"],
};
export function activateCareerPaths(l: ExpandedLife): ExpandedLife {
  if (
    l.phase === "ended" ||
    l.expansion.careerPaths !== undefined ||
    l.pending ||
    l.expansion.queue.length ||
    l.expansion.swords?.compatibilityDecision
  )
    return l;
  const n = structuredClone(l),
    y = worldYear(n),
    s = emptyCareerPaths(y);
  s.lastWorkYear = y;
  s.lastProjectYear = y;
  for (const [role, nodes] of Object.entries(INHERITED_CAREER_NODES)) {
    const key = role as Occupation,
      r = l.expansion.career.records[key];
    if (
      l.expansion.career.role !== key &&
      !r.years &&
      !r.xp &&
      !r.level &&
      !l.expansion.career.timeline.some((t) => t.role === key)
    )
      continue;
    const id = nodes[r.level],
      node = CAREER_NODES[id];
    s.payFloor[key] = PAY[key] + [0, 8, 18, 32][r.level];
    for (
      let cur: CareerNodeId | null = id;
      cur;
      cur = CAREER_NODES[cur].predecessor
    )
      s.earned[cur] = { year: null, source: "inherited" };
    if (key !== "teacher") s.work[node.branch].years += r.years;
    if (l.expansion.career.role === key) s.active = id;
  }
  n.expansion.careerPaths = s;
  return n;
}

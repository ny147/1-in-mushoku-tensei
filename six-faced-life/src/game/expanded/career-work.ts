import type { ExpandedLife } from "../types";
import type { CareerBranchId } from "./career-catalogue";
import { careerNode } from "./career-paths";
import { worldYear, fact } from "./facts";
import { draw, clamp } from "./random";
import { grantSwordXp } from "./sword-state";
import { talentMultiplier } from "./genetics";
import { creditorServiceReplacesWork } from "./parental-debt";
export type CareerProjectKind = "safe" | "risk" | "research";
export interface CareerProjectQuote {
  branch: CareerBranchId;
  cost: number;
  successChance: number;
  failureHealth: number;
  success: {
    units: number;
    milestones: number;
    requests: number;
    silver: number;
    service: number;
    trust: number;
    research: number;
  };
}
const bounded = (v: number) => clamp(v, 0, 1_000_000);
export function creditCareerWork(
  l: ExpandedLife,
  year: number,
  attendance: { fullTime: boolean; university: boolean },
): void {
  const s = l.expansion.careerPaths,
    n = careerNode(l);
  if (
    !s ||
    l.phase !== "alive" ||
    l.age < 15 ||
    year !== worldYear(l) ||
    s.lastWorkYear >= year
  )
    return;
  s.lastWorkYear = year;
  if (
    !n ||
    attendance.fullTime ||
    attendance.university ||
    l.expansion.education.stage === "university"
  )
    return;
  if (
    ["farmer", "guard", "adventurer", "swordsman", "knight"].includes(
      n.occupation,
    ) &&
    l.stats.health < 20
  )
    return;
  const w = s.work[n.branch],
    units = l.focus === "work" ? 2 : 1;
  w.years = bounded(w.years + 1);
  w.units = bounded(w.units + units);
  if (n.branch === "adventure")
    s.requests = bounded(s.requests + (l.focus === "work" ? 6 : 4));
  if (n.occupation === "swordsman")
    grantSwordXp(l, 5 * talentMultiplier(l, "sword"));
  if (n.branch === "instructor")
    l.stats.knowledge = clamp(
      l.stats.knowledge + talentMultiplier(l, "academic"),
    );
  s.recent.push({ year, node: n.id, code: "work", units });
  if (s.recent.length > 64) s.recent.shift();
}
export function careerProject(
  l: ExpandedLife,
  kind: CareerProjectKind,
): CareerProjectQuote | null {
  const s = l.expansion.careerPaths,
    n = careerNode(l),
    t = l.expansion.training;
  if (
    !s ||
    !n ||
    !["safe", "risk", "research"].includes(kind) ||
    l.phase !== "alive" ||
    l.age < 15 ||
    creditorServiceReplacesWork(l, worldYear(l)) ||
    l.expansion.education.stage === "university" ||
    s.lastProjectYear >= worldYear(l) ||
    (t?.active && !t.paused && t.mode === "full-time")
  )
    return null;
  if (
    ["farmer", "guard", "adventurer", "swordsman", "knight"].includes(
      n.occupation,
    ) &&
    l.stats.health < 20
  )
    return null;
  const branch = n.branch,
    risk = kind !== "safe";
  const q: CareerProjectQuote = {
    branch,
    cost: 0,
    successChance: 1,
    failureHealth: 0,
    success: {
      units: 2,
      milestones: 1,
      requests: 0,
      silver: 0,
      service: 0,
      trust: 0,
      research: 0,
    },
  };
  if (kind === "research" || (risk && branch === "academic")) {
    if (
      l.expansion.education.stage !== "graduated" ||
      l.training.magicXp < 500 ||
      l.expansion.education.research >= 64
    )
      return null;
    q.branch = "academic";
    q.cost = 8;
    q.successChance = 0.8;
    q.success.research = 1;
    q.success.units = branch === "academic" ? 4 : 0;
    q.success.milestones = branch === "academic" ? 1 : 0;
    return q;
  }
  if (branch === "instructor" && risk) return null;
  if (branch === "everyday" || branch === "farming") {
    q.cost = risk ? 8 : 4;
    if (risk) {
      q.successChance = 0.75;
      q.success.units = 4;
      q.success.silver = 12;
    }
  } else if (branch === "trade") {
    q.cost = risk ? 10 : 4;
    if (risk) {
      q.successChance = 0.75;
      q.success.units = 4;
      q.success.silver = 16;
    }
  } else if (["sword", "guard", "knight"].includes(branch)) {
    q.success.service = 1;
    if (risk) {
      q.successChance = 0.8;
      q.success.units = 4;
      q.success.silver = 8;
      q.failureHealth = 5;
    }
  } else if (branch === "mage") {
    if (risk) {
      q.cost = 4;
      q.successChance = 0.8;
      q.success.units = 4;
      q.success.silver = 10;
    }
  } else if (branch === "healer" || branch === "cleric") {
    if (!risk && branch === "cleric") q.success.trust = 1;
    if (risk) {
      q.cost = 4;
      q.successChance = 0.8;
      q.success.units = 4;
      q.success.silver = 8;
    }
  } else if (branch === "adventure") {
    const i = n.tier;
    q.success.units = 0;
    q.success.requests = risk ? 4 : 2;
    if (risk) {
      q.successChance = [0.9, 0.85, 0.8, 0.75][i];
      q.success.silver = [4, 8, 12, 16][i];
      q.failureHealth = [2, 4, 6, 8][i];
    }
  }
  return q;
}
export function applyCareerProject(
  l: ExpandedLife,
  kind: CareerProjectKind,
): boolean {
  const q = careerProject(l, kind),
    s = l.expansion.careerPaths,
    n = careerNode(l);
  if (!q || !s || !n || l.coins < q.cost) return false;
  const y = worldYear(l);
  s.lastProjectYear = y;
  l.coins -= q.cost;
  const success = q.successChance === 1 || draw(l) < q.successChance;
  if (success) {
    const r = q.success,
      w = s.work[q.branch];
    w.units = bounded(w.units + r.units);
    w.milestones = bounded(w.milestones + r.milestones);
    s.requests = bounded(s.requests + r.requests);
    l.coins = bounded(l.coins + r.silver);
    l.expansion.standing.service = bounded(
      l.expansion.standing.service + r.service,
    );
    l.expansion.standing.trust = clamp(l.expansion.standing.trust + r.trust);
    if (r.research) {
      l.expansion.education.research = Math.min(
        64,
        l.expansion.education.research + 1,
      );
      l.expansion.standing.reputation = clamp(
        l.expansion.standing.reputation + 10,
      );
      const feat = `research-${l.expansion.study}`;
      if (!l.expansion.standing.feats.includes(feat))
        l.expansion.standing.feats.push(feat);
      fact(l, "education", "research", l.expansion.study);
    }
  } else l.stats.health = clamp(l.stats.health - q.failureHealth);
  l.expansion.economy.peak = Math.max(l.expansion.economy.peak, l.coins);
  s.recent.push({
    year: y,
    node: n.id,
    code: success ? (q.success.research ? "research" : kind) : "failure",
    units: success ? q.success.units : 0,
  });
  if (s.recent.length > 64) s.recent.shift();
  return true;
}

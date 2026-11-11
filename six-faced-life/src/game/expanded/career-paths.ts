import type { ExpandedLife } from "../types";
import {
  CAREER_NODES,
  isCareerNode,
  type CareerNode,
  type CareerNodeId,
} from "./career-catalogue";
import { appoint, careerRequirements } from "./careers";
import { requirement, type Requirement } from "./education";
import { maxSwordXp } from "./sword-state";
import { worldYear } from "./facts";
import { draw } from "./random";

export function careerNode(l: ExpandedLife): CareerNode | null {
  const id = l.expansion.careerPaths?.active;
  return id ? (CAREER_NODES[id] ?? null) : null;
}
export function careerVacancy(l: ExpandedLife, role: string): boolean {
  if (role !== "knight" && role !== "professor") return true;
  const stream = {
    rng:
      (l.expansion.worldSeed ^
        Math.imul(worldYear(l), 2654435761) ^
        role
          .split("")
          .reduce(
            (h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0,
            2166136261,
          )) >>>
      0,
  };
  return draw(stream) < (role === "professor" ? 0.02 : 0.1);
}
export function pathRequirements(
  l: ExpandedLife,
  id: CareerNodeId,
): Requirement[] {
  const n = CAREER_NODES[id],
    s = l.expansion.careerPaths;
  const magic = l.progression?.magic[l.expansion.study].xp ?? 0;
  const sword = maxSwordXp(l);
  const r: Requirement[] = [requirement("age", l.age, 15)];
  const add = (key: string, current: number, needed: number) =>
    r.push(requirement(key, current, needed));
  const sameRole = l.expansion.career.role === n.occupation && !!s?.active;
  if (!sameRole)
    r.push(
      ...careerRequirements(l, n.occupation).filter(
        (q) =>
          q.id !== "age" && !(n.occupation === "teacher" && q.id === "skill"),
      ),
    );
  if (id === "magic-teacher") add("magic", magic, 25);
  if (id === "sword-instructor") add("sword", sword, 25);
  if (id === "teacher-unspecified") add("inherited", s?.earned[id] ? 1 : 0, 1);
  if (id === "sworn-service") add("service", l.expansion.standing.service, 1);
  const prestige = id === "knight" || id === "professor";
  if (n.predecessor && !prestige && !s?.earned[id]) {
    add("predecessor", s?.earned[n.predecessor] ? 1 : 0, 1);
    if (n.branch === "adventure") {
      const index = n.tier - 1;
      add("requests", s?.requests ?? 0, [12, 40, 100][index]);
      add("combat", Math.max(sword, magic), [30, 150, 500][index]);
    } else {
      const w = s?.work[n.branch],
        i = n.tier - 1;
      add("career-years", w?.years ?? 0, [2, 5, 10][i]);
      add("work-units", w?.units ?? 0, [6, 16, 32][i]);
      add("milestones", w?.milestones ?? 0, [1, 2, 3][i]);
    }
  }
  if (id === "master-practitioner") add("magic", magic, 500);
  if (id === "clinic-leader")
    add("healing", l.progression?.magic.healing.xp ?? 0, 150);
  if (id === "guard-captain") add("sword", sword, 150);
  if (id === "senior-cleric") add("trust", l.expansion.standing.trust, 30);
  if (id === "researcher") {
    add("degree", l.expansion.education.stage === "graduated" ? 1 : 0, 1);
    add("research", l.expansion.education.research, 1);
  }
  if (id === "knight-commander") {
    add("knight-years", l.expansion.career.records.knight.years, 5);
    add("service", l.expansion.standing.service, 10);
    add("sword", sword, 300);
    add("reputation", l.expansion.standing.reputation, 50);
  }
  if (prestige && !sameRole)
    add("vacancy", careerVacancy(l, n.occupation) ? 1 : 0, 1);
  return r;
}
export function pathIncome(l: ExpandedLife): number {
  if (l.age < 15 || l.expansion.education.stage === "university") return 0;
  const t = l.expansion.training;
  if (t?.active && !t.paused && t.mode === "full-time") return 24;
  const n = careerNode(l);
  return n
    ? Math.max(n.pay, l.expansion.careerPaths?.payFloor[n.occupation] ?? 0)
    : 0;
}
function rememberNode(l: ExpandedLife, id: CareerNodeId, code: string): void {
  const s = l.expansion.careerPaths!,
    y = worldYear(l);
  s.active = id;
  s.earned[id] ??= { year: y, source: "earned" };
  s.recent.push({ year: y, node: id, code, units: 0 });
  if (s.recent.length > 64) s.recent.shift();
}
export function syncCareerNode(l: ExpandedLife): void {
  const s = l.expansion.careerPaths;
  if (!s) return;
  const role = l.expansion.career.role;
  if (["child", "student", "retired"].includes(role)) {
    s.active = null;
    return;
  }
  if (s.active && CAREER_NODES[s.active].occupation === role) return;
  const matches = Object.values(CAREER_NODES).filter(
    (n) => n.occupation === role,
  );
  const preference =
    role === "teacher"
      ? s.teaching === "magic"
        ? "magic-teacher"
        : s.teaching === "sword"
          ? "sword-instructor"
          : "teacher-unspecified"
      : null;
  const earned = matches
    .filter(
      (n) =>
        s.earned[n.id] &&
        (!preference ||
          n.id === preference ||
          n.branch === CAREER_NODES[preference].branch),
    )
    .sort((a, b) => b.pay - a.pay)[0];
  const target =
    earned ??
    (preference
      ? CAREER_NODES[preference]
      : (matches.find((n) => !n.predecessor) ?? matches[0]));
  if (target) rememberNode(l, target.id, "appointment");
}
export function enterCareerNode(
  l: ExpandedLife,
  id: CareerNodeId,
  funding?: "reserved-training",
): boolean {
  const s = l.expansion.careerPaths;
  if (
    !s ||
    !isCareerNode(id) ||
    l.phase !== "alive" ||
    l.expansion.education.stage === "university"
  )
    return false;
  const n = CAREER_NODES[id];
  if (n.predecessor && !s.earned[id] && id !== "knight" && id !== "professor")
    return false;
  const next = structuredClone(l),
    ns = next.expansion.careerPaths!;
  if (id === "magic-teacher" || id === "sword-instructor")
    ns.teaching = id === "magic-teacher" ? "magic" : "sword";
  if (!funding && pathRequirements(next, id).some((r) => !r.met)) return false;
  const sameRole = next.expansion.career.role === n.occupation && !!ns.active;
  if (
    !sameRole &&
    !appoint(next, n.occupation, funding ? { funding } : undefined)
  )
    return false;
  const earned = Object.values(CAREER_NODES)
    .filter((v) => v.branch === n.branch && v.occupation===n.occupation && ns.earned[v.id])
    .sort((a, b) => b.pay - a.pay)[0];
  rememberNode(next, earned?.id ?? id, "appointment");
  Object.assign(l, next);
  return true;
}
export function promoteCareerNode(l: ExpandedLife, id: CareerNodeId): boolean {
  const s = l.expansion.careerPaths;
  if (
    !s ||
    !isCareerNode(id) ||
    l.phase !== "alive" ||
    l.expansion.education.stage === "university"
  )
    return false;
  const n = CAREER_NODES[id];
  if (
    !s.active ||
    n.predecessor !== s.active ||
    s.earned[id] ||
    pathRequirements(l, id).some((r) => !r.met)
  )
    return false;
  const next = structuredClone(l);
  if (
    next.expansion.career.role !== n.occupation &&
    !appoint(next, n.occupation)
  )
    return false;
  rememberNode(next, id, "promotion");
  Object.assign(l, next);
  return true;
}

import { consumeEducation, reservedTotal } from "./education-finance";
import type { ExpandedLife, Career, MagicSchool } from "../types";
import type { Occupation } from "./types";
import { isOrdinaryRole, ordinaryEntry } from "./career-access";
import { PAY, OCCUPATIONS } from "./balance";
import { requirement, type Requirement } from "./education";
import { fact, worldYear } from "./facts";
import { clamp } from "./random";
import { getProgression } from "../progression";
export function careerRequirements(
  l: ExpandedLife,
  role: Occupation,
  discipline = l.expansion.study,
): Requirement[] {
  const x = l.expansion,
    school = l.progression?.magic[discipline].xp ?? 0;
  const r: Requirement[] = [requirement("age", l.age, 15)];
  const add = (id: string, current: number, required: number) =>
    r.push(requirement(id, current, required));
  if (isOrdinaryRole(role)) {
    const c = ordinaryEntry(role);
    if (role === "farmer" || role === "adventurer") add("health", l.stats.health, c.health!);
    if (c.knowledge) add("knowledge", l.stats.knowledge, c.knowledge);
    if (c.starterFee) add("capital", l.coins, c.starterFee);
    if (["guard", "swordsman"].includes(role)) add("sword", l.training.swordXp, c.sword!);
    if (role === "adventurer") add("skill", Math.max(l.training.swordXp, l.training.magicXp), 15);
    if (role === "teacher") add("skill", Math.max(school, l.training.swordXp), 25);
    if (role === "mage") add("magic", school, c.magic!);
    if (role === "healer" || role === "cleric") add("healing", l.progression?.magic.healing.xp ?? 0, c.magic!);
    if (c.cap) add("instruction", c.cap === "magic" ? l.training.magicCap : l.training.swordCap, 1);
    if (c.trust) add("trust", x.standing.trust, c.trust);
    if (c.reputation) add("reputation", x.standing.reputation, c.reputation);
    return r;
  }
  switch (role) {
    case "child":
    case "student":
      add("appointment", 0, 1);
      break;
    case "knight":
      add("sword", l.training.swordXp, 150);
      add("service", x.standing.service, 3);
      add("patron", x.origin.patron || x.standing.reputation >= 30 ? 1 : 0, 1);
      add(
        "equipment",
        l.coins + (x.origin.status === "noble" ? x.economy.familyFunds : 0),
        120,
      );
      break;
    case "professor":
      add("degree", x.education.stage === "graduated" ? 1 : 0, 1);
      add("magic", school, 500);
      add("research", x.education.research, 2);
      add("teaching", x.career.records.teacher.years, 5);
      add("reputation", x.standing.reputation, 50);
      break;
    case "retired":
      break;
  }
  return r;
}
export interface AppointmentOptions { school?: MagicSchool; funding?: "reserved-training" }
export function appoint(l: ExpandedLife, role: Occupation, options?: AppointmentOptions): boolean {
  const record = isOrdinaryRole(role) ? l.expansion.training?.records[role] : undefined;
  const funded = options?.funding === "reserved-training" && isOrdinaryRole(role) && record?.completedYear != null;
  if (l.expansion.education.stage === "university" || !OCCUPATIONS.includes(role) ||
    (options?.funding && !funded) ||
    (!funded && careerRequirements(l, role, options?.school).some((r) => !r.met)))
    return false;
  const x = l.expansion;
  const cost =
    role === "knight"
      ? 120
      : role === "adventurer"
        ? ordinaryEntry("adventurer").starterFee
        : role === "merchant"
          ? ordinaryEntry("merchant").starterFee
          : 0;
  if (funded && isOrdinaryRole(role)) {
    const fee = record!.placementAccepted ? 0 : ordinaryEntry(role).starterFee;
    if (l.age < 15 || (ordinaryEntry(role).health && l.stats.health < ordinaryEntry(role).health!)) return false;
    if (fee && (reservedTotal(l.expansion.finance?.purposes[role]) < fee || !consumeEducation(l, role, fee))) return false;
  }
  const family =
    role === "knight" && x.origin.status === "noble"
      ? Math.min(cost, x.economy.familyFunds)
      : 0;
  x.economy.familyFunds -= family;
  if (!funded) l.coins -= cost - family;
  x.career.role = role;
  const mirror: Partial<Record<Occupation, Career>> = {
    laborer: "guard",
    farmer: "merchant",
    swordsman: "guard",
    mage: "healer",
    cleric: "healer",
    knight: "guard",
    professor: "teacher",
  };
  l.career = mirror[role] ?? (role as Career);
  l.progression = getProgression(l);
  x.career.timeline.push({
    year: worldYear(l),
    role,
    level: x.career.records[role].level,
    reason: "appointment",
  });
  if (x.career.timeline.length > 128) x.career.timeline.shift();
  fact(l, "career", "appointed", role);
  return true;
}
export function careerIncomeExpanded(l: ExpandedLife): number {
  const t=l.expansion.training;
  if(t?.active && !t.paused && t.mode==="full-time") return 24;
  const c = l.expansion.career;
  return (
    PAY[c.role] +
    (PAY[c.role] > 0 ? [0, 8, 18, 32][c.records[c.role].level] : 0)
  );
}
export function promotionReady(l: ExpandedLife) {
  const c = l.expansion.career.records[l.expansion.career.role],
    level = c.level;
  return (
    PAY[l.expansion.career.role] > 0 &&
    level < 3 &&
    c.xp >= [60, 180, 400][level] &&
    c.years >= [2, 5, 10][level] &&
    c.reputation >= [10, 25, 50][level]
  );
}
export function promote(l: ExpandedLife): boolean {
  if (!promotionReady(l)) return false;
  const x = l.expansion,
    c = x.career.records[x.career.role];
  c.level++;
  x.career.timeline.push({
    year: worldYear(l),
    role: x.career.role,
    level: c.level,
    reason: "promotion",
  });
  if (x.career.timeline.length > 128) x.career.timeline.shift();
  fact(l, "career", "promoted", x.career.role, c.level);
  return true;
}
export function applyCareerYear(l: ExpandedLife, attendingFullTime = false) {
  const x = l.expansion,
    c = x.career.records[x.career.role];
  if(['farmer','guard','adventurer','swordsman','knight'].includes(x.career.role)&&l.stats.health<20){
    const previous=x.career.role;
    x.career.timeline.push({year:worldYear(l),role:previous,level:c.level,reason:'dismissal'});
    if(x.career.timeline.length>128)x.career.timeline.shift();
    x.career.role='child';l.career='child';l.progression=getProgression(l);fact(l,'career','dismissed',previous);return;
  }
  if (attendingFullTime || PAY[x.career.role] === 0) return;
  c.years++;
  c.xp += l.focus === "work" ? 14 : 8;
  c.reputation = clamp(c.reputation + 1);
  x.standing.reputation = clamp(x.standing.reputation + 0.7);
  if (["guard", "knight"].includes(x.career.role)) {
    x.standing.service++;
    l.training.swordXp += 5;
  }
  if (["mage", "healer", "cleric", "professor"].includes(x.career.role))
    l.training.magicXp += 4;
  if (x.career.role === "cleric")
    x.standing.trust = clamp(x.standing.trust + 2);
}

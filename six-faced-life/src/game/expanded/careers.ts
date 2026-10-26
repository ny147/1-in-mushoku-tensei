import type { ExpandedLife, Career } from "../types";
import type { Occupation } from "./types";
import { PAY, OCCUPATIONS } from "./balance";
import { requirement, type Requirement } from "./education";
import { fact, worldYear } from "./facts";
import { clamp } from "./random";
import { getProgression } from "../progression";
export function careerRequirements(
  l: ExpandedLife,
  role: Occupation,
): Requirement[] {
  const x = l.expansion,
    school = l.progression?.magic[x.study].xp ?? 0;
  const r: Requirement[] = [requirement("age", l.age, 15)];
  const add = (id: string, current: number, required: number) =>
    r.push(requirement(id, current, required));
  switch (role) {
    case "child":
    case "student":
      add("appointment", 0, 1);
      break;
    case "laborer":
      break;
    case "farmer":
      add("health", l.stats.health, 20);
      break;
    case "merchant":
      add("knowledge", l.stats.knowledge, 20);
      add("capital", l.coins, 30);
      break;
    case "guard":
      add("sword", l.training.swordXp, 40);
      break;
    case "adventurer":
      add("health", l.stats.health, 45);
      add("skill", Math.max(l.training.swordXp, l.training.magicXp), 30);
      add("capital", l.coins, 10);
      break;
    case "swordsman":
      add("sword", l.training.swordXp, 80);
      add("instruction", l.training.swordCap, 2);
      break;
    case "mage":
      add("magic", school, 100);
      add("instruction", l.training.magicCap, 2);
      break;
    case "healer":
      add("healing", l.progression?.magic.healing.xp ?? 0, 50);
      break;
    case "cleric":
      add("healing", l.progression?.magic.healing.xp ?? 0, 50);
      add("knowledge", l.stats.knowledge, 35);
      add("trust", x.standing.trust, 30);
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
    case "teacher":
      add("knowledge", l.stats.knowledge, 40);
      add("skill", Math.max(school, l.training.swordXp), 50);
      add("reputation", x.standing.reputation, 10);
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
export function appoint(l: ExpandedLife, role: Occupation): boolean {
  if (
    !OCCUPATIONS.includes(role) ||
    careerRequirements(l, role).some((r) => !r.met)
  )
    return false;
  const x = l.expansion;
  const cost =
    role === "knight"
      ? 120
      : role === "adventurer"
        ? 10
        : role === "merchant"
          ? 30
          : 0;
  const family =
    role === "knight" && x.origin.status === "noble"
      ? Math.min(cost, x.economy.familyFunds)
      : 0;
  x.economy.familyFunds -= family;
  l.coins -= cost - family;
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
export function applyCareerYear(l: ExpandedLife) {
  const x = l.expansion,
    c = x.career.records[x.career.role];
  if(['farmer','guard','adventurer','swordsman','knight'].includes(x.career.role)&&l.stats.health<20){
    const previous=x.career.role;
    x.career.timeline.push({year:worldYear(l),role:previous,level:c.level,reason:'dismissal'});
    if(x.career.timeline.length>128)x.career.timeline.shift();
    x.career.role='child';l.career='child';l.progression=getProgression(l);fact(l,'career','dismissed',previous);return;
  }
  if (PAY[x.career.role] === 0) return;
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

import type { ExpandedLife } from "../types";
import { fact } from "./facts";
import { clamp } from "./random";
import { getProgression } from "../progression";
export interface Requirement {
  id: string;
  current: number;
  required: number;
  met: boolean;
}
export const requirement = (
  id: string,
  current: number,
  required: number,
): Requirement => ({ id, current, required, met: current >= required });
export function assessTalent(life: ExpandedLife) {
  const e = life.expansion.education,
    g = life.expansion.genetics;
  e.assessed = true;
  e.assessment = clamp(
    Math.floor(
      life.stats.knowledge +
        Math.sqrt(life.training.magicXp) * 3 +
        (g.magicTalent || g.academicTalent ? 20 : 0),
    ),
  );
  fact(life, "education", "assessment", "", e.assessment);
}
export function travelCost(life: ExpandedLife) {
  return life.region === "demon" ? 120 : life.region === "begaritt" ? 90 : 40;
}
export function scholarshipEligible(life: ExpandedLife) {
  const x = life.expansion;
  return (
    x.education.assessed &&
    x.education.assessment >= 60 &&
    (x.genetics.magicTalent || x.genetics.academicTalent)
  );
}
export function educationRequirements(life: ExpandedLife): Requirement[] {
  return [
    requirement("age", life.age, 15),
    requirement("knowledge", life.stats.knowledge, 40),
    requirement(
      "readiness",
      life.training.magicXp >= 60 || life.expansion.education.assessment >= 60
        ? 1
        : 0,
      1,
    ),
    requirement(
      "funding",
      scholarshipEligible(life)
        ? 10000
        : life.expansion.economy.familyFunds + life.coins,
      80 + 232 + travelCost(life),
    ),
  ];
}
export function enrollUniversity(life: ExpandedLife): boolean {
  const x = life.expansion,
    e = x.education;
  if (
    e.stage === "university" ||
    e.stage === "graduated" ||
    educationRequirements(life).some((r) => !r.met)
  )
    return false;
  e.scholarship = scholarshipEligible(life);
  e.budget = 0;
  if (!e.scholarship) {
    const cost = 80 + 232 + travelCost(life);
    const family = Math.min(cost, x.economy.familyFunds);
    x.economy.familyFunds -= family;
    life.coins -= cost - family;
    e.budget = 232;
  }
  e.stage = "university";
  e.successfulYears = 0;
  e.probation = false;
  e.previousKnowledge = life.stats.knowledge;
  e.previousXp = life.training.magicXp;
  x.economy.travelUntil = x.birthYear + life.age;
  x.origin.locality = "university";
  life.region = "ranoa";
  x.career.role = "student";
  life.career = "student";
  life.progression = getProgression(life);
  fact(life, "education", e.scholarship ? "scholarship" : "enrolled");
  return true;
}
export function applyEducationYear(life: ExpandedLife) {
  const e = life.expansion.education;
  if (e.stage !== "university") return;
  const successful =
    ["study", "magic"].includes(life.focus) &&
    (life.training.magicXp - e.previousXp >= 12 ||
      life.stats.knowledge - e.previousKnowledge >= 3);
  e.previousXp = life.training.magicXp;
  e.previousKnowledge = life.stats.knowledge;
  if (successful) {
    e.successfulYears++;
    e.probation = false;
    if (e.successfulYears >= 4) {
      e.stage = "graduated";
      e.scholarship = false;
      fact(life, "education", "graduated");
    }
  } else if (e.probation) {
    e.stage = "withdrawn";
    e.scholarship = false;
    fact(life, "education", "withdrawn");
  } else {
    e.probation = true;
    fact(life, "education", "probation");
  }
}

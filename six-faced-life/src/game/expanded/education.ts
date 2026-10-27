import {
  quoteEducation,
  reserveEducation,
  consumeEducation,
  refundEducation,
  type EducationQuote,
} from "./education-finance";
import type { ExpandedLife } from "../types";
import { ensureEducationAccess } from "./education-access-state";
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
export function universityQuote(life: ExpandedLife): EducationQuote {
  const scholarship = scholarshipEligible(life);
  return quoteEducation(life, {
    purpose: "university",
    admission: scholarship ? 0 : 80,
    travel: scholarship ? 0 : travelCost(life),
    tuition: scholarship ? 0 : 160,
    living: scholarship ? 0 : 72,
    starterFee: 0,
    remainingUnits: 0,
    school: null,
  });
}
export function enrollUniversity(
  life: ExpandedLife,
  funding?: { quote: EducationQuote; borrow: boolean },
): boolean {
  const x = life.expansion,
    e = x.education;
  if (
    life.phase !== "alive" ||
    x.training?.active ||
    ["university", "graduated"].includes(e.stage) ||
    educationRequirements(life).some((r) => r.id !== "funding" && !r.met)
  )
    return false;
  const quote = universityQuote(life),
    q = funding?.quote ?? quote;
  if (
    Object.keys(quote).some(
      (k) => quote[k as keyof EducationQuote] !== q[k as keyof EducationQuote],
    )
  )
    return false;
  const scholarship = scholarshipEligible(life);
  if (!scholarship && !reserveEducation(life, q, funding?.borrow ?? false))
    return false;
  if (!scholarship)
    consumeEducation(life, "university", quote.admission + quote.travel);
  e.scholarship = scholarship;
  e.budget = scholarship ? 0 : 232;
  e.stage = "university";
  ensureEducationAccess(life).finance.pauseReason = "university";
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
  fact(life, "education", scholarship ? "scholarship" : "enrolled");
  return true;
}
export function applyEducationYear(life: ExpandedLife) {
  const e = life.expansion.education;
  if (e.stage !== "university") return;
  const successful =
    ["study", "magic"].includes(life.focus) &&
    (life.training.magicXp - e.previousXp >= 9 ||
      life.stats.knowledge - e.previousKnowledge >= 3 ||
      (life.focus === "study" &&
        life.stats.knowledge === 100 &&
        e.previousKnowledge >= 97));
  e.previousXp = life.training.magicXp;
  e.previousKnowledge = life.stats.knowledge;
  if (successful) {
    e.successfulYears++;
    e.probation = false;
    if (e.successfulYears >= 4) {
      e.stage = "graduated";
      e.scholarship = false;
      if (life.expansion.finance?.purposes.university)
        refundEducation(life, "university");
      fact(life, "education", "graduated");
    }
  } else if (e.probation) {
    e.stage = "withdrawn";
    e.scholarship = false;
    if (life.expansion.finance?.purposes.university)
      refundEducation(life, "university");
    fact(life, "education", "withdrawn");
  } else {
    e.probation = true;
    fact(life, "education", "probation");
  }
}

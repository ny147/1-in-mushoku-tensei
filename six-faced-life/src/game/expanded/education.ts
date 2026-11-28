import {
  quoteEducation,
  reserveEducation,
  consumeEducation,
  refundEducation,
  type EducationQuote,
} from "./education-finance";
import { sameHouseSponsorship } from "./house-sponsorship";
import type { ExpandedLife, RegionId } from "../types";
import { ensureEducationAccess } from "./education-access-state";
import { fact, worldYear } from "./facts";
import { canRelocate, inCustody } from "./succession-restrictions";
import { clamp } from "./random";
import { getProgression } from "../progression";
import { syncCareerNode } from './career-paths';
import { earnedRikarisuFare } from "./rikarisu-passage";
import { DEMON_CONTINENT_FARE } from "./balance";
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
export const UNIVERSITY_KNOWLEDGE = 40;
export const SCHOLARSHIP_SCORE = 60;

export function talentAssessmentScore(life: ExpandedLife) {
  const g = life.expansion.genetics;
  return clamp(
    Math.floor(
      life.stats.knowledge +
        Math.sqrt(life.training.magicXp) * 3 +
        (g.magicTalent || g.academicTalent ? 20 : 0),
    ),
  );
}

export function assessTalent(life: ExpandedLife) {
  const e = life.expansion.education;
  e.assessed = true;
  e.assessment = talentAssessmentScore(life);
  fact(life, "education", "assessment", "", e.assessment);
}
export function moveByOrdinaryTravel(life: ExpandedLife, destination: RegionId) {
  life.region = destination;
  life.expansion.origin.locality = destination === "asura" ? "countryside" : "settlement";
  life.expansion.economy.travelUntil = worldYear(life) + 1;
  fact(life, "history", "migration", destination);
}

export function travelCost(life: ExpandedLife) {
  return life.region === "demon" ? DEMON_CONTINENT_FARE : life.region === "begaritt" ? 90 : 40;
}
function universityTravelCost(life: ExpandedLife) {
  return earnedRikarisuFare(life) ? 0 : travelCost(life);
}
export function scholarshipEligible(life: ExpandedLife) {
  const x = life.expansion;
  return (
    x.education.assessed &&
    x.education.assessment >= SCHOLARSHIP_SCORE &&
    (x.genetics.magicTalent || x.genetics.academicTalent || x.beastfolkMentor?.completed === "letter")
  );
}
export function educationRequirements(life: ExpandedLife): Requirement[] {
  return [
    requirement("age", life.age, 15),
    requirement("knowledge", life.stats.knowledge, UNIVERSITY_KNOWLEDGE),
    requirement(
      "readiness",
      life.training.magicXp >= 60 || life.expansion.education.assessment >= SCHOLARSHIP_SCORE
        ? 1
        : 0,
      1,
    ),
    requirement(
      "funding",
      scholarshipEligible(life)
        ? 10000
        : life.expansion.economy.familyFunds + life.coins,
      80 + 232 + universityTravelCost(life),
    ),
  ];
}
export function universityQuote(life: ExpandedLife, useSponsor = false): EducationQuote {
  const scholarship = scholarshipEligible(life);
  return quoteEducation(life, {
    purpose: "university",
    admission: scholarship ? 0 : 80,
    travel: scholarship ? 0 : universityTravelCost(life),
    tuition: scholarship ? 0 : 160,
    living: scholarship ? 0 : 72,
    starterFee: 0,
    remainingUnits: 0,
    school: null,
  }, useSponsor);
}
export function canEnrollUniversity(life: ExpandedLife): boolean {
  return life.phase === "alive" && canRelocate(life, "ranoa") &&
    !life.expansion.training?.active &&
    !["university", "graduated"].includes(life.expansion.education.stage) &&
    educationRequirements(life).every((r) => r.id === "funding" || r.met);
}
export function enrollUniversity(
  life: ExpandedLife,
  funding?: { quote: EducationQuote; borrow: boolean },
): boolean {
  const x = life.expansion,
    e = x.education;
  if (!canEnrollUniversity(life)) return false;
  const quote = universityQuote(life, !!funding?.quote.sponsor),
    q = funding?.quote ?? quote;
  if (
    !sameHouseSponsorship(quote.sponsor, q.sponsor) ||
    Object.keys(quote).some(
      (k) => k !== "sponsor" && quote[k as keyof EducationQuote] !== q[k as keyof EducationQuote],
    )
  )
    return false;
  const scholarship = scholarshipEligible(life);
  if (!scholarship && !reserveEducation(life, q, funding?.borrow ?? false))
    return false;
  if (!scholarship) {
    consumeEducation(life, "university", quote.admission + quote.travel);
    const passage = earnedRikarisuFare(life);
    if (passage) passage.settlement = "used";
  }
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
  syncCareerNode(life);
  life.career = "student";
  life.progression = getProgression(life);
  fact(life, "education", scholarship ? "scholarship" : "enrolled");
  return true;
}
export function applyEducationYear(life: ExpandedLife) {
  const e = life.expansion.education;
  if (e.stage !== "university" || inCustody(life)) return;
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

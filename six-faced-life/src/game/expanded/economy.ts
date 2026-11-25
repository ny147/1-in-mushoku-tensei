import { consumeEducation } from "./education-finance";
import { ordinaryEntry } from "./career-access";
import type { EducationYear } from "./education-finance";
import type { ExpandedLife } from "../types";
import { inCustody } from "./succession-restrictions";
import { HAZARDS } from "./balance";
import { worldYear, fact } from "./facts";
import { clamp, draw } from "./random";
import { annualIncomeExpanded } from "./careers";
import { isRuler } from "./governance";
import { serviceAssignment, type ServiceAssignment } from "./service-priority";
import { regionalConflict } from "./history";
import { houseProtectionActive } from "./house-service";
import { royalMarriageProtection } from "./royal-marriage";
import { applyHouseholdDebtYear, housingSurcharge, debtServiceYear, type DebtServiceYear } from "./parental-debt";
export interface Risk {
  cause: string;
  chance: number;
}
export interface EconomyYear extends EducationYear {
  additionalShelterCosts: number;
}
export function applyEconomyYear(life: ExpandedLife, service: DebtServiceYear = debtServiceYear(life, worldYear(life)), assignment: ServiceAssignment = serviceAssignment(life)): EconomyYear {
  const x = life.expansion,
    e = x.economy,
    year = worldYear(life);
  const children = x.family.people.filter(
    (p) => p.role === "child" && p.died === null && year - p.born < 18,
  ).length;
  const spouses = x.family.marriages.filter((m) => m.end === null).length;
  const dependantCosts = children * 4 + spouses * 6;
  if (inCustody(life)) {
    const custody = x.succession!.restrictions.custody!;
    if (custody.lastSettlement < year && year <= custody.releaseYear) {
      const paid = Math.min(life.coins, dependantCosts);
      life.coins -= paid;
      custody.unmetDependants += dependantCosts - paid;
      custody.lastSettlement = year;
      e.lastIncome = 0;
      e.lastExpenses = paid;
      e.unmetFood = e.unmetShelter = e.unmetCare = 0;
      if (x.finance) {
        x.finance.lastYear = year;
        x.finance.lastRepayment = 0;
        x.finance.pauseReason = "hardship";
      }
      if (x.social?.debt) {
        x.social.debt.lastRepaymentYear = year;
        x.social.debt.lastRepayment = 0;
        x.social.debt.pauseReason = "hardship";
      }
      if (paid < dependantCosts) fact(life, "need", "custody-dependants", String(year), dependantCosts - paid);
    }
    return {worldYear: year, creditorService:false, additionalShelterCosts:0, earnedIncome:0,
      necessaryEducationCosts:0, dependantCosts, universityAttendance:false, unmetNeeds:e.lastExpenses < dependantCosts};
  }
  const income = annualIncomeExpanded(life, service.eligible, assignment);
  const householdDeduction = applyHouseholdDebtYear(life);
  const additionalShelterCosts = housingSurcharge(life, year);
  const attending = x.education.stage === "university" && !isRuler(life);
  const tuition = attending && !x.education.scholarship ? 40 : 0;
  const extras =
    children * 4 + spouses * 6 + (life.focus === "explore" ? 4 : 0) + tuition;
  let resources =
    (life.age < 15 ? e.support - householdDeduction : life.coins + income) +
    (year <= e.aidUntil ? 12 : 0);
  if (service.eligible) resources += service.support;
  // Scholarships pay actual necessities, never deposit an allowance in the purse.
  if (attending && x.education.scholarship)
    resources += 18;
  let prepaidTuition = 0;
  if (attending && !x.education.scholarship) {
    let grant = Math.min(58, x.education.budget);
    if (
      x.finance?.purposes.university &&
      !consumeEducation(life, "university", grant, year, Math.min(tuition, grant))
    )
      grant = 0;
    // A sponsored enrollment's tuition is paid before the living allowance enters the purse.
    if (x.house?.sponsorship?.status === "studying" && x.house.sponsorship.purpose === "university")
      prepaidTuition = Math.min(tuition, grant);
    resources += grant - prepaidTuition;
    x.education.budget -= grant;
  }
  const use = (cost: number) => {
    const paid = Math.min(resources, cost);
    resources -= paid;
    return cost - paid;
  };
  e.unmetFood = use(8);
  e.unmetShelter = use(6 + additionalShelterCosts);
  e.unmetCare = use(4);
  const unmetExtra = use(extras - prepaidTuition);
  e.lastIncome = income;
  e.lastExpenses =
    18 + additionalShelterCosts + extras -
    e.unmetFood - e.unmetShelter - e.unmetCare - unmetExtra;
  if (life.age >= 15) life.coins = clamp(Math.floor(resources), 0, 1_000_000);
  e.peak = Math.max(e.peak, life.coins);
  if (e.unmetFood + e.unmetShelter + e.unmetCare > 0) {
    e.deprivedYears++;
    fact(
      life,
      "need",
      "deprivation",
      "",
      e.unmetFood + e.unmetShelter + e.unmetCare,
    );
  }
  const t = x.training,
    course = t?.active ? ordinaryEntry(t.active) : null;
  const trainingCost =
    course && t && !t.paused && course.tuition
      ? Math.min(
          course.units - t.records[t.active!].units,
          t.mode === "full-time" ? 2 : 1,
        ) * 4
      : 0;
  return {
    worldYear: year,
    creditorService: service.eligible,
    additionalShelterCosts,
    earnedIncome: income,
    necessaryEducationCosts: tuition + trainingCost,
    dependantCosts: children * 4 + spouses * 6,
    universityAttendance: attending,
    unmetNeeds: e.unmetFood + e.unmetShelter + e.unmetCare + unmetExtra > 0,
  };
}
export function survivalRisks(life: ExpandedLife, assignment: ServiceAssignment = serviceAssignment(life)): Risk[] {
  const e = life.expansion.economy,
    year = worldYear(life);
  const persecution =
    life.race === "superd" && life.age < 15 ? HAZARDS.persecution : 0;
  const conflict = regionalConflict(
    life.expansion.worldSeed,
    life.region,
    year,
  );
  const violence =
    persecution +
    (year <= life.expansion.politics.pursuitUntil ? 0.02 : 0) +
    (conflict ? [0, 0.005, 0.02, 0.06][conflict.severity] : 0);
  return [
    { cause: "malnutrition", chance: (HAZARDS.malnutrition * e.unmetFood) / 8 },
    {
      cause: "illness",
      chance:
        (HAZARDS.illness +
          (HAZARDS.unmetCare * e.unmetCare) / 4 +
          (HAZARDS.unmetShelter * e.unmetShelter) / 6) *
        (life.stats.health < 35 ? 2 : 1) *
        (life.focus === "rest" ? 0.7 : 1),
    },
    { cause: "unsafe-work", chance: e.unsafeWork && !inCustody(life) && !isRuler(life) &&
        (assignment === null || assignment === "creditor") ? HAZARDS.unsafe : 0 },
    {
      cause: "violence",
      chance: violence * (year <= e.protectionUntil || houseProtectionActive(life) || royalMarriageProtection(life) ? 0.5 : 1),
    },
    { cause: "travel", chance: !inCustody(life) && year <= e.travelUntil ? HAZARDS.travel : 0 },
  ];
}
export function checkSurvival(life: ExpandedLife, assignment: ServiceAssignment = serviceAssignment(life)): string | null {
  for (const risk of survivalRisks(life, assignment))
    if (draw(life) < clamp(risk.chance, 0, 0.9)) return risk.cause;
  return life.age >= life.deathAge
    ? "aging"
    : life.stats.health <= 0
      ? "illness"
      : null;
}
export function materialNeeds(life: ExpandedLife): string[] {
  const e = life.expansion.economy;
  return [
    ...(e.unmetFood > 0 ? ["food"] : []),
    ...(e.unmetShelter > 0 ? ["shelter"] : []),
    ...(e.unmetCare > 0 ? ["care"] : []),
  ];
}

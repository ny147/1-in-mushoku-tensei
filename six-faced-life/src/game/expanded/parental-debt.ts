import type { ExpandedLife } from "../types";
import { PARENTAL_DEBT } from "./balance";
import { worldYear } from "./facts";

/** Returns support withheld this year; the child's purse and reserves are separate. */
export function applyHouseholdDebtYear(life: ExpandedLife): number {
  const s = life.expansion.social,
    d = s?.debt,
    year = worldYear(life);
  if (
    life.phase !== "alive" ||
    life.age < 1 || life.age >= PARENTAL_DEBT.personalAge ||
    !s || !d || d.status !== "household" ||
    d.decisionYear !== null || d.balance <= 0 || d.lastChildhoodYear >= year
  ) return 0;
  // A paused annual attempt is recorded too: restoration cannot replay the year.
  d.lastChildhoodYear = year;
  const localParent = life.expansion.family.people.some(p =>
    p.role === "parent" && s.household.parentIds.includes(p.id) &&
    p.died === null && p.home === s.household.home,
  );
  if (!localParent) return 0;
  const paid = Math.min(
    d.balance,
    PARENTAL_DEBT.childhoodPayment,
    Math.max(0, life.expansion.economy.support - PARENTAL_DEBT.childhoodSupportFloor),
  );
  d.balance -= paid;
  d.childhoodPaid += paid;
  if (d.balance === 0) d.status = "settled";
  return paid;
}

/** The historical security loss remains after this bounded local cost expires. */
export function housingSurcharge(life: ExpandedLife, year: number): number {
  const h = life.expansion.social?.household;
  if (
    !h || h.housing !== "security-lost" || h.housingLossYear === null ||
    life.region !== h.home || year <= h.housingLossYear ||
    year > h.housingLossYear + PARENTAL_DEBT.refusalHousingYears
  ) return 0;
  return PARENTAL_DEBT.refusalHousingCost;
}

/** Scheduling remains manual and independent of whether parents survived. */
export function parentalResponsibilityDue(life: ExpandedLife): boolean {
  const d = life.expansion.social?.debt;
  return life.phase === "alive" && life.age >= PARENTAL_DEBT.personalAge &&
    !!d && d.status === "household" && d.balance > 0 && d.decisionYear === null;
}

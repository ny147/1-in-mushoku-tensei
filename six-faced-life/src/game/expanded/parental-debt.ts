import type { ExpandedLife, RegionId } from "../types";
import { PARENTAL_DEBT } from "./balance";
import { worldYear } from "./facts";
import { appoint } from "./careers";
import { clamp } from "./random";

/** Only this voluntary transition turns household liability into personal debt. */
export function acceptParentalDebt(life: ExpandedLife, route: "instalments" | "service" | "refuse"): boolean {
  if (!["instalments", "service", "refuse"].includes(route) || !parentalResponsibilityDue(life)) return false;
  const social = life.expansion.social!, debt = social.debt!, year = worldYear(life);
  if (debt.service !== null) return false;
  const quote = route === "service" ? quoteDebtService(life) : null;
  if (route === "service" && !quote) return false;
  debt.decisionYear = year;
  debt.status = route === "instalments" ? "accepted" : route === "service" ? "service" : "refused";
  debt.pauseReason = route === "service" ? "service" : "none";
  if (route === "refuse") {
    const h = social.household;
    h.housing = "security-lost"; h.housingLossYear = year;
    h.affectedParentIds = life.expansion.family.people.filter(p =>
      p.role === "parent" && h.parentIds.includes(p.id) && p.died === null && p.home === h.home,
    ).map(p => p.id);
    if (h.affectedParentIds.length) {
      h.relationship = PARENTAL_DEBT.refusalRelationship;
      life.stats.bonds = clamp(life.stats.bonds - PARENTAL_DEBT.refusalBonds);
    }
  } else if (quote) {
    debt.service = {acceptedBalance: quote.balance, region: quote.region, startedYear: year,
      requiredYears: quote.requiredYears, completedYears: 0, lastYear: year, lastCreditYear: null,
      endedYear: null, endReason: null};
    // Existing study is retained even if it currently prevents appointment/service.
    if (life.expansion.career.role !== "laborer") appoint(life, "laborer");
  }
  return true;
}

export function exitDebtService(life: ExpandedLife): boolean {
  const debt = life.expansion.social?.debt, service = debt?.service;
  if (life.phase !== "alive" || life.age < PARENTAL_DEBT.personalAge || !debt || debt.status !== "service" || debt.balance <= 0 || !service || service.endedYear !== null) return false;
  debt.status = "accepted"; debt.pauseReason = "none";
  service.endedYear = worldYear(life); service.endReason = "exit";
  return true;
}

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

export interface DebtServiceQuote {
  balance: number;
  region: RegionId;
  requiredYears: number;
  annualCredit: 12;
}
export interface DebtServiceYear {
  year: number;
  eligible: boolean;
  support: number;
  credit: number;
  pauseReason: "none" | "health" | "study" | "region" | "occupation" | "not-started" | "ended";
}
export function quoteDebtService(life: ExpandedLife): DebtServiceQuote | null {
  const s = life.expansion.social, d = s?.debt;
  if (life.phase !== "alive" || life.age < PARENTAL_DEBT.personalAge || !s || !d || d.balance <= 0 || ["refused", "closed", "settled"].includes(d.status)) return null;
  return { balance: d.balance, region: s.household.home, requiredYears: Math.ceil(d.balance / PARENTAL_DEBT.annualServiceCredit), annualCredit: PARENTAL_DEBT.annualServiceCredit };
}
/** Quoted in-kind necessities, shared with each eligible year's accounting. */
export function debtServiceSupport(life: ExpandedLife, year: number): number {
  const family = life.expansion.family;
  const dependants = family.people.filter(p => p.role === "child" && p.died === null && year - p.born < 18).length * 4 + family.marriages.filter(m => m.end === null).length * 6;
  return PARENTAL_DEBT.serviceBasicSupport + dependants;
}
/** Read-only snapshot retained throughout the annual accounting cycle. */
export function debtServiceYear(life: ExpandedLife, year: number): DebtServiceYear {
  const x = life.expansion, d = x.social?.debt, s = d?.service;
  let pauseReason: DebtServiceYear["pauseReason"] = "none";
  if (life.phase !== "alive" || !d || !s || d.status !== "service" || s.endedYear !== null) pauseReason = "ended";
  else if (life.age < PARENTAL_DEBT.personalAge || year <= s.startedYear) pauseReason = "not-started";
  else if (life.stats.health < PARENTAL_DEBT.serviceHealth) pauseReason = "health";
  else if (x.education.stage === "university" || x.training?.active && !x.training.paused && x.training.mode === "full-time") pauseReason = "study";
  else if (life.region !== s.region) pauseReason = "region";
  else if (x.career.role !== "laborer") pauseReason = "occupation";
  const eligible = pauseReason === "none";
  return { year, eligible, pauseReason, support: eligible ? debtServiceSupport(life, year) : 0, credit: eligible ? Math.min(PARENTAL_DEBT.annualServiceCredit, d!.balance) : 0 };
}
/** Actual credited labor stays committed through later fitness/job changes or exit. */
export function creditorServiceReplacesWork(life: ExpandedLife, year: number): boolean {
  const service = life.expansion.social?.debt?.service;
  return debtServiceYear(life, year).eligible ||
    service?.lastCreditYear === year ||
    (service?.endReason === "completed" && service.endedYear === year);
}
export function creditDebtServiceYear(life: ExpandedLife, year: DebtServiceYear): void {
  const d = life.expansion.social?.debt, s = d?.service;
  if (life.phase !== "alive" || !d || !s || d.status !== "service" || s.endedYear !== null || year.year !== worldYear(life) || year.year <= s.startedYear || year.year <= s.lastYear) return;
  s.lastYear = year.year;
  if (!year.eligible) return;
  const credit = Math.min(d.balance, year.credit, PARENTAL_DEBT.annualServiceCredit);
  d.balance -= credit; d.servicePaid += credit; s.completedYears++;
  s.lastCreditYear = year.year;
  // This year's labor is already committed, including after a subsequent exit.
  if (life.expansion.careerPaths)
    life.expansion.careerPaths.lastProjectYear = Math.max(life.expansion.careerPaths.lastProjectYear, year.year);
  if (d.balance === 0) {
    d.status = "settled"; d.pauseReason = "none";
    s.endedYear = year.year; s.endReason = "completed";
  }
}
/** Neither household liability nor accepted personal debt transfers to descendants. */
export function closeParentalDebt(life: ExpandedLife): void {
  const d = life.expansion.social?.debt;
  if (!d || d.status === "closed") return;
  if (d.service && d.service.endedYear === null) {
    d.service.endedYear = worldYear(life); d.service.endReason = "death";
  }
  if (d.balance > 0) { d.closedUnpaid += d.balance; d.balance = 0; d.status = "closed"; }
  d.pauseReason = "ended";
}

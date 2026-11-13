import type { ExpandedLife } from "../types";
import { ensureEducationAccess } from "./education-access-state";
import { allocateEducationRepayment, repayEducationYear, type EducationYear } from "./education-finance";

/** One cap shared by consumed education principal and voluntarily accepted debt. */
export function repayDebtsYear(life: ExpandedLife, year: EducationYear): void {
  if (!life.expansion.social) return repayEducationYear(life, year);
  const f = ensureEducationAccess(life).finance, d = life.expansion.social.debt;
  // If either creditor already processed this year, never mint another allowance.
  const processed = f.lastYear >= year.worldYear || !!d && d.lastRepaymentYear >= year.worldYear;
  if (f.lastYear < year.worldYear) { f.lastYear = year.worldYear; f.lastRepayment = 0; }
  if (d && d.lastRepaymentYear < year.worldYear) { d.lastRepaymentYear = year.worldYear; d.lastRepayment = 0; }
  if (processed) return;
  const surplus = Math.max(0, Math.floor(year.earnedIncome - 18 - year.dependantCosts - year.necessaryEducationCosts - (year.additionalShelterCosts ?? 0)));
  const reason = life.phase === "ended" ? "ended" : year.creditorService || d?.status === "service" ? "service" : year.universityAttendance ? "university" : year.unmetNeeds ? "hardship" : surplus > 0 ? "none" : "no-surplus";
  // Education's historical enum has no service reason: zero earned surplus explains it.
  f.pauseReason = reason === "service" ? "no-surplus" : reason;
  if (d) d.pauseReason = reason;
  if (reason !== "none") return;
  let budget = Math.min(life.coins, surplus, Math.max(1, Math.floor(surplus * 0.1)));
  budget -= allocateEducationRepayment(life, budget);
  if (!d || d.status !== "accepted" || d.decisionYear === null || life.age < 15) return;
  const paid = Math.min(budget, d.balance);
  life.coins -= paid; d.balance -= paid; d.personalPaid += paid; d.lastRepayment = paid;
  if (d.balance === 0) d.status = "settled";
}

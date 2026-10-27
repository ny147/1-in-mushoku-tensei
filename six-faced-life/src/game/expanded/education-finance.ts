import type { ExpandedLife, MagicSchool } from "../types";
import { ORDINARY_ROLES, isOrdinaryRole, type EducationPurpose, type FundingRecord } from "./career-access";
import { ensureEducationAccess } from "./education-access-state";
export interface EducationCost {
  purpose: EducationPurpose; admission: number; travel: number; tuition: number; living: number; starterFee: number;
  remainingUnits: number; school: MagicSchool | null;
}
export interface EducationQuote extends EducationCost { total: number; family: number; personal: number; loan: number }
export interface EducationYear { worldYear: number; earnedIncome: number; necessaryEducationCosts: number; dependantCosts: number; universityAttendance: boolean; unmetNeeds: boolean }
const components = ["admission", "travel", "tuition", "living", "starterFee"] as const;
export const reservedTotal = (r?: FundingRecord) => r ? r.reserved.family + r.reserved.personal + r.reserved.loan : 0;
export function quoteEducation(l: ExpandedLife, cost: EducationCost): EducationQuote {
  const total = components.reduce((s,k)=>s+cost[k],0);
  const family = Math.min(total, Math.floor(l.expansion.economy.familyFunds));
  const personal = Math.min(total-family, Math.floor(l.coins));
  return { ...cost, total, family, personal, loan: total-family-personal };
}
export function reserveEducation(l: ExpandedLife, q: EducationQuote, borrow: boolean): boolean {
  if (l.phase !== "alive" || !(isOrdinaryRole(q.purpose) || q.purpose === "university") ||
    components.some(k=>!Number.isSafeInteger(q[k]) || q[k]<0) || q.total > 1_000_000 ||
    (!borrow && q.loan>0)) return false;
  const current=quoteEducation(l,q);
  if ([...components,"total","family","personal","loan"].some(k=>current[k as keyof EducationQuote]!==q[k as keyof EducationQuote])) return false;
  const prior=l.expansion.finance?.purposes[q.purpose];
  if (reservedTotal(prior)>0 || (prior?.borrowed ?? 0)+q.loan>1_000_000) return false;
  const {finance}=ensureEducationAccess(l);
  const r=prior ?? { borrowed:0,repaid:0,cancelled:0,balance:0,closedUnpaid:0,reserved:{family:0,personal:0,loan:0} };
  l.expansion.economy.familyFunds-=q.family;l.coins-=q.personal;
  r.borrowed+=q.loan;r.balance+=q.loan;r.reserved={family:q.family,personal:q.personal,loan:q.loan};finance.purposes[q.purpose]=r;
  return true;
}
export function consumeEducation(l: ExpandedLife, purpose: EducationPurpose, amount: number, annualYear?: number): boolean {
  const f=l.expansion.finance,r=f?.purposes[purpose];
  if (!f || !r || !Number.isSafeInteger(amount) || amount<0 || reservedTotal(r)<amount || (annualYear!==undefined && f.lastConsumptionYear>=annualYear)) return false;
  let remaining=amount;
  for (const source of ["family","personal","loan"] as const) { const paid=Math.min(remaining,r.reserved[source]);r.reserved[source]-=paid;remaining-=paid; }
  if (annualYear!==undefined) f.lastConsumptionYear=annualYear;
  return true;
}
export function refundEducation(l: ExpandedLife, purpose: EducationPurpose): void {
  const r=l.expansion.finance?.purposes[purpose];if (!r) return;
  r.balance-=r.reserved.loan;r.cancelled+=r.reserved.loan;
  l.coins=Math.min(1_000_000,l.coins+r.reserved.personal);
  l.expansion.economy.familyFunds=Math.min(1_000_000,l.expansion.economy.familyFunds+r.reserved.family);
  l.expansion.economy.peak=Math.max(l.expansion.economy.peak,l.coins);
  r.reserved={family:0,personal:0,loan:0};
  if (purpose==="university") l.expansion.education.budget=0;
}
export function repayEducationYear(l: ExpandedLife, y: EducationYear): void {
  const {finance:f}=ensureEducationAccess(l);if (f.lastYear>=y.worldYear) return;
  f.lastYear=y.worldYear;f.lastRepayment=0;
  if (y.universityAttendance || y.unmetNeeds) { f.pauseReason=y.universityAttendance?"university":"hardship";return; }
  const surplus=Math.max(0,Math.floor(y.earnedIncome-18-y.dependantCosts-y.necessaryEducationCosts));
  let budget=Math.min(l.coins,surplus,surplus>0?Math.max(1,Math.floor(surplus*.1)):0);
  for (const purpose of [...ORDINARY_ROLES,"university"] as const) {
    const r=f.purposes[purpose];if (!r) continue;
    const payment=Math.min(budget, r.balance-r.reserved.loan);
    r.balance-=payment;r.repaid+=payment;budget-=payment;l.coins-=payment;f.lastRepayment+=payment;
  }
  f.pauseReason=surplus>0?"none":"no-surplus";
}
export function closeEducationDebt(l: ExpandedLife): void {
  const f=l.expansion.finance;if (!f) return;
  for (const r of Object.values(f.purposes)) {
    r.cancelled+=r.reserved.loan;r.balance-=r.reserved.loan;r.closedUnpaid+=r.balance;r.balance=0;
    r.reserved={family:0,personal:0,loan:0};
  }
  f.pauseReason="ended";f.lastRepayment=0;
  if (f.purposes.university) l.expansion.education.budget=0;
  if (l.expansion.training) { l.expansion.training.active=null;l.expansion.training.selection=null; }
}

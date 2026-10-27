import type { ExpandedLife } from "../types";
import { ORDINARY_ROLES, isOrdinaryRole, ordinaryEntry, type TrainingState, type EducationFinance } from "./career-access";
export function emptyTraining(birthYear: number): TrainingState {
  return { version: 1, active: null, mode: "full-time", paused: false, selection: null, lastYear: birthYear - 1,
    records: Object.fromEntries(ORDINARY_ROLES.map(role => [role, { units: 0, school: null, completedYear: null, placementAccepted: false }])) as TrainingState["records"] };
}
export function emptyFinance(birthYear: number): EducationFinance {
  return { version: 1, lastYear: birthYear - 1, lastConsumptionYear: birthYear - 1, lastRepayment: 0, pauseReason: "no-surplus", purposes: {} };
}
export function ensureEducationAccess(l: ExpandedLife) {
  l.expansion.training ??= emptyTraining(l.expansion.birthYear);
  l.expansion.finance ??= emptyFinance(l.expansion.birthYear);
  return { training: l.expansion.training, finance: l.expansion.finance };
}
export function migrateEducationAccess(l: ExpandedLife): ExpandedLife {
  if (l.expansion.training && l.expansion.finance) return l;
  const next = structuredClone(l); ensureEducationAccess(next); return next;
}
const obj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);
const int = (v: unknown, max = 1_000_000, min = 0): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= min && v <= max;
const schools = ["water", "fire", "earth", "wind", "healing"];
export function validateEducationAccess(x: Record<string, unknown>, year: number, phase: unknown): boolean {
  const born = x.birthYear as number, t = x.training, f = x.finance;
  const validYear = (v: unknown) => int(v, year, born - 1);
  if (t !== undefined) {
    if (!obj(t) || t.version !== 1 || !validYear(t.lastYear) || typeof t.paused !== "boolean" || !["full-time", "part-time"].includes(String(t.mode)) ||
      !(t.active === null || isOrdinaryRole(t.active)) || !obj(t.records) || Object.keys(t.records).length !== 10 ||
      !(t.selection === null || (obj(t.selection) && isOrdinaryRole(t.selection.role) && ["full-time", "part-time"].includes(String(t.selection.mode))))) return false;
    for (const role of ORDINARY_ROLES) {
      const r = t.records[role];
      if (!Object.hasOwn(t.records, role) || !obj(r) || !int(r.units, ordinaryEntry(role).units) || typeof r.placementAccepted !== "boolean" ||
        !(r.school === null || schools.includes(String(r.school))) ||
        !(r.completedYear === null || int(r.completedYear, year, born + 15)) ||
        (r.completedYear !== null) !== (r.units === ordinaryEntry(role).units) ||
        (r.placementAccepted && r.completedYear === null) ||
        (r.units > 0 && ["mage", "healer", "cleric"].includes(role) && r.school === null) ||
        (["healer", "cleric"].includes(role) && r.school !== null && r.school !== "healing") ||
        (!["mage", "healer", "cleric"].includes(role) && r.school !== null)) return false;
    }
    if (t.active !== null && (phase === "ended" || (obj(x.education) && x.education.stage === "university") ||
      (t.records[t.active as string] as Record<string, unknown>).completedYear !== null)) return false;
  }
  if (f !== undefined) {
    if (!obj(f) || f.version !== 1 || !validYear(f.lastYear) || !validYear(f.lastConsumptionYear) || !int(f.lastRepayment) ||
      !["none", "no-surplus", "university", "hardship", "ended"].includes(String(f.pauseReason)) || !obj(f.purposes) || Object.keys(f.purposes).length > 11) return false;
    for (const [purpose, r] of Object.entries(f.purposes)) {
      if (!(isOrdinaryRole(purpose) || purpose === "university") || !obj(r) ||
        !["borrowed", "repaid", "cancelled", "balance", "closedUnpaid"].every(k => int(r[k])) || !obj(r.reserved) ||
        !["family", "personal", "loan"].every(k => int((r.reserved as Record<string, unknown>)[k]))) return false;
      const { borrowed, repaid, cancelled, balance, closedUnpaid } = r as unknown as import("./career-access").FundingRecord;
      if (borrowed !== repaid + cancelled + balance + closedUnpaid || (r.reserved.loan as number) > balance || (phase === "ended" && balance !== 0)) return false;
      if (purpose === "university" && obj(x.education) && x.education.budget !== Object.values(r.reserved).reduce<number>((sum, v) => sum + Number(v), 0)) return false;
    }
  }
  return true;
}

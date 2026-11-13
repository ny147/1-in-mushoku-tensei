import type { ExpandedLife } from "../types";
import type { SocialState } from "./social-state";
import { PARENTAL_DEBT } from "./balance";

const obj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const int = (v: unknown, lo = 0, hi = 1_000_000): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= lo && v <= hi;
const one = (v: unknown, values: readonly unknown[]) => values.includes(v);
const exact = (v: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(v).length === keys.length &&
  keys.every((k) => Object.hasOwn(v, k));
const regions = ["asura", "ranoa", "millis", "forest", "demon", "begaritt"];
const ids = (v: unknown): v is string[] =>
  Array.isArray(v) &&
  v.length <= 2 &&
  v.every((id) => typeof id === "string" && id.length > 0 && id.length <= 80) &&
  new Set(v).size === v.length;

/** Called only after the full life/family shape has passed structural validation. */
export function validateSocialState(
  value: unknown,
  life: ExpandedLife,
): boolean {
  if (value === undefined) return true;
  if (
    !obj(value) ||
    !exact(value, [
      "version",
      "source",
      "activatedYear",
      "royalHouse",
      "association",
      "household",
      "debt",
    ]) ||
    value.version !== 1
  )
    return false;
  const born = life.expansion.birthYear,
    year = born + life.age;
  if (
    !one(value.source, ["new-birth", "migrated"]) ||
    !int(value.activatedYear, born, year) ||
    !one(value.royalHouse, [null, "asura"])
  )
    return false;
  const s = value as unknown as SocialState;
  if (s.source === "new-birth" && s.activatedYear !== born) return false;
  if (s.source === "migrated" && (s.royalHouse !== null || s.debt !== null))
    return false;
  if (
    s.royalHouse !== null &&
    (life.birthRegion !== "asura" ||
      life.race !== "human" ||
      life.expansion.origin.status !== "noble")
  )
    return false;
  if (s.association !== null) {
    const a = s.association;
    if (
      !obj(a) ||
      !exact(a, ["id", "region", "source", "since"]) ||
      !one(a.source, ["birth", "earned", "inherited-record"]) ||
      !(a.since === null || int(a.since, born, year))
    )
      return false;
    const expected = {
      "asura-local": "asura",
      "ranoa-local": "ranoa",
      "millis-local": "millis",
      "asura-royal": "asura",
    };
    if (
      !Object.hasOwn(expected, a.id) ||
      expected[a.id] !== a.region ||
      (a.id === "asura-royal" && s.royalHouse !== "asura")
    )
      return false;
    if (
      a.source === "birth" &&
      (s.source !== "new-birth" ||
        life.expansion.origin.status !== "noble" ||
        a.since !== born ||
        a.region !== life.birthRegion)
    )
      return false;
  }
  const h = s.household;
  if (
    !obj(h) ||
    !exact(h, [
      "home",
      "parentIds",
      "relationship",
      "housing",
      "affectedParentIds",
      "housingLossYear",
    ]) ||
    !one(h.home, regions) ||
    h.home !== life.birthRegion ||
    !ids(h.parentIds) ||
    !ids(h.affectedParentIds) ||
    !int(h.relationship, 0, 100) ||
    !one(h.housing, ["unrecorded", "secure-tenancy", "security-lost"])
  )
    return false;
  const parents = life.expansion.family.people.filter(
    (p) => p.role === "parent",
  );
  if (
    h.parentIds.some((id) => !parents.some((p) => p.id === id)) ||
    h.affectedParentIds.some((id) => !h.parentIds.includes(id))
  )
    return false;
  if (h.housing === "security-lost") {
    if (!int(h.housingLossYear, born + PARENTAL_DEBT.personalAge, year))
      return false;
    if (
      h.affectedParentIds.some((id) => {
        const p = parents.find((p) => p.id === id)!;
        return p.died !== null && p.died < h.housingLossYear!;
      })
    )
      return false;
  } else if (h.housingLossYear !== null || h.affectedParentIds.length !== 0)
    return false;
  if (s.debt === null) return h.housing === "unrecorded";
  const d = s.debt;
  if (
    s.source !== "new-birth" ||
    life.expansion.origin.wealth !== "poor" ||
    !obj(d) ||
    !exact(d, [
      "creditorId",
      "collateral",
      "initial",
      "balance",
      "childhoodPaid",
      "personalPaid",
      "servicePaid",
      "closedUnpaid",
      "status",
      "decisionYear",
      "lastChildhoodYear",
      "lastRepaymentYear",
      "lastRepayment",
      "pauseReason",
      "service",
    ])
  )
    return false;
  if (
    d.creditorId !== "local-creditor" ||
    d.collateral !== "tenancy-security" ||
    !int(d.initial, 1) ||
    ![
      "balance",
      "childhoodPaid",
      "personalPaid",
      "servicePaid",
      "closedUnpaid",
      "lastRepayment",
    ].every((k) => int(d[k as keyof typeof d])) ||
    !one(d.status, [
      "household",
      "accepted",
      "service",
      "refused",
      "settled",
      "closed",
    ]) ||
    !one(d.pauseReason, [
      "none",
      "no-surplus",
      "hardship",
      "university",
      "service",
      "ended",
    ])
  )
    return false;
  if (
    d.initial !==
      d.balance +
        d.childhoodPaid +
        d.personalPaid +
        d.servicePaid +
        d.closedUnpaid ||
    !int(d.lastChildhoodYear, born - 1, Math.min(year, born + 14)) ||
    !int(d.lastRepaymentYear, born - 1, year) ||
    d.lastRepayment > d.personalPaid ||
    d.childhoodPaid > Math.max(0, d.lastChildhoodYear - born) ||
    d.childhoodPaid > 14
  )
    return false;
  if (!(
    d.decisionYear === null ||
    int(d.decisionYear, born + PARENTAL_DEBT.personalAge, year)
  ))
    return false;
  if (
    d.personalPaid > 0 &&
    (d.decisionYear === null || d.lastRepaymentYear < d.decisionYear)
  )
    return false;
  if (
    d.decisionYear === null &&
    (d.personalPaid !== 0 ||
      d.servicePaid !== 0 ||
      d.service !== null ||
      !one(d.status, ["household", "settled", "closed"]))
  )
    return false;
  if (
    d.status === "household" &&
    (d.decisionYear !== null ||
      d.balance === 0 ||
      d.closedUnpaid !== 0 ||
      d.service !== null)
  )
    return false;
  if (
    one(d.status, ["accepted", "service", "refused"]) &&
    (d.decisionYear === null || d.balance === 0)
  )
    return false;
  if (
    d.status === "refused" &&
    (d.personalPaid !== 0 || d.servicePaid !== 0 || d.service !== null)
  )
    return false;
  if (d.status === "settled" && (d.balance !== 0 || d.closedUnpaid !== 0))
    return false;
  if (
    d.status === "closed"
      ? life.phase !== "ended" || d.balance !== 0 || d.pauseReason !== "ended"
      : d.closedUnpaid !== 0
  )
    return false;
  if (life.phase === "ended" && !one(d.status, ["closed", "settled"]))
    return false;
  if (life.phase !== "ended" && d.pauseReason === "ended") return false;
  if (h.housing === "unrecorded") return false;
  if (h.housing === "security-lost") {
    if (
      !one(d.status, ["refused", "closed"]) ||
      h.housingLossYear !== d.decisionYear ||
      d.personalPaid !== 0 ||
      d.servicePaid !== 0 ||
      d.service !== null
    )
      return false;
  } else if (d.status === "refused") return false;
  if (d.service === null) return d.status !== "service" && d.servicePaid === 0;
  const t = d.service;
  if (
    !obj(t) ||
    !exact(t, [
      "acceptedBalance",
      "region",
      "startedYear",
      "requiredYears",
      "completedYears",
      "lastYear",
      "endedYear",
      "endReason",
    ]) ||
    !int(t.acceptedBalance, 1) ||
    t.acceptedBalance !== d.initial - d.childhoodPaid ||
    t.region !== h.home ||
    !int(t.startedYear, born + PARENTAL_DEBT.personalAge, year) ||
    t.startedYear !== d.decisionYear ||
    !int(t.requiredYears, 1) ||
    t.requiredYears !==
      Math.ceil(t.acceptedBalance / PARENTAL_DEBT.annualServiceCredit) ||
    !int(t.completedYears, 0, t.requiredYears) ||
    !int(t.lastYear, t.startedYear, year) ||
    t.completedYears > t.lastYear - t.startedYear ||
    d.servicePaid !==
      Math.min(
        t.acceptedBalance,
        t.completedYears * PARENTAL_DEBT.annualServiceCredit,
      )
  )
    return false;
  if (t.endedYear === null)
    return (
      t.endReason === null &&
      d.status === "service" &&
      d.personalPaid === 0 &&
      t.completedYears < t.requiredYears
    );
  if (
    !int(t.endedYear, t.startedYear, year) ||
    t.lastYear > t.endedYear ||
    !one(t.endReason, ["completed", "exit", "death"]) ||
    d.status === "service"
  )
    return false;
  if (t.endReason === "completed")
    return (
      d.status === "settled" &&
      t.completedYears === t.requiredYears &&
      d.personalPaid === 0 &&
      d.closedUnpaid === 0 &&
      t.endedYear === t.lastYear
    );
  if (t.completedYears >= t.requiredYears) return false;
  if (t.endReason === "death")
    return (
      life.phase === "ended" && d.status === "closed" && t.endedYear === year
    );
  return one(d.status, ["accepted", "settled", "closed"]);
}

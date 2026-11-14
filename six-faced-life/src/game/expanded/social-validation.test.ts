import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { validateSocialState } from "./social-validation";
import { isLife, loadGame } from "../storage";
import type { SocialState } from "./social-state";

function debtor() {
  for (let seed = 0; seed < 100; seed++) {
    const l = createExpandedLife({ seed });
    if (l.expansion.social?.debt) return l;
  }
  throw Error("expected a poor indebted fixture");
}
function adult() {
  const l = debtor();
  l.phase = "alive";
  l.age = 18;
  l.pending = null;
  return l;
}
function serviceLife() {
  const l = adult(),
    s = l.expansion.social!,
    d = s.debt!,
    born = l.expansion.birthYear;
  Object.assign(d, {
    status: "service",
    decisionYear: born + 15,
    balance: 24,
    servicePaid: 24,
  });
  d.service = {
    acceptedBalance: 48,
    region: s.household.home,
    startedYear: born + 15,
    requiredYears: 4,
    completedYears: 2,
    lastYear: born + 17,
    endedYear: null,
    endReason: null,
  };
  return l;
}
describe("strict social ledger validation", () => {
  it("accepts optional last-credit facts without inventing them in older ledgers", () => {
    const l = serviceLife(), d = l.expansion.social!.debt!, t = d.service!;
    expect(validateSocialState(l.expansion.social, l)).toBe(true);
    expect(Object.hasOwn(t, "lastCreditYear")).toBe(false);
    Object.assign(t, { lastCreditYear: l.expansion.birthYear + 17 });
    expect(validateSocialState(l.expansion.social, l)).toBe(true);
    Object.assign(t, { completedYears: 0, lastYear: t.startedYear, lastCreditYear: null });
    d.balance = 48; d.servicePaid = 0;
    expect(validateSocialState(l.expansion.social, l)).toBe(true);
  });
  it.each([null, undefined, "417", 417.5, -1, 9999])("rejects inconsistent present last-credit value %s", value => {
    const l = serviceLife(); Object.assign(l.expansion.social!.debt!.service!, { lastCreditYear: value });
    expect(validateSocialState(l.expansion.social, l)).toBe(false);
  });
  it("requires a real last credit to follow acceptance and fit completed service years", () => {
    const l = serviceLife(), t = l.expansion.social!.debt!.service!;
    for (const lastCreditYear of [t.startedYear, t.startedYear + 1, t.lastYear + 1]) {
      Object.assign(t, { lastCreditYear });
      expect(validateSocialState(l.expansion.social, l)).toBe(false);
    }
  });
  it("rejects personal payments whose annual guard predates acceptance", () => {
    const l = adult(),
      d = l.expansion.social!.debt!,
      born = l.expansion.birthYear;
    Object.assign(d, {
      status: "accepted",
      decisionYear: born + 15,
      personalPaid: 1,
      balance: 47,
      lastRepayment: 1,
      lastRepaymentYear: born + 14,
    });
    expect(validateSocialState(l.expansion.social, l)).toBe(false);
    d.lastRepaymentYear = born + 16;
    expect(validateSocialState(l.expansion.social, l)).toBe(true);
  });
  it("accepts missing compatibility state and rejects present null", () => {
    const l = adult();
    expect(validateSocialState(undefined, l)).toBe(true);
    expect(validateSocialState(null, l)).toBe(false);
    delete l.expansion.social;
    expect(isLife(l)).toBe(true);
  });
  it.each<[string, (s: any) => void]>([
    ["unknown version", (s) => (s.version = 2)],
    ["unknown key", (s) => (s.forged = true)],
    ["missing required key", (s) => delete s.royalHouse],
    ["unknown source", (s) => (s.source = "old")],
    ["future activation", (s) => (s.activatedYear = 9999)],
    [
      "false migrated ancestry",
      (s) => {
        s.source = "migrated";
        s.royalHouse = "asura";
      },
    ],
    ["invented parent", (s) => (s.household.parentIds = ["nobody"])],
    ["duplicate parent", (s) => (s.household.parentIds = ["mother", "mother"])],
    [
      "invented affected parent",
      (s) => (s.household.affectedParentIds = ["nobody"]),
    ],
    ["bad relationship", (s) => (s.household.relationship = 101)],
    [
      "future loss",
      (s) => {
        s.household.housing = "security-lost";
        s.household.housingLossYear = 9999;
      },
    ],
    [
      "loss without refusal",
      (s) => {
        s.household.housing = "security-lost";
        s.household.housingLossYear = s.activatedYear;
      },
    ],
    ["invalid home", (s) => (s.household.home = "foreign")],
    ["unknown debt key", (s) => (s.debt.forged = true)],
    ["negative balance", (s) => (s.debt.balance = -1)],
    ["fractional balance", (s) => (s.debt.balance = 47.5)],
    ["NaN balance", (s) => (s.debt.balance = NaN)],
    ["inconsistent conservation", (s) => (s.debt.balance = 47)],
    ["unknown creditor", (s) => (s.debt.creditorId = "bank")],
    ["missing collateral", (s) => delete s.debt.collateral],
    ["future guard", (s) => (s.debt.lastRepaymentYear = 9999)],
    [
      "childhood after 14",
      (s) => (s.debt.lastChildhoodYear = s.activatedYear + 15),
    ],
    [
      "household personal payments",
      (s) => {
        s.debt.personalPaid = 1;
        s.debt.balance = 47;
      },
    ],
    [
      "personal decision before 15",
      (s) => {
        s.debt.status = "accepted";
        s.debt.decisionYear = s.activatedYear + 14;
      },
    ],
    [
      "closed live debt",
      (s) => {
        s.debt.status = "closed";
        s.debt.closedUnpaid = 48;
        s.debt.balance = 0;
      },
    ],
    [
      "service without contract",
      (s) => {
        s.debt.status = "service";
        s.debt.decisionYear = s.activatedYear + 15;
      },
    ],
  ])(
    "rejects %s before migration and never rewrites raw storage",
    (_, mutate) => {
      const l = adult();
      mutate(l.expansion.social!);
      expect(validateSocialState(l.expansion.social, l)).toBe(false);
      expect(isLife(l)).toBe(false);
      const raw = JSON.stringify({ version: 1, active: l, archive: [] });
      let writes = 0;
      expect(
        loadGame({
          getItem: () => raw,
          setItem: () => {
            writes++;
          },
        }).error,
      ).toBeTruthy();
      expect(writes).toBe(0);
    },
  );
  it("validates house region and royal eligibility using immutable birth facts", () => {
    const l = adult(),
      s = l.expansion.social!;
    s.royalHouse = "asura";
    expect(validateSocialState(s, l)).toBe(false);
    s.royalHouse = null;
    s.association = {
      id: "asura-local",
      region: "ranoa",
      source: "earned",
      since: l.expansion.birthYear + 16,
    };
    expect(validateSocialState(s, l)).toBe(false);
    s.association = {
      id: "ranoa-local",
      region: "ranoa",
      source: "earned",
      since: null,
    };
    expect(validateSocialState(s, l)).toBe(true);
  });
  it("accepts a recorded refusal after parents later die or leave without personal liability", () => {
    const l = adult(),
      s = l.expansion.social!,
      d = s.debt!,
      year = l.expansion.birthYear + 15;
    Object.assign(d, { status: "refused", decisionYear: year });
    Object.assign(s.household, {
      housing: "security-lost",
      housingLossYear: year,
      relationship: 35,
      affectedParentIds: ["mother"],
    });
    l.expansion.family.people[0].died = year + 1;
    l.expansion.family.people[0].home = "ranoa";
    expect(validateSocialState(s, l)).toBe(true);
  });
  it("accepts elapsed service credit but rejects unearned, future and mismatched terms", () => {
    const l = serviceLife(),
      s = l.expansion.social!;
    expect(validateSocialState(s, l)).toBe(true);
    for (const mutate of [
      (t: SocialState) => {
        t.debt!.service!.completedYears = 4;
      },
      (t: SocialState) => {
        t.debt!.service!.lastYear = l.expansion.birthYear + 19;
      },
      (t: SocialState) => {
        t.debt!.service!.requiredYears = 3;
      },
      (t: SocialState) => {
        t.debt!.service!.acceptedBalance = 34;
      },
      (t: SocialState) => {
        t.debt!.servicePaid = 36;
        t.debt!.balance = 12;
      },
      (t: SocialState) => {
        t.debt!.service!.endedYear = l.expansion.birthYear + 17;
      },
    ]) {
      const bad = structuredClone(s);
      mutate(bad);
      expect(validateSocialState(bad, l)).toBe(false);
    }
  });
  it("requires debt to close at death and preserves completed and exited contracts", () => {
    const l = serviceLife(),
      s = l.expansion.social!,
      d = s.debt!;
    l.phase = "ended";
    expect(validateSocialState(s, l)).toBe(false);
    Object.assign(d, {
      status: "closed",
      closedUnpaid: 24,
      balance: 0,
      pauseReason: "ended",
    });
    Object.assign(d.service!, {
      endedYear: l.expansion.birthYear + 18,
      endReason: "death",
    });
    expect(validateSocialState(s, l)).toBe(true);
    l.phase = "alive";
    Object.assign(d, {
      status: "accepted",
      closedUnpaid: 0,
      balance: 24,
      pauseReason: "none",
    });
    Object.assign(d.service!, { endReason: "exit" });
    expect(validateSocialState(s, l)).toBe(true);
    Object.assign(d, { status: "settled", servicePaid: 48, balance: 0 });
    Object.assign(d.service!, {
      completedYears: 4,
      lastYear: l.expansion.birthYear + 19,
      endedYear: l.expansion.birthYear + 19,
      endReason: "completed",
    });
    l.age = 19;
    expect(validateSocialState(s, l)).toBe(true);
  });
});

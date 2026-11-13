import type { ExpandedLife, RegionId } from "../types";
import { SOCIAL_BIRTH } from "./balance";
import { draw } from "./random";
import { worldYear } from "./facts";

export interface HouseAssociation {
  id: "asura-local" | "ranoa-local" | "millis-local" | "asura-royal";
  region: RegionId;
  source: "birth" | "earned" | "inherited-record";
  since: number | null;
}
export interface HouseholdState {
  home: RegionId;
  parentIds: string[];
  relationship: number;
  housing: "unrecorded" | "secure-tenancy" | "security-lost";
  affectedParentIds: string[];
  housingLossYear: number | null;
}
export interface DebtService {
  acceptedBalance: number;
  region: RegionId;
  startedYear: number;
  requiredYears: number;
  completedYears: number;
  lastYear: number;
  endedYear: number | null;
  endReason: "completed" | "exit" | "death" | null;
}
export interface ParentalDebt {
  creditorId: "local-creditor";
  collateral: "tenancy-security";
  initial: number;
  balance: number;
  childhoodPaid: number;
  personalPaid: number;
  servicePaid: number;
  closedUnpaid: number;
  status:
    "household" | "accepted" | "service" | "refused" | "settled" | "closed";
  decisionYear: number | null;
  lastChildhoodYear: number;
  lastRepaymentYear: number;
  lastRepayment: number;
  pauseReason:
    "none" | "no-surplus" | "hardship" | "university" | "service" | "ended";
  service: DebtService | null;
}
export interface SocialState {
  version: 1;
  source: "new-birth" | "migrated";
  activatedYear: number;
  royalHouse: "asura" | null;
  association: HouseAssociation | null;
  household: HouseholdState;
  debt: ParentalDebt | null;
}

/** Original local contacts, independent of the current legal-status gate. */
export function associationForRegion(
  region: RegionId,
  source: HouseAssociation["source"],
  since: number | null,
  royalHouse: SocialState["royalHouse"] = null,
): HouseAssociation | null {
  if (region !== "asura" && region !== "ranoa" && region !== "millis")
    return null;
  return {
    id:
      region === "asura" && royalHouse === "asura"
        ? "asura-royal"
        : `${region}-local`,
    region,
    source,
    since,
  };
}

/** Record the local contact earned by an ordinary noble grant. */
export function recordNobleAssociation(life: ExpandedLife): void {
  const social = life.expansion.social;
  if (!social) return;
  social.association = associationForRegion(life.region, "earned", worldYear(life));
}

/** Only new births roll these independent streams; callers never consume them. */
export function createSocialState(life: ExpandedLife): SocialState {
  const x = life.expansion,
    born = x.birthYear;
  const royalStream = { rng: (life.seed ^ SOCIAL_BIRTH.royalSeed) >>> 0 };
  const debtStream = { rng: (life.seed ^ SOCIAL_BIRTH.debtSeed) >>> 0 };
  const royalHouse =
    life.birthRegion === "asura" &&
    life.race === "human" &&
    x.origin.status === "noble" &&
    draw(royalStream) < SOCIAL_BIRTH.royalChance
      ? "asura"
      : null;
  const owes =
    x.origin.wealth === "poor" && draw(debtStream) < SOCIAL_BIRTH.debtChance;
  return {
    version: 1,
    source: "new-birth",
    activatedYear: born,
    royalHouse,
    association:
      x.origin.status === "noble"
        ? associationForRegion(life.birthRegion, "birth", born, royalHouse)
        : null,
    household: {
      home: life.birthRegion,
      parentIds: x.family.people
        .filter((p) => p.role === "parent")
        .slice(0, 2)
        .map((p) => p.id),
      relationship: SOCIAL_BIRTH.relationship,
      housing: owes ? "secure-tenancy" : "unrecorded",
      affectedParentIds: [],
      housingLossYear: null,
    },
    debt: owes
      ? {
          creditorId: "local-creditor",
          collateral: "tenancy-security",
          initial: SOCIAL_BIRTH.debtBalance,
          balance: SOCIAL_BIRTH.debtBalance,
          childhoodPaid: 0,
          personalPaid: 0,
          servicePaid: 0,
          closedUnpaid: 0,
          status: "household",
          decisionYear: null,
          lastChildhoodYear: born - 1,
          lastRepaymentYear: born - 1,
          lastRepayment: 0,
          pauseReason: "none",
          service: null,
        }
      : null,
  };
}

import type { ExpandedLife } from "../types";
import { isOrdinaryRole, type EducationPurpose, type FundingRecord } from "./career-access";
import { canEnrollUniversity, scholarshipEligible } from "./education";
import type { EducationCost } from "./education-finance";
import { fact, worldYear } from "./facts";
import { hasHouseCommitment, houseBenefitsSuspended } from "./house-service";
import { eligibleHouse, HOUSE_EDUCATION_RESERVE, type HouseProvider } from "./house-state";
import { canEnrollTraining } from "./training";

const TUITION_LIMIT = 48;

export interface HouseSponsorQuote {
  providerId: HouseProvider;
  purpose: EducationPurpose;
  amount: number;
  serviceYears: 1;
  year: number;
}

export interface SponsorContract {
  providerId: HouseProvider;
  purpose: EducationPurpose;
  amount: number;
  spent: number;
  openedYear: number;
  endedYear: number | null;
  servedYear: number | null;
  status: "studying" | "owed" | "served" | "closed";
}

export function quoteHouseSponsorship(life: ExpandedLife, cost: EducationCost): HouseSponsorQuote | null {
  const provider = eligibleHouse(life);
  const house = life.expansion.house;
  if (!provider || !house || hasHouseCommitment(life) || houseBenefitsSuspended(life, provider.id) ||
    !Number.isSafeInteger(cost.tuition) || cost.tuition <= 0) return null;
  const prior = life.expansion.finance?.purposes[cost.purpose]?.reserved;
  if (prior && (prior.family + prior.personal + prior.loan + (prior.sponsor ?? 0) > 0)) return null;
  if (cost.purpose === "university" ? !canEnrollUniversity(life) || scholarshipEligible(life) :
    !canEnrollTraining(life, cost.purpose)) return null;
  const amount = Math.min(TUITION_LIMIT, cost.tuition, house.balances[provider.id] ?? 0);
  return amount > 0 ? { providerId: provider.id, purpose: cost.purpose, amount, serviceYears: 1, year: worldYear(life) } : null;
}

export function sameHouseSponsorship(a?: HouseSponsorQuote, b?: HouseSponsorQuote): boolean {
  if (!a || !b) return a === b;
  return a.providerId === b.providerId && a.purpose === b.purpose && a.amount === b.amount &&
    a.serviceYears === b.serviceYears && a.year === b.year;
}

/** Called after the education quote and all other sources have been validated. */
export function reserveHouseSponsorship(life: ExpandedLife, quote: HouseSponsorQuote): void {
  const { providerId, purpose, year, amount } = quote;
  const house = life.expansion.house!;
  house.balances[providerId] = house.balances[providerId]! - amount;
  house.sponsorship = { providerId, purpose, amount, spent: 0, openedYear: year, endedYear: null, servedYear: null, status: "studying" };
  fact(life, "education", "house-tuition-reserved", providerId, amount);
}

export function settleHouseSponsorship(life: ExpandedLife, purpose: EducationPurpose, ended = false): void {
  const house = life.expansion.house;
  const contract = house?.sponsorship;
  if (!house || !contract || contract.purpose !== purpose) return;
  if (contract.status === "studying") {
    const funding = life.expansion.finance?.purposes[purpose];
    const unused = funding?.reserved.sponsor ?? 0;
    if (funding) delete funding.reserved.sponsor;
    if (unused > 0) {
      house.balances[contract.providerId] = house.balances[contract.providerId]! + unused;
      fact(life, "education", "house-tuition-refund", contract.providerId, unused);
    }
    contract.endedYear = worldYear(life);
    contract.status = !ended && contract.spent > 0 ? "owed" : "closed";
  } else if (ended && contract.status === "owed") contract.status = "closed";
}

export function validateHouseSponsorship(life: ExpandedLife): boolean {
  const house = life.expansion.house;
  const contract = house?.sponsorship;
  const sponsored = Object.entries(life.expansion.finance?.purposes ?? {}).filter(([, record]) => record.reserved.sponsor !== undefined);
  if (!house) return sponsored.length === 0;
  if (contract === null) return sponsored.length === 0;
  if (!contract || typeof contract !== "object" ||
    !Object.hasOwn(house.accessYears, contract.providerId) ||
    !(contract.purpose === "university" || isOrdinaryRole(contract.purpose))) return false;
  const currentYear = worldYear(life);
  const inRange = (n: number, min: number, max: number) => Number.isSafeInteger(n) && n >= min && n <= max;
  const funded = life.expansion.finance?.purposes[contract.purpose];
  if (!funded || !inRange(contract.openedYear, house.accessYears[contract.providerId]!, currentYear) ||
    !inRange(contract.amount, 1, TUITION_LIMIT) ||
    !inRange(contract.spent, 0, Math.min(contract.amount, house.tuitionSpent[contract.providerId] ?? 0))) return false;
  if (contract.status === "studying") {
    const courseActive = contract.purpose === "university" ?
      life.expansion.education.stage === "university" && !life.expansion.education.scholarship :
      life.expansion.training?.active === contract.purpose;
    return life.phase === "alive" && courseActive && contract.endedYear === null && contract.servedYear === null &&
      sponsored.length === 1 && funded.reserved.sponsor === contract.amount - contract.spent &&
      house.balances[contract.providerId]! <= HOUSE_EDUCATION_RESERVE - contract.amount;
  }
  if (sponsored.length > 0 || contract.endedYear === null || !inRange(contract.endedYear, contract.openedYear, currentYear) ||
    house.balances[contract.providerId]! > HOUSE_EDUCATION_RESERVE - contract.spent) return false;
  if (contract.status === "owed") return life.phase === "alive" && contract.spent > 0 && contract.servedYear === null;
  if (contract.status === "served") return contract.spent > 0 && contract.servedYear !== null && inRange(contract.servedYear, contract.endedYear + 1, currentYear);
  return contract.status === "closed" && contract.servedYear === null && (life.phase === "ended" || contract.spent === 0);
}

export function sponsorTuitionPayment(life: ExpandedLife, funding: FundingRecord, purpose: EducationPurpose, tuition: number): number {
  const contract = life.expansion.house?.sponsorship;
  if (!contract || contract.status !== "studying" || contract.purpose !== purpose || funding.reserved.sponsor === undefined) return 0;
  return Math.min(tuition, funding.reserved.sponsor);
}

export function spendHouseTuition(life: ExpandedLife, funding: FundingRecord, paid: number): void {
  const house = life.expansion.house!;
  const contract = house.sponsorship!;
  funding.reserved.sponsor! -= paid;
  contract.spent += paid;
  house.tuitionSpent[contract.providerId] = (house.tuitionSpent[contract.providerId] ?? 0) + paid;
}

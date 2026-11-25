import type { ExpandedLife } from "../types";
import { worldYear } from "./facts";
import { isRuler } from "./governance";
import { inCustody, permanentlyExiled } from "./succession-restrictions";
import type { HouseAssociation } from "./social-state";
import { newHouseServiceState, validHouseServiceState, type HouseServiceState } from "./house-service";
import { newRoyalMarriageState, validRoyalMarriageState, type RoyalMarriageState } from "./royal-marriage";
import { validateHouseSponsorship, type SponsorContract } from "./house-sponsorship";

export const HOUSE_EDUCATION_RESERVE = 72;
const providerIds = ["asura-local", "asura-royal", "ranoa-local", "millis-local"] as const;
export type HouseProvider = (typeof providerIds)[number];

export interface HouseState {
  version: 1;
  accessYear: number;
  accessYears: Partial<Record<HouseProvider, number>>;
  balances: Partial<Record<HouseProvider, number>>;
  tuitionSpent: Partial<Record<HouseProvider, number>>;
  sponsorship: SponsorContract | null;
  service: HouseServiceState;
  marriage: RoyalMarriageState;
}

export function eligibleHouse(life: ExpandedLife): HouseAssociation | null {
  const association = life.expansion.social?.association;
  if (!association || life.phase !== "alive" || life.age < 15 || association.region !== life.region ||
    life.expansion.standing.status !== "noble" || inCustody(life) || isRuler(life) ||
    (association.region === "asura" && permanentlyExiled(life))) return null;
  return association;
}

/** Introduce access only between choices, without assigning past obligations. */
export function activateHouseState(life: ExpandedLife): ExpandedLife {
  const x = life.expansion;
  const house = eligibleHouse(life);
  if (!house || x.house?.accessYears[house.id] !== undefined || life.pending || x.queue.length ||
    x.swords?.compatibilityDecision) return life;
  const year = worldYear(life);
  const next = structuredClone(life);
  const state = next.expansion.house ??= {
    version: 1, accessYear: year, accessYears: {}, balances: {}, tuitionSpent: {}, sponsorship: null,
    service: newHouseServiceState(), marriage: newRoyalMarriageState(),
  };
  state.accessYears[house.id] = year;
  state.balances[house.id] = HOUSE_EDUCATION_RESERVE;
  return next;
}

export function validateHouseState(life: ExpandedLife): boolean {
  const state = life.expansion.house;
  if (state === undefined) return validateHouseSponsorship(life);
  if (!state || state.version !== 1 || life.phase === "birth" || life.age < 15 ||
    !state.accessYears || typeof state.accessYears !== "object" || Array.isArray(state.accessYears) ||
    !state.balances || typeof state.balances !== "object" || Array.isArray(state.balances) ||
    !state.tuitionSpent || typeof state.tuitionSpent !== "object" || Array.isArray(state.tuitionSpent)) return false;
  const year = worldYear(life), earliest = life.expansion.birthYear + 15;
  const keys = Object.keys(state.accessYears) as HouseProvider[];
  if (!keys.length || keys.length !== Object.keys(state.balances).length ||
    Object.keys(state.tuitionSpent).some(key => !Object.hasOwn(state.accessYears, key)) ||
    keys.some(key => {
      const started = state.accessYears[key];
      const balance = state.balances[key];
      const spent = Object.hasOwn(state.tuitionSpent, key) ? state.tuitionSpent[key] : 0;
      const contract = state.sponsorship;
      const held = contract?.status === "studying" && contract.providerId === key ? contract.amount - contract.spent : 0;
      return !providerIds.includes(key) || !Number.isSafeInteger(started) ||
        started! < earliest || started! > year || !Number.isSafeInteger(balance) ||
        balance! < 0 || balance! > HOUSE_EDUCATION_RESERVE || !Number.isSafeInteger(spent) || spent! < 0 ||
        balance! + spent! + held !== HOUSE_EDUCATION_RESERVE;
    }) || state.accessYear !== Math.min(...keys.map(key => state.accessYears[key]!))) return false;
  return validHouseServiceState(state.service, life) &&
    validRoyalMarriageState(state.marriage, life) && validateHouseSponsorship(life);
}

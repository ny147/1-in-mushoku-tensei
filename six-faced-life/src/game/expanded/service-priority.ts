import type { ExpandedLife, RegionId } from "../types";
import { PARENTAL_DEBT } from "./balance";
import { worldYear } from "./facts";
import { isRuler } from "./governance";
import type { HouseAssociation } from "./social-state";
import { inCustody, permanentlyExiled } from "./succession-restrictions";

type Provider = HouseAssociation["id"];
export type ServiceAssignment = "creditor" | "crown" | "duty" | "sponsorship" | "marriage" | null;
export type ServicePause = "custody" | "governing" | "health" | "study" | "region" | "exile" | "commitment";

export function providerRegion(provider: Provider): RegionId {
  return provider === "ranoa-local" ? "ranoa" : provider === "millis-local" ? "millis" : "asura";
}

export function servicePause(life: ExpandedLife, region: RegionId): Exclude<ServicePause, "commitment"> | null {
  if (inCustody(life)) return "custody";
  if (isRuler(life)) return "governing";
  if (life.stats.health < PARENTAL_DEBT.serviceHealth) return "health";
  const { education, training } = life.expansion;
  if (education.stage === "university" || training?.active && !training.paused && training.mode === "full-time")
    return "study";
  if (region === "asura" && permanentlyExiled(life)) return "exile";
  return life.region === region ? null : "region";
}

/** The oldest eligible acceptance gets the year. Earlier systems break same-year ties. */
export function serviceAssignment(life: ExpandedLife, year = worldYear(life)): ServiceAssignment {
  if (life.phase !== "alive") return null;
  const { social, succession, house, career } = life.expansion;
  const debt = social?.debt;
  const creditor = debt?.service;
  const court = succession?.court;
  const crown = court?.request;
  if (creditor?.lastCreditYear === year || creditor?.endReason === "completed" && creditor.endedYear === year) return "creditor";
  if (crown?.status === "served" && crown.resolutionYear === year) return "crown";
  if (house?.service.lastCreditYear === year) return house.service.lastCreditSource;

  const candidates: { source: NonNullable<ServiceAssignment>; accepted: number }[] = [];
  if (debt?.status === "service" && creditor?.endedYear === null && year > creditor.startedYear &&
      life.age >= 15 && career.role === "laborer" && !servicePause(life, creditor.region))
    candidates.push({ source: "creditor", accepted: creditor.startedYear });
  if (crown?.status === "service" && court?.relinquishedYear === null && year >= crown.dueYear && !servicePause(life, "asura"))
    candidates.push({ source: "crown", accepted: crown.acceptedYear ?? crown.openedYear });
  if (house && life.age >= 18) {
    for (const [key, record] of Object.entries(house.service.providers)) {
      const request = record.request;
      if (request?.status === "service" && request.acceptedYear !== null && year > request.acceptedYear &&
          !servicePause(life, providerRegion(key as Provider)))
        candidates.push({ source: "duty", accepted: request.acceptedYear });
    }
    const sponsor = house.sponsorship;
    if (sponsor?.status === "owed" && sponsor.endedYear !== null && year > sponsor.endedYear &&
        !servicePause(life, providerRegion(sponsor.providerId)))
      candidates.push({ source: "sponsorship", accepted: sponsor.openedYear });
    for (const term of house.service.terms) {
      if (term.completedYear === null && term.cancelledYear === null && year > term.acceptedYear &&
          !servicePause(life, providerRegion(term.provider)))
        candidates.push({ source: "marriage", accepted: term.acceptedYear });
    }
  }
  return candidates.sort((a, b) => a.accepted - b.accepted)[0]?.source ?? null;
}

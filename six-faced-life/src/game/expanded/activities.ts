import type { ExpandedLife } from "../types";
import { worldYear } from "./facts";
import { getExpandedDecision } from "./events";
import { inCustody } from "./succession-restrictions";
import { activateCareerPaths } from './career-migration';
import { careerWorkAvailable } from './career-events';
import { debtServiceExitAvailable } from './social-events';
import { parentalResponsibilityDue } from './parental-debt';
import { canPetition, isCourtServiceYear } from './crown-service';
import { isRuler } from './governance';
import { activateHouseState } from "./house-state";
import { canPetitionHouse, consumesWorkThisYear } from "./house-service";
import { quoteRoyalMarriage, prepareRoyalMarriageProposal } from "./royal-marriage";

import { dreamAvailable } from "./dream-warning";
import { ledgerAvailable } from "./orsted-ledger";

export const ACTIVITIES = [
  "hitogami-dream",
  "orsted-ledger",
  "crown-petition",
  "house-petition",
  "royal-marriage",
  "debt-service-exit",
  "career",
  'career-work',
  "training",
  "instruction",
  "sword-mentor",
  "assessment",
  "university",
  "travel",
  "courtship",
  "challenge",
] as const;
export type Activity = (typeof ACTIVITIES)[number];
const minimumAge: Record<Activity, number> = {
  "hitogami-dream": 18,
  "orsted-ledger": 18,
  "crown-petition": 0,
  "house-petition": 18,
  "royal-marriage": 18,
  "debt-service-exit": 15,
  career: 15,
  "career-work": 15,
  training: 15,
  instruction: 8,
  "sword-mentor": 8,
  assessment: 8,
  university: 15,
  travel: 18,
  courtship: 18,
  challenge: 18,
};

export function activitiesBlock(life: ExpandedLife) {
  if (life.phase !== "alive") return "inactive";
  if (inCustody(life)) return "custody";
  if (life.pending) return "pending";
  if (life.expansion.queue.length || parentalResponsibilityDue(life)) return "queued";
  return null;
}

export function activityOpening(life: ExpandedLife, key: Activity) {
  if (key === "hitogami-dream" && !dreamAvailable(life)) return { kind: "irrelevant" } as const;
  if (key === "orsted-ledger" && !ledgerAvailable(life)) return { kind: "irrelevant" } as const;
  if (key === "house-petition" && !canPetitionHouse(life)) return {kind: "irrelevant"} as const;
  if (key === "royal-marriage" && !quoteRoyalMarriage(life)) return {kind: "irrelevant"} as const;
  if (key === "crown-petition" && !canPetition(life)) return { kind: "irrelevant" } as const;
  if (key === "travel" && isRuler(life)) return { kind: "irrelevant" } as const;
  if ((isRuler(life) || isCourtServiceYear(life) || consumesWorkThisYear(life)) &&
    ["career", "career-work", "training", "instruction", "sword-mentor", "university"].includes(key))
    return { kind: "irrelevant" } as const;
  if (key === "debt-service-exit" && !debtServiceExitAvailable(life)) {
    return { kind: "irrelevant" } as const;
  }
  const age = minimumAge[key];
  if (key === "challenge" && worldYear(life) < 431) {
    return { kind: "challenge-window", age, year: 431 } as const;
  }
  if (life.age < age) return { kind: "age", age } as const;
  switch (key) {
    case "career-work":
      if (!careerWorkAvailable(life)) return { kind: "career-work" } as const;
      break;
    case "university": {
      const { stage } = life.expansion.education;
      if (stage === "graduated") return { kind: "irrelevant" } as const;
      if (stage === "university") return { kind: "enrolled" } as const;
      break;
    }
  }
  return { kind: "available" } as const;
}

export function activityAvailable(life: ExpandedLife, key: Activity): boolean {
  return !activitiesBlock(life) && activityOpening(life, key).kind === "available";
}
export function openExpandedActivity(
  l: ExpandedLife,
  key: Activity,
): ExpandedLife {
  const active = activateHouseState(l);
  if (!activityAvailable(active, key)) return l;
  const n = structuredClone(activateCareerPaths(active));
  n.pending = `expanded.${key}`;
  n.expansion.optionalActivity = n.pending;
  if (key === "royal-marriage") prepareRoyalMarriageProposal(n);
  return getExpandedDecision(n) ? n : l;
}

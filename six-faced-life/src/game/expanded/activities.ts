import type { ExpandedLife } from "../types";
import { worldYear } from "./facts";
import { getExpandedDecision } from "./events";
import { activateCareerPaths } from './career-migration';
import { careerWorkAvailable } from './career-events';
import { debtServiceExitAvailable } from './social-events';
import { parentalResponsibilityDue } from './parental-debt';

export const ACTIVITIES = [
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
  if (life.pending) return "pending";
  if (life.expansion.queue.length || parentalResponsibilityDue(life)) return "queued";
  return null;
}

export function activityOpening(life: ExpandedLife, key: Activity) {
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
  if (!activityAvailable(l, key)) return l;
  const n = structuredClone(activateCareerPaths(l));
  n.pending = `expanded.${key}`;
  n.expansion.optionalActivity = n.pending;
  return getExpandedDecision(n) ? n : l;
}

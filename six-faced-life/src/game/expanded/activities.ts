import type { ExpandedLife } from "../types";
import { worldYear } from "./facts";
import { getExpandedDecision } from "./events";

export const ACTIVITIES = [
  "career",
  "training",
  "instruction",
  "assessment",
  "university",
  "travel",
  "courtship",
  "challenge",
] as const;
export type Activity = (typeof ACTIVITIES)[number];
export function activityAvailable(l: ExpandedLife, key: Activity): boolean {
  if (l.phase !== "alive" || l.pending || l.expansion.queue.length)
    return false;
  switch (key) {
    case "training":
    case "career":
      return l.age >= 15;
    case "instruction":
    case "assessment":
      return l.age >= 8;
    case "university":
      return (
        l.age >= 15 &&
        !["university", "graduated"].includes(l.expansion.education.stage)
      );
    case "travel":
    case "courtship":
      return l.age >= 18;
    case "challenge":
      return l.age >= 18 && worldYear(l) > 430;
    default:
      return false;
  }
}
export function openExpandedActivity(
  l: ExpandedLife,
  key: Activity,
): ExpandedLife {
  if (!activityAvailable(l, key)) return l;
  const n = structuredClone(l);
  n.pending = `expanded.${key}`;
  n.expansion.optionalActivity = n.pending;
  return getExpandedDecision(n) ? n : l;
}

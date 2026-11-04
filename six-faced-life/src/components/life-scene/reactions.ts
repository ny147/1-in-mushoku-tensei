import type { ReactionState, SceneFacts, SceneReaction } from "./types";
export const EMPTY_REACTION: ReactionState = Object.freeze({
  current: null,
  deferred: null,
  expiresAt: null,
});
const priority: Record<SceneReaction, number> = {
  ending: 5,
  arrival: 4,
  rank: 3,
  career: 3,
  family: 2,
  birth: 1,
};
export function detectSceneReaction(
  a: SceneFacts | null,
  b: SceneFacts,
): SceneReaction | null {
  if (!a || a.lifeId !== b.lifeId) return null;
  if (a.phase !== "ended" && b.phase === "ended") return "ending";
  if (a.region !== b.region) return "arrival";
  if (
    Object.keys(b.magicRanks).some(
      (k) =>
        b.magicRanks[k as keyof typeof b.magicRanks] >
        a.magicRanks[k as keyof typeof a.magicRanks],
    ) ||
    Object.keys(b.swordRanks).some(
      (k) =>
        b.swordRanks[k as keyof typeof b.swordRanks] >
        a.swordRanks[k as keyof typeof a.swordRanks],
    ) ||
    (a.legacySwordRank !== null &&
      b.legacySwordRank !== null &&
      b.legacySwordRank > a.legacySwordRank)
  )
    return "rank";
  if (a.occupation !== b.occupation || b.careerLevel > a.careerLevel)
    return "career";
  if (
    b.marriageKeys.some((k) => !a.marriageKeys.includes(k)) ||
    (a.directBorn !== null &&
      b.directBorn !== null &&
      b.directBorn > a.directBorn)
  )
    return "family";
  return a.phase === "birth" && b.phase === "alive" ? "birth" : null;
}
export function reduceReaction(
  state: ReactionState,
  input: {
    candidate: SceneReaction | null;
    now: number;
    pending: boolean;
    suspended: boolean;
    reset: boolean;
  },
): ReactionState {
  if (input.reset || input.suspended) return EMPTY_REACTION;
  let { current, deferred, expiresAt } = state;
  const { candidate, now, pending } = input;
  if (pending)
    return {
      current: null,
      deferred: candidate ?? deferred ?? current,
      expiresAt: null,
    };
  if (current && expiresAt !== null && now >= expiresAt) {
    current = null;
    expiresAt = null;
  }
  if (candidate) {
    if (!current || priority[candidate] >= priority[current]) {
      current = candidate;
      expiresAt = now + 2000;
      deferred = null;
    } else deferred = candidate;
  }
  if (!current && deferred) {
    current = deferred;
    deferred = null;
    expiresAt = now + 2000;
  }
  return current ? { current, deferred, expiresAt } : EMPTY_REACTION;
}

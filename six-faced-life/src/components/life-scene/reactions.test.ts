import { expect, it } from "vitest";
import { expandedSceneLife } from "./fixtures";
import { sampleSceneFacts } from "./model";
import {
  detectSceneReaction,
  reduceReaction,
  EMPTY_REACTION,
} from "./reactions";

it("does not replay loads or compare ranks across selected tracks", () => {
  const a = sampleSceneFacts(expandedSceneLife());
  expect(detectSceneReaction(null, a)).toBeNull();
  expect(detectSceneReaction(a, { ...a, study: "fire" })).toBeNull();
  expect(
    detectSceneReaction(a, { ...a, lifeId: "other", phase: "ended" }),
  ).toBeNull();
  expect(
    detectSceneReaction(a, { ...a, magicRanks: { ...a.magicRanks, water: 6 } }),
  ).toBe("rank");
  expect(
    detectSceneReaction(a, {
      ...a,
      phase: "ended",
      region: "demon",
      directBorn: 12,
    }),
  ).toBe("ending");
  expect(
    detectSceneReaction(a, {
      ...a,
      region: a.region === "demon" ? "asura" : "demon",
      directBorn: 12,
    }),
  ).toBe("arrival");
  expect(detectSceneReaction(a, { ...a, marriageKeys: ["person:421"] })).toBe(
    "family",
  );
});
it("bounds pending and burst reactions and expires exactly at the deadline", () => {
  const input = {
    candidate: "rank" as const,
    now: 100,
    pending: false,
    suspended: false,
    reset: false,
  };
  const rank = reduceReaction(EMPTY_REACTION, input);
  expect(rank).toEqual({ current: "rank", deferred: null, expiresAt: 2100 });
  expect(
    reduceReaction(rank, { ...input, candidate: null, now: 2099 }),
  ).toEqual(rank);
  expect(
    reduceReaction(rank, { ...input, candidate: null, now: 2100 }),
  ).toEqual(EMPTY_REACTION);
  const waiting = reduceReaction(EMPTY_REACTION, {
    ...input,
    pending: true,
    candidate: "arrival",
  });
  expect(waiting).toEqual({
    current: null,
    deferred: "arrival",
    expiresAt: null,
  });
  expect(
    reduceReaction(waiting, { ...input, candidate: null, now: 800 }),
  ).toEqual({ current: "arrival", deferred: null, expiresAt: 2800 });
  let burst = rank;
  for (let i = 0; i < 100; i++)
    burst = reduceReaction(burst, {
      ...input,
      candidate: "family",
      now: 101 + i,
    });
  expect(burst).toEqual({ ...rank, deferred: "family" });
  expect(reduceReaction(burst, { ...input, suspended: true })).toEqual(
    EMPTY_REACTION,
  );
  expect(reduceReaction(burst, { ...input, reset: true })).toEqual(
    EMPTY_REACTION,
  );
});
it("only celebrates recorded changes and preserves a deferred reaction through a choice", () => {
  const a = sampleSceneFacts(expandedSceneLife());
  expect(detectSceneReaction({ ...a, phase: "birth" }, a)).toBe("birth");
  expect(detectSceneReaction(a, { ...a, careerLevel: a.careerLevel + 1 })).toBe(
    "career",
  );
  expect(
    detectSceneReaction(a, { ...a, directBorn: (a.directBorn ?? 0) + 1 }),
  ).toBe("family");
  expect(detectSceneReaction(a, { ...a })).toBeNull();
  const input = {
    candidate: null,
    now: 0,
    pending: true,
    suspended: false,
    reset: false,
  };
  const waiting = reduceReaction(
    { current: "career", deferred: null, expiresAt: 1500 },
    input,
  );
  expect(waiting).toEqual({
    current: null,
    deferred: "career",
    expiresAt: null,
  });
  const ended = reduceReaction(waiting, {
    ...input,
    pending: false,
    candidate: "ending",
  });
  expect(ended).toEqual({ current: "ending", deferred: null, expiresAt: 2000 });
});

import { expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { activateHouseState, eligibleHouse, validateHouseState } from "./house-state";
import { associationForRegion } from "./social-state";
import { loadGame } from "../storage";
import { enterCustody, politicalFlight } from "./succession-restrictions";

it.each(["asura", "ranoa", "millis"] as const)("opens a prospective %s house reserve without touching lived facts", region => {
  const life = createExpandedLife({seed: 1, region});
  life.phase = "alive";
  life.age = 20;
  life.expansion.standing.status = "noble";
  life.expansion.social!.association = associationForRegion(region, "earned", life.expansion.birthYear + 20);
  life.pending = "expanded.travel";
  expect(activateHouseState(life)).toBe(life);
  life.pending = null;
  const next = activateHouseState(life);
  expect(next.rng).toBe(life.rng);
  expect(next.expansion.facts).toEqual(life.expansion.facts);
  expect(next.expansion.house?.balances[`${region}-local`]).toBe(72);
  expect(validateHouseState(next)).toBe(true);
  next.region = "forest";
  expect(eligibleHouse(next)).toBeNull();
  next.region = region;
  expect(activateHouseState(next)).toBe(next);
  next.expansion.house!.balances[`${region}-local`] = 73;
  expect(validateHouseState(next)).toBe(false);
});

it("leaves completed lives untouched", () => {
  const life = createExpandedLife({seed: 1});
  life.phase = "ended";
  expect(activateHouseState(life)).toBe(life);
});

it("preserves an old pending decision and its random streams until it is dismissed", () => {
  let life = createExpandedLife({seed: 0, region: "ranoa"});
  for (let seed = 1; seed < 1000 && life.expansion.standing.status !== "noble"; seed++)
    life = createExpandedLife({seed, region: "ranoa"});
  expect(life.expansion.standing.status).toBe("noble");
  life.phase = "alive";
  life.age = 20;
  life.pending = "expanded.travel";
  const save = {version: 1, active: life, archive: []};
  const loaded = loadGame({getItem: () => JSON.stringify(save), setItem: () => {}});
  expect(loaded.error).toBeNull();
  expect(loaded.data.active).toEqual(life);
});

it("keeps prior reserves while the player is under custody or Asuran exile", () => {
  const starting = createExpandedLife({seed: 6, region: "asura"});
  starting.phase = "alive";
  starting.age = 19;
  starting.expansion.standing.status = "noble";
  starting.expansion.social!.association = associationForRegion("asura", "earned", 425);
  const life = activateHouseState(starting);
  expect(life.expansion.house?.balances["asura-local"]).toBe(72);
  const prisoner = structuredClone(life);
  enterCustody(prisoner);
  expect(eligibleHouse(prisoner)).toBeNull();
  politicalFlight(life);
  expect(eligibleHouse(life)).toBeNull();
  expect(life.expansion.house?.balances["asura-local"]).toBe(72);
});

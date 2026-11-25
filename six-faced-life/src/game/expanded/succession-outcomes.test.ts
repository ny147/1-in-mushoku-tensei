import { chooseExpanded } from "./engine";
import { expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import {
  applyCrisisChoice,
  applySuccessionYear,
  dueCrisisDecision,
  crisisDecision,
} from "./succession-events";

function participant(action: string, winner: "opposition" | "ariel") {
  const l = createExpandedLife({ seed: 37 });
  l.phase = "alive";
  l.age = 24;
  l.expansion.birthYear = 400;
  l.region = "asura";
  l.expansion.standing.status = "noble";
  l.expansion.social!.royalHouse = "asura";
  l.expansion.succession!.winner = winner;
  applySuccessionYear(l);
  applyCrisisChoice(l, "expanded.asura-oath." + action);
  l.age++;
  applySuccessionYear(l);
  applyCrisisChoice(l, "expanded.asura-result.read");
  return l;
}
it("freezes one roll, friend, fee and chances across inspections and restoration", () => {
  const l = participant("opposition", "ariel");
  l.coins = 0;
  l.stats.sword = 99;
  l.expansion.family.friends.push({
    id: "old-friend",
    name: "Ira",
    role: "friend",
    strength: 50,
  });
  l.pending = dueCrisisDecision(l);
  const saved = JSON.stringify(l);
  const q = l.expansion.succession!.crisis.quote!;
  expect([q.friendId, q.escape, q.paidEscape, q.resist]).toEqual([
    "old-friend",
    45,
    65,
    65,
  ]);
  expect(
    crisisDecision(l)?.choices.find((c) => c.id.endsWith("escape-paid"))
      ?.disabled,
  ).toBe(true);
  expect(crisisDecision(JSON.parse(saved))).toEqual(crisisDecision(l));
  dueCrisisDecision(l);
  expect(JSON.stringify(l)).toEqual(saved);
  applyCrisisChoice(l, "expanded.asura-defeat.surrender");
  expect(l.expansion.succession!.crisis.outcome).toBe("captured");
});
it("recognizes an opposition supporter and crowns only a declared claimant", () => {
  for (const action of ["opposition", "claimant"]) {
    const l = participant(action, "opposition");
    expect(l.expansion.succession!.crisis.outcome).toBe(
      action === "claimant" ? "crowned" : "recognized",
    );
    const purse = l.coins;
    applyCrisisChoice(l, "expanded.asura-result.read");
    expect(l.coins).toBe(purse);
    expect(l.expansion.succession!.crisis.reward).toBe(40);
  }
});

it("charges the escape fee once and applies losses to the remaining purse", () => {
  for (const roll of [0, 0.99]) {
    const l = participant("ariel", "opposition");
    l.coins = 31;
    l.expansion.family.friends = [];
    dueCrisisDecision(l);
    l.expansion.succession!.crisis.quote!.roll = roll;
    applyCrisisChoice(l, "expanded.asura-defeat.escape-paid");
    expect(l.expansion.succession!.crisis.outcome).toBe(
      roll ? "captured" : "escaped",
    );
    expect(l.coins).toBe(10);
    applyCrisisChoice(l, "expanded.asura-defeat.escape-paid");
    expect(l.coins).toBe(10);
  }
});
it("ends a life immediately on failed resistance", () => {
  const l = participant("ariel", "opposition");
  l.pending = dueCrisisDecision(l);
  l.expansion.succession!.crisis.quote!.roll = 0.99;
  const ended = chooseExpanded(l, "expanded.asura-defeat.resist");
  expect(ended.phase).toBe("ended");
  expect(ended.ending?.cause).toBe("violence");
});

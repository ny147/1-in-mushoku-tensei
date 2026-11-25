import { expect, it } from "vitest";
import { newCourtState, recognizeAtCourt, advanceCourtYear, applyCourtChoice, courtDecision, nextCourtDecision, canPetition, validCourtState } from "./crown-service";
import { createExpandedLife } from "./origins";

function supporter(royal = false) {
  const l = createExpandedLife({seed: 4});
  l.phase = "alive";
  l.age = 425 - l.expansion.birthYear;
  l.region = "asura";
  l.stats.health = 75;
  Object.assign(l.expansion, {succession: {...l.expansion.succession, court: newCourtState()}});
  recognizeAtCourt(l, royal);
  return l;
}
it("gives royal petition precedence and pays each petition only once", () => {
  const l = supporter(true), common = supporter(), coins = l.coins;
  expect(canPetition(common)).toBe(false);
  common.age++;
  expect(canPetition(common)).toBe(true);
  l.pending = "expanded.crown-petition";
  expect(applyCourtChoice(l, l.pending + ".claim")).toBe(true);
  expect(applyCourtChoice(l, l.pending + ".claim")).toBe(false);
  expect(l.coins).toBe(coins + 12);
  l.age += 3;
  expect(canPetition(l)).toBe(true);
});
it("defers a hardship without a strike and completes one full eligible year of service", () => {
  const l = supporter(), c = l.expansion.succession!.court;
  l.coins = 0;
  l.age += 3;
  advanceCourtYear(l);
  l.pending = nextCourtDecision(l);
  expect(courtDecision(l)?.choices.find(x => x.id.endsWith(".pay"))?.disabled).toBe(true);
  expect(applyCourtChoice(l, l.pending + ".extend")).toBe(true);
  l.age++; advanceCourtYear(l); l.pending = nextCourtDecision(l);
  expect(applyCourtChoice(l, l.pending + ".service")).toBe(true);
  l.stats.health = 10; l.age++; advanceCourtYear(l);
  expect(c.refusals).toBe(0);
  expect(c.request?.status).toBe("service");
  l.stats.health = 80; l.age++; advanceCourtYear(l);
  expect(c.request?.status).toBe("served");
  expect(validCourtState(c, l)).toBe(true);
});
it.each(["noble", "commoner"] as const)("relinquishes an active title while preserving %s ancestry and the Powers rank", origin => {
  const l = supporter(true);
  l.expansion.origin.status = origin;
  l.expansion.standing.status = "noble";
  l.expansion.standing.title = 6;
  for (let refusal = 1; refusal <= 3; refusal++) {
    l.age += 3; advanceCourtYear(l); l.pending = nextCourtDecision(l);
    expect(applyCourtChoice(l, l.pending + ".refuse")).toBe(true);
    expect(l.expansion.succession!.court.refusals).toBe(refusal);
    if (refusal === 2) expect(canPetition(l)).toBe(false);
  }
  l.pending = nextCourtDecision(l);
  expect(l.pending).toBe("expanded.crown-standing");
  expect(applyCourtChoice(l, l.pending + ".relinquish")).toBe(true);
  expect(l.expansion.origin.status).toBe(origin);
  expect(l.expansion.standing.status).toBe("commoner");
  expect(l.expansion.standing.title).toBe(6);
  expect(canPetition(l)).toBe(false);
});

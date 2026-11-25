import { describe, expect, it } from "vitest";
import { advance, choose, finishLife, getDecision, openActivity } from "../engine";
import { canAutoChoose } from "../simulation";
import { isLife, loadGame, saveGame } from "../storage";
import type { ExpandedLife } from "../types";
import { survivalRisks } from "./economy";
import { recordFamilyDeath } from "./family";
import { createExpandedLife } from "./origins";
import { permanentlyExiled, politicalFlight } from "./succession-restrictions";

function dynasty() {
  const life = createExpandedLife({ seed: 82, region: "asura" });
  life.phase = "alive";
  life.age = 426 - life.expansion.birthYear;
  Object.assign(life.expansion.succession!.crisis, { route: "news", revealed: true, outcome: "news" });
  return life;
}

function courtship(life = dynasty()) {
  const meeting = openActivity(life, "courtship");
  const met = choose(meeting, "expanded.courtship.meet") as ExpandedLife;
  met.expansion.family.people.find(p => p.role === "spouse")!.strength = 100;
  return choose(met, "expanded.marriage.later") as ExpandedLife;
}

function offer(life: ExpandedLife) {
  return openActivity(life, "royal-marriage") as ExpandedLife;
}

function chooseMarriage(life: ExpandedLife, action: "accept" | "refuse" | "dismiss") {
  return choose(life, `expanded.royal-marriage.${action}`) as ExpandedLife;
}

function risk(life: ExpandedLife) {
  return survivalRisks(life).find(r => r.cause === "violence")!.chance;
}

describe("royal marriage", () => {
  it("requires an introduced local adult and a settled K425 outcome", () => {
    const alone = dynasty();
    expect(offer(alone)).toBe(alone);
    const life = courtship();
    const prospect = life.expansion.family.people.find(p => p.role === "spouse")!;
    life.age = 17;
    expect(offer(life)).toBe(life);
    life.age = 24;
    life.expansion.succession!.crisis.due = "result";
    expect(offer(life)).toBe(life);
    life.expansion.succession!.crisis.due = null;
    life.age = 25;
    prospect.born = 410;
    expect(offer(life)).toBe(life);
    prospect.born = 400;
    expect(offer(life).pending).toBe("expanded.royal-marriage");
  });

  it("pauses for explicit consent and preserves succession, lineage, location and random streams", () => {
    const life = courtship();
    const first = life.expansion.family.people.find(p => p.role === "spouse")!;
    life.expansion.family.people.push({ ...first, id: "alternate", born: first.born - 5 });
    const pending = offer(life);
    expect(canAutoChoose(pending)).toBe(false);
    expect(pending.expansion.family.marriages).toHaveLength(0);
    const married = chooseMarriage(pending, "accept");
    expect(married.expansion.family.marriages).toEqual([{ person: first.id, start: 426, end: null, reason: null }]);
    expect(married.expansion.succession).toEqual(life.expansion.succession);
    expect(married.expansion.origin).toEqual(life.expansion.origin);
    expect(married.expansion.family.people.find(p => p.id === first.id)).toEqual({ ...first, partner: "self" });
    expect(married.region).toBe(life.region);
    expect(married.rng).toBe(life.rng);
    expect(married.expansion.familyRng).toBe(life.expansion.familyRng);
    expect(offer(married)).toBe(married);
  });

  it("does not propose an alliance during an existing ordinary marriage", () => {
    const life = courtship();
    const first = life.expansion.family.people.find(p => p.role === "spouse")!;
    const meeting = openActivity(life, "courtship");
    const met = choose(meeting, "expanded.courtship.meet") as ExpandedLife;
    const married = choose(met, `expanded.marriage.marry-${first.id}`) as ExpandedLife;
    married.expansion.family.people.push({ ...first, id: "alternate" });
    expect(married.expansion.family.marriages).toHaveLength(1);
    expect(married.expansion.house!.service.terms).toHaveLength(0);
    expect(offer(married)).toBe(married);
  });

  it.each(["death", "absence", "relationship"] as const)("allows a stale proposal to be dismissed after %s", (change) => {
    const life = courtship();
    const first = life.expansion.family.people.find(p => p.role === "spouse")!;
    life.expansion.family.people.push({ ...first, id: "alternate" });
    const pending = offer(life);
    const prospect = pending.expansion.family.people.find(p => p.role === "spouse")!;
    if (change === "death") recordFamilyDeath(pending, prospect.id);
    if (change === "absence") prospect.home = "ranoa";
    if (change === "relationship") prospect.strength = 20;
    expect(getDecision(pending)?.choices.map(c => c.id)).toEqual(["expanded.royal-marriage.dismiss"]);
    expect(chooseMarriage(pending, "accept")).toBe(pending);
    const dismissed = chooseMarriage(pending, "dismiss");
    expect(dismissed.pending).toBeNull();
    expect(chooseMarriage(offer(dismissed), "accept").expansion.family.marriages[0].person).toBe("alternate");
  });

  it("offers again after three years without changing crown standing", () => {
    const life = courtship();
    const refused = chooseMarriage(offer(life), "refuse");
    expect(refused.expansion.family.marriages).toHaveLength(0);
    expect(refused.expansion.succession).toEqual(life.expansion.succession);
    refused.age = 27;
    expect(offer(refused)).toBe(refused);
    refused.age = 28;
    expect(offer(refused).pending).toBe("expanded.royal-marriage");
  });

  it("restores a pending proposal without rerolling or duplicating the marriage", () => {
    const pending = offer(courtship());
    expect(pending.pending).toBe("expanded.royal-marriage");
    let raw = "";
    const storage = { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; } };
    expect(saveGame(storage, { version: 1, active: pending, archive: [] })).toBe(true);
    const restored = loadGame(storage).data.active as ExpandedLife;
    expect(restored.expansion.house?.marriage.proposal).toEqual(pending.expansion.house?.marriage.proposal);
    expect(restored.rng).toBe(pending.rng);
    const married = chooseMarriage(restored, "accept");
    expect(married.expansion.family.marriages).toHaveLength(1);
    expect(saveGame(storage, { version: 1, active: married, archive: [] })).toBe(true);
    const reloaded = loadGame(storage).data.active as ExpandedLife;
    expect(chooseMarriage(reloaded, "accept")).toBe(reloaded);
    expect(reloaded.expansion.family.marriages).toHaveLength(1);
  });

  it("rejects saved alliance service detached from its marriage", () => {
    const married = chooseMarriage(offer(courtship()), "accept");
    expect(isLife(married)).toBe(true);
    married.expansion.house!.marriage.alliances = [];
    expect(isLife(married)).toBe(false);
  });

  it("retains completed alliance service if the spouse later dies", () => {
    const married = chooseMarriage(offer(courtship()), "accept");
    married.coins = 500;
    const served = advance(married, "year") as ExpandedLife;
    expect(served.expansion.house!.service.terms[0].completedYear).toBe(427);
    recordFamilyDeath(served, served.expansion.family.marriages[0].person);
    expect(served.expansion.house!.service.terms[0]).toMatchObject({ completedYear: 427, cancelledYear: null });
    expect(isLife(served)).toBe(true);
  });

  it("blocks exiled dynasty members from making another local alliance", () => {
    const life = courtship();
    politicalFlight(life);
    expect(permanentlyExiled(life)).toBe(true);
    expect(offer(life)).toBe(life);
  });

  it("provides protection for two local annual settlements", () => {
    const life = courtship();
    const married = chooseMarriage(offer(life), "accept");
    life.expansion.politics.pursuitUntil = married.expansion.politics.pursuitUntil = 430;
    expect(risk(married)).toBe(risk(life));
    for (const age of [26, 27]) {
      married.age = life.age = age;
      expect(risk(married)).toBe(risk(life) / 2);
    }
    const partner = married.expansion.family.people.find(p => p.role === "spouse")!;
    partner.home = "ranoa";
    expect(risk(married)).toBe(risk(life));
    partner.home = "asura";
    married.region = "ranoa";
    life.region = "ranoa";
    expect(risk(married)).toBe(risk(life));
    married.region = life.region = "asura";
    married.age = life.age = 28;
    expect(risk(married)).toBe(risk(life));
  });

  it.each(["divorce", "widowhood", "death"] as const)("ends alliance protection on %s", reason => {
    const life = courtship();
    let married = chooseMarriage(offer(life), "accept");
    life.age = married.age = 26;
    life.expansion.politics.pursuitUntil = married.expansion.politics.pursuitUntil = 430;
    expect(risk(married)).toBe(risk(life) / 2);
    if (reason === "divorce") {
      married.pending = "expanded.family";
      married = choose(married, "expanded.family.separate") as ExpandedLife;
    } else if (reason === "widowhood") recordFamilyDeath(married, married.expansion.family.marriages[0].person);
    else finishLife(married, "illness");
    expect(risk(married)).toBe(risk(life));
    expect(married.expansion.facts.some(f => f.code === "royal-alliance-ended")).toBe(true);
    expect(married.expansion.house!.service.terms[0]).toMatchObject({ completedYear: null, cancelledYear: 427 });
    expect(isLife(married)).toBe(true);
  });
});

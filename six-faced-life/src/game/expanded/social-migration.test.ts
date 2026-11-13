import { describe, expect, it } from "vitest";
import type { ExpandedLife, RegionId } from "../types";
import { advance, choose } from "../engine";
import { isLife } from "../storage";
import { createExpandedLife } from "./origins";
import { activateSocialState } from "./social-migration";
import { recordNobleAssociation } from "./social-state";
import { getExpandedDecision } from "./events";
import { fact, worldYear } from "./facts";
import { appoint, careerRequirements } from "./careers";

function oldLife(): ExpandedLife {
  const life = createExpandedLife({ seed: 1 });
  delete life.expansion.social;
  life.phase = "alive";
  life.age = 30;
  life.pending = null;
  life.expansion.queue = [];
  return life;
}

describe("prospective social migration", () => {
  it("preserves all existing origin history and RNG without retrospective deductions", () => {
    const life = oldLife(), before = structuredClone(life);
    const adopted = activateSocialState(life);
    expect(life).toEqual(before);
    expect(adopted).not.toBe(life);
    const { social, ...preserved } = adopted.expansion;
    expect({ ...adopted, expansion: preserved }).toEqual(before);
    expect(social).toMatchObject({
      version: 1, source: "migrated", activatedYear: worldYear(life),
      royalHouse: null, debt: null,
      household: { home: life.birthRegion, housing: "unrecorded", affectedParentIds: [], housingLossYear: null },
    });
    expect(social!.household.parentIds).toEqual(life.expansion.family.people.filter(p => p.role === "parent").map(p => p.id));
    expect(activateSocialState(adopted)).toBe(adopted);
    expect(isLife(adopted)).toBe(true);
  });

  it("generic noble does not become royal and retains its recorded birthplace association", () => {
    const life = oldLife();
    life.birthRegion = "asura";
    life.region = "ranoa";
    life.expansion.origin.status = life.expansion.standing.status = "noble";
    expect(activateSocialState(life).expansion.social).toMatchObject({
      royalHouse: null, debt: null,
      association: { id: "asura-local", region: "asura", source: "inherited-record", since: life.expansion.birthYear },
    });
  });

  it("does not modify ended, initialized, pending, queued or sword compatibility lives", () => {
    const initialized = createExpandedLife({ seed: 1 });
    expect(activateSocialState(initialized)).toBe(initialized);
    const life = oldLife();
    life.phase = "ended";
    expect(activateSocialState(life)).toBe(life);
    life.phase = "alive";
    life.pending = "expanded.university";
    const offer = getExpandedDecision(life);
    expect(activateSocialState(life)).toBe(life);
    life.pending = null;
    life.expansion.queue = ["expanded.grant"];
    expect(activateSocialState(life)).toBe(life);
    life.expansion.queue = [];
    life.expansion.swords!.compatibilityDecision = offer;
    expect(activateSocialState(life)).toBe(life);
  });

  it("old pending and queued offers keep their original terms until final queued choice", () => {
    let life = oldLife();
    life.pending = "expanded.grant";
    life.expansion.queue = ["expanded.university", "expanded.retire"];
    const offer = getExpandedDecision(life);
    expect(getExpandedDecision(activateSocialState(life))).toEqual(offer);
    life = choose(life, "expanded.grant.later") as ExpandedLife;
    expect(life.pending).toBe("expanded.university");
    expect(life.expansion.social).toBeUndefined();
    const universityOffer = getExpandedDecision(life);
    expect(getExpandedDecision(activateSocialState(life))).toEqual(universityOffer);
    life = choose(life, "expanded.university.later") as ExpandedLife;
    expect(life.pending).toBe("expanded.retire");
    expect(life.expansion.social).toBeUndefined();
    life = choose(life, "expanded.retire.later") as ExpandedLife;
    const social = structuredClone(life.expansion.social);
    expect(social?.activatedYear).toBe(worldYear(life));
    life = advance(life, "tick", 0.1) as ExpandedLife;
    expect(life.expansion.social).toEqual(social);
  });

  it("adopts before advancement at the current world year", () => {
    const life = oldLife();
    const next = advance(life, "tick", 0.1) as ExpandedLife;
    expect(next.expansion.social?.activatedYear).toBe(worldYear(life));
    expect(life.expansion.social).toBeUndefined();
    expect(next.rng).toBe(life.rng);
  });

  it("uses recorded grant locations and leaves missing past grant years unknown", () => {
    const life = oldLife();
    life.birthRegion = "asura";
    life.region = "millis";
    life.expansion.origin.status = "commoner";
    life.expansion.standing.status = "noble";
    life.age = 20;
    fact(life, "history", "migration", "ranoa");
    life.age = 21;
    fact(life, "achievement", "noble-grant");
    life.age = 25;
    fact(life, "history", "migration", "millis");
    life.age = 30;
    expect(activateSocialState(life).expansion.social?.association).toEqual({
      id: "ranoa-local", region: "ranoa", source: "inherited-record", since: life.expansion.birthYear + 21,
    });
    life.expansion.facts = life.expansion.facts.filter(f => f.code !== "noble-grant");
    expect(activateSocialState(life).expansion.social?.association?.since).toBeNull();
  });

  it.each(["asura", "ranoa", "millis", "demon"] as RegionId[])("earned and born nobles have the same association lookup in %s", region => {
    const born = createExpandedLife({ seed: 1 });
    born.birthRegion = born.region = region;
    born.expansion.origin.status = born.expansion.standing.status = "noble";
    delete born.expansion.social;
    const bornAssociation = activateSocialState(born).expansion.social?.association;
    const earned = activateSocialState(oldLife());
    earned.region = region;
    recordNobleAssociation(earned);
    const association = earned.expansion.social?.association;
    expect(association?.id).toBe(bornAssociation?.id);
    expect(association?.region).toBe(bornAssociation?.region);
    if (association) expect(association).toMatchObject({ source: "earned", since: worldYear(earned) });
    else expect(association).toBeNull();
  });

  it("an earned grant retains birth, debt, qualifications, power title and faction membership", () => {
    let life = createExpandedLife({ seed: 1 });
    for (let seed = 0; !life.expansion.social!.debt && seed < 100; seed++) life = createExpandedLife({ seed });
    expect(life.expansion.social!.debt).not.toBeNull();
    life.phase = "alive";
    life.age = 30;
    life.region = "ranoa";
    life.pending = "expanded.grant";
    life.expansion.standing.status = "commoner";
    life.expansion.standing.reputation = 70;
    life.expansion.standing.feats = ["a", "b", "c", "d", "e"];
    life.expansion.standing.title = 7;
    life.expansion.politics.faction = "orsted";
    const before = structuredClone(life);
    const next = choose(life, "expanded.grant.accept") as ExpandedLife;
    expect(next.expansion.standing.status).toBe("noble");
    expect(next.expansion.origin).toEqual({ ...before.expansion.origin, patron: true });
    expect(next.expansion.social).toEqual({ ...before.expansion.social, association: { id: "ranoa-local", region: "ranoa", source: "earned", since: worldYear(life) } });
    expect(next.expansion.standing.title).toBe(7);
    expect(next.expansion.politics).toEqual(before.expansion.politics);
    expect(next.expansion.career).toEqual(before.expansion.career);
    expect(next.expansion.education).toEqual(before.expansion.education);
  });

  it.each([false, true])("quotes identical knight costs for born and earned nobles with career paths=%s", versioned => {
    const life = oldLife();
    life.expansion.social = activateSocialState(life).expansion.social;
    life.pending = versioned ? "expanded.career-path" : "expanded.career";
    if (versioned) life.expansion.careerPaths!.selection = "martial";
    else delete life.expansion.careerPaths;
    life.expansion.standing.status = "noble";
    life.expansion.origin.status = "commoner";
    life.coins = 20;
    life.expansion.economy.familyFunds = 100;
    const id = versioned ? "expanded.career-path.enter-knight" : "expanded.career.job-knight";
    expect(getExpandedDecision(life)!.choices.find(c => c.id === id)?.cost).toBe(20);
    life.expansion.origin.status = "noble";
    expect(getExpandedDecision(life)!.choices.find(c => c.id === id)?.cost).toBe(20);
  });

  it.each(["commoner", "noble"] as const)("honors current noble equipment access and debits only the remainder for %s birth", birthStatus => {
    const life = activateSocialState(oldLife());
    delete life.expansion.careerPaths;
    delete life.expansion.swords;
    life.expansion.origin.status = birthStatus;
    life.expansion.origin.patron = true;
    life.expansion.standing.status = "noble";
    life.expansion.standing.service = 3;
    life.training.swordXp = 150;
    life.coins = 20;
    life.expansion.economy.familyFunds = 100;
    expect(careerRequirements(life, "knight").every(r => r.met)).toBe(true);
    expect(appoint(life, "knight")).toBe(true);
    expect(life.coins).toBe(0);
    expect(life.expansion.economy.familyFunds).toBe(0);
  });

  it("preserves absent-ledger noble funding rules until a compatibility offer resolves", () => {
    const life = oldLife();
    life.expansion.origin.status = "commoner";
    life.expansion.standing.status = "noble";
    life.coins = 20;
    life.expansion.economy.familyFunds = 100;
    expect(careerRequirements(life, "knight").find(r => r.id === "equipment")?.met).toBe(false);
    life.expansion.origin.status = "noble";
    expect(careerRequirements(life, "knight").find(r => r.id === "equipment")?.met).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { advanceExpanded, chooseExpanded } from "./engine";
import { applyEconomyYear } from "./economy";
import { getExpandedDecision, applyExpandedChoice } from "./events";
import { createExpandedLife } from "./origins";
import { canRelocate, enterCustody, flightTerms, inCustody, politicalFlight, settleCustodyRelease, validRestrictionState } from "./succession-restrictions";
import { worldYear } from "./facts";
import { parentalResponsibilityDue } from "./parental-debt";
import { annualIncomeExpanded, careerIncomeExpanded } from "./careers";
import { loadGame, saveGame } from "../storage";
import type { ExpandedLife } from "../types";

function adult() {
  const life = createExpandedLife({ seed: 5 });
  life.phase = "alive";
  life.region = "asura";
  life.expansion.birthYear = 400;
  life.age = 25;
  life.coins = 11;
  life.pending = null;
  life.expansion.queue = [];
  life.stats.health = 100;
  life.deathAge = 80;
  return life;
}

describe("succession restrictions", () => {
  it("defers parental liability and suppresses both earnings quotes during custody", () => {
    const life=adult();
    for(let seed=1;seed<1000;seed++){
      const candidate=createExpandedLife({seed});
      if(candidate.expansion.social?.debt){life.expansion.social=candidate.expansion.social; break;}
    }
    expect(parentalResponsibilityDue(life)).toBe(true);
    life.focus="work";
    life.expansion.career.role="guard";
    enterCustody(life);
    expect(parentalResponsibilityDue(life)).toBe(false);
    expect(annualIncomeExpanded(life)).toBe(0);
    expect(careerIncomeExpanded(life)).toBe(0);
    life.pending="expanded.practice";
    expect(chooseExpanded(life,"expanded.practice.magic")).toBe(life);
    const closed=chooseExpanded(life,"expanded.practice.dismiss");
    expect(closed.pending).toBeNull();
  });

  it("offers a pledged traveller a free manual review before charging or moving", () => {
    const life=adult(), c=life.expansion.succession!.crisis;
    Object.assign(c,{outcome:"pledged",route:"adult",side:"ariel"});
    life.pending="expanded.travel";
    life.coins=1;
    const review=chooseExpanded(life,"expanded.travel.move-millis");
    expect(review.pending).toBe("expanded.succession-withdrawal");
    expect(review.coins).toBe(1);
    expect(review.region).toBe("asura");
    expect(chooseExpanded(review,"expanded.succession-withdrawal.stay").expansion.succession!.crisis.outcome).toBe("pledged");
    const exile=chooseExpanded(review,"expanded.succession-withdrawal.confirm");
    expect(exile.region).toBe("ranoa");
    expect(exile.expansion.succession!.crisis.outcome).toBe("withdrawn");
  });

  it("restores a released prisoner without repeating the custody settlement", () => {
    const life=createExpandedLife({seed:5});
    life.phase="alive";
    life.age=425-life.expansion.birthYear;
    life.stats.health=100;
    life.pending=null;
    enterCustody(life);
    let freed=advanceExpanded(advanceExpanded(life,"year"),"year");
    expect(inCustody(freed)).toBe(false);
    let raw="";
    const storage={getItem:()=>raw,setItem:(_:string,v:string)=>{raw=v;}};
    expect(saveGame(storage,{version:1,active:freed,archive:[]})).toBe(true);
    freed=loadGame(storage).data.active as ExpandedLife;
    expect(freed.expansion.succession!.restrictions.custody?.releasedYear).toBe(427);
    expect(freed.expansion.facts.filter(f=>f.code==="asura-release")).toHaveLength(1);
  });
  it("confiscates once, pays actual dependant costs, and releases only after the second settlement", () => {
    const life = adult();
    const spouse = life.expansion.family.people[0];
    life.expansion.family.marriages.push({person: spouse.id, start: 424, end: null, reason: null});
    enterCustody(life);
    enterCustody(life);
    expect(life.coins).toBe(6);
    expect(canRelocate(life, "asura")).toBe(false);
    life.age++;
    expect(applyEconomyYear(life)).toMatchObject({earnedIncome: 0, dependantCosts: 6, necessaryEducationCosts: 0});
    settleCustodyRelease(life);
    expect(inCustody(life)).toBe(true);
    expect(life.coins).toBe(0);
    life.age++;
    applyEconomyYear(life);
    settleCustodyRelease(life);
    settleCustodyRelease(life);
    expect(inCustody(life)).toBe(false);
    expect(life.expansion.succession?.restrictions.custody).toMatchObject({enteredYear:425, releaseYear:427,releasedYear:427,confiscated:5,unmetDependants:6});
    expect(life.expansion.economy).toMatchObject({unmetFood:0,unmetShelter:0,unmetCare:0});
  });

  it("keeps dependants together without moving adult or absent relatives or charging an evacuation fare", () => {
    const life=adult(), people=life.expansion.family.people;
    for(const p of people) p.home="asura";
    const child={...structuredClone(people[0]), id:"minor",born:422,role:"child" as const};
    people.push(child,{...child,id:"absent",home:"millis"},{...child,id:"grown",born:400});
    life.coins=0;
    expect(flightTerms(life).en).toContain("Ranoa");
    politicalFlight(life);
    expect(child.home).toBe("ranoa");
    expect(people.find(p=>p.id==="grown")?.home).toBe("asura");
    expect(people.find(p=>p.id==="absent")?.home).toBe("millis");
    expect(life.region).toBe("ranoa");
    life.age+=30;
    life.coins=51;
    politicalFlight(life);
    expect(life.coins).toBe(51);
    expect(canRelocate(life,"asura")).toBe(false);
    expect(validRestrictionState(life.expansion.succession!.restrictions,life)).toBe(true);
    life.pending="expanded.travel";
    expect(getExpandedDecision(life)?.choices.find(c=>c.id==="expanded.travel.move-asura")).toMatchObject({disabled:true});
    expect(chooseExpanded(life,"expanded.travel.move-asura")).toBe(life);
    applyExpandedChoice(life,"expanded.travel.move-asura");
    expect(life.region).toBe("ranoa");
    expect(life.coins).toBe(51);
  });

  it("suspends annual focus and work during ticks and releases a living captive after K427 settlement",()=>{
    let life=adult(); enterCustody(life);
    life.focus="magic";
    const xp=life.training.magicXp;
    for(let i=0;i<4;i++) life=advanceExpanded(life,"tick",0.25);
    expect(worldYear(life)).toBe(426);
    expect(life.training.magicXp).toBe(xp);
    expect(life.expansion.economy.lastIncome).toBe(0);
    life=advanceExpanded(structuredClone(life),"year");
    expect(worldYear(life)).toBe(427);
    expect(inCustody(life)).toBe(false);
    expect(life.training.magicXp).toBe(xp);
  });

  it("records ordinary death during a sentence without granting release",()=>{
    const life=adult(); enterCustody(life); life.deathAge=26;
    const ended=advanceExpanded(life,"decision");
    expect(ended.phase).toBe("ended");
    expect(ended.expansion.succession?.restrictions.custody?.releasedYear).toBeNull();
  });
});

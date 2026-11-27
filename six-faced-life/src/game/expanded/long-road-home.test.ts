import { describe, expect, it } from "vitest";
import { choose, getDecision, openActivity } from "../engine";
import { isLife, loadGame } from "../storage";
import { canAutoChoose } from "../simulation";
import { createExpandedLife } from "./origins";
import { finishExpanded } from "./engine";
import type { ExpandedLife } from "../types";

function survivor(): ExpandedLife {
  let seed=0;
  let life=createExpandedLife({seed});
  while (life.expansion.birthYear > 409) life=createExpandedLife({seed:++seed});
  delete life.expansion.social;
  life.phase = "alive";
  life.age = Math.max(25, 420 - life.expansion.birthYear);
  life.region = "demon";
  life.expansion.origin.locality = "displaced";
  life.expansion.history.push({year:417,code:"calamity",exposure:"civilian",region:"asura",locality:"fittoa"});
  life.coins = life.expansion.economy.peak = 200;
  return life;
}
const open = (l: ExpandedLife) => openActivity(l, "long-road-home") as ExpandedLife;
const pick = (l: ExpandedLife, action: string) => choose(l, "expanded.long-road-home." + action) as ExpandedLife;
function reload(l: ExpandedLife) {
  const saved = loadGame({getItem:()=>JSON.stringify({version:1,active:l,archive:[]}),setItem:()=>{}});
  expect(saved.error).toBeFalsy();
  return saved.data.active as ExpandedLife;
}
describe("The Long Road Home", () => {
  it("requires displaced Fittoa history and a free decision slot", () => {
    const l = survivor(), h=l.expansion.history.at(-1)!;
    h.exposure="news";
    expect(open(l)).toBe(l);
    h.exposure="support"; h.locality="countryside";
    expect(open(l)).toBe(l);
    h.locality="fittoa"; l.age=7;
    expect(open(l)).toBe(l);
    l.age=8; l.expansion.queue.push("expanded.reading");
    expect(open(l)).toBe(l);
    l.expansion.queue.pop(); l.pending="expanded.calamity";
    expect(open(l)).toBe(l);
    l.pending=null;
    expect(getDecision(open(l))?.choices.find(c=>c.id.endsWith(".passage"))?.disabled).toBe(true);
  });
  it.each([96,100])("defers and recovers once from %i health", health => {
    const l=survivor(), first=reload(open(l));
    expect(canAutoChoose(first)).toBe(false);
    const later=pick(first,"later");
    const chosen=pick(open(later),"refuge");
    expect(open(chosen)).toBe(chosen);
    chosen.age++; chosen.stats.health=health;
    const follow=reload(open(chosen));
    expect(canAutoChoose(follow)).toBe(false);
    const done=pick(follow,"recover");
    expect(done.stats.health).toBe(100);
    expect(done.history.at(-1)?.text).toContain("+"+(100-health));
    expect(done.coins).toBe(l.coins);
    expect(open(done)).toBe(done);
    expect(done.rng).toBe(l.rng);
    expect(done.expansion.familyRng).toBe(l.expansion.familyRng);
  });
  it("rechecks the fare, waits without payment and applies ordinary migration once", () => {
    const l=survivor();
    l.coins=119;
    expect(pick(open(l),"passage").expansion.longRoadHome).toBeUndefined();
    l.coins=120;
    const booked=reload(pick(open(l),"passage"));
    expect(booked.coins).toBe(120);
    booked.age++; booked.coins=119;
    const restricted=structuredClone(booked);
    restricted.coins=200;
    restricted.expansion.succession!.restrictions.exile = {year:420,confiscated:0,movedIds:[],stayedIds:[],lostHousing:false};
    const banned=open(restricted);
    expect(getDecision(banned)?.choices.find(c=>c.id.endsWith(".board"))?.disabled).toBe(true);
    const blocked=open(booked);
    expect(pick(blocked,"board")).toBe(blocked);
    const waited=pick(blocked,"wait");
    const cancelled=pick(open(waited),"cancel");
    expect(cancelled.coins).toBe(119);
    expect(open(cancelled)).toBe(cancelled);
    waited.coins=120;
    const boarded=pick(open(waited),"board");
    expect([boarded.coins,boarded.region,boarded.expansion.origin.locality]).toEqual([0,"asura","countryside"]);
    expect(boarded.expansion.economy.travelUntil).toBe(boarded.age+boarded.expansion.birthYear+1);
    expect(boarded.expansion.family).toEqual(l.expansion.family);
    expect(boarded.expansion.facts.some(f=>f.code==="migration" && f.detail==="asura")).toBe(true);
    expect(isLife(boarded)).toBe(true);
  });
  it("ends a commitment on an independent move or death", () => {
    const l=pick(open(survivor()),"refuge");
    const moved=choose(openActivity(l,"travel"),"expanded.travel.move-asura") as ExpandedLife;
    expect(moved.expansion.longRoadHome?.resolution).toBe("left");
    const returned=choose(openActivity(moved,"travel"),"expanded.travel.move-demon") as ExpandedLife;
    expect(open(returned)).toBe(returned);
    finishExpanded(l,"illness");
    expect(l.expansion.longRoadHome?.resolution).toBe("ended");
  });
});

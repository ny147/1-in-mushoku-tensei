import { describe, expect, it } from "vitest";
import { advance, choose, createLife, getDecision, openActivity, setFocus } from "../engine";
import { canAutoChoose } from "../simulation";
import { isLife, loadGame, saveGame } from "../storage";
import type { ExpandedLife } from "../types";
import { educationRequirements, universityQuote } from "./education";

const event = "expanded.rikarisu-passage";
const open = (life: ExpandedLife) => openActivity(life, "rikarisu-passage") as ExpandedLife;
const pick = (life: ExpandedLife, action: string) => choose(life, `${event}.${action}`) as ExpandedLife;
const year = (life: ExpandedLife) => advance(life, "year") as ExpandedLife;

function worker(): ExpandedLife {
  let seed = 0;
  let life = createLife({ seed, region: "demon" }) as ExpandedLife;
  while (life.race !== "migurd") life = createLife({ seed: ++seed, region: "demon" }) as ExpandedLife;
  life.phase = "alive";
  life.age = life.expansion.lastRandom = 19;
  life.expansion.processedYear = life.expansion.birthYear + life.age;
  delete life.expansion.social;
  life.expansion.genetics.academicTalent = life.expansion.genetics.magicTalent = false;
  life.stats.health = 100;
  life.stats.knowledge = 50;
  life.training.magicXp = 65;
  life.coins = life.expansion.economy.peak = 60;
  life.expansion.economy.familyFunds = 0;
  return life;
}

function reload(life: ExpandedLife) {
  let raw: string | null = null;
  const storage = { getItem: () => raw, setItem: (_: string, value: string) => { raw = value; } };
  expect(saveGame(storage, { version: 1, active: life, archive: [] })).toBe(true);
  const restored = loadGame(storage);
  expect(restored.error).toBeNull();
  return restored.data.active as ExpandedLife;
}

const worked = (life: ExpandedLife) => year(setFocus(life, "work") as ExpandedLife);

describe("Passage from Rikarisu", () => {
  it("opens only for eligible Migurd and keeps both cards manual after reload", () => {
    const life = worker();
    expect(isLife(life)).toBe(true);
    expect(open({ ...life, age: 14 }).pending).toBeNull();
    expect(open({ ...life, race: "dwarf" }).pending).toBeNull();
    expect(open({ ...life, region: "ranoa" }).pending).toBeNull();
    const displaced = structuredClone(life);
    displaced.expansion.origin.locality = "displaced";
    expect(open(displaced)).toBe(displaced);
    const busy = { ...life, pending: "expanded.reading" };
    expect(open(busy)).toBe(busy);
    const queued = structuredClone(life);
    queued.expansion.queue.push("expanded.reading");
    expect(open(queued)).toBe(queued);
    const opened = open(life);
    expect(opened.pending).toBe(event);
    const offer = reload(opened);
    expect(canAutoChoose(offer)).toBe(false);
    expect(open(pick(offer, "later")).pending).toBe(event);
    const started = reload(pick(offer, "accept"));
    expect(open(started)).toBe(started);
    const payout = reload(open(worked(started)));
    expect(payout.pending).toBe(event);
    expect(canAutoChoose(payout)).toBe(false);
  });

  it("credits only local work and pays cash once without creating any fare credit", () => {
    const started = pick(open(worker()), "accept");
    const away = worked({ ...started, region: "ranoa" });
    const returned = open({ ...away, region: "demon" });
    expect(returned.pending).toBe(event);
    expect(pick(returned, "cash")).toBe(returned);
    const idle = open(year(started));
    expect(pick(idle, "fare")).toBe(idle);

    const payout = open(worked(started));
    const cash = reload(pick(payout, "cash"));
    expect(cash.coins).toBe(payout.coins + 48);
    expect(universityQuote(cash).travel).toBe(120);
    expect(open(cash)).toBe(cash);
    expect(choose(cash, `${event}.cash`)).toBe(cash);
    const malformed = structuredClone(cash);
    delete malformed.expansion.rikarisuPassage!.workedYear;
    expect(isLife(malformed)).toBe(false);
  });

  it("reduces only the university fare and redeems the credit once on enrollment", () => {
    const payout = open(worked(pick(open(worker()), "accept")));
    const fare = reload(pick(payout, "fare"));
    expect([fare.region, fare.coins, fare.rng]).toEqual(["demon", payout.coins, payout.rng]);
    expect(universityQuote(fare)).toMatchObject({ travel: 0, admission: 80, tuition: 160, living: 72, total: 312 });
    expect(educationRequirements(fare).find(r => r.id === "funding")?.required).toBe(312);
    expect(universityQuote({ ...fare, region: "forest" }).travel).toBe(40);
    const traveler = structuredClone(fare);
    traveler.coins = traveler.expansion.economy.peak = 200;
    const moved = choose(openActivity(traveler, "travel"), "expanded.travel.move-ranoa") as ExpandedLife;
    expect([moved.region, moved.coins, moved.expansion.rikarisuPassage?.settlement]).toEqual(["ranoa", 80, "fare"]);

    const unready = reload({ ...fare, stats: { ...fare.stats, knowledge: 39 } });
    const rejected = openActivity(unready, "university");
    expect(choose(rejected, "expanded.university.enroll-loan")).toBe(rejected);
    const declined = choose(openActivity(fare, "university"), "expanded.university.later") as ExpandedLife;
    expect(universityQuote(declined).travel).toBe(0);

    const quote = universityQuote(fare);
    const admission = openActivity(fare, "university");
    expect(getDecision(admission)?.text).toContain("Your earned Rikarisu passage covers the full fare");
    expect(getDecision(admission)?.localized?.text).toContain("เจ้าของร้านจากริคาริสุจ่ายค่าเดินทาง");
    const enrolled = reload(choose(admission, "expanded.university.enroll-loan") as ExpandedLife);
    expect([enrolled.region, enrolled.expansion.education.stage]).toEqual(["ranoa", "university"]);
    expect(enrolled.expansion.finance?.purposes.university?.borrowed).toBe(quote.loan);
    expect(enrolled.expansion.rikarisuPassage?.settlement).toBe("used");
    expect(universityQuote({ ...enrolled, region: "demon" }).travel).toBe(120);
  });

  it("keeps the earned passage when a full scholarship already pays the fare", () => {
    const payout = open(worked(pick(open(worker()), "accept")));
    const fare = pick(payout, "fare");
    fare.expansion.education.assessed = fare.expansion.genetics.magicTalent = true;
    fare.expansion.education.assessment = 80;
    const enrolled = reload(choose(openActivity(fare, "university"), "expanded.university.enroll") as ExpandedLife);
    expect(enrolled.expansion.education.scholarship).toBe(true);
    expect(enrolled.expansion.rikarisuPassage?.settlement).toBe("fare");
    expect(enrolled.expansion.finance?.purposes.university).toBeUndefined();
  });
});

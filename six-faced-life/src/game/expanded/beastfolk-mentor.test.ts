import { describe, expect, it } from "vitest";
import { advance, choose, createLife, getDecision, openActivity, setFocus } from "../engine";
import { canAutoChoose } from "../simulation";
import { isLife, loadGame, saveGame } from "../storage";
import type { ExpandedLife } from "../types";

const event = "expanded.beastfolk-mentor";
const open = (life: ExpandedLife) => openActivity(life, "beastfolk-mentor") as ExpandedLife;
const pick = (life: ExpandedLife, action: string) => choose(life, `${event}.${action}`) as ExpandedLife;

function pupil(): ExpandedLife {
  let seed = 0;
  let life = createLife({ seed, region: "forest" }) as ExpandedLife;
  while (life.race !== "beastfolk") life = createLife({ seed: ++seed, region: "forest" }) as ExpandedLife;
  life.phase = "alive";
  life.age = life.expansion.lastRandom = 16;
  life.expansion.processedYear = life.expansion.birthYear + life.age;
  life.expansion.genetics.magicTalent = life.expansion.genetics.academicTalent = false;
  life.stats.knowledge = 56;
  life.training.magicXp = 0;
  life.coins = life.expansion.economy.peak = 18;
  life.expansion.economy.familyFunds = 0;
  life.expansion.economy.aidUntil = life.expansion.processedYear + 3;
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

const year = (life: ExpandedLife) => advance(life, "year") as ExpandedLife;

describe("A Letter to Ranoa", () => {
  it("opens in the Great Forest for Beastfolk from age 12 and respects pending decisions", () => {
    const life = pupil();
    life.age = 11;
    expect(open(life)).toBe(life);
    life.age = 12;
    expect(open({ ...life, race: "elf" }).pending).toBeNull();
    expect(open({ ...life, region: "ranoa" }).pending).toBeNull();
    const busy = { ...life, pending: "expanded.reading" };
    expect(open(busy)).toBe(busy);
    const queued = structuredClone(life);
    queued.expansion.queue.push("expanded.reading");
    expect(open(queued)).toBe(queued);
    const decision = open(life);
    expect(decision.pending).toBe(event);
    expect(canAutoChoose(decision)).toBe(false);
    expect(open(pick(decision, "later")).pending).toBe(event);
  });

  it("counts a local Study year and funds ordinary admission via a saved recommendation", () => {
    const life = pupil();
    const ordinaryAdmission = getDecision(openActivity(life, "university"));
    expect(ordinaryAdmission?.choices.find(c => c.id.endsWith(".enroll"))?.disabled).toBe(true);
    const accepted = reload(pick(reload(open(life)), "study"));
    expect(open(accepted)).toBe(accepted);
    const waiting = year(accepted);
    const beforeStudy = open(waiting);
    expect(beforeStudy.pending).toBe(event);
    expect(pick(beforeStudy, "letter")).toBe(beforeStudy);
    const abroad = year(setFocus({ ...waiting, region: "ranoa" }, "study") as ExpandedLife);
    const back = open({ ...abroad, region: "forest" });
    expect(back.pending).toBe(event);
    expect(pick(back, "letter")).toBe(back);

    const studied = year(setFocus(waiting, "study") as ExpandedLife);
    const ready = reload(open(studied));
    expect(ready.pending).toBe(event);
    expect(canAutoChoose(ready)).toBe(false);
    expect(getDecision(ready)?.localized?.title).toBe("จดหมายถึงราโนอา");
    const letter = reload(pick(ready, "letter"));
    expect(getDecision(letter)).toBeNull();
    expect(open(letter)).toBe(letter);
    expect(letter.region).toBe("forest");
    expect(letter.expansion.education.assessment).toBeGreaterThanOrEqual(60);
    expect([letter.rng, letter.expansion.familyRng]).toEqual([ready.rng, ready.expansion.familyRng]);
    const enrolled = choose(openActivity(letter, "university"), "expanded.university.enroll") as ExpandedLife;
    expect([enrolled.region, enrolled.expansion.education.stage, enrolled.expansion.education.scholarship])
      .toEqual(["ranoa", "university", true]);
    expect(enrolled.coins).toBe(letter.coins);
    expect(enrolled.expansion.finance?.purposes.university).toBeUndefined();
    expect(isLife(enrolled)).toBe(true);
  });

  it("pays once for local work and rejects a recommendation without a study year", () => {
    const started = pick(open(pupil()), "study");
    const followUp = reload(open(year(started)));
    const work = reload(pick(followUp, "local-work"));
    expect(work.coins).toBe(followUp.coins + 12);
    expect([work.expansion.career.role, work.region]).toEqual([followUp.expansion.career.role, "forest"]);
    expect(open(work)).toBe(work);
    expect(choose(work, `${event}.local-work`)).toBe(work);
    const bad = structuredClone(work);
    bad.expansion.beastfolkMentor!.completed = "letter";
    expect(isLife(bad)).toBe(false);
  });
});

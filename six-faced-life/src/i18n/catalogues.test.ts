import { describe, expect, it } from "vitest";
import { createLife } from "../game/engine";
import { EVENTS } from "../game/events";
import { CAREER_TITLES, MAGIC_SCHOOLS, SCHOOL_IDS } from "../game/progression";
import { CAREERS, FOCUSES, RACES, REGIONS, RANKS } from "../game/world";
import type { Career, Life, RaceId, RegionId } from "../game/types";
import { translate, UI_TH } from "./messages";
import { decisionText } from "./story";
import { domainText } from "./world";

const thai = (text: string) => {
  expect(text).toMatch(/[\u0e00-\u0e7f]/);
  expect(text).not.toMatch(/[A-Za-z]{2,}/);
};

describe("complete Thai catalogues", () => {
  it("covers all events and generated choices across world and progression variants", () => {
    const base = createLife({ ruleset: 'legacy-1', seed: 44 });
    const checked = new Set<string>();
    expect(EVENTS).toHaveLength(55);
    for (const region of Object.keys(REGIONS) as RegionId[])
      for (const race of Object.keys(RACES) as RaceId[])
        for (const school of SCHOOL_IDS)
          for (const career of Object.keys(CAREER_TITLES) as Career[])
            for (const level of [0, 1, 2, 3]) {
              const life: Life = structuredClone(base);
              Object.assign(life, {
                region,
                race,
                age: 40,
                career,
                coins: 10000,
              });
              life.training.magicXp = life.training.swordXp = 2000;
              life.training.magicCap = life.training.swordCap = 5;
              life.progression!.specialization = school;
              life.progression!.career = {
                role: career,
                level,
                experience: 1000,
                years: 20,
                reputation: 100,
              };
              for (const id of SCHOOL_IDS)
                life.progression!.magic[id].xp = 2000;
              for (const event of EVENTS) {
                const original = {
                  id: event.id,
                  title: event.title,
                  text: event.text,
                  kind: event.kind,
                  choices: event.choices(life),
                };
                const signature = JSON.stringify([
                  event.id,
                  original.choices.map((c) => [
                    c.id,
                    c.label,
                    c.description,
                    c.outcome,
                  ]),
                ]);
                if (checked.has(signature)) continue;
                checked.add(signature);
                const before = structuredClone(original);
                const localized = decisionText(original, life, "th");
                for (const field of [
                  localized.title,
                  localized.text,
                  localized.kind,
                ])
                  thai(field);
                for (const option of localized.choices) {
                  for (const field of [
                    option.label,
                    option.description,
                    option.outcome,
                  ])
                    thai(field);
                  expect(option.id).toBe(
                    original.choices.find((c) => c.id === option.id)!.id,
                  );
                }
                expect(original).toEqual(before);
                expect(decisionText(original, life, "en")).toEqual(original);
              }
            }
  }, 30000);

  it("covers every domain description, rank, career title and spell", () => {
    for (const record of [RACES, REGIONS, FOCUSES, MAGIC_SCHOOLS])
      for (const item of Object.values(record)) {
        thai(domainText("th", item.name));
        thai(domainText("th", item.description));
      }
    for (const item of Object.values(CAREERS))
      thai(domainText("th", item.name));
    for (const rank of RANKS) thai(domainText("th", rank));
    for (const titles of Object.values(CAREER_TITLES))
      for (const title of titles) thai(domainText("th", title));
    let spells = 0;
    for (const school of Object.values(MAGIC_SCHOOLS))
      for (const spell of school.spells) {
        thai(domainText("th", spell.name));
        thai(domainText("th", spell.description));
        spells++;
      }
    expect(spells).toBe(30);
  });

  it("covers childhood wording, both risk warnings and every instruction threshold", () => {
    for (const age of [4, 20])
      for (const cap of [1, 2, 3, 4, 5])
        for (const xp of [0, 2000]) {
          const life = createLife({ ruleset: 'legacy-1', seed: 14 });
          life.age = age;
          life.training.magicCap = cap;
          life.stats.mana = life.stats.sword = xp;
          for (const id of [
            "help-neighbor",
            "guild-quest",
            "magic-assessment",
          ]) {
            const event = EVENTS.find((e) => e.id === id)!;
            const localized = decisionText(
              { ...event, choices: event.choices(life) },
              life,
              "th",
            );
            for (const choice of localized.choices)
              for (const value of [
                choice.label,
                choice.description,
                choice.outcome,
              ])
                thai(value);
          }
        }
  });

  it("translates UI messages and parameters without altering personal names", () => {
    expect(Object.keys(UI_TH).length).toBeGreaterThan(50);
    for (const [key, value] of Object.entries(UI_TH)) {
      expect(value.trim()).not.toBe("");
      expect(translate("th", key)).toBe(value);
      expect(translate("en", key)).toBe(key);
    }
    expect(translate("th", "Knowledge +8")).toBe("ความรู้ +8");
    expect(translate("th", "Aster Ashvale")).toBe("Aster Ashvale");
    expect(translate("th", "Age {age}", { age: 12 })).toBe("อายุ 12");
  });
});

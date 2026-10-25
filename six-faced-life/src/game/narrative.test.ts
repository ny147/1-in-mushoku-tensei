import { describe, expect, it } from "vitest";
import {
  advance,
  beginLife,
  choose,
  createLife,
  finishLife,
  getDecision,
} from "./engine";
import { FOCUSES } from "./world";
import type { Focus, Life } from "./types";
import { entryText } from "../i18n/story";
import { loadGame, SAVE_KEY } from "./storage";
import { annualMessage } from "./narrative";

const incompleteBirthParameters: Record<string, string | number>[] = [
  {},
  { background: 42 },
  { background: "" },
];
describe("saved narrative references", () => {
  it.each(incompleteBirthParameters)(
    "falls back safely for incomplete birth parameters %j",
    (extra) => {
      const entry = createLife({ seed: 14 }).history[0];
      entry.message = { key: "birth", params: { region: "asura", ...extra } };
      expect(entryText(entry, "th")).toEqual({
        title: entry.title,
        text: entry.text,
      });
    },
  );
  it("captures a birth and keeps old unreferenced English text readable", () => {
    const life = createLife({ seed: 14, region: "asura", language: "th" });
    expect(life.history[0].message).toBeDefined();
    expect(entryText(life.history[0], "th").text).toContain("อาณาจักรอัสรา");
    expect(entryText(life.history[0], "en").text).toBe(life.history[0].text);
    const legacy = { ...life.history[0] };
    delete legacy.message;
    expect(entryText(legacy, "th")).toEqual({
      title: legacy.title,
      text: legacy.text,
    });
    expect(
      entryText({ ...legacy, message: { key: "future.unknown" } }, "th"),
    ).toEqual(entryText(legacy, "th"));
  });

  it("captures annual focuses and infant entries independently of later focus", () => {
    const life = createLife({ seed: 14 });
    for (const focus of Object.keys(FOCUSES) as Focus[]) {
      life.age = 8;
      life.focus = focus;
      const entry = {
        ...life.history[0],
        title: "original",
        text: "original",
        message: annualMessage(life),
      };
      life.focus = "rest";
      expect(entryText(entry, "th").title).toMatch(/[\u0e00-\u0e7f]/);
      expect(entryText(entry, "th").text).not.toMatch(/[A-Za-z]{2,}/);
    }
    life.age = 1;
    expect(annualMessage(life).key).toBe("infancy");
  });

  it("retains event-time travel, career and study values in past choices", () => {
    for (const [event, choice] of [
      ["journey", "travel-ranoa"],
      ["study-path", "study-fire"],
      ["career-promotion", "accept-promotion"],
    ]) {
      const life = beginLife(createLife({ seed: 14 }));
      Object.assign(life, {
        age: 30,
        region: "asura",
        pending: event,
        career: "guard",
        coins: 500,
      });
      life.training.swordXp = 500;
      life.progression!.career = {
        role: "guard",
        level: 0,
        experience: 200,
        years: 20,
        reputation: 100,
      };
      const after = choose(life, choice);
      const entry = after.history.at(-1)!;
      expect(entry.message?.key).toBe(`choice.${event}.${choice}`);
      const text = entryText(entry, "th");
      expect(text.text).not.toMatch(/[A-Za-z]{2,}/);
      after.region = "demon";
      after.career = "teacher";
      after.progression!.specialization = "earth";
      expect(entryText(entry, "th")).toEqual(text);
    }
  });

  it("captures failed risky outcomes rather than promising the successful result", () => {
    let found = false;
    for (let seed = 1; seed < 100 && !found; seed++) {
      const life = beginLife(createLife({ seed }));
      life.age = 30;
      life.pending = "guild-quest";
      life.coins = 500;
      const after = choose(life, "ruin");
      const entry = after.history.at(-1)!;
      if (entry.text.startsWith("The risk does not pay off")) {
        found = true;
        expect(entryText(entry, "th").text).toContain("บาดเจ็บ");
        expect(entry.message?.params?.failed).toBe(1);
      }
    }
    expect(found).toBe(true);
  });

  it("keeps the childhood version of a changing choice label in history", () => {
    const life = beginLife(createLife({ seed: 14 }));
    life.age = 4;
    life.pending = "help-neighbor";
    const after = choose(life, "focus");
    expect(entryText(after.history.at(-1)!, "th").title).toBe("กลับไปเรียนต่อ");
  });

  it("captures learned spells from choices and yearly practice, plus family farewells", () => {
    const life = beginLife(createLife({ seed: 14 }));
    life.pending = "reading";
    life.coins = 500;
    const choice = choose(life, "primer");
    const learned = choice.history.find(
      (e) => e.message?.key === "spells.choice",
    )!;
    expect(learned).toBeDefined();
    expect(entryText(learned, "th").text).toContain("รวบรวมน้ำ");
    const practice = beginLife(createLife({ seed: 14 }));
    practice.pending = null;
    practice.age = 8;
    practice.focus = "magic";
    practice.family[0].bornAt = practice.age + 1 - practice.family[0].lifespan;
    const after = advance(practice, "year");
    const annual = after.history.find((e) => e.message?.key === "spells.year")!;
    const farewell = after.history.find((e) => e.message?.key === "farewell")!;
    expect(entryText(annual, "th").text).toContain("รวบรวมน้ำ");
    expect(entryText(farewell, "th").title).toContain(
      practice.family[0].name.split(" ")[0],
    );
    expect(entryText(farewell, "th").text).toContain("แม่");
  });

  it("localizes every ending cause and legacy", () => {
    for (const cause of [
      "Your health declined, and this life came gently to its close.",
      "After a lifetime of seasons, you passed away of old age.",
      "The injuries of a dangerous journey brought this life to an early close.",
    ]) {
      for (const branch of [
        "taughtOthers",
        "bonds",
        "magic",
        "sword",
        "ordinary",
      ]) {
        const life = createLife({ seed: 14 });
        life.stats.bonds = branch === "bonds" ? 80 : 20;
        life.flags.taughtOthers = branch === "taughtOthers";
        life.training.magicXp = branch === "magic" ? 300 : 0;
        life.training.swordXp = branch === "sword" ? 300 : 0;
        finishLife(life, cause);
        expect(entryText(life.history.at(-1)!, "th").text).not.toMatch(
          /[A-Za-z]{2,}/,
        );
      }
    }
  });

  it("keeps full seeded futures equal across languages and gives every new entry a reference", () => {
    function run(language: "en" | "th", seed: number) {
      let life = beginLife(createLife({ seed, language }));
      for (let i = 0; i < 1000 && life.phase !== "ended"; i++) {
        const decision = getDecision(life);
        if (decision) {
          const choices = decision.choices.filter(
            (c) => !c.disabled && (c.cost ?? 0) <= life.coins,
          );
          life = choose(life, choices[seed % choices.length].id);
        } else life = advance(life, "year");
      }
      expect(life.phase).toBe("ended");
      for (const entry of life.history) {
        expect(entry.message).toBeDefined();
        const localized = entryText(entry, "th");
        expect(localized.title).toMatch(/[\u0e00-\u0e7f]/);
        // Farewell titles contain unchanged generated personal names.
        if (entry.message?.key !== "farewell")
          expect(localized.text).not.toMatch(/[A-Za-z]{2,}/);
      }
      const { language: _, ...simulation } = life;
      return simulation;
    }
    for (let seed = 1; seed <= 12; seed++)
      expect(run("th", seed)).toEqual(run("en", seed));
  });

  it("retains unreadable raw saves when optional narrative metadata is malformed", () => {
    for (const message of [
      null,
      [],
      {},
      { key: "" },
      { key: "x".repeat(161) },
      { key: "birth", params: [] },
      { key: "birth", params: { region: {} } },
      { key: "birth", params: { name: "x".repeat(501) } },
      {
        key: "birth",
        params: Object.fromEntries(
          Array.from({ length: 21 }, (_, i) => [String(i), i]),
        ),
      },
    ]) {
      const life: Life = createLife({ seed: 14 });
      life.history[0].message = message as never;
      const raw = JSON.stringify({ version: 1, active: life, archive: [] });
      const result = loadGame({
        getItem: (key) => (key === SAVE_KEY ? raw : null),
        setItem() {
          throw Error("must not write");
        },
      });
      expect(result.error).toBeTruthy();
    }
  });
});

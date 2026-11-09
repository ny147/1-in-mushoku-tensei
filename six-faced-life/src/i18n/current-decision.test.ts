import { expect, it } from "vitest";
import { currentDecisionText } from "./current-decision";
import { createExpandedLife } from "../game/expanded/origins";
import { getDecision } from "../game/engine";
import { decisionText, entryText } from "./story";
it.each(["en", "th"] as const)(
  "isolates %s live quotes from canonical outcomes, saves and history",
  (language) => {
    const l = createExpandedLife({ seed: 1, language });
    l.age = 20;
    l.phase = "alive";
    l.coins = 0;
    l.expansion.economy.familyFunds = 0;
    l.expansion.birthYear = 420;
    l.expansion.politics.faction = "orsted";
    l.expansion.politics.contact = true;
    l.expansion.training!.selection = { role: "mage", mode: "full-time" };
    for (const event of [
      "training",
      "training-quote",
      "university",
      "instruction",
      "aid",
      "service",
      "assignment",
    ]) {
      l.pending = `expanded.${event}`;
      if (event === "service") {
        l.expansion.serviceContext = {
          year: 440,
          code: "authored-conflict",
          region: l.region,
          locality: l.expansion.origin.locality,
        };
        l.expansion.history.push({
          ...l.expansion.serviceContext,
          exposure: "participant",
        });
      }
      const d = getDecision(l)!;
      expect(d, event).not.toBeNull();
      const before = JSON.stringify({ l, d });
      const history = l.history.map((e) => entryText(e, language));
      const localized = decisionText(d, l, language);
      const live = currentDecisionText(d, l, language);
      expect(live.choices.map((c) => c.outcome)).toEqual(
        localized.choices.map((c) => c.outcome),
      );
      expect(live.choices.map(({ label, description, ...c }) => c)).toEqual(
        localized.choices.map(({ label, description, ...c }) => c),
      );
      expect(JSON.stringify({ l, d })).toBe(before);
      expect(l.history.map((e) => entryText(e, language))).toEqual(history);
      const copy =
        live.text + live.choices.map((c) => c.label + c.description).join(" ");
      expect(copy).not.toMatch(/coins?|เหรียญ(?!เงิน)/);
      if (event === "training-quote") {
        expect(copy).toContain(
          language === "en" ? "24 silver/year" : "24 เหรียญเงินต่อปี",
        );
        expect(copy).toContain(
          language === "en" ? "Loan 24 silver" : "เงินกู้ 24 เหรียญเงิน",
        );
        expect(copy).toContain(
          language === "en"
            ? "Borrow 24 silver and enroll"
            : "กู้ 24 เหรียญเงินและเริ่มฝึก",
        );
      }
    }
    const unknown = {
      id: "custom",
      title: "Old offer",
      text: "A custom offer",
      kind: "Life",
      choices: [],
    };
    expect(currentDecisionText(unknown, l, language)).toEqual(
      decisionText(unknown, l, language),
    );
  },
);

it.each(["en", "th"] as const)("keeps %s funded and borrowed university offers distinct", language => {
  const life = createExpandedLife({seed: 1, language});
  life.phase = "alive"; life.age = 20; life.coins = 0;
  life.pending = "expanded.university"; life.expansion.economy.familyFunds = 0;
  life.stats.knowledge = 40; life.training.magicXp = 60;
  life.expansion.genetics.magicTalent = false;
  life.expansion.genetics.academicTalent = false;
  const canonical = getDecision(life)!;
  const localized = decisionText(canonical, life, language);
  const current = currentDecisionText(canonical, life, language);
  const funded = current.choices.find(c => c.id.endsWith(".enroll"))!;
  const borrowed = current.choices.find(c => c.id.endsWith(".enroll-loan"))!;
  expect(funded.label).toBe(localized.choices.find(c=>c.id===funded.id)!.label);
  expect(funded.label).not.toBe(borrowed.label);
  expect(funded.disabled).toBe(true);
  expect(borrowed.disabled).toBe(false);
});

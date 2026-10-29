import { describe, expect, it } from "vitest";
import { beginLife, createLife, getDecision, choose } from "../game/engine";
import { createExpandedLife } from "../game/expanded/origins";
import { choiceEffects } from "./choice-effects";
import { choiceChanges } from "./choice-changes";
import type { ExpandedLife } from "../game/types";
import { EXPANDED_COPY } from "./expanded";
import {allocateSwordStyle} from '../game/expanded/sword-state';

describe("effect presentation boundaries", () => {
  it('previews weaker-style learning without inventing a strongest-style stat gain',()=>{
    const l=createExpandedLife({seed:1});l.phase='alive';l.age=30;l.pending='expanded.practice';allocateSwordStyle(l,'sword-god');l.expansion.swords!.tracks['sword-god'].xp=110;allocateSwordStyle(l,'water-god');l.stats.sword=5+Math.sqrt(110)*3;l.expansion.education.assessed=true;l.expansion.genetics.swordTalent=false;
    const c=getDecision(l)!.choices.find(c=>c.id.endsWith('.sword'))!;expect(choiceEffects(l,c,'en').join(' ')).not.toContain('Sword skill +');expect(choose(l,c.id).stats.sword).toBe(l.stats.sword);
  });
  it("also previews the mana developed by a real magic-practice choice", () => {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = 8;
    l.pending = "expanded.practice";
    l.stats.mana = 14;
    l.training.magicXp = 0;
    l.expansion.education.assessed = true;
    l.expansion.genetics.magicTalent = false;
    const c = getDecision(l)!.choices.find((c) => c.id.endsWith(".magic"))!;
    expect(choiceEffects(l, c, "en")).toContain("Mana +10.39");
    expect(choose(l, c.id).stats.mana - l.stats.mana).toBeCloseTo(10.39, 2);
  });
  it("quotes promoted job base pay without claiming it replaces a full-time stipend", () => {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = 18;
    l.pending = "expanded.career";
    l.expansion.career.role = "farmer";
    const record = l.expansion.career.records.farmer;
    Object.assign(record, { xp: 100, years: 3, reputation: 20 });
    l.expansion.training!.active = "guard";
    l.expansion.training!.mode = "full-time";
    l.expansion.training!.paused = false;
    const c = getDecision(l)!.choices.find((c) => c.id.endsWith(".promote"))!;
    const preview = choiceEffects(l, c, "en").join(" ");
    expect(preview).toContain("Job base pay 20 → 28 silver/year");
    expect(preview).toContain("24/year stipend");
    const after = choose(l, c.id);
    expect(choiceChanges(l, after).join(" ")).not.toContain("Yearly income");
  });
  it("reports actual annual income including the work-focus bonus", () => {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = 18;
    l.pending = "expanded.work";
    l.focus = "work";
    l.stats.health = 80;
    const after = choose(l, "expanded.work.farmer");
    expect(choiceChanges(l, after)).toContain(
      "Yearly income 0 → 26 silver before expenses",
    );
  });
  it("keeps all legacy effect labels in Thai, including caps and reputation", () => {
    const l = beginLife(
      createLife({ ruleset: "legacy-1", seed: 32, language: "th" }),
    );
    const effects = choiceEffects(
      l,
      {
        id: "test",
        label: "",
        description: "",
        outcome: "",
        magicCap: 2,
        swordCap: 2,
        reputation: 5,
        careerXp: 2,
        schoolXp: { water: 4 },
      },
      "th",
    );
    expect(effects.join(" ")).not.toMatch(/[A-Za-z]{2,}/);
  });
  it("caps reward previews at the purse limit while keeping fees separate", () => {
    const l = beginLife(createLife({ ruleset: "legacy-1", seed: 32 }));
    l.coins = 999999;
    expect(
      choiceEffects(
        l,
        { id: "test", label: "", description: "", outcome: "", coins: 20 },
        "en",
      ),
    ).toContain("Silver +1");
  });
  it("gives every actionable expanded choice a disclosure without changing RNG or the save", () => {
    const l = createExpandedLife({ seed: 2 });
    l.phase = "alive";
    l.age = 30;
    l.expansion.birthYear = 400;
    l.coins = 1000;
    l.expansion.politics.faction = "orsted";
    l.expansion.politics.contact = true;
    l.expansion.standing.title = 7;
    l.expansion.education.stage = "university";
    const visited = new Set<string>();
    for (const key of Object.keys(EXPANDED_COPY)) {
      l.pending = `expanded.${key}`;
      if (key === "university") l.expansion.education.stage = "none";
      if (key === "school-year") l.expansion.education.stage = "university";
      const decision = getDecision(l);
      if (!decision) continue;
      const original = structuredClone(l);
      for (const c of decision.choices) {
        visited.add(key);
        for (const language of ["en", "th"] as const)
          expect(
            choiceEffects(l, c, language).length,
            `${key}.${c.id} ${language}`,
          ).toBeGreaterThan(0);
      }
      expect(l).toEqual(original);
    }
    expect(visited.size).toBeGreaterThan(24);
  });
  it("reports training enrollment, debt and restored-pending previews from real state", () => {
    const l = createExpandedLife({ seed: 1 });
    l.phase = "alive";
    l.age = 18;
    l.pending = "expanded.training";
    l.coins = 0;
    l.expansion.economy.familyFunds = 0;
    const selection = choose(l, "expanded.training.course-guard") as ExpandedLife;
    const quote = choose(selection,'expanded.training-quote.sword-god') as ExpandedLife;
    const restored = JSON.parse(JSON.stringify(quote)) as ExpandedLife;
    const offer = getDecision(restored)!;
    const enroll = offer.choices.find((c) => c.id.endsWith("enroll-loan"))!;
    expect(choiceEffects(restored, enroll, "en").join(" ")).toContain(
      "Starts the quoted course",
    );
    const after = choose(restored, enroll.id);
    const changes = choiceChanges(restored, after).join(" ");
    expect(changes).toContain("Active training → Guard");
    expect(changes).toContain("Education debt +16");
    expect(changes).toContain("24 silver before expenses");
    expect(choiceChanges(restored, after)).toEqual(choiceChanges(quote, after));
  });
});

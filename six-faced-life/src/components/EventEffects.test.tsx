// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "../i18n/context";
import { DecisionPanel } from "./LifeView";
import { createExpandedLife } from "../game/expanded/origins";
import { beginLife, createLife } from "../game/engine";
import type { ExpandedLife, Language, Life } from "../game/types";

afterEach(cleanup);
function show(l: Life) {
  render(
    <LanguageProvider language={l.language ?? "en"}>
      <DecisionPanel life={l} onChoose={() => {}} onAdvance={() => {}} />
    </LanguageProvider>,
  );
}
function fixture(event: string, language: Language = "en"): ExpandedLife {
  const l = createExpandedLife({ seed: 1, language });
  l.phase = "alive";
  l.age = 18;
  l.pending = `expanded.${event}`;
  l.coins = 200;
  l.focus = "magic";
  l.expansion.education.assessed = true;
  l.expansion.genetics.magicTalent = false;
  l.expansion.genetics.academicTalent = false;
  l.expansion.genetics.swordTalent = false;
  return l;
}
describe("consequences before choosing", () => {
  it("shows protection strength, expiry and the persistent focus switch before payment", () => {
    const l = fixture("protection");
    const snapshot = structuredClone(l);
    show(l);
    const accept = screen.getByRole("button", {
      name: /Serve and seek protection/,
    });
    expect(accept.textContent).toContain("Violence risk ×0.5");
    expect(accept.textContent).toContain(
      `through K${l.expansion.birthYear + 21}`,
    );
    expect(accept.textContent).toContain("Focus → Family & friends");
    expect(accept.textContent).toContain("until you change it");
    expect(
      screen.getByRole("button", { name: /Continue without committing/ })
        .textContent,
    ).toContain("No immediate change");
    expect(l).toEqual(snapshot);
  });
  it("shows capped knowledge and fractional talent learning without rolling the future", () => {
    const l = fixture("memory");
    l.expansion.genetics.academicTalent = true;
    l.expansion.genetics.magicTalent = true;
    l.stats.knowledge = 99;
    show(l);
    expect(
      screen.getByRole("button", { name: /Observe your new home/ }).textContent,
    ).toContain("Knowledge +1");
    expect(
      screen.getByRole("button", { name: /Seek the shape of mana/ })
        .textContent,
    ).toContain("Magic experience +10");
  });
  it("does not expose unassessed talent in learning previews", () => {
    const l = fixture("practice");
    l.expansion.education.assessed = false;
    l.expansion.genetics.magicTalent = true;
    show(l);
    const magic = screen.getByRole("button", { name: /^Practice magic/ });
    expect(magic.textContent).toContain("Base Magic experience +12");
    expect(magic.textContent).not.toContain("+15");
    expect(magic.textContent).not.toContain("Magical talent");
  });
  it("shows relief and research changes rather than only story prose", () => {
    show(fixture("conflict"));
    expect(
      screen.getByRole("button", { name: /Help with relief/ }).textContent,
    ).toContain("Reputation +5");
    expect(
      screen.getByRole("button", { name: /Help with relief/ }).textContent,
    ).toContain("Public trust +5");
    cleanup();
    const l = fixture("research");
    l.expansion.education.stage = "graduated";
    l.training.magicXp = 500;
    show(l);
    expect(
      screen.getByRole("button", { name: /Complete a research project/ })
        .textContent,
    ).toContain("Reputation +10");
  });
  it("distinguishes fatal assignment risks from challenge danger markers", () => {
    const l = fixture("assignment");
    l.expansion.politics.faction = "orsted";
    show(l);
    const accept = screen.getByRole("button", {
      name: /Carry out the assignment/,
    });
    expect(accept.textContent).toContain("5% immediate fatal risk");
    expect(accept.textContent).toContain("If you survive");
    expect(accept.textContent).toContain("20 silver");
    cleanup();
    const duel = fixture("challenge");
    duel.expansion.birthYear = 420;
    duel.age = 30;
    duel.training.magicXp = 2000;
    duel.training.magicCap = 5;
    duel.expansion.standing.reputation = 90;
    duel.expansion.standing.feats = ["one", "two", "three"];
    show(duel);
    const rank = screen.getByRole("button", { name: /^Position 5/ });
    expect(rank.textContent).toContain("Win chance 15%");
    expect(rank.textContent).not.toContain("100%");
    expect(rank.textContent).toContain("35 Health");
  });
  it("explains menus separately from accepting an offer", () => {
    show(fixture("opportunity"));
    expect(
      screen.getByRole("button", { name: /Seek community protection/ })
        .textContent,
    ).toContain("Opens another decision");
  });
  it("renders Thai consequences, including ongoing dependant costs", () => {
    show(fixture("child", "th"));
    const child = screen.getByRole("button", { name: /ต้อนรับลูกด้วยกัน/ });
    expect(child.textContent).toContain("ผลที่ได้รับ");
    expect(child.textContent).toContain("4 เหรียญต่อปี");
    expect(child.textContent).not.toContain("Effects");
  });
  it("also discloses structured gains and setback risk for legacy lives", () => {
    const l = beginLife(createLife({ ruleset: "legacy-1", seed: 32 }));
    show(l);
    expect(
      screen.getByRole("button", { name: /Feel for something impossible/ })
        .textContent,
    ).toContain("Magic experience +5");
    cleanup();
    l.age = 20;
    l.pending = "guild-quest";
    l.flags.guildMember = true;
    show(l);
    expect(
      within(
        screen
          .getAllByRole("button")
          .find((b) => b.textContent?.includes("6%"))!,
      ).getByText(/setback risk/),
    ).toBeTruthy();
  });
});

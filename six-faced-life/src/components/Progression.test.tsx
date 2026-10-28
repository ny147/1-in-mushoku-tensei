// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudyFocus, CareerProgress, Spellbook } from "./Progression";
import { DecisionPanel } from "./LifeView";
import { beginLife, choose, createLife } from "../game/engine";
import { getProgression, syncSpells } from "../game/progression";

afterEach(cleanup);
function grown() {
  const life = choose(beginLife(createLife({ ruleset: 'legacy-1', seed: 29 })), "observe");
  life.age = 26;
  life.career = "merchant";
  life.progression = undefined;
  life.progression = getProgression(life);
  return life;
}
describe("visible progression", () => {
  it("offers a labeled study selector and shows the next spell requirement", () => {
    const onChange = vi.fn();
    render(<StudyFocus life={grown()} onChange={onChange} />);
    fireEvent.change(
      screen.getByRole("combobox", { name: "Magic discipline" }),
      { target: { value: "fire" } },
    );
    expect(onChange).toHaveBeenCalledWith("fire");
    expect(screen.getByText(/Gather water/)).toBeTruthy();
    expect(screen.getByText(/8 experience/)).toBeTruthy();
  });
  it("shows the actual promoted title, income, and next requirements", () => {
    const life = grown();
    life.progression!.career.level = 1;
    render(<CareerProgress life={life} />);
    expect(screen.getByText("Established trader")).toBeTruthy();
    expect(screen.getByText("41 silver")).toBeTruthy();
    expect(screen.getByText(/75 career experience/)).toBeTruthy();
  });
  it("distinguishes learned spells from those still requiring instruction", () => {
    const life = grown();
    life.progression!.magic.water.xp = 130;
    life.training.magicCap = 1;
    syncSpells(life);
    render(<Spellbook life={life} />);
    expect(screen.getByText("Water Ball")).toBeTruthy();
    expect(screen.getByText(/Advanced instruction/)).toBeTruthy();
  });
  it("does not claim missing silver when an assessment needs more knowledge", () => {
    const life = grown();
    life.progression!.magic.water.xp = 130;
    life.training.magicCap = 1;
    life.stats.knowledge = 20;
    life.coins = 300;
    life.pending = "magic-assessment";
    render(
      <DecisionPanel life={life} onChoose={() => {}} />,
    );
    expect(
      (
        screen.getByRole("button", {
          name: /^Train toward Advanced/,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.queryByText(/Need -\d+ more silver/)).toBeNull();
  });
});

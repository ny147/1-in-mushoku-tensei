// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "../i18n/context";
import { CareerPaths } from "./CareerPaths";
import { createExpandedLife } from "../game/expanded/origins";
import { enterCareerNode } from "../game/expanded/career-paths";
import { activateCareerPaths } from "../game/expanded/career-migration";
afterEach(cleanup);
function worker() {
  const l = createExpandedLife({ seed: 1 });
  l.age = 25;
  l.phase = "alive";
  l.pending = null;
  l.stats.health = 90;
  enterCareerNode(l, "farmhand");
  return l;
}
describe("readable career journeys", () => {
  it("leads with current work and next milestone, retaining six native path disclosures", () => {
    const l = worker();
    const { rerender } = render(
      <LanguageProvider language="en">
        <CareerPaths life={l} />
      </LanguageProvider>,
    );
    expect(screen.getByRole("heading", { name: "Farmhand" })).toBeTruthy();
    expect(
      screen.getByText(/20 silver per year before living costs/),
    ).toBeTruthy();
    expect(screen.getByText(/Next milestone: Farmer/)).toBeTruthy();
    const paths = document.querySelectorAll("details.career-path-group");
    expect(paths).toHaveLength(6);
    fireEvent.click(paths[0].querySelector("summary")!);
    (paths[0] as HTMLDetailsElement).open = true;
    rerender(
      <LanguageProvider language="en">
        <CareerPaths life={{ ...l, age: 26 }} />
      </LanguageProvider>,
    );
    expect((paths[0] as HTMLDetailsElement).open).toBe(true);
  });
  it("renders Thai labels and the actual training stipend", () => {
    const l = worker();
    l.expansion.training!.active = "mage";
    render(
      <LanguageProvider language="th">
        <CareerPaths life={l} />
      </LanguageProvider>,
    );
    expect(screen.getByRole("heading", { name: "ผู้ช่วยไร่นา" })).toBeTruthy();
    expect(screen.getByText(/24 เหรียญเงิน/)).toBeTruthy();
    expect(screen.getByText(/ฝึกเต็มเวลา/)).toBeTruthy();
  });
  it("explains inherited ranks without claiming completed requests", () => {
    const old = worker();
    delete old.expansion.careerPaths;
    old.expansion.career.role = "adventurer";
    old.expansion.career.records.adventurer.level = 2;
    const l = activateCareerPaths(old);
    render(
      <LanguageProvider language="en">
        <CareerPaths life={l} />
      </LanguageProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "B-rank Adventurer" }),
    ).toBeTruthy();
    expect(screen.getByText(/Inherited recognition/)).toBeTruthy();
    expect(screen.getByText(/Completed requests: 0/)).toBeTruthy();
  });
  it("keeps unspecified teaching honest and student state free of employed titles", () => {
    const old = worker();
    delete old.expansion.careerPaths;
    old.expansion.career.role = "teacher";
    const l = activateCareerPaths(old);
    const { rerender } = render(
      <LanguageProvider language="en">
        <CareerPaths life={l} />
      </LanguageProvider>,
    );
    expect(
      screen.getByRole("heading", {
        name: "Teacher (specialization unrecorded)",
      }),
    ).toBeTruthy();
    l.expansion.careerPaths!.active = null;
    l.expansion.career.role = "student";
    rerender(
      <LanguageProvider language="en">
        <CareerPaths life={l} />
      </LanguageProvider>,
    );
    expect(screen.getByRole("heading", { name: "Student" })).toBeTruthy();
    expect(screen.queryByText(/Next milestone:/)).toBeNull();
  });
});

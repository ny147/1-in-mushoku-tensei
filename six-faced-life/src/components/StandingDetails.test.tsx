// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { LanguageProvider } from "../i18n/context";
import { createExpandedLife } from "../game/expanded/origins";
import { StandingDetails } from "./StandingDetails";
import { ExpandedDetails } from "./ExpandedDetails";
import { EducationProgress } from "./EducationProgress";
afterEach(cleanup);
it("provides a native standing disclosure beside existing expanded facts, without future actions", () => {
  const l = createExpandedLife({ seed: 1 });
  render(
    <LanguageProvider language="en">
      <ExpandedDetails life={l} />
    </LanguageProvider>,
  );
  expect(screen.getByText("Standing and household obligations").tagName).toBe(
    "SUMMARY",
  );
  expect(screen.getByText("Birth rank")).toBeTruthy();
  expect(screen.getByText("Current legal standing")).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: /sponsor|marriage|crown/i }),
  ).toBeNull();
});
it("renders Thai labels and retains legacy unknown records", () => {
  const l = createExpandedLife({ seed: 1 });
  delete l.expansion.social;
  render(
    <LanguageProvider language="th">
      <StandingDetails life={l} />
    </LanguageProvider>,
  );
  expect(screen.getByText("ฐานันดรเมื่อเกิด")).toBeTruthy();
  expect(screen.getAllByText(/ไม่มีบันทึก/).length).toBeGreaterThan(0);
});
it("explains one shared repayment budget separately from education debt", () => {
  const l = createExpandedLife({ seed: 1 });
  l.age = 18;
  render(
    <LanguageProvider language="en">
      <EducationProgress life={l} />
    </LanguageProvider>,
  );
  expect(screen.getByText(/One shared annual repayment budget/)).toBeTruthy();
  expect(screen.getByText(/Household liability is excluded/)).toBeTruthy();
});

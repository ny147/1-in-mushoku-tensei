// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ExpandedDetails, ExpandedCareer } from "./ExpandedDetails";
import { createExpandedLife } from "../game/expanded/origins";
import { LanguageProvider } from "../i18n/context";
import { Retrospective } from "./Retrospective";
import { finishLife } from "../game/engine";
afterEach(cleanup);
describe("expanded chronicle details", () => {
  it("shows the calendar, resources and truthful warnings while hiding latent genetics", () => {
    const l = createExpandedLife({ seed: 1 });
    l.race = "superd";
    l.expansion.genetics.carrier = true;
    l.expansion.genetics.manifestation = "mana";
    render(
      <LanguageProvider language="en">
        <ExpandedDetails life={l} />
      </LanguageProvider>,
    );
    expect(screen.getByText(`K${l.expansion.birthYear} · Age 0`)).toBeTruthy();
    expect(screen.getByText(/90%/)).toBeTruthy();
    expect(screen.queryByText(/Laplace/)).toBeNull();
  });
  it("shows the expanded occupation and actual pay rather than its compatibility role", () => {
    const l = createExpandedLife({ seed: 1 });
    l.age = 20;
    l.expansion.career.role = "farmer";
    l.career = "merchant";
    render(
      <LanguageProvider language="en">
        <ExpandedCareer life={l} />
      </LanguageProvider>,
    );
    expect(
      screen.getAllByRole("heading", { name: "Farmer" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/20.*coins/)).toBeTruthy();
  });
  it("renders the same stored snapshot in Thai without exposing a latent diagnosis", () => {
    const l = createExpandedLife({ seed: 1 });
    finishLife(l, "illness");
    render(
      <LanguageProvider language="th">
        <Retrospective life={l} />
      </LanguageProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "วัยเด็กและโอกาส" }),
    ).toBeTruthy();
    expect(screen.queryByText(/Laplace/)).toBeNull();
    expect(
      screen.getAllByText(/ผู้สืบสกุลที่ยังมีชีวิตทั้งหมด/).length,
    ).toBeGreaterThan(0);
  });
});

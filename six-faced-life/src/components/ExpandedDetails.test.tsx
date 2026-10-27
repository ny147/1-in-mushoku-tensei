// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ExpandedDetails, ExpandedCareer } from "./ExpandedDetails";
import { createExpandedLife } from "../game/expanded/origins";
import { LanguageProvider } from "../i18n/context";
import { Retrospective } from "./Retrospective";
import { finishLife } from "../game/engine";
import { DecisionPanel } from "./LifeView";
import { appointmentAvailable } from "../game/expanded/events";
afterEach(cleanup);
describe("expanded chronicle details", () => {
  it("discloses affordable career fees before commitment in English and Thai", () => {
    for (const language of ["en", "th"] as const) {
      const l = createExpandedLife({ seed: 2, language });
      l.phase = "alive";
      l.age = 35;
      l.coins = 200;
      l.expansion.economy.peak = 200;
      l.stats.knowledge = 50;
      l.pending = "expanded.career";
      for (let seed = 0; seed < 1000; seed++) {
        l.expansion.worldSeed = seed;
        if (appointmentAvailable(l, "merchant")) break;
      }
      const view = render(
        <LanguageProvider language={language}>
          <DecisionPanel life={l} onChoose={() => {}} onAdvance={() => {}} />
        </LanguageProvider>,
      );
      const merchant = screen.getByRole("button", {
        name: language === "en" ? /^Merchant / : /^พ่อค้า/,
      });
      expect(merchant.textContent).toContain(
        language === "en" ? "Costs 10 silver" : "ใช้ 10 เหรียญเงิน",
      );
      view.unmount();
    }
  });
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

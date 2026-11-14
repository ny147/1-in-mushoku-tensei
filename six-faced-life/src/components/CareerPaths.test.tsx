// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "../i18n/context";
import { CareerPaths } from "./CareerPaths";
import { createExpandedLife } from "../game/expanded/origins";
import { enterCareerNode } from "../game/expanded/career-paths";
import { activateCareerPaths } from "../game/expanded/career-migration";
import {
  acceptParentalDebt,
  creditDebtServiceYear,
  debtServiceYear,
} from "../game/expanded/parental-debt";
import { worldYear } from "../game/expanded/facts";
import { applyEconomyYear } from "../game/expanded/economy";
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
  function servant(balance = 34) {
    const l = worker();
    l.expansion.social!.debt = {
      creditorId: "local-creditor",
      collateral: "tenancy-security",
      initial: 48,
      balance,
      childhoodPaid: 48 - balance,
      personalPaid: 0,
      servicePaid: 0,
      closedUnpaid: 0,
      status: "household",
      decisionYear: null,
      lastChildhoodYear: l.expansion.birthYear + 14,
      lastRepaymentYear: l.expansion.birthYear - 1,
      lastRepayment: 0,
      pauseReason: "none",
      service: null,
    };
    l.expansion.social!.household.home = l.region;
    expect(acceptParentalDebt(l, "service")).toBe(true);
    return l;
  }
  it.each(["en", "th"] as const)(
    "explains acceptance-year ordinary pay before eligible service begins (%s)",
    (language) => {
      const l = servant();
      render(
        <LanguageProvider language={language}>
          <CareerPaths life={l} />
        </LanguageProvider>,
      );
      expect(document.querySelector(".career-path-pay")!.textContent).toContain(
        language === "en" ? "18 silver" : "18 เหรียญเงิน",
      );
      expect(
        screen.getByText(
          language === "en"
            ? /next eligible elapsed year/
            : /ปีที่ผ่านไปและเข้าเงื่อนไขถัดไป/,
        ),
      ).toBeTruthy();
      expect(
        screen.getByText(
          language === "en"
            ? /accepting now grants no service credit/
            : /การรับสัญญาตอนนี้ยังไม่ให้เครดิต/,
        ),
      ).toBeTruthy();
      expect(l.expansion.social!.debt!.service!.completedYears).toBe(0);
    },
  );
  it.each([34, 5])(
    "shows zero cash for credited service despite later health loss, including balance %s",
    (balance) => {
      const l = servant(balance);
      l.age++;
      const service = debtServiceYear(l, worldYear(l));
      applyEconomyYear(l, service);
      creditDebtServiceYear(l, service);
      l.stats.health = 19;
      const { rerender } = render(
        <LanguageProvider language="en">
          <CareerPaths life={l} />
        </LanguageProvider>,
      );
      expect(l.expansion.economy.lastIncome).toBe(0);
      expect(document.querySelector(".career-path-pay")!.textContent).toContain(
        "0 silver per year",
      );
      expect(screen.getByText(/necessities replace cash wages/i)).toBeTruthy();
      if (balance === 5) {
        expect(l.expansion.social!.debt!.status).toBe("settled");
        l.age++;
        rerender(
          <LanguageProvider language="en">
            <CareerPaths life={l} />
          </LanguageProvider>,
        );
        expect(
          document.querySelector(".career-path-pay")!.textContent,
        ).toContain("18 silver per year");
        expect(
          screen.queryByText(/necessities replace cash wages/i),
        ).toBeNull();
      }
    },
  );
  it("shows ordinary wages for a paused service year without credited work", () => {
    const l = servant();
    l.age++;
    l.region = l.region === "asura" ? "millis" : "asura";
    const service = debtServiceYear(l, worldYear(l));
    expect(service.eligible).toBe(false);
    applyEconomyYear(l, service);
    creditDebtServiceYear(l, service);
    render(
      <LanguageProvider language="en">
        <CareerPaths life={l} />
      </LanguageProvider>,
    );
    expect(l.expansion.economy.lastIncome).toBe(18);
    expect(document.querySelector(".career-path-pay")!.textContent).toContain(
      "18 silver per year",
    );
    expect(screen.queryByText(/necessities replace cash wages/i)).toBeNull();
  });
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

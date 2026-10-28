// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { ExpandedDetails, ExpandedCareer } from "./ExpandedDetails";
import { createExpandedLife } from "../game/expanded/origins";
import { LanguageProvider } from "../i18n/context";
import { Retrospective } from "./Retrospective";
import { choose, finishLife } from "../game/engine";
import { CharacterView, DecisionPanel } from "./LifeView";
import { isLife } from "../game/storage";
import { appointmentAvailable } from "../game/expanded/events";
afterEach(cleanup);
describe("expanded chronicle details", () => {
  it.each(["en", "th"] as const)(
    "reveals sword talent and its learning bonus only after assessment in %s",
    (language) => {
      const l = createExpandedLife({ seed: 1, language });
      l.phase = "alive";
      l.age = 8;
      Object.assign(l.expansion.genetics, {
        magicTalent: false,
        academicTalent: false,
        swordTalent: true,
      });
      const view = render(
        <LanguageProvider language={language}>
          <ExpandedDetails life={l} />
        </LanguageProvider>,
      );
      expect(
        screen.queryByText(/Swordsmanship talent|พรสวรรค์ด้านดาบ/),
      ).toBeNull();
      expect(screen.queryByText(/25%/)).toBeNull();
      l.pending = "expanded.assessment";
      const assessed = choose(l, "expanded.assessment.take");
      view.rerender(
        <LanguageProvider language={language}>
          <ExpandedDetails life={assessed as typeof l} />
        </LanguageProvider>,
      );
      expect(
        screen.getByText(
          language === "en"
            ? /Swordsmanship talent \(\+25% sword experience\)/
            : /พรสวรรค์ด้านดาบ \(ประสบการณ์ดาบ \+25%\)/,
        ),
      ).toBeTruthy();
      expect(
        screen.queryByText(
          /Magical talent|Academic talent|No special talent identified/,
        ),
      ).toBeNull();
    },
  );
  it.each(["magic", "academic"] as const)(
    "only identifies the assessed %s talent",
    (talent) => {
      const l = createExpandedLife({ seed: 1 });
      l.expansion.education.assessed = true;
      l.expansion.genetics.magicTalent = talent === "magic";
      l.expansion.genetics.academicTalent = talent === "academic";
      l.expansion.genetics.swordTalent = false;
      render(
        <LanguageProvider language="en">
          <ExpandedDetails life={l} />
        </LanguageProvider>,
      );
      expect(screen.queryByText(/Magical talent/) !== null).toBe(
        talent === "magic",
      );
      expect(screen.queryByText(/Academic talent/) !== null).toBe(
        talent === "academic",
      );
    },
  );
  it.each(["en", "th"] as const)(
    "shows a completed talent assessment after restoring a %s life",
    (language) => {
      const l = createExpandedLife({ seed: 1, language });
      l.phase = "alive";
      l.age = 8;
      l.stats.knowledge = 30;
      l.training.magicXp = 0;
      l.expansion.genetics.magicTalent = true;
      l.expansion.genetics.academicTalent = true;
      l.expansion.genetics.swordTalent = false;
      l.pending = "expanded.assessment";
      const assessed = choose(l, "expanded.assessment.take");
      const restored = JSON.parse(JSON.stringify(assessed));
      expect(isLife(restored)).toBe(true);
      render(
        <LanguageProvider language={language}>
          <CharacterView life={restored} onStudyChange={() => {}} />
        </LanguageProvider>,
      );
      const score =
        language === "en"
          ? "Assessment score: 50 / 100"
          : "คะแนนประเมิน: 50 / 100";
      expect(
        screen.getByText(language === "en" ? "Natural aptitude" : "พรสวรรค์")
          .nextElementSibling?.textContent,
      ).toContain(score);
      expect(
        within(
          screen.getByRole("region", {
            name: language === "en" ? "Era and opportunity" : "ยุคสมัยและโอกาส",
          }),
        ).getByText(new RegExp(score.replace("/", "\\/"))),
      ).toBeTruthy();
      expect(
        screen.getAllByText(
          language === "en"
            ? /Assessment score: 50 \/ 100/
            : /คะแนนประเมิน: 50 \/ 100/,
        ).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText(
          language === "en" ? /Magical talent/ : /พรสวรรค์ด้านเวทมนตร์/,
        ).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText(
          language === "en" ? /Academic talent/ : /พรสวรรค์ด้านวิชาการ/,
        ).length,
      ).toBeGreaterThan(0);
      expect(screen.queryByText(/See recorded assessments/)).toBeNull();
      expect(screen.queryByText(/inherited trait|ลักษณะสืบทอด/)).toBeNull();
    },
  );
  it.each(["en", "th"] as const)(
    "distinguishes unassessed and ordinary results in %s without revealing latent talent",
    (language) => {
      const l = createExpandedLife({ seed: 1, language });
      l.expansion.genetics.magicTalent = true;
      l.expansion.genetics.academicTalent = true;
      l.expansion.genetics.swordTalent = false;
      const view = render(
        <LanguageProvider language={language}>
          <ExpandedDetails life={l} />
        </LanguageProvider>,
      );
      expect(
        screen.getByText(
          language === "en" ? /Not assessed yet/ : /ยังไม่ได้รับการประเมิน/,
        ),
      ).toBeTruthy();
      expect(
        screen.queryByText(/Magical talent|Academic talent|พรสวรรค์ด้าน/),
      ).toBeNull();
      l.expansion.education.assessed = true;
      l.expansion.education.assessment = 0;
      l.expansion.genetics.magicTalent = false;
      l.expansion.genetics.academicTalent = false;
      view.rerender(
        <LanguageProvider language={language}>
          <ExpandedDetails life={l} />
        </LanguageProvider>,
      );
      expect(
        screen.getByText(
          language === "en"
            ? /Assessment score: 0 \/ 100/
            : /คะแนนประเมิน: 0 \/ 100/,
        ),
      ).toBeTruthy();
      expect(
        screen.getByText(
          language === "en"
            ? /No special talent identified/
            : /ไม่พบพรสวรรค์พิเศษ/,
        ),
      ).toBeTruthy();
    },
  );
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
          <DecisionPanel life={l} onChoose={() => {}} />
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

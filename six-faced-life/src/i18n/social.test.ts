import { describe, expect, it } from "vitest";
import { createExpandedLife } from "../game/expanded/origins";
import {
  socialText,
  socialChoiceOutcome,
  socialChoiceMessage,
  socialEffects,
} from "./social";
import { expandedEntryText } from "./expanded";
import type { ExpandedLife } from "../game/types";
import { choiceChanges } from "./choice-changes";
import { loadGame } from "../game/storage";

function household(): ExpandedLife {
  const l = createExpandedLife({ seed: 1 });
  l.age = 15;
  l.phase = "alive";
  l.pending = null;
  l.expansion.origin.wealth = "poor";
  l.expansion.origin.status = "commoner";
  l.expansion.standing.status = "commoner";
  const s = l.expansion.social!;
  s.royalHouse = null;
  s.association = null;
  s.household.housing = "secure-tenancy";
  s.debt = {
    creditorId: "local-creditor",
    collateral: "tenancy-security",
    initial: 48,
    balance: 34,
    childhoodPaid: 14,
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
  return l;
}
describe("standing and obligations in both languages", () => {
  it("round-trips a long bilingual outcome within narrative parameter limits", () => {
    const a = household();
    a.expansion.family.people
      .filter((p) => p.role === "parent")
      .forEach((p, i) => {
        p.name = `Parent${i} ${"Longname".repeat(9)}`;
      });
    const b = structuredClone(a),
      d = b.expansion.social!.debt!;
    d.status = "refused";
    d.decisionYear = b.expansion.birthYear + b.age;
    b.expansion.social!.household.housing = "security-lost";
    b.expansion.social!.household.housingLossYear = d.decisionYear;
    b.expansion.social!.household.affectedParentIds = [
      ...b.expansion.social!.household.parentIds,
    ];
    const message = socialChoiceMessage(
      a,
      b,
      "expanded.parental-debt.service",
      "Service",
      "ทำงานใช้หนี้",
    )!;
    expect(
      Object.values(message.params!).every(
        (p) => typeof p !== "string" || p.length <= 500,
      ),
    ).toBe(true);
    const saved = createExpandedLife({ seed: 12 });
    const entry = {
      id: saved.history.length + 1,
      age: saved.age,
      title: "Service",
      text: socialChoiceOutcome(a, b, "service", "en")!,
      kind: "choice" as const,
      message,
    };
    saved.history.push(entry);
    const restored = loadGame({
      getItem: () => JSON.stringify({ version: 1, active: saved, archive: [] }),
      setItem: () => {},
    });
    expect(restored.error).toBeNull();
    expect(expandedEntryText(entry, "th")!.text).toBe(
      socialChoiceOutcome(a, b, "service", "th"),
    );
  });
  it.each(["en", "th"] as const)(
    "separates birth, earned standing, royal ancestry and household debt (%s)",
    (lang) => {
      const l = household();
      l.expansion.standing.status = "noble";
      l.expansion.social!.association = {
        id: "asura-local",
        region: "asura",
        source: "earned",
        since: 420,
      };
      const t = socialText(l, lang);
      expect(t.birthRank).toContain(lang === "en" ? "Commoner" : "สามัญชน");
      expect(t.currentStanding).toContain(lang === "en" ? "Noble" : "ขุนนาง");
      expect(t.association).toContain("K420");
      expect(t.debt).toContain("34");
      expect(t.debt).toContain(
        lang === "en" ? "not personal debt" : "ไม่ใช่หนี้ส่วนตัว",
      );
      l.expansion.origin.status = "noble";
      l.expansion.social!.royalHouse = "asura";
      expect(socialText(l, lang).royalAncestry).toContain(
        lang === "en" ? "Asura royal family" : "ราชวงศ์อัสรา",
      );
      expect(socialText(l, lang).birthRank).toContain(
        lang === "en" ? "Poor" : "ยากจน",
      );
    },
  );
  it.each(["en", "th"] as const)(
    "reports accepted instalments, last payment and service pauses/completion (%s)",
    (lang) => {
      const l = household(),
        d = l.expansion.social!.debt!;
      d.status = "accepted";
      d.decisionYear = l.expansion.birthYear + 15;
      d.balance = 32;
      d.personalPaid = 2;
      d.lastRepayment = 2;
      d.lastRepaymentYear = d.decisionYear;
      expect(socialText(l, lang).debt).toContain(
        lang === "en"
          ? "Personal parental debt"
          : "หนี้ครอบครัวที่รับเป็นหนี้ส่วนตัว",
      );
      expect(socialText(l, lang).debt).toContain(`K${d.decisionYear}`);
      d.status = "service";
      d.service = {
        acceptedBalance: 32,
        region: l.region,
        startedYear: d.decisionYear,
        requiredYears: 3,
        completedYears: 0,
        lastYear: d.decisionYear,
        endedYear: null,
        endReason: null,
      };
      l.expansion.education.stage = "university";
      expect(socialText(l, lang).commitment).toContain(
        lang === "en" ? "Paused" : "พัก",
      );
      expect(socialText(l, lang).commitment).toContain("3");
      d.status = "settled";
      d.balance = 0;
      d.servicePaid = 32;
      d.service.completedYears = 3;
      d.service.endReason = "completed";
      d.service.endedYear = d.decisionYear + 3;
      expect(socialText(l, lang).commitment).toContain(
        lang === "en" ? "Completed" : "สำเร็จ",
      );
    },
  );
  it("keeps refusal household-only and explains bounded housing cost expiry", () => {
    const l = household(),
      s = l.expansion.social!;
    s.debt!.status = "refused";
    s.household.housing = "security-lost";
    s.household.housingLossYear = l.expansion.birthYear + 15;
    expect(socialText(l, "en").debt).toContain("not personal debt");
    expect(socialText(l, "en").housing).toContain(
      `K${s.household.housingLossYear + 1}–K${s.household.housingLossYear + 3}`,
    );
    l.age = 19;
    expect(socialText(l, "en").housing).toContain("expired");
    expect(socialText(l, "th").housing).toContain("สิ้นสุด");
  });
  it("reports only actual capped service credit and preserves it in saved bilingual history", () => {
    const a = household(),
      b = structuredClone(a);
    a.expansion.social!.debt!.status = "service";
    b.expansion.social!.debt!.status = "settled";
    b.expansion.social!.debt!.balance = 0;
    b.expansion.social!.debt!.servicePaid = 34;
    expect(socialChoiceOutcome(a, b, "annual-service", "en")).toContain(
      "34 silver",
    );
    const message = socialChoiceMessage(
      a,
      b,
      "annual-service",
      "Paid",
      "ชำระแล้ว",
    )!;
    b.expansion.social!.debt!.balance = 800;
    const e = {
      id: 1,
      age: 16,
      title: "Paid",
      text:
        socialChoiceOutcome(a, { ...a }, "unknown", "en") ?? "Original English",
      kind: "choice" as const,
      message,
    };
    expect(expandedEntryText(e, "th")!.text).toContain("34 เหรียญเงิน");
    expect(
      expandedEntryText(
        { ...e, message: { key: "expanded.future-unknown" } },
        "th",
      )!.text,
    ).toBe("Original English");
  });
  it("quotes only living household parents, actual bonds floor, and does not invent absent relatives", () => {
    const l = household();
    l.stats.bonds = 0;
    l.expansion.social!.household.parentIds = [];
    expect(socialEffects(l, "refuse", "en")).toContain("0 living parents");
    expect(socialEffects(l, "refuse", "en")).toContain("Bonds −0");
    const b = structuredClone(l);
    b.expansion.social!.debt!.status = "refused";
    b.expansion.social!.household.housing = "security-lost";
    b.expansion.social!.household.housingLossYear =
      b.expansion.birthYear + b.age;
    expect(
      socialChoiceOutcome(l, b, "expanded.parental-debt.refuse", "en"),
    ).toContain("0 parents");
    expect(
      socialChoiceOutcome(l, b, "expanded.parental-debt.refuse", "en"),
    ).toContain("Bonds 0");
  });
  it("does not invent ancestry or liability for absent social records", () => {
    const l = household();
    delete l.expansion.social;
    expect(socialText(l, "en").royalAncestry).toContain("Unrecorded");
    expect(socialText(l, "en").debt).toContain("Unrecorded");
  });
  it.each(["en", "th"] as const)(
    "preserves a capped final five-silver credit and real parent names (%s)",
    (language) => {
      const a = household(),
        d = a.expansion.social!.debt!;
      a.language = language;
      d.status = "service";
      d.balance = 5;
      d.servicePaid = 29;
      const b = structuredClone(a);
      b.expansion.social!.debt!.balance = 0;
      b.expansion.social!.debt!.servicePaid = 34;
      b.expansion.social!.debt!.status = "settled";
      const out = socialChoiceOutcome(a, b, "annual-service", language)!;
      expect(out).toContain(language === "en" ? "5 silver" : "5 เหรียญเงิน");
      expect(out).not.toContain(
        language === "en" ? "12 silver" : "12 เหรียญเงิน",
      );
      expect(choiceChanges(a, b).join(" ")).toContain(
        language === "en" ? "credit +5" : "เครดิตทำงานใช้หนี้ครอบครัว +5",
      );
      const refused = structuredClone(a),
        s = refused.expansion.social!;
      s.debt!.status = "refused";
      s.household.housing = "security-lost";
      s.household.housingLossYear = a.expansion.birthYear + a.age;
      s.household.affectedParentIds = [s.household.parentIds[0]];
      refused.stats.bonds = a.stats.bonds - 2;
      const name = a.expansion.family.people.find(
        (p) => p.id === s.household.parentIds[0],
      )!.name;
      expect(
        socialChoiceOutcome(
          a,
          refused,
          "expanded.parental-debt.refuse",
          language,
        ),
      ).toContain(name);
    },
  );
  it("shows actual current patron access without promising future sponsorship", () => {
    const l = household();
    l.expansion.standing.status = "noble";
    l.expansion.social!.association = {
      id: "millis-local",
      region: "millis",
      source: "earned",
      since: 420,
    };
    l.expansion.origin.patron = false;
    expect(socialText(l, "en").association).toContain("Patron support: no");
  });
  it.each(["en", "th"] as const)(
    "names the recorded instalment pause reason (%s)",
    (lang) => {
      const l = household();
      l.expansion.social!.debt!.status = "accepted";
      l.expansion.social!.debt!.pauseReason = "no-surplus";
      expect(socialText(l, lang).commitment).toContain(
        lang === "en"
          ? "Paused: no affordable surplus"
          : "พัก: ไม่มีรายได้ส่วนเกินที่จ่ายไหว",
      );
    },
  );
});

import { describe, expect, it } from "vitest";
import type { ExpandedLife } from "../types";
import { createExpandedLife } from "./origins";
import { getExpandedDecision } from "./events";
import { socialDecision, applySocialChoice } from "./social-events";
import { choose, advance, openActivity } from "../engine";
import { canAutoChoose } from "../simulation";
import { isLife, loadGame } from "../storage";
import { worldYear } from "./facts";
import { acceptParentalDebt, exitDebtService, creditDebtServiceYear, debtServiceYear } from "./parental-debt";
import { socialChoiceOutcome } from "../../i18n/social";

function debtor(age = 15): ExpandedLife {
  for (let seed = 0; seed < 100; seed++) {
    const l = createExpandedLife({ seed });
    if (!l.expansion.social?.debt) continue;
    l.phase = "alive"; l.age = age; l.pending = "expanded.parental-debt";
    l.expansion.queue = []; l.stats.health = 100;
    return l;
  }
  throw Error("missing indebted poor birth");
}
function restore(l: ExpandedLife): ExpandedLife {
  const result = loadGame({getItem: () => JSON.stringify({version: 1, active: l, archive: []}), setItem: () => {}});
  expect(result.error).toBeNull();
  return result.data.active as ExpandedLife;
}
describe("manual parental responsibility", () => {
  it.each(["accept", "service", "refuse"] as const)("resolves %s through public choose without taking savings or repeating", route => {
    const l = debtor(), before = structuredClone(l);
    const decision = getExpandedDecision(l)!;
    expect(decision).not.toBeNull();
    expect(decision.requiresManual).toBe(true);
    expect(canAutoChoose(l)).toBe(false);
    expect(decision.choices.every(c => c.cost === undefined)).toBe(true);
    const n = choose(restore(l), `expanded.parental-debt.${route}`) as ExpandedLife;
    expect(n.expansion.social!.debt!.status).toBe({accept: "accepted", service: "service", refuse: "refused"}[route]);
    expect(n.expansion.social!.debt!.balance).toBe(48);
    expect(n.coins).toBe(l.coins);
    expect(isLife(n)).toBe(true);
    expect(choose(n, `expanded.parental-debt.${route}`)).toBe(n);
    expect(l).toEqual(before);
    const record = n.history.at(-1)!;
    expect(record.text).toBe(socialChoiceOutcome(l, n, `expanded.parental-debt.${route}`, "en"));
    expect(record.message?.key).toBe("expanded.social-choice");
  });
  it("accepts only the remaining balance and rejects domain replays or underage actions", () => {
    const l = debtor(), d = l.expansion.social!.debt!;
    d.balance = 41; d.childhoodPaid = 7; d.lastChildhoodYear = l.expansion.birthYear + 7;
    expect(acceptParentalDebt(l, "service")).toBe(true);
    expect(d.service!.acceptedBalance).toBe(41);
    expect(d.service!.requiredYears).toBe(4);
    expect(isLife({...l, pending: null})).toBe(true);
    const snap = structuredClone(l);
    expect(acceptParentalDebt(l, "instalments")).toBe(false);
    expect(l).toEqual(snap);
    const child = debtor(14), childBefore = structuredClone(child);
    expect(applySocialChoice(child, "expanded.parental-debt.accept")).toBe(false);
    expect(child).toEqual(childBefore);
    const settled = debtor(); settled.expansion.social!.debt!.balance = 0;
    expect(acceptParentalDebt(settled, "service")).toBe(false);
  });
  it("refuses against real local living parents only and clamps bonds once", () => {
    const l = debtor(); l.stats.bonds = 3;
    const h = l.expansion.social!.household, parents = l.expansion.family.people.filter(p => h.parentIds.includes(p.id));
    parents[0].died = worldYear(l) - 1;
    parents[1].home = l.region === "ranoa" ? "asura" : "ranoa";
    expect(acceptParentalDebt(l, "refuse")).toBe(true);
    expect(h.affectedParentIds).toEqual([]); expect(h.relationship).toBe(50); expect(l.stats.bonds).toBe(3);
    const local = debtor(); local.stats.bonds = 3;
    expect(acceptParentalDebt(local, "refuse")).toBe(true);
    expect(local.stats.bonds).toBe(0);
    expect(local.expansion.social!.household.affectedParentIds.length).toBe(2);
    expect(local.expansion.social!.household.housing).toBe("security-lost");
    local.pending = null;
    expect(isLife(local)).toBe(true);
    expect(acceptParentalDebt(local, "refuse")).toBe(false);
    expect(local.stats.bonds).toBe(0);
  });
  it("keeps university and reserves intact while disclosing paused service", () => {
    const l = debtor(); l.expansion.education.stage = "university";
    const education = structuredClone(l.expansion.education), finance = structuredClone(l.expansion.finance);
    expect(socialDecision(l)!.choices.find(c => c.id.endsWith(".service"))!.description).toMatch(/paused|pause/i);
    expect(acceptParentalDebt(l, "service")).toBe(true);
    expect(l.expansion.education).toEqual(education); expect(l.expansion.finance).toEqual(finance);
    expect(debtServiceYear(l, worldYear(l) + 1).eligible).toBe(false);
  });
  it("refreshes an old quote and pauses illness without charging or inventing participation", () => {
    const l = debtor();
    const first = socialDecision(l)!;
    l.expansion.social!.debt!.balance = 47;
    l.expansion.social!.debt!.childhoodPaid = 1;
    l.expansion.social!.debt!.lastChildhoodYear = l.expansion.birthYear + 1;
    l.stats.health = 19;
    expect(socialDecision(l)!.choices[1].description).not.toBe(first.choices[1].description);
    expect(socialDecision(l)!.choices[1].description).toContain("starts paused");
    const n = choose(l, "expanded.parental-debt.service") as ExpandedLife;
    expect(n.expansion.social!.debt!.service!.acceptedBalance).toBe(47);
    expect(n.expansion.social!.debt!.servicePaid).toBe(0);
    expect(n.coins).toBe(l.coins);
  });
  it("retains full-time education and its funding when signing service", () => {
    const l = debtor();
    l.expansion.training!.active = "farmer";
    l.expansion.training!.paused = false;
    l.expansion.training!.mode = "full-time";
    const training = structuredClone(l.expansion.training), finance = structuredClone(l.expansion.finance);
    expect(acceptParentalDebt(l, "service")).toBe(true);
    expect(l.expansion.training).toEqual(training);
    expect(l.expansion.finance).toEqual(finance);
    l.age++;
    expect(debtServiceYear(l, worldYear(l)).eligible).toBe(false);
  });
  it("opens service review read-only and retains earned credit on a single exit", () => {
    const l = debtor(); acceptParentalDebt(l, "service"); l.pending = null; l.age++;
    creditDebtServiceYear(l, debtServiceYear(l, worldYear(l)));
    const before = structuredClone(l), opened = openActivity(l, "debt-service-exit") as ExpandedLife;
    expect(opened.pending).toBe("expanded.debt-service-exit"); expect(canAutoChoose(opened)).toBe(false);
    expect(l).toEqual(before); expect(opened.coins).toBe(l.coins);
    expect(isLife(opened)).toBe(true);
    const n = choose(restore(opened), "expanded.debt-service-exit.confirm") as ExpandedLife;
    expect(n.expansion.social!.debt!.balance).toBe(36); expect(n.expansion.social!.debt!.servicePaid).toBe(12);
    expect(n.expansion.social!.debt!.service!.endReason).toBe("exit"); expect(isLife(n)).toBe(true);
    expect(exitDebtService(n)).toBe(false); expect(acceptParentalDebt(n, "service")).toBe(false);
    const kept = choose(opened, "expanded.debt-service-exit.keep") as ExpandedLife;
    expect(kept.expansion.social!.debt).toEqual(opened.expansion.social!.debt);
  });
  it("preserves an unrelated pending decision and schedules responsibility before age15 spending", () => {
    const l = debtor(14); l.pending = "expanded.reading";
    const held = advance(l, "year"); expect(held).toBe(l);
    l.pending = null;
    const n = advance(l, "year") as ExpandedLife;
    expect(n.pending).toBe("expanded.parental-debt");
    expect(n.expansion.queue.slice(0, 2)).toEqual(["expanded.work", "expanded.university"]);
    expect(restore(n).pending).toBe(n.pending);
  });
  it("keeps historical events ahead of responsibility at the age15 boundary", () => {
    let l: ExpandedLife | undefined;
    for (let seed = 0; seed < 10000; seed++) {
      const candidate = createExpandedLife({seed});
      if (candidate.expansion.birthYear === 409 && candidate.expansion.social?.debt) { l = candidate; break; }
    }
    expect(l).toBeDefined();
    l!.phase = "alive"; l!.age = 14; l!.pending = null; l!.stats.health = 100;
    const n = advance(l!, "year") as ExpandedLife;
    expect(n.pending).toBe("expanded.succession");
    expect(n.expansion.queue).toEqual(["expanded.parental-debt", "expanded.work", "expanded.university"]);
  });
  it("retains due liability through a full saved queue and inserts once as it drains", () => {
    const l = debtor(); l.pending = "expanded.reading";
    l.expansion.queue = ["work", "university", "career", "training", "instruction", "assessment", "travel", "courtship", "challenge", "family", "discovery", "grant", "retire", "research", "opportunity", "practice"].map(k => `expanded.${k}`);
    expect(restore(l).expansion.social!.debt!.decisionYear).toBeNull();
    const n = choose(restore(l), "expanded.reading.learn") as ExpandedLife;
    expect(n.expansion.queue.length).toBeLessThanOrEqual(16);
    expect(n.pending).toBe("expanded.parental-debt");
    expect(n.expansion.social!.debt!.decisionYear).toBeNull();
    expect(restore(n).pending).toBe("expanded.parental-debt");
    const done = choose(n, "expanded.parental-debt.refuse") as ExpandedLife;
    expect([done.pending, ...done.expansion.queue]).not.toContain("expanded.parental-debt");
  });
  it("does not duplicate a responsibility offer already queued behind a pending choice", () => {
    const l = debtor(); l.pending = "expanded.reading";
    l.expansion.queue = ["expanded.parental-debt", "expanded.work"];
    expect(advance(l, "year")).toBe(l);
    const n = choose(l, "expanded.reading.learn") as ExpandedLife;
    expect(n.pending).toBe("expanded.parental-debt");
    expect(n.expansion.queue).toEqual(["expanded.work"]);
  });
});

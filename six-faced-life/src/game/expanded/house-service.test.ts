import { expect, it } from "vitest";
import { annualIncomeExpanded, appoint } from "./careers";
import { advanceCourtYear, recognizeAtCourt } from "./crown-service";
import { advanceExpanded, chooseExpanded } from "./engine";
import { worldYear } from "./facts";
import { activateHouseState } from "./house-state";
import {
  advanceHouseYear,
  applyHouseServiceChoice,
  canPetitionHouse,
  houseProtectionActive,
  houseServiceDecision,
  nextHouseDecision,
  startMarriageService,
  validHouseServiceState,
} from "./house-service";
import { createExpandedLife } from "./origins";
import { debtServiceYear, creditDebtServiceYear } from "./parental-debt";
import { serviceAssignment } from "./service-priority";
import { associationForRegion } from "./social-state";
import { enterCustody } from "./succession-restrictions";
import { survivalRisks } from "./economy";
import { promoteCareerNode } from "./career-paths";
import { getExpandedDecision } from "./events";

function noble(region: "asura" | "ranoa" | "millis" = "ranoa") {
  const life = createExpandedLife({ seed: 4, region });
  life.phase = "alive";
  life.age = 20;
  life.pending = null;
  life.expansion.queue = [];
  life.expansion.standing.status = "noble";
  life.expansion.social!.association = associationForRegion(region, "earned", worldYear(life));
  life.stats.health = 80;
  life.coins = 0;
  return activateHouseState(life);
}

function due(life: ReturnType<typeof noble>, years = 3) {
  life.age += years;
  advanceHouseYear(life);
  life.pending = nextHouseDecision(life);
}

it("offers a penniless noble an extension and unpaid service and preserves the due record on reload", () => {
  const life = noble();
  due(life, 2);
  expect(life.pending).toBeNull();
  due(life, 1);
  expect(life.pending).toBe("expanded.house-request");
  const loaded = JSON.parse(JSON.stringify(life)) as typeof life;
  expect(validHouseServiceState(loaded.expansion.house?.service, loaded)).toBe(true);
  expect(houseServiceDecision(loaded)).toMatchObject({
    requiresManual: true,
    choices: expect.arrayContaining([
      expect.objectContaining({ id: "expanded.house-request.pay", disabled: true }),
      expect.objectContaining({ id: "expanded.house-request.service", disabled: false }),
    ]),
  });
  expect(applyHouseServiceChoice(loaded, "expanded.house-request.extend")).toBe(true);
  expect(applyHouseServiceChoice(loaded, "expanded.house-request.extend")).toBe(false);
  due(loaded, 1);
  expect(applyHouseServiceChoice(loaded, "expanded.house-request.service")).toBe(true);
  expect(serviceAssignment(loaded)).toBeNull();
  loaded.age++;
  expect(annualIncomeExpanded(loaded)).toBe(0);
  advanceHouseYear(loaded);
  expect(loaded.expansion.house?.service.lastCreditYear).toBe(worldYear(loaded));
  expect(loaded.expansion.house?.service.providers["ranoa-local"]?.refusals).toBe(0);
});

it("defers an accepted year through custody, full-time study, illness and relocation", () => {
  const life = noble("asura");
  due(life);
  expect(applyHouseServiceChoice(life, "expanded.house-request.service")).toBe(true);
  enterCustody(life);
  due(life, 1);
  const duty = life.expansion.house!.service.providers["asura-local"]!;
  expect(duty.request?.pauseReason).toBe("custody");
  life.expansion.succession!.restrictions.custody = null;
  life.expansion.education.stage = "university";
  due(life, 1);
  expect(duty.request?.pauseReason).toBe("study");
  life.expansion.education.stage = "none";
  life.stats.health = 19;
  due(life, 1);
  expect(duty.request?.pauseReason).toBe("health");
  life.stats.health = 80;
  life.region = "ranoa";
  due(life, 1);
  expect(duty.request?.pauseReason).toBe("region");
  expect(duty.refusals).toBe(0);
  life.region = "asura";
  due(life, 1);
  expect(duty.request?.status).toBe("served");
});

it("suspends benefits after two refusals and lets the player relinquish the legal title after three", () => {
  const life = noble("millis");
  expect(canPetitionHouse(life)).toBe(true);
  const origin = structuredClone(life.expansion.origin.ancestry);
  for (let strike = 1; strike <= 3; strike++) {
    due(life);
    expect(applyHouseServiceChoice(life, "expanded.house-request.refuse")).toBe(true);
    expect(life.expansion.house?.service.providers["millis-local"]?.refusals).toBe(strike);
  }
  expect(canPetitionHouse(life)).toBe(false);
  life.pending = nextHouseDecision(life);
  expect(life.pending).toBe("expanded.house-standing");
  expect(applyHouseServiceChoice(life, "expanded.house-standing.relinquish")).toBe(true);
  expect(life.expansion.standing.status).toBe("commoner");
  expect(life.expansion.origin.ancestry).toEqual(origin);
  life.expansion.standing.status = "noble";
  life.expansion.social!.association = associationForRegion("millis", "earned", worldYear(life));
  due(life);
  expect(applyHouseServiceChoice(life, "expanded.house-request.refuse")).toBe(true);
  expect(validHouseServiceState(life.expansion.house!.service, life)).toBe(true);
});

it("uses the crown schedule once recognized and credits the oldest eligible accepted service first", () => {
  const life = noble("asura");
  const court = life.expansion.succession!.court;
  recognizeAtCourt(life, true);
  due(life);
  advanceCourtYear(life);
  expect(nextHouseDecision(life)).toBeNull();
  expect(court.request?.status).toBe("open");

  const year = worldYear(life);
  const debt = life.expansion.social!.debt ??= createExpandedLife({ seed: 1 }).expansion.social!.debt!;
  expect(debt).toBeTruthy();
  debt.status = "service";
  debt.balance = 24;
  debt.service = { acceptedBalance: 24, region: "asura", startedYear: year - 2, requiredYears: 2, completedYears: 0, lastYear: year - 2, endedYear: null, endReason: null };
  expect(appoint(life, "laborer")).toBe(true);
  startMarriageService(life, "asura-local");
  life.age++;
  expect(serviceAssignment(life)).toBe("creditor");
  const creditor = debtServiceYear(life, worldYear(life));
  creditDebtServiceYear(life, creditor);
  advanceHouseYear(life);
  expect(life.expansion.house?.service.lastCreditYear).toBeNull();
  expect(debt.service.lastCreditYear).toBe(worldYear(life));
});

it("serves the accepted household year before a newer crown obligation without wages or work advancement", () => {
  const life = noble("asura");
  life.expansion.social!.debt = null;
  life.coins = 300;
  expect(appoint(life, "laborer")).toBe(true);
  due(life);
  const start = worldYear(life);
  const accepted = chooseExpanded(life, "expanded.house-request.service");
  expect(accepted.pending).toBeNull();
  const request = accepted.expansion.house!.service.providers["asura-local"]!.request!;
  expect(request.status).toBe("service");
  const court = accepted.expansion.succession!.court;
  court.recognitionYear = start - 2;
  court.nextPetitionYear = start;
  court.request = { openedYear: start + 1, dueYear: start + 2, acceptedYear: start + 1,
    extended: false, status: "service", resolutionYear: null };
  accepted.age++;
  // This handcrafted overlap represents a house obligation saved before recognition.
  const priorYears = accepted.expansion.career.records.laborer.years;
  const settled = advanceExpanded(accepted, "year");
  expect(settled.expansion.house!.service.lastCreditYear).toBe(start + 2);
  expect(settled.expansion.economy.lastIncome).toBe(0);
  expect(settled.expansion.career.records.laborer.years).toBe(priorYears);
  expect(settled.expansion.succession!.court.request).toMatchObject({ status: "service", pauseReason: "commitment" });
  settled.expansion.economy.unsafeWork = true;
  expect(survivalRisks(settled).find(risk => risk.cause === "unsafe-work")?.chance).toBe(0);
  const careers = settled.expansion.careerPaths!;
  careers.active = "farmhand";
  careers.earned.farmhand = {year: null, source: "inherited"};
  careers.work.farming = {years: 2, units: 6, milestones: 1};
  settled.expansion.career.role = "farmer";
  settled.pending = "expanded.career";
  expect(getExpandedDecision(settled)?.choices.map(choice => choice.id)).toEqual(["expanded.career.later"]);
  expect(promoteCareerNode(settled, "farmer")).toBe(false);
});

it("presents a queued historical choice before a house request due that year", () => {
  const life = noble();
  life.expansion.social!.debt = null;
  due(life);
  life.pending = "expanded.reading";
  life.expansion.queue = ["expanded.conflict"];
  const next = chooseExpanded(life, "expanded.reading.learn");
  expect(next.pending).toBe("expanded.conflict");
});

it("limits petition protection to the next eligible local settlement", () => {
  const life = noble();
  expect(applyHouseServiceChoice(life, "expanded.house-petition.claim")).toBe(true);
  expect(applyHouseServiceChoice(life, "expanded.house-petition.claim")).toBe(false);
  expect(houseProtectionActive(life)).toBe(false);
  life.age++;
  expect(houseProtectionActive(life)).toBe(true);
  life.region = "asura";
  expect(houseProtectionActive(life)).toBe(false);
  life.region = "ranoa";
  life.age += 2;
  expect(canPetitionHouse(life)).toBe(true);
  expect(houseProtectionActive(life)).toBe(false);
});

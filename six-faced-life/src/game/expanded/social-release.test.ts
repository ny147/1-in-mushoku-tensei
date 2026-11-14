import { describe, expect, it } from "vitest";
import { advance, beginLife, choose, createLife, getDecision, openActivity } from "../engine";
import { archiveLife, loadGame, saveGame } from "../storage";
import { canAutoChoose } from "../simulation";
import type { ExpandedLife, Language, Life } from "../types";
import { quoteEducation, reserveEducation } from "./education-finance";
import legacyBaseline from "../fixtures/legacy-baseline.json";

const hash = async (value: unknown) => Array.from(new Uint8Array(
  await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(value))),
)).map(v => v.toString(16).padStart(2, "0")).join("");

function debtor(language: Language = "en"): ExpandedLife {
  for (let seed = 0; seed < 100; seed++) {
    const birth = createLife({ seed, language });
    if (birth.ruleset !== "expanded-1" || !birth.expansion.social?.debt) continue;
    expect(birth.expansion.origin.wealth).toBe("poor");
    expect(birth.expansion.social.debt.initial).toBe(48);
    const life = beginLife(birth) as ExpandedLife;
    return choose(life, getDecision(life)!.choices[0].id) as ExpandedLife;
  }
  throw Error("No seeded indebted poor birth");
}

function reload<T extends Life>(life: T): T {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  expect(saveGame(storage, { version: 1, active: life, archive: [] })).toBe(true);
  const restored = loadGame(storage);
  expect(restored.error).toBeNull();
  expect(restored.data.active).toEqual(life);
  return restored.data.active as T;
}

function clearDecisions(life: ExpandedLife): ExpandedLife {
  for (let guard = 0; life.pending && guard < 30; guard++) {
    const offer = getDecision(life)!;
    const choice = offer.choices.find(c => c.id.endsWith(".later")) ??
      offer.choices.find(c => !c.disabled && !c.cost);
    if (!choice) throw Error(`No nonspending continuation for ${life.pending}`);
    life = choose(life, choice.id) as ExpandedLife;
  }
  expect(life.pending).toBeNull();
  return life;
}

// Equality includes all three random streams, pending/queue, history, facts,
// source-specific reserves and every annual/idempotence guard, not just balances.
function pairedYear(life: ExpandedLife): ExpandedLife {
  const direct = advance(clearDecisions(life), "year") as ExpandedLife;
  const restored = advance(clearDecisions(reload(life)), "year");
  expect(restored).toEqual(direct);
  return reload(direct);
}

function atResponsibility(language: Language): ExpandedLife {
  const life = debtor(language);
  life.age = 14;
  life.stats.health = 100;
  life.deathAge = 100;
  life.coins = 300;
  life.expansion.economy.peak = 300;
  life.expansion.lastRandom = 14;
  const next = pairedYear(life);
  expect(next.pending).toBe("expanded.parental-debt");
  expect(canAutoChoose(next)).toBe(false);
  expect(advance(next, "year")).toBe(next);
  return next;
}

describe("standing release: uninterrupted and saved public flows", () => {
  it("keeps captured pre-standing university, grant and service offers and exact choice futures until prospective adoption", async () => {
    let life = structuredClone(preStanding.life) as unknown as ExpandedLife;
    const oldOrigin = structuredClone(life.expansion.origin);
    const actions = ["expanded.university.later", "expanded.grant.later", "expanded.service.later"];
    for (let index = 0; index < actions.length; index++) {
      life = reload(life);
      expect(life.expansion.social).toBeUndefined();
      expect(await hash(getDecision(life))).toBe(preStanding.offers[index]);
      life = choose(life, actions[index]) as ExpandedLife;
      const historical = structuredClone(life);
      delete historical.expansion.social;
      expect(await hash(historical)).toBe(preStanding.states[index]);
    }
    expect(life.expansion.social).toMatchObject({ source: "migrated", royalHouse: null, debt: null, activatedYear: life.expansion.birthYear + 30 });
    expect(life.expansion.origin).toEqual(oldOrigin);
    expect(reload(reload(life))).toEqual(life);
    const ended = preStanding.ended as unknown as ExpandedLife;
    const saved = archiveLife({ version: 1, active: ended, archive: [] }, ended);
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    expect(saveGame(storage, saved)).toBe(true);
    expect(loadGame(storage)).toEqual({ data: saved, error: null });
  });

  it("retains frozen legacy seeded outcomes through actual repeated writes and reads", async () => {
    const record = legacyBaseline.records[0];
    let life = createLife({ ruleset: "legacy-1", seed: record.seed, language: record.language as Language, name: "Baseline" });
    expect(await hash(reload(life))).toBe(record.checkpoints[0]);
    life = beginLife(life);
    expect(await hash(reload(life))).toBe(record.checkpoints[1]);
    for (const checkpoint of record.checkpoints.slice(2)) {
      life = reload(life);
      const decision = getDecision(life);
      const choice = decision?.choices.find(c => !c.disabled && (c.cost ?? 0) <= life.coins && !c.risk) ??
        decision?.choices.find(c => !c.disabled && (c.cost ?? 0) <= life.coins);
      life = decision ? choose(life, choice!.id) : advance(life, "year");
      expect(await hash(life)).toBe(checkpoint);
    }
    expect(life.phase).toBe("ended");
  });

  it.each(["en", "th"] as const)("collects childhood support once and preserves %s reserves and seeded future", language => {
    const life = debtor(language);
    life.stats.health = 100;
    life.coins = 33;
    life.expansion.economy.peak = 33;
    life.expansion.economy.familyFunds = 50;
    expect(reserveEducation(life, quoteEducation(life, {
      purpose: "mage", admission: 0, travel: 0, tuition: 24, living: 0,
      starterFee: 0, remainingUnits: 6, school: null,
    }), false)).toBe(true);
    const finance = structuredClone(life.expansion.finance);
    const next = pairedYear(life);
    expect(next.expansion.social!.debt).toMatchObject({ balance: 47, childhoodPaid: 1, personalPaid: 0 });
    expect(next.coins).toBe(33);
    expect(next.expansion.economy.familyFunds).toBe(26);
    expect(next.expansion.finance!.purposes).toEqual(finance!.purposes);
    const partial = advance(next, "tick", 0.1) as ExpandedLife;
    expect(partial.expansion.social!.debt).toEqual(next.expansion.social!.debt);
    expect(advance(reload(next), "tick", 0.1)).toEqual(partial);
    expect(pairedYear(next).age).toBe(2);
  });

  it.each(["en", "th"] as const)("accepts %s debt without consuming student reserves and restores later decisions", language => {
    const pending = atResponsibility(language);
    pending.expansion.economy.familyFunds = 30;
    expect(reserveEducation(pending, quoteEducation(pending, {
      purpose: "university", admission: 0, travel: 0, tuition: 60, living: 0,
      starterFee: 0, remainingUnits: 1, school: null,
    }), false)).toBe(true);
    pending.expansion.education.budget = 60;
    pending.expansion.education.stage = "university";
    const finance = structuredClone(pending.expansion.finance), coins = pending.coins;
    const accepted = choose(pending, "expanded.parental-debt.accept") as ExpandedLife;
    expect(choose(reload(pending), "expanded.parental-debt.accept")).toEqual(accepted);
    expect(accepted.coins).toBe(coins);
    expect(accepted.expansion.finance).toEqual(finance);
    expect(accepted.expansion.social!.debt).toMatchObject({ status: "accepted", balance: 48, personalPaid: 0 });
    expect(choose(reload(accepted), "expanded.parental-debt.accept")).toEqual(accepted);
    expect(pairedYear(accepted).expansion.social!.debt!.decisionYear).toBe(pending.expansion.birthYear + 15);
  });

  it.each(["en", "th"] as const)("pauses, resumes and completes %s service with no cash wage or repeated credit", language => {
    let life = clearDecisions(choose(atResponsibility(language), "expanded.parental-debt.service") as ExpandedLife);
    expect(life.expansion.career.role).toBe("laborer");
    // Relocation pauses the actual annual service, without withdrawing study.
    const home = life.region;
    life.region = home === "ranoa" ? "asura" : "ranoa";
    life = pairedYear(life);
    expect(life.expansion.social!.debt).toMatchObject({ servicePaid: 0, balance: 48, service: { completedYears: 0 } });
    life = clearDecisions(life);
    life.region = home;
    for (let year = 1; year <= 4; year++) {
      life = pairedYear(life);
      expect(life.expansion.economy.lastIncome).toBe(0);
      expect(life.expansion.social!.debt).toMatchObject({ servicePaid: 12 * year, balance: 48 - 12 * year, service: { completedYears: year } });
      const held = reload(life);
      expect((advance(held, "tick", 0.1) as ExpandedLife).expansion.social!.debt!.servicePaid).toBe(12 * year);
    }
    expect(life.expansion.social!.debt).toMatchObject({ status: "settled", service: { endReason: "completed" } });
    const paidAgain = pairedYear(life);
    expect(paidAgain.expansion.economy.lastIncome).toBeGreaterThan(0);
    expect(paidAgain.expansion.social!.debt!.servicePaid).toBe(48);
  });

  it.each(["en", "th"] as const)("restores %s service review, keeps earned credit and closes unpaid debt at death once", language => {
    let life = clearDecisions(choose(atResponsibility(language), "expanded.parental-debt.service") as ExpandedLife);
    life = clearDecisions(pairedYear(life));
    const review = openActivity(life, "debt-service-exit") as ExpandedLife;
    expect(review.pending).toBe("expanded.debt-service-exit");
    expect(canAutoChoose(review)).toBe(false);
    expect(review.coins).toBe(life.coins);
    const kept = choose(reload(review), "expanded.debt-service-exit.keep") as ExpandedLife;
    expect(kept.expansion.social!.debt).toEqual(life.expansion.social!.debt);
    const exited = choose(reload(review), "expanded.debt-service-exit.confirm") as ExpandedLife;
    expect(exited).toEqual(choose(review, "expanded.debt-service-exit.confirm"));
    expect(exited.expansion.social!.debt).toMatchObject({ status: "accepted", balance: 36, servicePaid: 12, service: { endReason: "exit" } });
    exited.deathAge = exited.age + 1;
    const ended = pairedYear(exited);
    expect(ended.phase).toBe("ended");
    expect(ended.expansion.social!.debt).toMatchObject({ status: "closed", balance: 0, closedUnpaid: 36, servicePaid: 12 });
    const once = archiveLife({ version: 1, active: ended, archive: [] }, ended);
    expect(archiveLife(once, reload(ended))).toEqual(once);
    const storage = { getItem: () => JSON.stringify(once), setItem: () => {} };
    expect(loadGame(storage)).toEqual({ data: once, error: null });
    expect(advance(ended, "year")).toBe(ended);
  });

  it.each(["en", "th"] as const)("expires the %s refusal shelter burden after three real years without collecting personal debt", language => {
    let life = clearDecisions(choose(atResponsibility(language), "expanded.parental-debt.refuse") as ExpandedLife);
    const decisionYear = life.expansion.social!.debt!.decisionYear;
    for (let elapsed = 1; elapsed <= 4; elapsed++) {
      life = pairedYear(life);
      expect(life.expansion.economy.lastExpenses).toBe(elapsed <= 3 ? 22 : 18);
      expect(life.expansion.social!.debt).toMatchObject({ status: "refused", decisionYear, personalPaid: 0, balance: 48 });
      expect(life.expansion.social!.household.housing).toBe("security-lost");
    }
  });
});

// Captured from origin/main e7fa05b, not generated by the implementation under test.
const preStanding = {"ref":"e7fa05b89594afb9d8e291117f25c6c45228e44b","life":{"version":1,"language":"en","id":"life-1","seed":1,"rng":2043914558,"name":"Standing compatibility","surname":"Rowan","race":"human","birthRegion":"millis","region":"millis","hometown":"a town outside Millishion","background":"A well-established family","aptitude":"A quick, curious mind","personality":"Restlessly hopeful","phase":"alive","age":30,"progress":0,"memories":true,"stats":{"health":90,"happiness":64,"knowledge":18,"bonds":67,"mana":24,"sword":5},"coins":500,"focus":"balanced","career":"child","training":{"magicXp":0,"swordXp":0,"magicCap":1,"swordCap":2,"discipline":"Elemental magic","school":"","guildXp":0},"family":[{"id":"mother","name":"Elena Rowan","role":"Mother","bornAt":-27,"lifespan":78},{"id":"father","name":"Tomas Rowan","role":"Father","bornAt":-27,"lifespan":78}],"flags":{},"history":[{"id":1,"age":0,"title":"A life in history","text":"A new life begins with memories of another world.","kind":"birth","message":{"key":"expanded.birth"}}],"pending":"expanded.university","seen":{},"deathAge":78,"ending":null,"progression":{"version":1,"specialization":"water","magic":{"water":{"xp":0,"spells":[]},"fire":{"xp":0,"spells":[]},"earth":{"xp":0,"spells":[]},"wind":{"xp":0,"spells":[]},"healing":{"xp":0,"spells":[]}},"career":{"role":"child","level":0,"experience":0,"years":0,"reputation":20}},"ruleset":"expanded-1","expansion":{"swords":{"version":1,"selected":null,"tracks":{"sword-god":{"xp":0,"cap":2},"water-god":{"xp":0,"cap":2},"north-god":{"xp":0,"cap":2}},"legacy":null,"compatibilityDecision":null,"compatibilityStudy":null,"courseCredit":{"laborer":0,"farmer":0,"merchant":0,"guard":0,"adventurer":0,"swordsman":0,"mage":0,"healer":0,"cleric":0,"teacher":0},"mentorship":null,"completed":{"sword-god":{},"water-god":{},"north-god":{}}},"version":1,"birthYear":412,"worldSeed":4061452545,"familyRng":427009404,"nextId":1,"origin":{"wealth":"poor","status":"commoner","locality":"settlement","birthplace":"settlement","patron":false,"ancestry":["human"]},"economy":{"support":10,"familyFunds":0,"assets":0,"unmetFood":0,"unmetShelter":0,"unmetCare":0,"peak":500,"protectionUntil":411,"aidUntil":411,"travelUntil":411,"unsafeWork":false,"lastIncome":0,"lastExpenses":0,"deprivedYears":0},"education":{"stage":"none","assessment":0,"assessed":false,"scholarship":false,"probation":false,"successfulYears":0,"research":0,"previousKnowledge":18,"previousXp":0,"budget":0},"career":{"role":"child","records":{"child":{"xp":0,"years":0,"level":0,"reputation":0},"student":{"xp":0,"years":0,"level":0,"reputation":0},"laborer":{"xp":0,"years":0,"level":0,"reputation":0},"farmer":{"xp":0,"years":0,"level":0,"reputation":0},"merchant":{"xp":0,"years":0,"level":0,"reputation":0},"guard":{"xp":0,"years":0,"level":0,"reputation":0},"adventurer":{"xp":0,"years":0,"level":0,"reputation":0},"swordsman":{"xp":0,"years":0,"level":0,"reputation":0},"mage":{"xp":0,"years":0,"level":0,"reputation":0},"healer":{"xp":0,"years":0,"level":0,"reputation":0},"cleric":{"xp":0,"years":0,"level":0,"reputation":0},"knight":{"xp":0,"years":0,"level":0,"reputation":0},"teacher":{"xp":0,"years":0,"level":0,"reputation":0},"professor":{"xp":0,"years":0,"level":0,"reputation":0},"retired":{"xp":0,"years":0,"level":0,"reputation":0}},"timeline":[]},"standing":{"status":"commoner","reputation":0,"trust":0,"service":0,"feats":[],"title":null,"titles":[]},"politics":{"faction":null,"trust":0,"refused":{},"pursuitUntil":411,"obligations":0,"contact":false,"records":[]},"genetics":{"carrier":false,"manifestation":"none","auraImpaired":false,"discovered":false,"signs":false,"magicTalent":false,"academicTalent":false,"swordTalent":false},"family":{"people":[{"id":"mother","name":"Elena Rowan","role":"parent","parents":[],"race":"human","ancestry":["human"],"born":385,"died":null,"lifespan":78,"strength":70,"genetics":{"carrier":false,"manifestation":"none","auraImpaired":false,"discovered":false,"signs":false,"magicTalent":false,"academicTalent":false,"swordTalent":true},"partner":"father","children":1,"generation":-1,"home":"millis","educated":false,"occupation":"worker"},{"id":"father","name":"Tomas Rowan","role":"parent","parents":[],"race":"human","ancestry":["human"],"born":385,"died":null,"lifespan":78,"strength":70,"genetics":{"carrier":false,"manifestation":"none","auraImpaired":false,"discovered":false,"signs":false,"magicTalent":true,"academicTalent":false,"swordTalent":false},"partner":"mother","children":1,"generation":-1,"home":"millis","educated":false,"occupation":"worker"}],"marriages":[],"cohorts":[],"directBorn":0,"distantBorn":0,"distantDead":0,"friends":[]},"facts":[],"queue":["expanded.grant","expanded.service"],"lastRandom":-3,"processedYear":411,"history":[{"year":442,"code":"conflict","region":"millis","locality":"settlement","exposure":"support"}],"summary":null,"study":"water","training":{"version":1,"active":null,"mode":"full-time","paused":false,"selection":null,"lastYear":411,"records":{"laborer":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"farmer":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"merchant":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"guard":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"adventurer":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"swordsman":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"mage":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"healer":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"cleric":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"teacher":{"units":0,"school":null,"completedYear":null,"placementAccepted":false}}},"finance":{"version":1,"lastYear":411,"lastConsumptionYear":411,"lastRepayment":0,"pauseReason":"no-surplus","purposes":{}},"careerPaths":{"version":1,"active":null,"earned":{},"work":{"everyday":{"years":0,"units":0,"milestones":0},"farming":{"years":0,"units":0,"milestones":0},"trade":{"years":0,"units":0,"milestones":0},"sword":{"years":0,"units":0,"milestones":0},"guard":{"years":0,"units":0,"milestones":0},"knight":{"years":0,"units":0,"milestones":0},"adventure":{"years":0,"units":0,"milestones":0},"mage":{"years":0,"units":0,"milestones":0},"academic":{"years":0,"units":0,"milestones":0},"instructor":{"years":0,"units":0,"milestones":0},"healer":{"years":0,"units":0,"milestones":0},"cleric":{"years":0,"units":0,"milestones":0}},"requests":0,"lastWorkYear":411,"lastProjectYear":411,"payFloor":{},"selection":null,"teaching":null,"teacherCourse":null,"recent":[]},"serviceContext":{"year":442,"code":"conflict","region":"millis","locality":"settlement"}}},"offers":["b730bfd9cf948a282ffb07afa1d18fdbac0fba277606a67bae7a38584672686b","6789a373ac8186a5ca862987968342dec4afd93b30455985f451c95607172d17","ae7ffb25d2a242f10e555b3c2181593a553c7dd183579e8ecf53852c227f1f9f"],"states":["8e12dd9efc52905d18f96043d3dc84cfc14caee6b70a80029a0715d4f80e1e64","ce2b623e672ed641eafdcf48b8041741242b6aeb67dfa531ca049c73cf7fef4f","40e67816dde59dea45996d275137fefa55b063e59147642a1289045aa9df0768"],"ended":{"version":1,"language":"en","id":"life-1","seed":1,"rng":2043914558,"name":"Standing compatibility","surname":"Rowan","race":"human","birthRegion":"millis","region":"millis","hometown":"a town outside Millishion","background":"A well-established family","aptitude":"A quick, curious mind","personality":"Restlessly hopeful","phase":"ended","age":30,"progress":0,"memories":true,"stats":{"health":90,"happiness":64,"knowledge":18,"bonds":67,"mana":24,"sword":5},"coins":500,"focus":"balanced","career":"child","training":{"magicXp":0,"swordXp":0,"magicCap":1,"swordCap":2,"discipline":"Elemental magic","school":"","guildXp":0},"family":[{"id":"mother","name":"Elena Rowan","role":"Mother","bornAt":-27,"lifespan":78},{"id":"father","name":"Tomas Rowan","role":"Father","bornAt":-27,"lifespan":78}],"flags":{},"history":[{"id":1,"age":0,"title":"A life in history","text":"A new life begins with memories of another world.","kind":"birth","message":{"key":"expanded.birth"}},{"id":2,"age":30,"title":"The last page of this life","text":"aging","kind":"ending","message":{"key":"expanded.ending"}}],"pending":null,"seen":{},"deathAge":78,"ending":{"cause":"aging","legacy":"A life shaped by circumstances, choices and the people who shared it."},"progression":{"version":1,"specialization":"water","magic":{"water":{"xp":0,"spells":[]},"fire":{"xp":0,"spells":[]},"earth":{"xp":0,"spells":[]},"wind":{"xp":0,"spells":[]},"healing":{"xp":0,"spells":[]}},"career":{"role":"child","level":0,"experience":0,"years":0,"reputation":20}},"ruleset":"expanded-1","expansion":{"swords":{"version":1,"selected":null,"tracks":{"sword-god":{"xp":0,"cap":2},"water-god":{"xp":0,"cap":2},"north-god":{"xp":0,"cap":2}},"legacy":null,"compatibilityDecision":null,"compatibilityStudy":null,"courseCredit":{"laborer":0,"farmer":0,"merchant":0,"guard":0,"adventurer":0,"swordsman":0,"mage":0,"healer":0,"cleric":0,"teacher":0},"mentorship":null,"completed":{"sword-god":{},"water-god":{},"north-god":{}}},"version":1,"birthYear":412,"worldSeed":4061452545,"familyRng":427009404,"nextId":1,"origin":{"wealth":"poor","status":"commoner","locality":"settlement","birthplace":"settlement","patron":false,"ancestry":["human"]},"economy":{"support":10,"familyFunds":0,"assets":0,"unmetFood":0,"unmetShelter":0,"unmetCare":0,"peak":500,"protectionUntil":411,"aidUntil":411,"travelUntil":411,"unsafeWork":false,"lastIncome":0,"lastExpenses":0,"deprivedYears":0},"education":{"stage":"none","assessment":0,"assessed":false,"scholarship":false,"probation":false,"successfulYears":0,"research":0,"previousKnowledge":18,"previousXp":0,"budget":0},"career":{"role":"child","records":{"child":{"xp":0,"years":0,"level":0,"reputation":0},"student":{"xp":0,"years":0,"level":0,"reputation":0},"laborer":{"xp":0,"years":0,"level":0,"reputation":0},"farmer":{"xp":0,"years":0,"level":0,"reputation":0},"merchant":{"xp":0,"years":0,"level":0,"reputation":0},"guard":{"xp":0,"years":0,"level":0,"reputation":0},"adventurer":{"xp":0,"years":0,"level":0,"reputation":0},"swordsman":{"xp":0,"years":0,"level":0,"reputation":0},"mage":{"xp":0,"years":0,"level":0,"reputation":0},"healer":{"xp":0,"years":0,"level":0,"reputation":0},"cleric":{"xp":0,"years":0,"level":0,"reputation":0},"knight":{"xp":0,"years":0,"level":0,"reputation":0},"teacher":{"xp":0,"years":0,"level":0,"reputation":0},"professor":{"xp":0,"years":0,"level":0,"reputation":0},"retired":{"xp":0,"years":0,"level":0,"reputation":0}},"timeline":[]},"standing":{"status":"commoner","reputation":0,"trust":0,"service":0,"feats":[],"title":null,"titles":[]},"politics":{"faction":null,"trust":0,"refused":{},"pursuitUntil":411,"obligations":0,"contact":false,"records":[]},"genetics":{"carrier":false,"manifestation":"none","auraImpaired":false,"discovered":false,"signs":false,"magicTalent":false,"academicTalent":false,"swordTalent":false},"family":{"people":[{"id":"mother","name":"Elena Rowan","role":"parent","parents":[],"race":"human","ancestry":["human"],"born":385,"died":null,"lifespan":78,"strength":70,"genetics":{"carrier":false,"manifestation":"none","auraImpaired":false,"discovered":false,"signs":false,"magicTalent":false,"academicTalent":false,"swordTalent":true},"partner":"father","children":1,"generation":-1,"home":"millis","educated":false,"occupation":"worker"},{"id":"father","name":"Tomas Rowan","role":"parent","parents":[],"race":"human","ancestry":["human"],"born":385,"died":null,"lifespan":78,"strength":70,"genetics":{"carrier":false,"manifestation":"none","auraImpaired":false,"discovered":false,"signs":false,"magicTalent":true,"academicTalent":false,"swordTalent":false},"partner":"mother","children":1,"generation":-1,"home":"millis","educated":false,"occupation":"worker"}],"marriages":[],"cohorts":[],"directBorn":0,"distantBorn":0,"distantDead":0,"friends":[]},"facts":[],"queue":[],"lastRandom":-3,"processedYear":411,"history":[{"year":442,"code":"conflict","region":"millis","locality":"settlement","exposure":"support"}],"summary":{"version":1,"deathYear":442,"cause":"aging","spouseCount":0,"childrenBorn":0,"survivingChildren":0,"survivingDescendants":0,"finalWealth":500,"peakWealth":500,"sections":[{"key":"identity","en":"Standing compatibility Rowan; Human; Holy Country of Millis, Local settlement; K412–K442; 30 years; Old age. Poor, Commoner.","th":"Standing compatibility Rowan; มนุษย์; ศาสนจักรมิลิส, ชุมชนในพื้นที่; K412–K442; 30 ปี; ชราภาพ. ยากจน, สามัญชน."},{"key":"childhood","en":"Years with unmet necessities: 0. Assessment: not assessed. Education: Not recorded; 0 successful years. Current scholarship: no. ","th":"วัยเด็กขาดปัจจัยจำเป็น 0 ปี การประเมินความสามารถ ยังไม่ได้ประเมิน การศึกษา: ยังไม่มีบันทึก ปีที่เรียนผ่าน 0 สถานะทุน ไม่มีทุนปัจจุบัน "},{"key":"work","en":"Sword God: Beginner (0 XP); Water God: Beginner (0 XP); North God: Beginner (0 XP). Last selected: unselected. Completed mentorships: none recorded. Child. Training: no recorded attendance. . . Completed requests: 0.","th":"เทพดาบ: ขั้นต้น (0 XP); เทพวารี: ขั้นต้น (0 XP); เทพอุดร: ขั้นต้น (0 XP). เลือกฝึกครั้งสุดท้าย: ยังไม่เลือก. การฝึกกับอาจารย์ที่สำเร็จ: ไม่มีที่บันทึก. เด็ก. การฝึก: ไม่มีการฝึกที่บันทึกไว้. . . คำขอสำเร็จ: 0."},{"key":"public","en":"Commoner; Reputation 0; no current allegiance; current title none. K442 conflict: Relief or support. ","th":"สามัญชน; ชื่อเสียง 0; ไม่มีฝ่ายปัจจุบัน; ตำแหน่งปัจจุบัน ไม่มี. K442 conflict: ผู้ช่วยบรรเทาทุกข์. "},{"key":"family","en":"Distinct spouses: 0. Direct children born: 0; surviving children: 0; total surviving descendants: 0. . Elena Rowan: Parent, K385; Tomas Rowan: Parent, K385. ","th":"คู่สมรสที่เคยสมรส 0 คน บุตรโดยตรง 0 คน ยังมีชีวิต 0 คน ผู้สืบสกุลที่ยังมีชีวิตทั้งหมด 0 คน . Elena Rowan: พ่อหรือแม่, K385; Tomas Rowan: พ่อหรือแม่, K385. "},{"key":"legacy","en":"Coins at death: 500; peak personal wealth: 500; assets: 0; distinct major contributions: 0.  Education finance: borrowed 0; repaid 0; unused funding cancelled 0; unpaid 0. Obligations do not pass to descendants.","th":"เงินเมื่อสิ้นชีวิต 500 เหรียญ เงินสูงสุด 500 เหรียญ ทรัพย์สิน 0 ผลงานสำคัญ 0 รายการ  เงินกู้เพื่อการศึกษา กู้สะสม 0 ชำระแล้ว 0 คืนเงินที่ยังไม่ใช้ 0 ค้างเมื่อสิ้นชีวิต 0 ไม่ส่งต่อหนี้ให้ผู้สืบสกุล"}],"narrative":{"en":"Standing compatibility Rowan was born in K412, in Holy Country of Millis, to a household with poor resources and commoner standing. Birth opened some routes and made others harder. Over 30 years, the recorded life developed through learning, material circumstances and decisions, rather than a guaranteed path to exceptional power. There were 0 years in which necessities were not fully met. Education ended with the recorded status of not recorded, with 0 successful university years. These details distinguish access and attendance from a completed qualification.\n\nThe final primary occupation was child. Earlier appointments and earned progression remain in the work record even after a change of direction. Public standing ended at 0 reputation. The historical record distinguishes personal exposure, voluntary work and distant news; it does not turn every contemporary of a conflict into a soldier. 0 distinct spouses and 0 direct children were recorded. At death, 0 direct children and 0 descendants in total were alive. Those counts describe recorded relationships, without assigning motives or inventing a family that never formed.\n\nThis life ended in K442 through old age. Personal savings stood at 500 coins, after a recorded peak of 500. The detailed sections preserve the circumstances, successes, interruptions and losses behind those totals. An ordinary livelihood and a life without marriage remain complete outcomes. The final account records what happened and leaves unobserved possibilities unwritten.","th":"Standing compatibility Rowan เกิดในปี K412 ที่ศาสนจักรมิลิส ในครัวเรือนยากจน มีฐานะเป็นสามัญชน ชาติกำเนิด ทรัพยากร และยุคสมัยส่งผลต่อโอกาส แต่ไม่ได้รับประกันความสำเร็จ ตลอดชีวิตมีช่วงที่ขาดปัจจัยจำเป็น 0 ปี เรื่องราวสิ้นสุดเมื่ออายุ 30 ปี ในปี K442 จากชราภาพ\n\nสถานะการศึกษาคือยังไม่มีบันทึก เรียนมหาวิทยาลัยผ่าน 0 ปี อาชีพหลักสุดท้ายคือเด็ก ประวัติการทำงานก่อนหน้ายังคงอยู่ในรายละเอียด ชื่อเสียงสุดท้าย 0 การมีชีวิตร่วมยุคกับสงครามไม่ได้หมายถึงเข้าร่วมรบ บันทึกจึงแยกผลกระทบต่อพลเรือน งานบรรเทาทุกข์ การรับใช้ และข่าวจากแดนไกลอย่างชัดเจน\n\nมีคู่สมรสที่เคยสมรส 0 คน บุตรโดยตรง 0 คน เมื่อสิ้นชีวิต บุตรยังมีชีวิต 0 คน และผู้สืบสกุลที่ยังมีชีวิตทั้งหมด 0 คน เงินที่เหลือ 500 เหรียญ เคยมีเงินสูงสุด 500 เหรียญ ตัวเลขเหล่านี้สะท้อนสิ่งที่บันทึกไว้ ไม่ใช่ความตั้งใจที่ไม่มีใครทราบ ชีวิตธรรมดาหรือชีวิตที่ไม่ได้สมรสก็เป็นเรื่องราวที่สมบูรณ์ รายละเอียดเก็บทั้งโอกาส ความพยายาม สิ่งที่สำเร็จ สิ่งที่ยุติลง และความสูญเสีย โดยเว้นอนาคตที่ไม่เคยเกิดขึ้นไว้ตามจริง"}},"study":"water","training":{"version":1,"active":null,"mode":"full-time","paused":false,"selection":null,"lastYear":411,"records":{"laborer":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"farmer":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"merchant":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"guard":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"adventurer":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"swordsman":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"mage":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"healer":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"cleric":{"units":0,"school":null,"completedYear":null,"placementAccepted":false},"teacher":{"units":0,"school":null,"completedYear":null,"placementAccepted":false}}},"finance":{"version":1,"lastYear":411,"lastConsumptionYear":411,"lastRepayment":0,"pauseReason":"ended","purposes":{}},"careerPaths":{"version":1,"active":null,"earned":{},"work":{"everyday":{"years":0,"units":0,"milestones":0},"farming":{"years":0,"units":0,"milestones":0},"trade":{"years":0,"units":0,"milestones":0},"sword":{"years":0,"units":0,"milestones":0},"guard":{"years":0,"units":0,"milestones":0},"knight":{"years":0,"units":0,"milestones":0},"adventure":{"years":0,"units":0,"milestones":0},"mage":{"years":0,"units":0,"milestones":0},"academic":{"years":0,"units":0,"milestones":0},"instructor":{"years":0,"units":0,"milestones":0},"healer":{"years":0,"units":0,"milestones":0},"cleric":{"years":0,"units":0,"milestones":0}},"requests":0,"lastWorkYear":411,"lastProjectYear":411,"payFloor":{},"selection":null,"teaching":null,"teacherCourse":null,"recent":[]},"serviceContext":{"year":442,"code":"conflict","region":"millis","locality":"settlement"},"optionalActivity":null}}};

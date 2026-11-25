import { loadGame, saveGame } from "../storage";
import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { advanceExpanded, beginExpanded, chooseExpanded } from "./engine";
import { getExpandedDecision } from "./events";
import { applySuccessionYear, dueCrisisDecision } from "./succession-events";
import { applyCrisisChoice } from "./succession-events";

function household(age: number) {
  const life = createExpandedLife({ seed: 41 });
  life.expansion.birthYear = 424 - age;
  life.age = age;
  life.region = "asura";
  life.expansion.standing.status = "noble";
  return life;
}
describe("the K424 eligibility snapshot", () => {
  it("gives a newborn shelter after the birth introduction, even when another decision is queued", () => {
    const life = beginExpanded(household(0));
    life.expansion.queue.push(...Array(16).fill("expanded.practice"));
    const child = chooseExpanded(life, "expanded.memory.observe");
    expect(child.pending).toBe("expanded.asura-household");
    expect(getExpandedDecision(child)?.requiresManual).toBe(true);
    const sheltered = chooseExpanded(child, "expanded.asura-household.stay");
    expect(sheltered.expansion.succession?.crisis.outcome).toBe("sheltered");
    expect(sheltered.expansion.queue.length).toBeLessThanOrEqual(16);
  });
  it("does not reopen eligibility on a later arrival or birthday", () => {
    const life = household(17);
    life.phase = "alive";
    life.region = "ranoa";
    applySuccessionYear(life);
    life.region = "asura";
    life.age = 18;
    applySuccessionYear(life);
    expect(dueCrisisDecision(life)).toBe("expanded.asura-result");
    expect(life.expansion.succession?.crisis.route).toBe("news");
  });
  it("records a paid pledge once and rejects side switching", () => {
    const life = household(18);
    life.phase = "alive";
    life.coins = 20;
    applySuccessionYear(life);
    life.pending = dueCrisisDecision(life);
    const pledged = chooseExpanded(life, "expanded.asura-oath.ariel-funded");
    expect(pledged.coins).toBe(8);
    applyCrisisChoice(pledged, "expanded.asura-oath.opposition");
    expect(pledged.expansion.succession?.crisis.side).toBe("ariel");
    expect(pledged.expansion.standing.service).toBe(1);
  });
});

it("opens on the eighteenth birthday and restores both the oath and the committed pledge through storage", () => {
  const l = createExpandedLife({ seed: 6, region: "asura" });
  expect(l.expansion.birthYear).toBe(406);
  l.phase = "alive";
  l.age = 17;
  l.expansion.standing.status = "noble";
  l.expansion.social!.debt = null;
  l.expansion.economy.peak = l.coins = 600;
  const oath = advanceExpanded(l, "year");
  expect(oath.age).toBe(18);
  expect(oath.pending).toBe("expanded.asura-oath");
  let raw = "";
  const store = {
    getItem: () => raw,
    setItem: (_key: string, v: string) => {
      raw = v;
    },
  };
  function restored(life: typeof l) {
    expect(saveGame(store, { version: 1, active: life, archive: [] })).toBe(
      true,
    );
    const result = loadGame(store);
    expect(result.error).toBeNull();
    return result.data.active as typeof l;
  }
  expect(restored(oath)).toEqual(oath);
  const pledged = chooseExpanded(oath, "expanded.asura-oath.opposition-funded");
  expect(restored(pledged)).toEqual(pledged);
});
it("shows a later-born child the actual K425 news exactly once", () => {
  const l = beginExpanded(createExpandedLife({ seed: 15, region: "asura" }));
  expect(l.expansion.birthYear).toBe(427);
  l.expansion.standing.status = "noble";
  const news = chooseExpanded(l, "expanded.memory.observe");
  expect(news.pending).toBe("expanded.asura-result");
  const read = chooseExpanded(news, "expanded.asura-result.read");
  expect(read.expansion.succession!.crisis).toMatchObject({
    route: "news",
    outcome: "news",
    reward: 0,
    side: null,
  });
  expect(read.coins).toBe(news.coins);
  applySuccessionYear(read);
  expect(dueCrisisDecision(read)).toBeNull();
});
it("keeps sheltered children outside adult outcomes after an eighteenth birthday; records living local helpers", () => {
  const l = household(17);
  l.phase = "alive";
  const [parent, absent] = l.expansion.family.people;
  parent.home = "asura";
  absent.home = "demon";
  applySuccessionYear(l);
  applyCrisisChoice(l, "expanded.asura-household.stay");
  const state = l.expansion.succession!;
  state.winner =
    state.crisis.householdSide === "ariel" ? "opposition" : "ariel";
  l.age++;
  applySuccessionYear(l);
  const purse = l.coins;
  applyCrisisChoice(l, "expanded.asura-result.read");
  expect(state.crisis).toMatchObject({
    outcome: "protection-lost",
    lostHelperIds: [parent.id],
    reward: 0,
    route: "child",
  });
  expect(l.expansion.standing.service).toBe(0);
  expect(l.coins).toBe(purse);
  expect(absent.home).toBe("demon");
});

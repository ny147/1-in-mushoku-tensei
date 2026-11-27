import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import {
  openActivity,
  choose,
  getDecision,
  createLife,
  advance,
} from "../engine";
import { isLife, loadGame } from "../storage";
import { canAutoChoose } from "../simulation";
import { expandedDecisionText } from "../../i18n/expanded";
function adult() {
  const l = createExpandedLife({ seed: 2 });
  // Existing activity fixtures exercise debt-free adults; responsibility has its own gate tests.
  delete l.expansion.social;
  l.phase = "alive";
  l.age = 35;
  l.coins = 200;
  l.expansion.economy.peak = 200;
  l.stats.knowledge = 50;
  return l;
}
describe("player-initiated optional activities", () => {
  it("never schedules a legendary challenge during ordinary yearly progression", () => {
    for (let seed = 0; seed < 500; seed++) {
      const l = createExpandedLife({ seed });
      l.phase = "alive";
      l.age = 35;
      l.stats.health = 100;
      l.coins = 500;
      l.expansion.economy.peak = 500;
      expect(advance(l, "year").pending, `seed ${seed}`).not.toBe(
        "expanded.challenge",
      );
    }
  });
  it("validates the saved manual marker and keeps existing pending challenges compatible", () => {
    const l = adult();
    l.pending = "expanded.challenge";
    expect(isLife(l)).toBe(true);
    l.expansion.optionalActivity = "expanded.career";
    expect(isLife(l)).toBe(false);
  });
  it("makes education, training, travel and meeting people available without random offers", () => {
    const l = adult();
    for (const key of [
      "assessment",
      "instruction",
      "university",
      "travel",
      "courtship",
    ] as const) {
      const n = openActivity(l, key);
      expect(n.pending).toBe(`expanded.${key}`);
      expect(canAutoChoose(n)).toBe(false);
      expect(isLife(n)).toBe(true);
    }
  });
  it("opens a career browser without time, coin or RNG changes and preserves manual control on reload", () => {
    const l = adult(),
      before = structuredClone(l),
      n = openActivity(l, "career");
    expect(l).toEqual(before);
    expect(n.pending).toBe("expanded.career");
    expect(n.age).toBe(l.age);
    expect(n.rng).toBe(l.rng);
    expect(n.coins).toBe(l.coins);
    expect(canAutoChoose(n)).toBe(false);
    expect(isLife(n)).toBe(true);
    const restored = loadGame({
      getItem: () => JSON.stringify({ version: 1, active: n, archive: [] }),
      setItem: () => {
        throw Error("no write");
      },
    }).data.active!;
    expect(canAutoChoose(restored)).toBe(false);
    const done = choose(restored, "expanded.career.later");
    expect(done.pending).toBeNull();
    expect(isLife(done)).toBe(true);
  });
  it("allows an eligible non-farmer appointment, charges once, and explains blocked jobs in both languages", () => {
    const l = adult();

    const n = choose(openActivity(l, "career"),'expanded.career.path-trade'),
      d = getDecision(n)!;
    expect(
      d.choices.find((c) => c.id === "expanded.career-path.enter-trade-assistant")?.disabled,
    ).toBe(false);
    const martial=getDecision(choose(openActivity(l,'career'),'expanded.career.path-martial'))!;
    expect(martial.choices.find(c=>c.id==='expanded.career-path.enter-guard')?.requirements)
      .toContainEqual({id:'sword',current:0,required:20,met:false});
    expect(
      expandedDecisionText(martial, "th").choices.find(
        (c) => c.id === "expanded.career-path.enter-guard",
      )?.description,
    ).toMatch(/[ก-๙]/);
    const hired = choose(n, "expanded.career-path.enter-trade-assistant");
    if (hired.ruleset !== "expanded-1") throw Error("expanded");
    expect(hired.expansion.career.role).toBe("merchant");
    expect(hired.coins).toBe(190);
    expect(isLife(hired)).toBe(true);
  });
  it("does not overwrite pending decisions or let children/legacy/ended lives open activities", () => {
    const l = adult();
    l.pending = "expanded.memory";
    expect(openActivity(l, "career")).toBe(l);
    l.pending = null;
    l.age = 14;
    expect(openActivity(l, "career")).toBe(l);
    l.phase = "ended";
    expect(openActivity(l, "career")).toBe(l);
    const old = createLife({ ruleset: "legacy-1", seed: 1 });
    expect(openActivity(old, "career")).toBe(old);
  });
  it("opens and declines a legendary challenge voluntarily without fighting", () => {
    const l = adult(),
      n = openActivity(l, "challenge");
    expect(n.pending).toBe("expanded.challenge");
    expect(canAutoChoose(n)).toBe(false);
    const next = choose(n, "expanded.challenge.later");
    expect(next.pending).toBeNull();
    expect(next.stats.health).toBe(l.stats.health);
    expect(next.rng).toBe(l.rng);
  });
  it("offers other careers directly at the first livelihood decision", () => {
    const l = adult();
    l.pending = "expanded.work";
    const next = choose(l, "expanded.work.career");
    expect(next.pending).toBe("expanded.career");
    expect(canAutoChoose(next)).toBe(false);
  });
});

describe("Orsted’s first assignment", () => {
  const key = "orsted-ledger" as const;
  const id = "expanded.orsted-ledger.";
  function member() {
    const life = adult();
    life.expansion.politics.faction = "orsted";
    life.expansion.politics.trust = 20;
    return life;
  }
  function reload(life: ReturnType<typeof member>) {
    const restored = loadGame({
      getItem: () => JSON.stringify({version: 1, active: life, archive: []}),
      setItem: () => { throw Error("Unexpected write"); },
    });
    expect(restored.error).toBeFalsy();
    return restored.data.active as typeof life;
  }
  it("respects membership, age and existing commitments", () => {
    const life = adult();
    expect(openActivity(life, key)).toBe(life);
    life.expansion.politics.faction = "hitogami";
    expect(openActivity(life, key)).toBe(life);
    life.expansion.politics.faction = "orsted";
    life.age = 17;
    expect(openActivity(life, key)).toBe(life);
    life.age = 18;
    life.expansion.queue.push("expanded.reading");
    expect(openActivity(life, key)).toBe(life);
    life.expansion.queue.pop();
    life.pending = "expanded.assignment";
    expect(openActivity(life, key)).toBe(life);
    expect(getDecision(life)?.id).toBe("expanded.assignment");
    const legacy = createLife({ruleset: "legacy-1", seed: 2});
    expect(openActivity(legacy, key)).toBe(legacy);
  });
  it.each([["full", 8], ["protect", 4]] as const)("resolves %s once after reload", (action, gain) => {
    const life = member();
    const first = reload(openActivity(life, key) as typeof life);
    expect(canAutoChoose(first)).toBe(false);
    const later = choose(first, id + "later") as typeof life;
    expect(later.expansion.politics.orstedLedger).toBeUndefined();
    const started = choose(openActivity(later, key), id + "investigate") as typeof life;
    const second = reload(openActivity(started, key) as typeof life);
    expect(canAutoChoose(second)).toBe(false);
    const done = choose(second, id + action) as typeof life;
    expect(done.expansion.politics.trust).toBe(20 + gain);
    expect(done.rng).toBe(life.rng);
    expect(done.history.at(-1)?.text).toContain("+" + gain);
    expect(openActivity(done, key)).toBe(done);
    expect(choose(done, id + action)).toBe(done);
  });
  it("records the capped reward and closes an investigation on defection", () => {
    const life = member();
    life.expansion.politics.trust = 99;
    const started = choose(openActivity(life, key), id + "investigate") as typeof life;
    const capped = choose(openActivity(started, key), id + "full") as typeof life;
    expect(capped.expansion.politics.trust).toBe(100);
    expect(capped.history.at(-1)?.text).toContain("+1");
    started.pending = "expanded.defect";
    const left = choose(started, "expanded.defect.accept") as typeof life;
    expect(left.expansion.politics.orstedLedger).toBe("ended");
    expect(left.expansion.politics.trust).toBe(0);
    left.expansion.politics.faction = "orsted";
    const rejoined = reload(left);
    expect(openActivity(rejoined, key)).toBe(rejoined);
  });
});

describe("the dream’s warning", () => {
  const key = "hitogami-dream" as const;
  const prefix = "expanded.hitogami-dream.";
  function apostle() {
    const life = adult();
    life.expansion.politics.faction = "hitogami";
    life.expansion.politics.trust = 98;
    return life;
  }
  function reload(life: ReturnType<typeof adult>) {
    const saved = loadGame({getItem: () => JSON.stringify({version: 1, active: life, archive: []}), setItem: () => {}});
    expect(saved.error).toBeFalsy();
    return saved.data.active as typeof life;
  }
  it.each(["stop", "pass"] as const)("keeps the %s consequence across reload and awards trust once", action => {
    const life = apostle();
    const first = reload(openActivity(life, key) as typeof life);
    expect(canAutoChoose(first)).toBe(false);
    expect(choose(first, prefix + "read")).toBe(first);
    const chosen = reload(choose(first, prefix + action) as typeof life);
    const trust = action === "stop" ? 100 : 98;
    expect(chosen.expansion.politics.trust).toBe(trust);
    expect(chosen.pending).toBeNull();
    expect(chosen.history.at(-1)?.text).toContain(action === "stop" ? "+2" : "went through");
    const report = reload(openActivity(chosen, key) as typeof life);
    expect(choose(report, prefix + action)).toBe(report);
    const done = reload(choose(report, prefix + "read") as typeof life);
    expect(done.history.at(-1)?.text).toContain(action === "stop" ? "ran out of lamp oil" : "found the ferryman");
    expect(done.expansion.politics.trust).toBe(trust);
    expect(done.rng).toBe(life.rng);
    expect(openActivity(done, key)).toBe(done);
  });
  it("keeps commitments first and prevents defection from resetting the dream", () => {
    const life = apostle();
    life.expansion.queue.push("expanded.reading");
    expect(openActivity(life, key)).toBe(life);
    life.expansion.queue.pop();
    for (const faction of [null, "orsted"] as const) {
      life.expansion.politics.faction = faction;
      expect(openActivity(life, key)).toBe(life);
    }
    life.expansion.politics.faction = "hitogami";
    life.age = 17;
    expect(openActivity(life, key)).toBe(life);
    life.age = 35;
    const chosen = choose(openActivity(life, key), prefix + "pass") as typeof life;
    chosen.pending = "expanded.defect";
    const left = choose(chosen, "expanded.defect.accept") as typeof life;
    expect(left.history.some(e => e.text.includes("found the ferryman"))).toBe(true);
    left.expansion.politics.faction = "hitogami";
    const rejoined = reload(left);
    expect(openActivity(rejoined, key)).toBe(rejoined);
  });
});

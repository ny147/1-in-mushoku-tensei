import { describe, expect, it } from "vitest";
import { advance, beginLife, choose, createLife } from "./engine";
import { archiveLife, loadGame, SAVE_KEY, saveGame } from "./storage";
import type { ExpandedLife } from "./types";
import { createExpandedLife } from "./expanded/origins";
import { getExpandedDecision } from "./expanded/events";
import { finishExpanded } from "./expanded/engine";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}
describe("local persistence", () => {
  it.each(["en", "th"] as const)(
    "retains a new %s life's language, pending decision, and future after reload",
    (language) => {
      const storage = memoryStorage();
      const life = beginLife(createLife({ ruleset: 'legacy-1', seed: 90, language }));
      expect(life.language).toBe(language);
      expect(saveGame(storage, { version: 1, active: life, archive: [] })).toBe(
        true,
      );
      const restored = loadGame(storage);
      expect(restored.error).toBeNull();
      expect(restored.data.active).toEqual(life);
      expect(
        advance(choose(restored.data.active!, "observe"), "decision"),
      ).toEqual(advance(choose(life, "observe"), "decision"));
    },
  );

  it("preserves legacy lives without adding language metadata or rewriting storage", () => {
    const storage = memoryStorage();
    const life = beginLife(createLife({ ruleset: 'legacy-1', seed: 44 }));
    delete life.language;
    const raw = JSON.stringify({ version: 1, active: life, archive: [] });
    storage.setItem(SAVE_KEY, raw);
    const restored = loadGame(storage);
    expect(restored.error).toBeNull();
    expect(restored.data.active).toEqual(life);
    expect(Object.hasOwn(restored.data.active!, "language")).toBe(false);
    expect(storage.getItem(SAVE_KEY)).toBe(raw);
  });

  it.each(["xx", null, 1, {}, [], "toString", "constructor", "__proto__"])(
    "preserves the original payload when a life has invalid language %j",
    (language) => {
      for (const archived of [false, true]) {
        const storage = memoryStorage();
        const life = {
          ...createLife({ ruleset: 'legacy-1', seed: 55 }),
          language,
          ...(archived
            ? {
                phase: "ended",
                pending: null,
                ending: { cause: "Old age.", legacy: "A life well lived." },
              }
            : {}),
        };
        const raw = JSON.stringify({
          version: 1,
          active: archived ? null : life,
          archive: archived ? [life] : [],
        });
        storage.setItem(SAVE_KEY, raw);
        expect(loadGame(storage).error).toBeTruthy();
        expect(storage.getItem(SAVE_KEY)).toBe(raw);
      }
    },
  );

  it("round trips English, Thai and legacy lives in the same archive", () => {
    const storage = memoryStorage();
    const archive = [
      createLife({ ruleset: 'legacy-1', seed: 1, language: "en" }),
      createLife({ ruleset: 'legacy-1', seed: 2, language: "th" }),
      createLife({ ruleset: 'legacy-1', seed: 3 }),
    ].map((life) => ({
      ...life,
      phase: "ended" as const,
      pending: null,
      ending: { cause: "Old age.", legacy: "A life well lived." },
    }));
    const save = {
      version: 1 as const,
      active: beginLife(createLife({ ruleset: 'legacy-1', seed: 4, language: "th" })),
      archive,
    };
    expect(saveGame(storage, save)).toBe(true);
    expect(loadGame(storage)).toEqual({ data: save, error: null });
    expect(loadGame(storage).data.archive.map((life) => life.language)).toEqual(
      ["en", "th", undefined],
    );
  });

  it("round trips an active pending decision and its future", () => {
    const storage = memoryStorage();
    const life = beginLife(createLife({ ruleset: 'legacy-1', seed: 90 }));
    expect(saveGame(storage, { version: 1, active: life, archive: [] })).toBe(
      true,
    );
    const result = loadGame(storage);
    expect(result.error).toBeNull();
    expect(result.data.active).toEqual(life);
    expect(advance(choose(result.data.active!, "observe"), "decision")).toEqual(
      advance(choose(life, "observe"), "decision"),
    );
  });
  it("returns a useful recovery message for corrupt and unsupported saves", () => {
    for (const value of [
      "{broken",
      '{"version":500}',
      '{"version":1,"active":{},"archive":[]}',
    ]) {
      const storage = memoryStorage();
      storage.setItem(SAVE_KEY, value);
      const result = loadGame(storage);
      expect(result.error).toBeTruthy();
      expect(result.data.active).toBeNull();
      expect(storage.getItem(SAVE_KEY)).toBe(value);
    }
  });
  it("rejects invalid nested stats, event ids, and nonfinite values", () => {
    const base = createLife({ ruleset: 'legacy-1', seed: 9 });
    for (const life of [
      { ...base, stats: { ...base.stats, health: -100 } },
      { ...base, family: [null] },
      { ...base, pending: "missing-event" },
      { ...base, training: { ...base.training, magicXp: null } },
      { ...base, race: "unicorn" },
    ]) {
      const storage = memoryStorage();
      storage.setItem(
        SAVE_KEY,
        JSON.stringify({ version: 1, active: life, archive: [] }),
      );
      expect(loadGame(storage).error).toBeTruthy();
    }
  });
  it("survives blocked browser storage", () => {
    const storage = {
      getItem() {
        throw Error("blocked");
      },
      setItem() {
        throw Error("full");
      },
    };
    expect(loadGame(storage).error).toBeTruthy();
    expect(saveGame(storage, { version: 1, active: null, archive: [] })).toBe(
      false,
    );
  });
  it("migrates a first-release save without changing its decision, history, or random state", () => {
    const storage = memoryStorage();
    const life = beginLife(createLife({ ruleset: 'legacy-1', seed: 42 }));
    delete life.progression;
    life.training.magicXp = 120;
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 1, active: life, archive: [] }),
    );
    const result = loadGame(storage);
    expect(result.error).toBeNull();
    expect(result.data.active?.progression?.magic.water.xp).toBe(120);
    const { progression, ...preserved } = result.data.active!;
    expect(progression).toBeDefined();
    expect(preserved).toEqual(life);
    expect(storage.getItem(SAVE_KEY)).toBe(
      JSON.stringify({ version: 1, active: life, archive: [] }),
    );
  });
  it("rejects malformed progression instead of crashing or erasing the save", () => {
    for (const corrupt of [
      { specialization: "toString" },
      {
        career: {
          role: "child",
          level: 99,
          experience: 0,
          years: 0,
          reputation: 20,
        },
      },
      { magic: { water: { xp: 0, spells: ["invented-spell"] } } },
    ]) {
      const storage = memoryStorage();
      const life = createLife({ ruleset: 'legacy-1', seed: 42 });
      life.progression = {
        ...life.progression!,
        ...corrupt,
      } as typeof life.progression;
      const raw = JSON.stringify({ version: 1, active: life, archive: [] });
      storage.setItem(SAVE_KEY, raw);
      expect(loadGame(storage).error).toBeTruthy();
      expect(storage.getItem(SAVE_KEY)).toBe(raw);
    }
  });
  it("rejects prototype keys masquerading as enum values", () => {
    for (const key of ["focus", "career", "race", "birthRegion", "region"]) {
      for (const value of ["toString", "constructor", "__proto__"]) {
        const storage = memoryStorage();
        const life = { ...createLife({ ruleset: 'legacy-1', seed: 9 }), [key]: value };
        storage.setItem(
          SAVE_KEY,
          JSON.stringify({ version: 1, active: life, archive: [] }),
        );
        expect(loadGame(storage).error, `${key} = ${value}`).toBeTruthy();
      }
    }
  });
  it("archives completed lives once and keeps their ending available", () => {
    let life = beginLife(createLife({ ruleset: 'legacy-1', seed: 1 }));
    life = {
      ...life,
      phase: "ended",
      pending: null,
      ending: { cause: "Old age.", legacy: "A life well lived." },
    };
    const once = archiveLife({ version: 1, active: life, archive: [] }, life);
    const twice = archiveLife(once, life);
    expect(twice.archive).toHaveLength(1);
    expect(twice.active?.ending).toEqual(life.ending);
  });
});

describe("social adoption in persisted expanded lives", () => {
  function oldExpanded() {
    const life = createExpandedLife({ seed: 1 });
    delete life.expansion.social;
    delete life.expansion.swords;
    delete life.expansion.careerPaths;
    life.phase = "alive";
    life.age = 30;
    life.pending = null;
    return life;
  }

  it("composes social adoption after sword and career migration without rewriting the raw save", () => {
    const life = oldExpanded(), storage = memoryStorage();
    const raw = JSON.stringify({ version: 1, active: life, archive: [] });
    storage.setItem(SAVE_KEY, raw);
    const restored = loadGame(storage);
    expect(restored.error).toBeNull();
    const active = restored.data.active as ExpandedLife;
    expect(active.expansion.swords).toBeDefined();
    expect(active.expansion.careerPaths?.lastWorkYear).toBe(life.expansion.birthYear + 30);
    expect(active.expansion.social).toMatchObject({ source: "migrated", activatedYear: life.expansion.birthYear + 30, debt: null, royalHouse: null });
    expect(active.history).toEqual(life.history);
    expect(active.rng).toBe(life.rng);
    expect(active.expansion.familyRng).toBe(life.expansion.familyRng);
    expect(active.expansion.worldSeed).toBe(life.expansion.worldSeed);
    expect(storage.getItem(SAVE_KEY)).toBe(raw);
    expect(saveGame(storage, restored.data)).toBe(true);
    expect(loadGame(storage).data).toEqual(restored.data);
  });

  it("preserves pending sword compatibility and queued university/grant/service offers", () => {
    const life = oldExpanded(), storage = memoryStorage();
    life.pending = "expanded.university";
    life.expansion.queue = ["expanded.grant", "expanded.service"];
    const offer = getExpandedDecision(life);
    expect(offer).toBeTruthy();
    storage.setItem(SAVE_KEY, JSON.stringify({ version: 1, active: life, archive: [] }));
    const restored = loadGame(storage);
    expect(restored.error).toBeNull();
    const active = restored.data.active as ExpandedLife;
    expect(getExpandedDecision(active)).toEqual(offer);
    expect(active.pending).toBe(life.pending);
    expect(active.expansion.queue).toEqual(life.expansion.queue);
    expect(active.expansion.swords?.compatibilityDecision).toEqual(offer);
    expect(active.expansion.social).toBeUndefined();
    expect(active.expansion.careerPaths).toBeUndefined();
  });

  it("rejects invalid raw payloads before adoption and leaves storage untouched", () => {
    for (const malformed of [null, {}, { version: 99 }]) {
      const life = oldExpanded(), storage = memoryStorage();
      const raw = JSON.stringify({ version: 1, active: { ...life, expansion: { ...life.expansion, social: malformed } }, archive: [] });
      storage.setItem(SAVE_KEY, raw);
      expect(loadGame(storage).error).toBeTruthy();
      expect(storage.getItem(SAVE_KEY)).toBe(raw);
    }
  });

  it("leaves completed active and archived expanded snapshots unchanged", () => {
    const life = oldExpanded(), storage = memoryStorage();
    finishExpanded(life, "old age");
    const save = { version: 1 as const, active: life, archive: [life] };
    storage.setItem(SAVE_KEY, JSON.stringify(save));
    expect(loadGame(storage)).toEqual({ data: save, error: null });
  });
});

describe("household debt storage recovery boundaries", () => {
  function debtor() {
    for (let seed = 0; seed < 100; seed++) {
      const life = createExpandedLife({ seed });
      if (!life.expansion.social?.debt) continue;
      life.phase = "alive";
      life.age = 15;
      life.pending = "expanded.parental-debt";
      return life;
    }
    throw Error("Missing indebted poor birth");
  }

  it.each<[string, (life: ExpandedLife) => void]>([
    ["unknown ledger version", l => { l.expansion.social!.version = 99 as 1; }],
    ["broken conservation", l => { l.expansion.social!.debt!.balance--; }],
    ["unknown household parent", l => { l.expansion.social!.household.parentIds = ["unrecorded-parent"]; }],
    ["future childhood collection", l => { l.expansion.social!.debt!.lastChildhoodYear = l.expansion.birthYear + 15; }],
    ["decision before age fifteen", l => {
      const d = l.expansion.social!.debt!;
      d.status = "accepted"; d.decisionYear = l.expansion.birthYear + 14;
      l.pending = null;
    }],
    ["missing required balance", l => { Reflect.deleteProperty(l.expansion.social!.debt!, "balance"); }],
    ["null ledger", l => { Reflect.set(l.expansion, "social", null); }],
  ])("preserves unreadable raw bytes for %s on every load attempt", (_label, corrupt) => {
    const life = debtor();
    corrupt(life);
    const storage = memoryStorage();
    const raw = JSON.stringify({ version: 1, active: life, archive: [] });
    storage.setItem(SAVE_KEY, raw);
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = loadGame(storage);
      expect(result.error).toBeTruthy();
      expect(result.data.active).toBeNull();
      expect(storage.getItem(SAVE_KEY)).toBe(raw);
    }
  });

  it("accepts the absent optional credit marker but rejects malformed contracts or forged earned credit", () => {
    const life = choose(debtor(), "expanded.parental-debt.service") as ExpandedLife;
    const service = life.expansion.social!.debt!.service!;
    expect(service.lastCreditYear).toBeNull();
    const storage = memoryStorage();
    delete service.lastCreditYear;
    expect(saveGame(storage, { version: 1, active: life, archive: [] })).toBe(true);
    const restored = loadGame(storage);
    expect(restored.error).toBeNull();
    expect(restored.data.active).toEqual(life);
    for (const mutate of [
      (l: ExpandedLife) => { l.expansion.social!.debt!.service!.lastCreditYear = l.expansion.birthYear + 15; },
      (l: ExpandedLife) => {
        const d = l.expansion.social!.debt!;
        d.servicePaid = 12; d.balance = 36;
      },
      (l: ExpandedLife) => { Reflect.set(l.expansion.social!.debt!, "service", null); },
    ]) {
      const invalid = structuredClone(life);
      mutate(invalid);
      const raw = JSON.stringify({ version: 1, active: invalid, archive: [] });
      storage.setItem(SAVE_KEY, raw);
      expect(loadGame(storage).error).toBeTruthy();
      expect(storage.getItem(SAVE_KEY)).toBe(raw);
    }
  });

  it("rejects corrupted archived debt before migrating a valid old active life", () => {
    const ended = choose(debtor(), "expanded.parental-debt.accept") as ExpandedLife;
    finishExpanded(ended, "aging");
    ended.expansion.social!.debt!.closedUnpaid--;
    const oldActive = debtor();
    delete oldActive.expansion.social;
    oldActive.pending = null;
    const storage = memoryStorage();
    const raw = JSON.stringify({ version: 1, active: oldActive, archive: [ended] });
    storage.setItem(SAVE_KEY, raw);
    expect(loadGame(storage).error).toBeTruthy();
    expect(storage.getItem(SAVE_KEY)).toBe(raw);
  });
});

import { describe, expect, it } from "vitest";
import { advance, beginLife, choose, createLife } from "./engine";
import { archiveLife, loadGame, SAVE_KEY, saveGame } from "./storage";

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

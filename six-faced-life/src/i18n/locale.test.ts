import { describe, expect, it } from "vitest";
import { advance, beginLife, choose, createLife } from "../game/engine";
import { SAVE_KEY } from "../game/storage";
import {
  languageOf,
  readLanguagePreference,
  writeLanguagePreference,
} from "./locale";

describe("life language and new-life preference", () => {
  it("reads legacy and missing lives as English without mutation", () => {
    const life = createLife({ seed: 12 });
    const before = structuredClone(life);
    expect(languageOf(life)).toBe("en");
    expect(languageOf(null)).toBe("en");
    expect(languageOf(undefined)).toBe("en");
    expect(languageOf({ language: "th" })).toBe("th");
    expect(life).toEqual(before);
  });

  it("keeps language separate from seeded simulation outcomes", () => {
    const run = (language: "en" | "th") => {
      let life = beginLife(createLife({ seed: 22, language }));
      life = advance(choose(life, "observe"), "decision");
      const { language: selected, ...simulation } = life;
      expect(selected).toBe(language);
      return simulation;
    };
    expect(run("th")).toEqual(run("en"));
  });

  it("remembers only the separate preference and never reads or writes the game save", () => {
    const values = new Map([[SAVE_KEY, "untouched game payload"]]);
    const reads: string[] = [];
    const writes: string[] = [];
    const storage = {
      getItem(key: string) {
        reads.push(key);
        return values.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        writes.push(key);
        values.set(key, value);
      },
    };
    expect(readLanguagePreference(storage)).toBe("en");
    expect(writeLanguagePreference(storage, "th")).toBe(true);
    expect(readLanguagePreference(storage)).toBe("th");
    expect(writeLanguagePreference(storage, "en")).toBe(true);
    expect(readLanguagePreference(storage)).toBe("en");
    expect(new Set(reads)).toEqual(new Set(["six-faced-life.language"]));
    expect(new Set(writes)).toEqual(new Set(["six-faced-life.language"]));
    expect(values.get(SAVE_KEY)).toBe("untouched game payload");
  });

  it.each([null, "", "xx", "TH", "null", '"th"', "toString", "__proto__"])(
    "defaults an invalid or absent preference %j to English",
    (value) => {
      expect(
        readLanguagePreference({ getItem: () => value, setItem() {} }),
      ).toBe("en");
    },
  );

  it("handles blocked preference reads and writes without attempting game-save recovery", () => {
    const keys: string[] = [];
    const storage = {
      getItem(key: string): string | null {
        keys.push(key);
        throw Error("blocked");
      },
      setItem(key: string) {
        keys.push(key);
        throw Error("full");
      },
    };
    expect(readLanguagePreference(storage)).toBe("en");
    expect(writeLanguagePreference(storage, "th")).toBe(false);
    expect(keys).toEqual([
      "six-faced-life.language",
      "six-faced-life.language",
    ]);
  });
});

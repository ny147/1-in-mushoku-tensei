import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./expanded/origins";
import { finishLife } from "./engine";
import { loadGame, saveGame } from "./storage";
describe("bounded expanded save encoding", () => {
  it("round-trips twenty full-length records under the loader ceiling without deleting prose", () => {
    const l = createExpandedLife({ seed: 1 });
    finishLife(l, "illness");
    l.history = Array.from({ length: 600 }, (_, i) => ({
      id: i + 1,
      age: 0,
      title: "A preserved chronicle entry",
      text: "An original recorded consequence. ".repeat(16),
      kind: "life" as const,
    }));
    const data = {
      version: 1 as const,
      active: createExpandedLife({ seed: 2 }),
      archive: Array.from({ length: 20 }, (_, i) => ({
        ...structuredClone(l),
        id: `archive-${i}`,
      })),
    };
    let raw = "";
    expect(
      saveGame(
        {
          getItem: () => raw,
          setItem: (_, v) => {
            raw = v;
          },
        },
        data,
      ),
    ).toBe(true);
    expect(raw.length).toBeLessThan(6_000_000);
    const result = loadGame({
      getItem: () => raw,
      setItem: () => {
        throw Error("no write");
      },
    });
    expect(result.error).toBeNull();
    expect(result.data).toEqual(data);
    console.info(
      JSON.stringify({
        fixture: "20 full-length repeated chronicle records",
        storedCharacters: raw.length,
      }),
    );
  });
  it("leaves corrupt encoding and unknown encoding untouched", () => {
    for (const raw of [
      '{"version":1,"encoding":"future-2"}',
      '{"version":1,"encoding":"dictionary-1","dictionary":[],"active":{"_s":9},"archive":[]}',
    ]) {
      const result = loadGame({
        getItem: () => raw,
        setItem: () => {
          throw Error("no writes");
        },
      });
      expect(result.error).toBeTruthy();
    }
  });
});

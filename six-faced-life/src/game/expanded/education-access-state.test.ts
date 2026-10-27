import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { isLife, loadGame, SAVE_KEY } from "../storage";

describe("education access save compatibility", () => {
  it("initializes a bounded empty course and debt state without changing origin draws", () => {
    const l = createExpandedLife({ seed: 1 });
    expect(l.expansion.training?.active).toBe(null);
    expect(Object.keys(l.expansion.training?.records ?? {})).toHaveLength(10);
    expect(l.expansion.finance?.purposes).toEqual({});
    expect(isLife(l)).toBe(true);
  });
  it("migrates only absent active fields and leaves storage and archived snapshots untouched", () => {
    const l = createExpandedLife({ seed: 1 });
    delete l.expansion.training;
    delete l.expansion.finance;
    const raw = JSON.stringify({ version: 1, active: l, archive: [] });
    const storage = {
      getItem: () => raw,
      setItem: () => {
        throw Error("must not write");
      },
    };
    const result = loadGame(storage);
    expect(result.error).toBe(null);
    const active = result.data.active!;
    expect(active.rng).toBe(l.rng);
    expect(active.pending).toBe(l.pending);
    expect(active.coins).toBe(l.coins);
    if (active.ruleset !== "expanded-1") throw Error("expanded");
    expect(active.expansion.training?.active).toBe(null);
    expect(active.expansion.finance?.purposes).toEqual({});
    expect(storage.getItem()).toBe(raw);
  });
  it.each([
    null,
    { version: 2 },
    { version: 1 },
    { version: 1, purposes: { constructor: {} } },
  ])("rejects malformed present finance %j recoverably", (finance) => {
    const l = createExpandedLife({ seed: 1 });
    Object.assign(l.expansion, { finance });
    const values = new Map([
      [SAVE_KEY, JSON.stringify({ version: 1, active: l, archive: [] })],
    ]);
    const before = values.get(SAVE_KEY);
    expect(
      loadGame({
        getItem: (k) => values.get(k) ?? null,
        setItem: (k, v) => {
          values.set(k, v);
        },
      }).error,
    ).not.toBe(null);
    expect(values.get(SAVE_KEY)).toBe(before);
  });
  it("rejects excessive progress, future guards and unbalanced reserves", () => {
    const base = createExpandedLife({ seed: 1 });
    for (const patch of [
      { training: { ...base.expansion.training, lastYear: 2000 } },
      { training: { ...base.expansion.training, records: {} } },
      { finance: { ...base.expansion.finance, lastRepayment: -1 } },
      { finance: { ...base.expansion.finance, lastRepayment: 0.5 } },
    ]) {
      const l = structuredClone(base);
      Object.assign(l.expansion, patch);
      expect(isLife(l)).toBe(false);
    }
  });
});

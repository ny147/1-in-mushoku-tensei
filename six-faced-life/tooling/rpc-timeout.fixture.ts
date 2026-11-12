import { expect, it } from "vitest";

// Deliberately block this worker beyond Vitest 3's internal 60-second RPC timer.
// Every assertion passes; the regression is a nonzero runner exit afterwards.
// Run separately with npm run test:runner, not on every ordinary test run.
it("reports a passing test after a slow synchronous operation", () => {
  const signal = new Int32Array(new SharedArrayBuffer(4));
  expect(Atomics.wait(signal, 0, 0, 65_000)).toBe("timed-out");
}, 90_000);

it("continues reporting and shuts down cleanly", () => {
  expect(2 + 2).toBe(4);
});

import { expect, it } from "vitest";
import { createExpandedLife } from "../game/expanded/origins";
import { successionHistory } from "./succession";

it("conceals the winner until the news and preserves a late-born character's version of history", () => {
  const life = createExpandedLife({seed: 12});
  const s = life.expansion.succession!;
  s.winner = "opposition";
  expect(successionHistory(life, "en")).not.toMatch(/opposition took|Ariel took/);
  s.crisis.revealed = true;
  expect(successionHistory(life, "en")).toContain("opposition took");
  expect(successionHistory(life, "th")).toContain("ฝ่ายตรงข้าม");
  delete life.expansion.succession;
  expect(successionHistory(life, "en")).toContain("Ariel");
});

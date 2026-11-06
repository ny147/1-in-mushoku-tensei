import { expect, it } from "vitest";
import { currencyUnit, moneyText } from "./money";
it("labels monetary values without changing caller formatting", () => {
  expect(currencyUnit("en")).toBe("silver");
  expect(currencyUnit("th")).toBe("เหรียญเงิน");
  expect(moneyText(0, "th")).toBe("0 เหรียญเงิน");
  expect(moneyText("+1.25", "en")).toBe("+1.25 silver");
  expect(moneyText("−2.5", "th")).toBe("−2.5 เหรียญเงิน");
  expect(moneyText("1,000", "en")).toBe("1,000 silver");
});

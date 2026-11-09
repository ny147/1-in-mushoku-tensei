import type { Language } from "../game/types";
export function currencyUnit(language: Language): string {
  return language === "th" ? "เหรียญเงิน" : "silver";
}
/** Callers own number formatting; this helper supplies only the monetary unit. */
export function moneyText(amount: number | string, language: Language): string {
  return `${amount} ${currencyUnit(language)}`;
}

import type { Language } from "../game/types";
import { translate } from "./messages";

export const effectNumber = (n: number) => Number(n.toFixed(2)).toString();
export function effectText(language: Language, en: string, th: string): string {
  return language === "th" ? th : en;
}
export function effectDelta(
  language: Language,
  label: string,
  amount: number,
): string {
  return `${translate(language, label)} ${amount < 0 ? "−" : "+"}${effectNumber(Math.abs(amount))}`;
}

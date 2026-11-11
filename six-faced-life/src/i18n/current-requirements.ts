import type { Language } from "../game/types";
import { expandedLabel } from "./expanded";
import { moneyText } from "./money";
import { careerRequirementLabel } from './careers';
export const isMonetaryRequirement = (id: string) =>
  ["funding", "capital", "equipment"].includes(id);
/** Current requirement rows only: never change the shared history vocabulary. */
export function currentRequirementText(
  requirement: { id: string; current: number; required: number },
  language: Language,
  round: (n: number) => number = Math.round,
  separator = " / ",
): string {
  const { id, current, required } = requirement;
  const label =
    id === "capital"
      ? language === "th"
        ? "เงินที่ใช้ได้"
        : "Available funds"
      : careerRequirementLabel(id,language) ?? expandedLabel(id, language);
  const values = `${round(current)}${separator}${required}`;
  return `${label} ${isMonetaryRequirement(id) ? moneyText(values, language) : values}`;
}

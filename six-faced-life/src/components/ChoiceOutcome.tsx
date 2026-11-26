import { createContext, useContext, useState, type ReactNode } from "react";
import { parentalDebtSummary, shortChoiceText } from "../i18n/short-choice-text";
import { useI18n } from "../i18n/context";
import type { Life } from "../game/types";
import { entryText } from "../i18n/story";
import { translate } from "../i18n/messages";
import { choiceChanges } from "../i18n/choice-changes";

type ReadingMode = "short" | "full";
const ReadingContext = createContext<readonly [ReadingMode, (mode: ReadingMode) => void] | null>(null);

export function ChoiceReadingProvider({ children }: { children: ReactNode }) {
  const preference = useState<ReadingMode>("short");
  return <ReadingContext.Provider value={preference}>{children}</ReadingContext.Provider>;
}

export interface ChoiceResult {
  lifeId: string;
  title: string;
  text: string;
  shortText?: string;
  changes: string[];
}

export function describeChoice(before: Life, after: Life): ChoiceResult {
  const entry = [...after.history]
    .reverse()
    .find((item) => item.kind === "choice" || item.kind === "memory");
  const language = after.language ?? "en";
  const localized = entry ? entryText(entry, language) : null;
  return {
    lifeId: after.id,
    title: localized?.title ?? translate(language, "Your choice"),
    text:
      localized?.text ??
      translate(language, "Your choice becomes part of your story."),
    shortText: entry?.message?.key === "expanded.social-choice"
      ? parentalDebtSummary(before, after, language) : undefined,
    changes: choiceChanges(before, after),
  };
}

export function ChoiceOutcome({ result }: { result: ChoiceResult }) {
  const { t, language } = useI18n();
  const preference = useContext(ReadingContext);
  const full = t(result.text);
  const text = preference?.[0] === "short" ? (result.shortText ?? shortChoiceText(full, language)) : full;
  const thai = language === "th";

  return (
    <section className="choice-outcome" aria-label={t("Your choice")}>
      <h2 id="outcome-heading" tabIndex={-1}>
        {t(result.title)}
      </h2>
      {preference && (
        <div role="radiogroup" aria-label={thai ? "ความยาวของผลการเลือก" : "Result length"}>
          {(["short", "full"] as const).map((mode) => (
            <label key={mode}>
              <input type="radio" name="choice-reading-mode"
                checked={preference[0] === mode} onChange={() => preference[1](mode)} />
              {mode === "short" ? (thai ? "แบบย่อ" : "Short") : (thai ? "แบบเต็ม" : "Full")}
            </label>
          ))}
        </div>
      )}
      <p className="outcome-narrative">{text}</p>
      {result.changes.length > 0 && (
        <ul className="outcome-changes" aria-label={t("What changed")}>
          {result.changes.map((change) => (
            <li key={change}>{t(change)}</li>
          ))}
        </ul>
      )}
      <p className="outcome-note">
        {t("The next event appears as time passes. If paused, press Play above.")}
      </p>
    </section>
  );
}

import { useI18n } from "../i18n/context";
import type { Life } from "../game/types";
import { entryText } from "../i18n/story";
import { translate } from "../i18n/messages";
import { choiceChanges } from "../i18n/choice-changes";

export interface ChoiceResult {
  lifeId: string;
  title: string;
  text: string;
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
    changes: choiceChanges(before, after),
  };
}

export function ChoiceOutcome({
  result,
  onContinue,
}: {
  result: ChoiceResult;
  onContinue: () => void;
}) {
  const { t } = useI18n();

  return (
    <section className="choice-outcome" aria-label={t("Your choice")}>
      <h2 id="outcome-heading" tabIndex={-1}>
        {t(result.title)}
      </h2>
      <p className="outcome-narrative">{t(result.text)}</p>
      {result.changes.length > 0 && (
        <ul className="outcome-changes" aria-label={t("What changed")}>
          {result.changes.map((change) => (
            <li key={change}>{t(change)}</li>
          ))}
        </ul>
      )}
      <button className="button primary" onClick={onContinue}>
        {t("Continue to next decision")}
      </button>
      <p className="outcome-note">
        {t("Your choice is recorded in the chronicle below.")}
      </p>
    </section>
  );
}

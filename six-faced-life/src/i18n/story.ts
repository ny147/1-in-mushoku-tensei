import type { Decision, Entry, Language, Life } from "../game/types";
import { translate } from "./messages";
import { STORIES_TH } from "./story-th";

/** Only the returned presentation copy is localized; engine choices stay canonical. */
export function decisionText(
  decision: Decision,
  life: Life,
  language: Language,
): Decision {
  if (language === "en" || !Object.hasOwn(STORIES_TH, decision.id))
    return decision;
  const story = STORIES_TH[decision.id];
  return {
    ...decision,
    title: story.title,
    text: story.text,
    kind: translate(language, decision.kind),
    choices: decision.choices.map((choice) => {
      const text = Object.hasOwn(story.choices, choice.id)
        ? story.choices[choice.id]
        : undefined;
      return {
        ...choice,
        label:
          decision.id === "help-neighbor" &&
          choice.id === "focus" &&
          life.age < 18
            ? "กลับไปเรียนต่อ"
            : text?.[0] || translate(language, choice.label),
        description: text?.[2] ?? translate(language, choice.description),
        outcome: text?.[1] ?? translate(language, choice.outcome),
      };
    }),
  };
}

export function entryText(
  entry: Entry,
  _language: Language,
): { title: string; text: string } {
  return { title: entry.title, text: entry.text };
}

import type { Choice, Decision, Life, NarrativeMessage } from "./types";
import { MAGIC_SCHOOLS } from "./progression";

export function annualMessage(life: Life): NarrativeMessage {
  return { key: life.age < 3 ? "infancy" : `year.${life.focus}` };
}

export function choiceMessage(
  decision: Decision,
  choice: Choice,
  failed: boolean,
): NarrativeMessage {
  // Capture generated wording now: a later career/study change must not rewrite it.
  return {
    key: `choice.${decision.id}.${choice.id}`,
    params: {
      label: choice.label,
      outcome: choice.outcome,
      failed: failed ? 1 : 0,
    },
  };
}

export function spellMessage(
  learned: string[],
  source: "choice" | "year",
): NarrativeMessage {
  const spells = Object.values(MAGIC_SCHOOLS).flatMap(
    (school) => school.spells,
  );
  return {
    key: `spells.${source}`,
    params: {
      spells: learned
        .map((name) => spells.find((spell) => spell.name === name)!.id)
        .join("|"),
    },
  };
}

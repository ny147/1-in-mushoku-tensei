// Public simulation boundary. Existing saves keep the frozen legacy engine.
import * as legacy from "./legacy/engine";
import { createExpandedLife } from "./expanded/origins";
import {
  beginExpanded,
  chooseExpanded,
  advanceExpanded,
  setFocusExpanded,
  finishExpanded,
} from "./expanded/engine";
import { getExpandedDecision } from "./expanded/events";
import type { Life, LifeOptions, Focus } from "./types";
import { openExpandedActivity, type Activity } from "./expanded/activities";
export const openActivity = (life: Life, key: Activity): Life =>
  life.ruleset === "expanded-1" ? openExpandedActivity(life, key) : life;
export function createLife(options: LifeOptions = {}): Life {
  return options.ruleset === "legacy-1"
    ? legacy.createLife(options)
    : createExpandedLife(options);
}
export const beginLife = (life: Life): Life =>
  life.ruleset === "expanded-1" ? beginExpanded(life) : legacy.beginLife(life);
export const choose = (life: Life, id: string): Life =>
  life.ruleset === "expanded-1"
    ? chooseExpanded(life, id)
    : legacy.choose(life, id);
export const getDecision = (life: Life) =>
  life.ruleset === "expanded-1"
    ? getExpandedDecision(life)
    : legacy.getDecision(life);
export const setFocus = (life: Life, focus: Focus): Life =>
  life.ruleset === "expanded-1"
    ? setFocusExpanded(life, focus)
    : legacy.setFocus(life, focus);
export const advance = (
  life: Life,
  mode: "year" | "decision" | "tick",
  delta?: number,
): Life =>
  life.ruleset === "expanded-1"
    ? advanceExpanded(life, mode, delta)
    : legacy.advance(life, mode, delta);
export function finishLife(life: Life, cause: string): void {
  if (life.ruleset === "expanded-1") finishExpanded(life, cause);
  else legacy.finishLife(life, cause);
}

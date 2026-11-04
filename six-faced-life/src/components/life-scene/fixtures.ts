import { createExpandedLife } from "../../game/expanded/origins";
import { createLife } from "../../game/legacy/engine";
export function expandedSceneLife() {
  const life = createExpandedLife({ seed: 32 });
  life.phase = "alive";
  life.age = 25;
  life.pending = null;
  return life;
}
export function legacySceneLife() {
  const life = createLife({ seed: 32 });
  life.phase = "alive";
  life.age = 25;
  life.pending = null;
  return life;
}

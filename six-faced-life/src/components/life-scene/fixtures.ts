import { createExpandedLife } from "../../game/expanded/origins";
import { createLife } from "../../game/legacy/engine";
import { introducePartner, marry, addChild } from "../../game/expanded/family";
export function expandedFamilySceneLife() {
  const life = expandedSceneLife();
  const spouse = introducePartner(life)!;
  spouse.strength = 80;
  marry(life, spouse.id);
  addChild(life);
  return life;
}
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

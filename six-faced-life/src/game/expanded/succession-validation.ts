import type { ExpandedLife } from "../types";
import { validCrisisState } from "./succession-core";
import { validRestrictionState } from "./succession-restrictions";
import { validCourtState } from "./crown-service";
import { successionWinner } from "./succession-state";

export function validSuccession(life: ExpandedLife): boolean {
  const state = life.expansion.succession;
  if (state === undefined) return true;
  return !!state && state.version === 1 && state.winner === successionWinner(life.expansion.worldSeed)
    && validCrisisState(state.crisis, life) && validRestrictionState(state.restrictions, life)
    && validCourtState(state.court, life);
}

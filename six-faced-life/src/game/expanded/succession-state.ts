import type { ExpandedLife } from "../types";
import { worldYear } from "./facts";
import { draw } from "./random";
import { newCrisisState, type CrisisState } from "./succession-core";
import { newRestrictionState, type RestrictionState } from "./succession-restrictions";
import { newCourtState, type CourtState } from "./crown-service";

export type SuccessionWinner = "ariel" | "opposition";
export interface SuccessionState {
  version: 1;
  winner: SuccessionWinner;
  crisis: CrisisState;
  restrictions: RestrictionState;
  court: CourtState;
}

export function winnerFromRoll(roll: number): SuccessionWinner {
  return roll < 0.8 ? "ariel" : "opposition";
}

export function successionWinner(worldSeed: number): SuccessionWinner {
  return winnerFromRoll(draw({ rng: (worldSeed ^ 0x41535552) >>> 0 }));
}

export function newSuccessionState(worldSeed: number): SuccessionState {
  return {version: 1, winner: successionWinner(worldSeed), crisis: newCrisisState(worldSeed),
    restrictions: newRestrictionState(), court: newCourtState()};
}

export function activateSuccession(life: ExpandedLife): ExpandedLife {
  const x = life.expansion;
  if (x.succession || !x.social || life.phase === "ended" || worldYear(life) >= 424 ||
      life.pending || x.queue.length || x.swords?.compatibilityDecision ||
      x.history.some(h => h.code === "asura-succession" || h.code === "ariel-accession")) return life;
  return {...life, expansion: {...x, succession: newSuccessionState(x.worldSeed)}};
}

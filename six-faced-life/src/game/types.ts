export type Language = "en" | "th";
import type { ExpandedState } from "./expanded/types";
export type RaceId =
  "human" | "elf" | "beastfolk" | "migurd" | "dwarf" | "superd";
export type RegionId =
  "asura" | "ranoa" | "millis" | "forest" | "demon" | "begaritt";
export type Focus =
  | "balanced"
  | "magic"
  | "sword"
  | "study"
  | "work"
  | "bonds"
  | "explore"
  | "rest";
export type Career =
  | "child"
  | "student"
  | "adventurer"
  | "merchant"
  | "healer"
  | "guard"
  | "teacher"
  | "retired";
export type Stat =
  "health" | "happiness" | "knowledge" | "bonds" | "mana" | "sword";
export type Stats = Record<Stat, number>;
export type MagicSchool = "water" | "fire" | "earth" | "wind" | "healing";
export interface Progression {
  version: 1;
  specialization: MagicSchool;
  magic: Record<MagicSchool, { xp: number; spells: string[] }>;
  career: {
    role: Career;
    level: number;
    experience: number;
    years: number;
    reputation: number;
  };
}
export interface Person {
  id: string;
  name: string;
  role: string;
  bornAt: number;
  lifespan: number;
}
export interface Entry {
  id: number;
  age: number;
  title: string;
  text: string;
  message?: NarrativeMessage;
  kind:
    "birth" | "memory" | "training" | "life" | "world" | "choice" | "ending";
}
export interface NarrativeMessage {
  key: string;
  params?: Record<string, string | number>;
}
export interface BaseLife {
  version: 1;
  /** Absent on legacy saves; presentation treats those lives as English. */
  language?: Language;
  id: string;
  seed: number;
  rng: number;
  name: string;
  surname: string;
  race: RaceId;
  birthRegion: RegionId;
  region: RegionId;
  hometown: string;
  background: string;
  aptitude: string;
  personality: string;
  phase: "birth" | "alive" | "ended";
  age: number;
  progress: number;
  memories: true;
  stats: Stats;
  coins: number;
  focus: Focus;
  career: Career;
  training: {
    magicXp: number;
    swordXp: number;
    magicCap: number;
    swordCap: number;
    discipline: string;
    school: string;
    guildXp: number;
  };
  family: Person[];
  flags: Record<string, boolean>;
  history: Entry[];
  pending: string | null;
  seen: Record<string, number>;
  deathAge: number;
  ending: { cause: string; legacy: string } | null;
  progression?: Progression;
}
export interface LegacyLife extends BaseLife {
  ruleset?: "legacy-1";
}
export interface ExpandedLife extends BaseLife {
  ruleset: "expanded-1";
  expansion: ExpandedState;
}
export type Life = LegacyLife | ExpandedLife;
export interface LifeOptions {
  name?: string;
  seed?: number;
  region?: RegionId;
  language?: Language;
  ruleset?: "legacy-1" | "expanded-1";
}
export interface Choice {
  requirements?: {
    id: string;
    current: number;
    required: number;
    met: boolean;
  }[];
  vacancy?: boolean;
  id: string;
  label: string;
  description: string;
  outcome: string;
  cost?: number;
  disabled?: boolean;
  effects?: Partial<Stats>;
  magicXp?: number;
  swordXp?: number;
  coins?: number;
  flags?: string[];
  career?: Career;
  region?: RegionId;
  discipline?: string;
  school?: string;
  magicCap?: number;
  swordCap?: number;
  partner?: boolean;
  child?: boolean;
  risk?: number;
  specialization?: MagicSchool;
  schoolXp?: Partial<Record<MagicSchool, number>>;
  careerXp?: number;
  reputation?: number;
  promoteCareer?: boolean;
}
export interface Decision {
  /** Authored presentation for dynamic education quotes; never saved as rules. */
  localized?: {
    title: string;
    text: string;
    choices: Record<
      string,
      { label: string; description: string; outcome: string }
    >;
  };
  requiresManual?: boolean;
  id: string;
  title: string;
  text: string;
  kind: string;
  choices: Choice[];
}
export interface EventDef {
  id: string;
  title: string;
  text: string;
  kind: string;
  minAge: number;
  maxAge?: number;
  atAge?: number;
  once?: boolean;
  cooldown?: number;
  weight?: number;
  condition?: (life: Life) => boolean;
  choices: (life: Life) => Choice[];
}
export interface SaveData {
  version: 1;
  active: Life | null;
  archive: Life[];
}

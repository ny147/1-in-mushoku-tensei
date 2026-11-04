import type {
  Life,
  RaceId,
  RegionId,
  Focus,
  MagicSchool,
} from "../../game/types";
import type { Occupation } from "../../game/expanded/types";
import type { SwordStyle } from "../../game/expanded/sword-state";
export type AgeStage = "infant" | "child" | "teen" | "adult" | "elder";
export type Rank = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type SceneOccupation = Occupation | "neutral";
export type ClipId =
  | "idle"
  | "observe"
  | "magic"
  | "sword-god"
  | "water-god"
  | "north-god"
  | "read"
  | "work"
  | "social"
  | "walk"
  | "rest"
  | "celebrate"
  | "greet"
  | "arrive"
  | "birth"
  | "ending"
  | "prepare";
export interface SceneFacts {
  readonly careerTitle: string;
  readonly calendarYear: number | null;
  readonly lifeId: string;
  readonly phase: Life["phase"];
  readonly age: number;
  readonly race: RaceId;
  readonly region: RegionId;
  readonly focus: Focus;
  readonly occupation: SceneOccupation;
  readonly careerLevel: number;
  readonly study: MagicSchool | null;
  readonly swordStyle: SwordStyle | null;
  readonly magicRanks: Readonly<Record<MagicSchool, Rank>>;
  readonly swordRanks: Readonly<Record<SwordStyle, Rank>>;
  readonly legacySwordRank: Rank | null;
  readonly marriageKeys: readonly string[];
  readonly directBorn: number | null;
}
export interface SceneModel {
  age: number;
  careerTitle: string;
  calendarYear: number | null;
  lifeId: string;
  phase: Life["phase"];
  region: RegionId;
  race: RaceId;
  stage: AgeStage;
  occupation: SceneOccupation;
  activity: ClipId;
  outfit: SceneOccupation | "magic-training" | "sword-training";
  training: {
    family: "magic" | "sword";
    discipline: MagicSchool | SwordStyle | null;
    rank: Rank | null;
  } | null;
}
export type SceneReaction =
  "birth" | "career" | "rank" | "family" | "arrival" | "ending";
export interface ReactionState {
  current: SceneReaction | null;
  deferred: SceneReaction | null;
  expiresAt: number | null;
}
export interface ScenePresentation {
  reducedMotion?: boolean;
  model: SceneModel;
  clip: ClipId;
  characterMotion: boolean;
  ambientMotion: boolean;
  reaction: SceneReaction | null;
}
export interface SceneInput {
  life: Life | null;
  enabled: boolean;
  playing: boolean;
  motionEnabled: boolean;
}
export interface SceneSession {
  presentation: ScenePresentation | null;
  setVisible: (visible: boolean) => void;
}
export interface AssetRecord {
  url: string;
  width: number;
  height: number;
  alpha: boolean;
  bytes: number;
}
export interface SceneLayer {
  id: string;
  asset: AssetRecord;
  row: number;
  frames: number;
  durationMs: number;
  z: number;
  anchor: "background" | "hero" | "effect" | "ambient";
}

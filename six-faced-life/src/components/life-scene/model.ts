import type { Life, Focus, MagicSchool } from "../../game/types";
import { getProgression, SCHOOL_IDS } from "../../game/progression";
import { FOCUSES, RANKS, rankFor, lifeStage } from "../../game/world";
import { OCCUPATIONS } from "../../game/expanded/balance";
import {
  SWORD_STYLES,
  SWORD_NAMES,
  swordRank,
  type SwordStyle,
} from "../../game/expanded/sword-state";
import type {
  AgeStage,
  ClipId,
  Rank,
  SceneFacts,
  SceneModel,
  SceneOccupation,
} from "./types";

function earnedRank(xp: number, cap: number): Rank {
  return Math.max(0, RANKS.indexOf(rankFor(xp, cap))) as Rank;
}
function legacyStyle(school: string): SwordStyle | null {
  return (
    SWORD_STYLES.find((s) => SWORD_NAMES[s] === school || s === school) ?? null
  );
}
export function sampleSceneFacts(life: Life): SceneFacts {
  const p = getProgression(life);
  const expanded = life.ruleset === "expanded-1" ? life.expansion : null;
  const rawOccupation = expanded?.career.role ?? life.career;
  const occupation: SceneOccupation = OCCUPATIONS.includes(rawOccupation)
    ? rawOccupation
    : "neutral";
  const swords = expanded?.swords;
  const style = expanded
    ? (swords?.selected ?? null)
    : legacyStyle(life.training.school);
  const magicRanks = Object.fromEntries(
    SCHOOL_IDS.map((s) => [
      s,
      earnedRank(p.magic[s].xp, life.training.magicCap),
    ]),
  ) as Record<MagicSchool, Rank>;
  const swordRanks = Object.fromEntries(
    SWORD_STYLES.map((s) => [s, swords ? swordRank(swords.tracks[s]) : 0]),
  ) as Record<SwordStyle, Rank>;
  const legacySwordRank = expanded
    ? null
    : earnedRank(life.training.swordXp, life.training.swordCap);
  if (!expanded && style && legacySwordRank !== null)
    swordRanks[style] = legacySwordRank;
  return {
    lifeId: life.id,
    phase: life.phase,
    age: life.age,
    race: life.race,
    region: life.region,
    focus: life.focus,
    occupation,
    careerLevel: expanded
      ? expanded.career.records[expanded.career.role].level
      : p.career.level,
    study: p.specialization,
    swordStyle: style,
    magicRanks,
    swordRanks,
    legacySwordRank,
    marriageKeys:
      expanded?.family.marriages.map((m) => `${m.person}:${m.start}`) ?? [],
    directBorn: expanded?.family.directBorn ?? null,
  };
}
const STAGES: Record<string, AgeStage> = {
  Infancy: "infant",
  Childhood: "child",
  Youth: "teen",
  Adulthood: "adult",
  "Later years": "elder",
};
const ACTIVITIES: Record<Focus, ClipId> = {
  balanced: "observe",
  magic: "magic",
  sword: "prepare",
  study: "read",
  work: "work",
  bonds: "social",
  explore: "walk",
  rest: "rest",
};
export function resolveScene(f: SceneFacts): SceneModel {
  const stage = STAGES[lifeStage(f.age, f.race)];
  const base: SceneModel = {
    lifeId: f.lifeId,
    phase: f.phase,
    region: f.region,
    race: f.race,
    stage,
    occupation: f.occupation,
    activity: ACTIVITIES[f.focus],
    outfit: f.occupation,
    training: null,
  };
  if (f.phase === "ended")
    return {
      ...base,
      activity: "ending",
      outfit: stage === "infant" ? "neutral" : base.outfit,
    };
  if (stage === "infant")
    return { ...base, activity: "rest", outfit: "neutral" };
  if (f.age < FOCUSES[f.focus].minAge) return { ...base, activity: "observe" };
  if (f.focus === "magic" && f.study)
    return {
      ...base,
      activity: "magic",
      outfit: "magic-training",
      training: {
        family: "magic",
        discipline: f.study,
        rank: f.magicRanks[f.study],
      },
    };
  if (f.focus === "sword")
    return {
      ...base,
      activity: f.swordStyle ?? "prepare",
      outfit: "sword-training",
      training: {
        family: "sword",
        discipline: f.swordStyle,
        rank: f.swordStyle ? f.swordRanks[f.swordStyle] : null,
      },
    };
  return base;
}

import type { RaceId, RegionId, MagicSchool } from "../types";
export type Wealth = "poor" | "modest" | "comfortable" | "extreme";
export type Occupation =
  | "child"
  | "student"
  | "laborer"
  | "farmer"
  | "merchant"
  | "guard"
  | "adventurer"
  | "swordsman"
  | "mage"
  | "healer"
  | "cleric"
  | "knight"
  | "teacher"
  | "professor"
  | "retired";
export type Faction = "orsted" | "hitogami";
export type Manifestation = "none" | "mana" | "appearance" | "physical";
export interface Genetics {
  carrier: boolean;
  manifestation: Manifestation;
  auraImpaired: boolean;
  discovered: boolean;
  signs: boolean;
  magicTalent: boolean;
  academicTalent: boolean;
}
export interface Relative {
  id: string;
  name: string;
  role: "parent" | "spouse" | "child" | "descendant" | "inlaw";
  parents: string[];
  race: RaceId;
  ancestry: RaceId[];
  born: number;
  died: number | null;
  lifespan: number;
  strength: number;
  genetics: Genetics;
  partner: string | null;
  children: number;
  generation: number;
  home: RegionId;
  educated: boolean;
  occupation: "child" | "worker" | "student";
}
export interface Marriage {
  person: string;
  start: number;
  end: number | null;
  reason: "divorce" | "widowhood" | null;
}
export interface CohortProfile {
  born: number;
  lifespan: number;
  race: RaceId;
  carrier: boolean;
  alive: number;
  dead: number;
  rng: number;
  ancestry?: RaceId[];
}
export interface Cohort extends CohortProfile {
  generation: number;
  bins?: CohortProfile[];
}
export interface Fact {
  id: number;
  year: number;
  kind:
    | "origin"
    | "need"
    | "education"
    | "career"
    | "history"
    | "politics"
    | "family"
    | "achievement"
    | "ending"
    | "discovery";
  code: string;
  detail: string;
  value: number;
}
export interface WorkRecord {
  xp: number;
  years: number;
  level: number;
  reputation: number;
}
export interface HistoricalRecord {
  year: number;
  code: string;
  exposure: "civilian" | "participant" | "support" | "news";
  region?: RegionId;
  locality?: string;
}
export interface ServiceContext {
  year: number;
  code: string;
  region: RegionId;
  locality: string;
}
export interface CompletedSummary {
  version: 1;
  deathYear: number;
  cause: string;
  spouseCount: number;
  childrenBorn: number;
  survivingChildren: number;
  survivingDescendants: number;
  finalWealth: number;
  peakWealth: number;
  sections: { key: string; en: string; th: string }[];
  narrative: { en: string; th: string };
}
export interface ExpandedState {
  version: 1;
  birthYear: number;
  worldSeed: number;
  familyRng: number;
  nextId: number;
  origin: {
    wealth: Wealth;
    status: "commoner" | "noble";
    locality: string;
    birthplace: string;
    patron: boolean;
    ancestry: RaceId[];
  };
  economy: {
    support: number;
    familyFunds: number;
    assets: number;
    unmetFood: number;
    unmetShelter: number;
    unmetCare: number;
    peak: number;
    protectionUntil: number;
    aidUntil: number;
    travelUntil: number;
    unsafeWork: boolean;
    lastIncome: number;
    lastExpenses: number;
    deprivedYears: number;
  };
  education: {
    stage: "none" | "basic" | "university" | "graduated" | "withdrawn";
    assessment: number;
    assessed: boolean;
    scholarship: boolean;
    probation: boolean;
    successfulYears: number;
    research: number;
    previousKnowledge: number;
    previousXp: number;
    budget: number;
  };
  career: {
    role: Occupation;
    records: Record<Occupation, WorkRecord>;
    timeline: {
      year: number;
      role: Occupation;
      level: number;
      reason: string;
    }[];
  };
  standing: {
    status: "commoner" | "noble";
    reputation: number;
    trust: number;
    service: number;
    feats: string[];
    title: 5 | 6 | 7 | null;
    titles: { year: number; position: 5 | 6 | 7; won: boolean }[];
  };
  politics: {
    faction: Faction | null;
    trust: number;
    refused: Partial<Record<Faction, number>>;
    pursuitUntil: number;
    obligations: number;
    contact: boolean;
    records: { year: number; code: string }[];
  };
  genetics: Genetics;
  family: {
    people: Relative[];
    marriages: Marriage[];
    cohorts: Cohort[];
    directBorn: number;
    distantBorn: number;
    distantDead: number;
    projectionLimited?: boolean;
    friends: {
      id: string;
      name: string;
      role: "friend" | "rival" | "enemy";
      strength: number;
    }[];
  };
  facts: Fact[];
  queue: string[];
  lastRandom: number;
  processedYear: number;
  history: HistoricalRecord[];
  serviceContext?: ServiceContext | null;
  summary: CompletedSummary | null;
  study: MagicSchool;
}

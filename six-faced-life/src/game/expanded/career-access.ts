import type { MagicSchool } from "../types";
export const ORDINARY_ROLES = [
  "laborer",
  "farmer",
  "merchant",
  "guard",
  "adventurer",
  "swordsman",
  "mage",
  "healer",
  "cleric",
  "teacher",
] as const;
export type OrdinaryRole = (typeof ORDINARY_ROLES)[number];
export const isOrdinaryRole = (v: unknown): v is OrdinaryRole =>
  typeof v === "string" && (ORDINARY_ROLES as readonly string[]).includes(v);
export interface CourseDefinition {
  units: 4 | 6;
  tuition: number;
  starterFee: number;
  health?: number;
  knowledge?: number;
  sword?: number;
  magic?: number;
  trust?: number;
  reputation?: number;
  cap?: "magic" | "sword";
}
const COURSES: Record<OrdinaryRole, CourseDefinition> = {
  laborer: { units: 4, tuition: 0, starterFee: 0 },
  farmer: { units: 4, tuition: 0, starterFee: 0, health: 20 },
  merchant: { units: 4, tuition: 16, starterFee: 10, knowledge: 10 },
  guard: { units: 4, tuition: 16, starterFee: 0, sword: 20, health: 20 },
  adventurer: { units: 4, tuition: 16, starterFee: 5, sword: 15, health: 30 },
  swordsman: {
    units: 6,
    tuition: 24,
    starterFee: 0,
    sword: 30,
    cap: "sword",
    health: 20,
  },
  mage: { units: 6, tuition: 24, starterFee: 0, magic: 30, cap: "magic" },
  healer: { units: 6, tuition: 24, starterFee: 0, magic: 25 },
  cleric: {
    units: 6,
    tuition: 24,
    starterFee: 0,
    magic: 25,
    knowledge: 20,
    trust: 10,
  },
  teacher: {
    units: 6,
    tuition: 24,
    starterFee: 0,
    knowledge: 25,
    sword: 25,
    reputation: 5,
  },
};
export const ordinaryEntry = (role: OrdinaryRole): Readonly<CourseDefinition> =>
  COURSES[role];
export type TrainingMode = "full-time" | "part-time";
export type EducationPurpose = OrdinaryRole | "university";
export interface TrainingState {
  version: 1;
  active: OrdinaryRole | null;
  mode: TrainingMode;
  paused: boolean;
  selection: { role: OrdinaryRole; mode: TrainingMode } | null;
  lastYear: number;
  records: Record<
    OrdinaryRole,
    {
      units: number;
      school: MagicSchool | null;
      completedYear: number | null;
      placementAccepted: boolean;
    }
  >;
}
export interface FundingRecord {
  borrowed: number;
  repaid: number;
  cancelled: number;
  balance: number;
  closedUnpaid: number;
  reserved: { family: number; personal: number; loan: number };
}
export interface EducationFinance {
  version: 1;
  lastYear: number;
  lastConsumptionYear: number;
  lastRepayment: number;
  pauseReason: "none" | "no-surplus" | "university" | "hardship" | "ended";
  purposes: Partial<Record<EducationPurpose, FundingRecord>>;
}

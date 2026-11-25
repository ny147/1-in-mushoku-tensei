import type { ExpandedLife } from "../types";
import type { SuccessionWinner } from "./succession-state";
import { draw } from "./random";

export interface DefeatQuote {
  roll: number;
  friendId: string | null;
  friendName: string | null;
  fee: number;
  escape: number;
  paidEscape: number;
  resist: number;
}
const routes = ["waiting", "news", "adult", "child"] as const;
const obligations = ["oath", "household", "result", "defeat"] as const;
const outcomes = [
  "none",
  "pledged",
  "sheltered",
  "fled",
  "withdrawn",
  "news",
  "protected",
  "protection-lost",
  "defeated",
  "recognized",
  "crowned",
  "captured",
  "escaped",
  "killed",
] as const;
export interface CrisisState {
  route: (typeof routes)[number];
  due: (typeof obligations)[number] | null;
  royal: boolean;
  revealed: boolean;
  householdSide: SuccessionWinner;
  helperIds: string[];
  lostHelperIds: string[];
  side: SuccessionWinner | null;
  claimant: boolean;
  funded: boolean;
  reward: number;
  outcome: (typeof outcomes)[number];
  quote: DefeatQuote | null;
}
export function newCrisisState(worldSeed: number): CrisisState {
  return {
    route: "waiting",
    due: null,
    royal: false,
    revealed: false,
    householdSide:
      draw({ rng: (worldSeed ^ 0x484f5553) >>> 0 }) < 0.5
        ? "ariel"
        : "opposition",
    helperIds: [],
    lostHelperIds: [],
    side: null,
    claimant: false,
    funded: false,
    reward: 0,
    outcome: "none",
    quote: null,
  };
}
export function isBoundSupporter(life: ExpandedLife) {
  return life.expansion.succession?.crisis.outcome === "pledged";
}
export function markWithdrawn(life: ExpandedLife) {
  if (isBoundSupporter(life))
    life.expansion.succession!.crisis.outcome = "withdrawn";
}
function validQuote(q: DefeatQuote) {
  return (
    !!q &&
    typeof q === "object" &&
    Number.isFinite(q.roll) &&
    q.roll >= 0 &&
    q.roll < 1 &&
    (q.friendId === null
      ? q.friendName === null
      : typeof q.friendId === "string" && typeof q.friendName === "string") &&
    q.fee === 12 &&
    q.escape === (q.friendId === null ? 25 : 45) &&
    q.paidEscape === q.escape + 20 &&
    Number.isInteger(q.resist) &&
    q.resist >= 20 &&
    q.resist <= 65
  );
}
export function validCrisisState(
  value: unknown,
  life: ExpandedLife,
): value is CrisisState {
  if (!value || typeof value !== "object") return false;
  const c = value as CrisisState;
  if (
    !routes.includes(c.route) ||
    !outcomes.includes(c.outcome) ||
    !(c.due === null || obligations.includes(c.due)) ||
    ![c.royal, c.revealed, c.claimant, c.funded].every(
      (v) => typeof v === "boolean",
    ) ||
    !["ariel", "opposition"].includes(c.householdSide) ||
    !(c.side === null || c.side === "ariel" || c.side === "opposition") ||
    !Array.isArray(c.helperIds) ||
    !Array.isArray(c.lostHelperIds) ||
    ![c.helperIds, c.lostHelperIds].every(
      (ids) =>
        ids.length <= 2 &&
        new Set(ids).size === ids.length &&
        ids.every(
          (id) =>
            typeof id === "string" &&
            life.expansion.family.people.some(
              (p) => p.id === id && p.role === "parent",
            ),
        ),
    ) ||
    !c.lostHelperIds.every((id) => c.helperIds.includes(id)) ||
    (c.quote !== null && !validQuote(c.quote))
  )
    return false;
  const rewarded = c.outcome === "recognized" || c.outcome === "crowned";
  if (c.reward !== (rewarded ? (c.funded ? 48 : 40) : 0)) return false;
  if (
    (c.due === "oath" &&
      (c.route !== "adult" || c.outcome !== "none" || c.revealed)) ||
    (c.due === "household" &&
      (c.route !== "child" || c.outcome !== "none" || c.revealed)) ||
    (c.due === "result" && !c.revealed) ||
    (c.due === "defeat" && c.outcome !== "defeated")
  )
    return false;
  if (
    (c.claimant && !(c.royal && c.side === "opposition")) ||
    (c.funded && !c.side) ||
    (c.side !== null && c.route !== "adult") ||
    (c.helperIds.length && c.route !== "child") ||
    (c.lostHelperIds.length && c.outcome !== "protection-lost")
  )
    return false;
  if (c.route === "waiting")
    return (
      !c.revealed &&
      !c.royal &&
      c.outcome === "none" &&
      c.due === null &&
      c.quote === null
    );
  if (c.route === "news" && (c.royal || !["none", "news"].includes(c.outcome)))
    return false;
  if (
    c.route === "child" &&
    !["none", "sheltered", "protected", "protection-lost", "fled"].includes(
      c.outcome,
    )
  )
    return false;
  if (
    [
      "pledged",
      "withdrawn",
      "defeated",
      "recognized",
      "crowned",
      "captured",
      "escaped",
      "killed",
    ].includes(c.outcome) !==
    (c.side !== null)
  )
    return false;
  if (
    [
      "news",
      "protected",
      "protection-lost",
      "defeated",
      "recognized",
      "crowned",
      "escaped",
      "captured",
      "killed",
    ].includes(c.outcome) &&
    !c.revealed
  )
    return false;
  if (
    c.quote &&
    !["defeated", "escaped", "captured", "killed"].includes(c.outcome)
  )
    return false;
  if (["escaped", "captured", "killed"].includes(c.outcome) && !c.quote)
    return false;
  const winner = life.expansion.succession?.winner;
  if (
    (rewarded && c.side !== winner) ||
    (c.outcome === "crowned" && !c.claimant) ||
    (["escaped", "killed", "captured", "defeated"].includes(c.outcome) &&
      c.side === winner)
  )
    return false;
  return true;
}

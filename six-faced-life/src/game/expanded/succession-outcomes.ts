import type { ExpandedLife } from "../types";
import type { DefeatQuote } from "./succession-core";
import { fact } from "./facts";
import { ASURA_CRISIS as balance } from "./balance";
import { draw } from "./random";
import {
  enterCustody,
  politicalFlight,
  permanentlyExiled,
} from "./succession-restrictions";
import { accede } from "./governance";
import { recognizeAtCourt } from "./crown-service";

export function quoteDefeat(life: ExpandedLife): DefeatQuote {
  const stored = life.expansion.succession?.crisis.quote;
  if (stored) return { ...stored };
  const friend = life.expansion.family.friends.find(
    (f) => f.role === "friend" && f.strength >= balance.friendStrength,
  );
  const escape = balance.escapeChance + (friend ? balance.friendBonus : 0);
  return {
    friendId: friend?.id ?? null,
    friendName: friend?.name ?? null,
    escape,
    paidEscape: escape + balance.paidBonus,
    fee: balance.escapeFee,
    resist: Math.min(
      balance.resistCap,
      balance.resistChance +
        Math.floor(Math.max(life.stats.sword, life.stats.mana) / 2),
    ),
    roll: draw({ rng: life.rng }),
  };
}
export function resolveAccession(life: ExpandedLife) {
  const { crisis: c, winner } = life.expansion.succession!;
  if (c.due !== "result" || life.phase !== "alive") return;
  c.due = null;
  if (c.outcome === "sheltered") {
    c.outcome = c.householdSide === winner ? "protected" : "protection-lost";
    if (c.outcome === "protection-lost") {
      c.lostHelperIds = c.helperIds.filter((id) =>
        life.expansion.family.people.some(
          (p) => p.id === id && p.died === null && p.home === "asura",
        ),
      );
      life.expansion.economy.protectionUntil = Math.min(
        life.expansion.economy.protectionUntil,
        424,
      );
    }
    return;
  }
  if (c.outcome !== "pledged") {
    if (c.route === "news") c.outcome = "news";
    return;
  }
  if (permanentlyExiled(life)) {
    c.outcome = "withdrawn";
    return;
  }
  if (c.side !== winner) {
    c.outcome = "defeated";
    c.due = "defeat";
    return;
  }
  c.reward = balance.recognition + (c.funded ? balance.supplyBonus : 0);
  life.coins = Math.min(1_000_000, life.coins + c.reward);
  if (c.claimant && c.royal && winner === "opposition") {
    c.outcome = "crowned";
    accede(life);
  } else {
    c.outcome = "recognized";
    recognizeAtCourt(life, c.royal);
  }
  fact(life, "politics", c.outcome, winner, c.reward);
}
export function resolveDefeat(
  life: ExpandedLife,
  action: string,
): string | null {
  const c = life.expansion.succession!.crisis,
    q = c.quote;
  if (
    life.phase !== "alive" ||
    c.due !== "defeat" ||
    !q ||
    !["surrender", "escape", "escape-paid", "resist"].includes(action)
  )
    return null;
  const paid = action === "escape-paid";
  if (paid && life.coins < q.fee) return null;
  if (paid) life.coins -= q.fee;
  c.due = null;
  const chance =
    action === "resist" ? q.resist : paid ? q.paidEscape : q.escape;
  if (action !== "surrender" && q.roll * 100 < chance) {
    c.outcome = "escaped";
    politicalFlight(life);
  } else if (action === "resist") {
    c.outcome = "killed";
    return "violence";
  } else {
    c.outcome = "captured";
    enterCustody(life);
  }
  return null;
}

import type { Decision, ExpandedLife } from "../types";
import { courtCard, courtOption } from "./crown-service";
import { fact, worldYear } from "./facts";
import { marriageAllowed, marry } from "./family";
import { endMarriageService, hasHouseCommitment, houseBenefitsSuspended, startMarriageService } from "./house-service";
import { eligibleHouse } from "./house-state";
import { inCustody, permanentlyExiled } from "./succession-restrictions";
import type { Marriage, Relative } from "./types";

const decisionId = "expanded.royal-marriage";
const provider = "asura-royal";
const protectionYears = 2;
const refusalYears = 3;

export interface RoyalMarriageQuote {
  provider: "asura-royal";
  candidateId: string;
  offeredYear: number;
  protectionUntil: number;
}

export interface RoyalMarriageAlliance {
  provider: "asura-royal";
  candidateId: string;
  marriageIndex: number;
  acceptedYear: number;
  protectionUntil: number;
  endedYear: number | null;
  endReason: "divorce" | "widowhood" | "death" | null;
}

export interface RoyalMarriageState {
  proposal: RoyalMarriageQuote | null;
  refusedUntil: number | null;
  alliances: RoyalMarriageAlliance[];
}

export function newRoyalMarriageState(): RoyalMarriageState {
  return { proposal: null, refusedUntil: null, alliances: [] };
}

function canPropose(life: ExpandedLife): boolean {
  const house = life.expansion.house;
  const year = worldYear(life);
  const crisis = life.expansion.succession?.crisis;
  return !!house && house.accessYears[provider] !== undefined && eligibleHouse(life)?.id === provider &&
    life.expansion.social?.royalHouse === "asura" && life.age >= 18 && year >= 425 &&
    (crisis ? crisis.revealed && crisis.due === null : year > 425) &&
    year >= (house.marriage.refusedUntil ?? year) &&
    !houseBenefitsSuspended(life, provider) && !hasHouseCommitment(life) &&
    !life.expansion.family.marriages.some(marriage => marriage.end === null);
}

function localCandidate(life: ExpandedLife, person: Relative): boolean {
  return person.home === life.region && person.partner === null && marriageAllowed(life, person.id);
}

export function quoteRoyalMarriage(life: ExpandedLife): RoyalMarriageQuote | null {
  if (!canPropose(life)) return null;
  const candidate = life.expansion.family.people.find(person => localCandidate(life, person));
  if (!candidate) return null;
  const year = worldYear(life);
  return { provider, candidateId: candidate.id, offeredYear: year, protectionUntil: year + protectionYears };
}

export function prepareRoyalMarriageProposal(life: ExpandedLife): void {
  const state = life.expansion.house?.marriage;
  if (state && life.pending === decisionId && !state.proposal) state.proposal = quoteRoyalMarriage(life);
}

function offeredCandidate(life: ExpandedLife, quote: RoyalMarriageQuote): Relative | undefined {
  if (quote.offeredYear !== worldYear(life) || !canPropose(life)) return;
  return life.expansion.family.people.find(person => person.id === quote.candidateId && localCandidate(life, person));
}

export function acceptRoyalMarriage(life: ExpandedLife, candidateId: string): boolean {
  const state = life.expansion.house?.marriage;
  const quote = state?.proposal;
  if (life.pending !== decisionId || !state || !quote || quote.candidateId !== candidateId ||
    !offeredCandidate(life, quote) || !marry(life, candidateId)) return false;
  state.proposal = null;
  state.alliances.push({
    provider, candidateId, marriageIndex: life.expansion.family.marriages.length - 1,
    acceptedYear: quote.offeredYear, protectionUntil: quote.protectionUntil,
    endedYear: null, endReason: null,
  });
  startMarriageService(life, provider);
  fact(life, "family", "royal-alliance-formed", candidateId);
  return true;
}

export function closeRoyalMarriageAlliance(life: ExpandedLife, marriage?: Marriage): void {
  const state = life.expansion.house?.marriage;
  if (!state) return;
  if (!marriage) state.proposal = null;
  const active = state.alliances.at(-1);
  if (!active || active.endedYear !== null) return;
  if (marriage && life.expansion.family.marriages[active.marriageIndex] !== marriage) return;
  active.endedYear = marriage?.end ?? worldYear(life);
  active.endReason = marriage?.reason ?? "death";
  endMarriageService(life);
  fact(life, "family", "royal-alliance-ended", active.candidateId);
}

export function royalMarriageProtection(life: ExpandedLife): boolean {
  const active = life.expansion.house?.marriage.alliances.at(-1);
  const year = worldYear(life);
  return !!active && active.endedYear === null && year > active.acceptedYear && year <= active.protectionUntil &&
    life.phase === "alive" && life.region === "asura" && life.expansion.standing.status === "noble" &&
    !inCustody(life) && !permanentlyExiled(life) &&
    life.expansion.family.people.some(person => person.id === active.candidateId && person.died === null && person.home === life.region);
}

export function royalMarriageDecision(life: ExpandedLife): Decision | null {
  if (life.pending !== decisionId || life.phase !== "alive") return null;
  const quote = life.expansion.house?.marriage.proposal;
  const candidate = quote && offeredCandidate(life, quote);
  if (!quote || !candidate) {
    const card = courtCard(decisionId, ["A proposal withdrawn", "ข้อเสนอสมรสที่ต้องยุติ"],
      ["The original marriage terms are no longer available.", "เงื่อนไขการสมรสเดิมใช้ไม่ได้แล้ว"]);
    courtOption(card, "dismiss", ["Close the proposal", "ปิดข้อเสนอ"],
      ["Close this proposal without making a commitment.", "ปิดข้อเสนอครั้งนี้โดยไม่มีข้อผูกพัน"]);
    return card;
  }
  const card = courtCard(decisionId, ["A royal marriage proposal", "ข้อเสนอสมรสของราชวงศ์"],
    [`The Asuran royal house proposes a marriage alliance with ${candidate.name}. It offers local protection in K${quote.offeredYear + 1} and K${quote.protectionUntil}, while you both live in Asura and the alliance lasts.`,
     `ราชวงศ์อัสราเสนอให้สมรสกับ ${candidate.name} เพื่อผูกสัมพันธ์ คุณจะได้รับความคุ้มครองในปี K${quote.offeredYear + 1} และ K${quote.protectionUntil} ตราบใดที่ทั้งคู่ยังอยู่ในอัสราและพันธมิตรยังคงอยู่`]);
  courtOption(card, "accept", ["Accept the marriage alliance", "ตกลงสมรสเพื่อผูกสัมพันธ์"],
    [`Marry ${candidate.name} and commit to one full eligible year of local household service in place of ordinary work.`,
     `สมรสกับ ${candidate.name} และรับภาระทำงานให้ตระกูลในอัสราครบหนึ่งปีที่เข้าเงื่อนไขแทนงานปกติ`]);
  const nextYear = quote.offeredYear + refusalYears;
  courtOption(card, "refuse", ["Decline the proposal", "ปฏิเสธข้อเสนอ"],
    [`Remain unmarried. The house can make another proposal in K${nextYear}.`, `คงสถานะโสดไว้ ตระกูลจะเสนอการสมรสได้อีกครั้งในปี K${nextYear}`]);
  return card;
}

export function applyRoyalMarriageChoice(life: ExpandedLife, id: string): boolean {
  if (!royalMarriageDecision(life)?.choices.some(choice => choice.id === id)) return false;
  const state = life.expansion.house?.marriage;
  if (!state) return false;
  const quote = state.proposal;
  if (id === `${decisionId}.accept`) return !!quote && acceptRoyalMarriage(life, quote.candidateId);
  state.proposal = null;
  if (id === `${decisionId}.refuse` && quote) {
    state.refusedUntil = quote.offeredYear + refusalYears;
    fact(life, "family", "royal-proposal-refused", quote.candidateId);
  }
  return true;
}

export function validRoyalMarriageState(value: unknown, life: ExpandedLife): value is RoyalMarriageState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const state = value as RoyalMarriageState;
  const terms = life.expansion.house?.service.terms;
  if (!Array.isArray(state.alliances) || !terms || state.alliances.length !== terms.length ||
    state.alliances.length > life.expansion.family.marriages.length) return false;
  const year = worldYear(life);
  const accessYear = life.expansion.house?.accessYears[provider];
  const earliest = Math.max(425, life.expansion.birthYear + 18, accessYear ?? Infinity);
  const inRange = (date: number, min: number, max: number) => Number.isSafeInteger(date) && date >= min && date <= max;
  const knownCandidate = (id: string, date: number) => life.expansion.family.people.some(person =>
    person.id === id && person.role === "spouse" && date - person.born >= 18 && (person.died === null || person.died >= date));
  if (state.refusedUntil !== null && !inRange(state.refusedUntil, earliest + refusalYears, year + refusalYears)) return false;
  const pending = life.pending === decisionId;
  if ((state.proposal !== null) !== pending) return false;
  if (pending) {
    const quote = state.proposal;
    if (!quote || quote.provider !== provider || !inRange(quote.offeredYear, earliest, year) ||
      quote.protectionUntil !== quote.offeredYear + protectionYears || !knownCandidate(quote.candidateId, quote.offeredYear)) return false;
  }
  return state.alliances.every((alliance, index) => {
    const previous = state.alliances[index - 1];
    if (!alliance || alliance.provider !== provider ||
      !inRange(alliance.marriageIndex, (previous?.marriageIndex ?? -1) + 1, life.expansion.family.marriages.length - 1) ||
      !inRange(alliance.acceptedYear, Math.max(earliest, previous?.endedYear ?? earliest), year) ||
      alliance.protectionUntil !== alliance.acceptedYear + protectionYears ||
      !knownCandidate(alliance.candidateId, alliance.acceptedYear)) return false;
    const marriage = life.expansion.family.marriages[alliance.marriageIndex];
    const term = terms[index];
    if (marriage.person !== alliance.candidateId || marriage.start !== alliance.acceptedYear ||
      !term || term.provider !== alliance.provider || term.acceptedYear !== alliance.acceptedYear ||
      (term.completedYear === null ? term.cancelledYear !== alliance.endedYear :
        alliance.endedYear !== null && term.completedYear > alliance.endedYear)) return false;
    const terminal = index === state.alliances.length - 1;
    if (alliance.endedYear === null) return terminal && life.phase === "alive" && marriage.end === null && alliance.endReason === null;
    if (!inRange(alliance.endedYear, alliance.acceptedYear, year)) return false;
    if (alliance.endReason === "death") return terminal && life.phase === "ended" && marriage.end === null && alliance.endedYear === year;
    return (alliance.endReason === "divorce" || alliance.endReason === "widowhood") &&
      alliance.endedYear === marriage.end && alliance.endReason === marriage.reason;
  });
}

import type { Choice, Decision, ExpandedLife, RegionId } from "../types";
import { REGIONS } from "../world";
import { expandedDecisionText } from "../../i18n/expanded";
import { fact, worldYear } from "./facts";
import { isBoundSupporter, markWithdrawn } from "./succession-core";
import { isRuler } from "./governance";

export interface RestrictionState {
  custody: {
    enteredYear: number;
    releaseYear: number;
    releasedYear: number | null;
    confiscated: number;
    unmetDependants: number;
    lastSettlement: number;
  } | null;
  exile: {
    year: number;
    confiscated: number;
    movedIds: string[];
    stayedIds: string[];
    lostHousing: boolean;
  } | null;
}

export const newRestrictionState = (): RestrictionState => ({ custody: null, exile: null });

export function inCustody(life: ExpandedLife): boolean {
  return life.expansion.succession?.restrictions.custody?.releasedYear === null;
}

export function permanentlyExiled(life: ExpandedLife): boolean {
  return !!life.expansion.succession?.restrictions.exile;
}

export function canRelocate(life: ExpandedLife, destination: RegionId): boolean {
  return Object.hasOwn(REGIONS, destination) && !inCustody(life) &&
    !(destination === "asura" && permanentlyExiled(life)) &&
    !(life.region === "asura" && destination !== "asura" && isBoundSupporter(life));
}

export function enterCustody(life: ExpandedLife) {
  const r = life.expansion.succession?.restrictions;
  if (!r || r.custody || r.exile || life.phase !== "alive") return;
  const year = worldYear(life), confiscated = Math.floor(life.coins / 2);
  life.coins -= confiscated;
  r.custody = { enteredYear: year, releaseYear: year + 2, releasedYear: null, confiscated, unmetDependants: 0, lastSettlement:year };
  fact(life, "politics", "asura-capture", "", confiscated);
}

export function settleCustodyRelease(life: ExpandedLife) {
  const c = life.expansion.succession?.restrictions.custody;
  if (!c || c.releasedYear !== null || life.phase !== "alive" || c.lastSettlement < c.releaseYear) return;
  c.releasedYear = worldYear(life);
  fact(life, "politics", "asura-release");
}

function flightHousehold(life: ExpandedLife, guardianId?: string | null) {
  const living = life.expansion.family.people.filter(p => p.died === null);
  const year = worldYear(life);
  const moving = living.filter(p => p.home === life.region && (life.age < 18
    ? p.role === "parent" && p.id === guardianId
    : p.role === "child" && year - p.born < 18));
  return { moving, staying: living.filter(p => !moving.includes(p)) };
}

function hasLocalHousing(life: ExpandedLife) {
  const h = life.expansion.social?.household;
  return h?.housing === "secure-tenancy" && h.home === "asura";
}

export function flightTerms(life: ExpandedLife, guardianId?: string | null) {
  const coins = Math.floor(life.coins / 2);
  const moving = flightHousehold(life, guardianId).moving.map(p => p.name).join(", ");
  return {
    en: `Evacuate to Ranoa with the fare covered. You forfeit ${coins} silver, Asuran protection and local title privileges. ${hasLocalHousing(life) ? "You lose access to your Asuran tenancy. " : ""}${moving ? `Travelling with you: ${moving}. ` : life.age < 18 ? "An escort takes you to safety. " : "You travel alone. "}Other relatives stay at their homes. You can never return to Asura.`,
    th: `อพยพไปราโนอาโดยมีผู้จ่ายค่าเดินทาง คุณต้องเสียเงิน ${coins} เหรียญเงิน การคุ้มครองและสิทธิ์ตามบรรดาศักดิ์ในอัสรา ${hasLocalHousing(life) ? "คุณเสียสิทธิ์ในที่เช่าของครอบครัวในอัสรา " : ""}${moving ? `ผู้ที่ไปด้วยคือ ${moving} ` : life.age < 18 ? "มีผู้คุ้มกันพาคุณไปยังที่ปลอดภัย " : "คุณเดินทางคนเดียว "}ญาติคนอื่นอยู่บ้านเดิม คุณจะกลับอัสราไม่ได้ตลอดชีวิต`,
  };
}

export function politicalFlight(life: ExpandedLife, guardianId?: string | null) {
  const r = life.expansion.succession?.restrictions;
  if (!r || r.exile || r.custody || life.phase !== "alive" || life.region !== "asura") return;
  const x = life.expansion, year = worldYear(life), confiscated = Math.floor(life.coins / 2);
  const { moving, staying } = flightHousehold(life, guardianId);
  r.exile = { year, confiscated, movedIds: moving.map(p => p.id), stayedIds: staying.map(p => p.id), lostHousing: hasLocalHousing(life) };
  life.coins -= confiscated;
  life.region = "ranoa";
  x.origin.locality = "settlement";
  x.economy.protectionUntil = Math.min(x.economy.protectionUntil, year - 1);
  if (x.social?.association?.region === "asura" || !x.social?.association && life.birthRegion === "asura") {
    x.standing.status = "commoner";
    x.origin.patron = false;
  }
  if (x.social?.association?.region === "asura") x.social.association = null;
  for (const p of moving) p.home = "ranoa";
  fact(life, "politics", "permanent-asura-exile", "ranoa", confiscated);
  fact(life, "history", "migration", "ranoa");
}

export function validRestrictionState(value: unknown, life: ExpandedLife): value is RestrictionState {
  if (!value || typeof value !== "object") return false;
  const {custody: c, exile: e} = value as RestrictionState;
  const integer = (n: unknown, min: number, max: number) =>
    typeof n === "number" && Number.isSafeInteger(n) && n >= min && n <= max;
  const year = worldYear(life);
  if (c !== null) {
    if (!c || typeof c !== "object" || e !== null || c.enteredYear !== 425 || c.releaseYear !== 427 ||
        !integer(c.enteredYear, life.expansion.birthYear, year) || !integer(c.confiscated, 0, 500000) ||
        !integer(c.unmetDependants, 0, 1000000) || !integer(c.lastSettlement, c.enteredYear, Math.min(year,c.releaseYear))) return false;
    return c.releasedYear === null ? year < c.releaseYear || life.phase === "ended" && year === c.releaseYear :
      c.releasedYear === c.releaseYear && c.lastSettlement === c.releaseYear && year >= c.releaseYear;
  }
  if (e === null) return true;
  if (!e || typeof e !== "object" || life.region === "asura" ||
      !integer(e.year, Math.max(424,life.expansion.birthYear), Math.min(425,year)) ||
      !integer(e.confiscated,0,500000) || typeof e.lostHousing !== "boolean" ||
      !Array.isArray(e.movedIds) || !Array.isArray(e.stayedIds)) return false;
  const ids = [...e.movedIds, ...e.stayedIds];
  const people = life.expansion.family.people;
  return new Set(ids).size === ids.length && ids.every(id => people.some(p => p.id === id && p.born <= e.year && (p.died === null || p.died >= e.year)));
}

const withdrawal = "expanded.succession-withdrawal";
type Words = [string,string];
function restrictionOffer(id: string, title: Words, text: Words, rows: [string,Words,Words][]): Decision {
  const localized: NonNullable<Decision["localized"]> = {title:title[1], text:text[1], choices:{}};
  const choices = rows.map(([action,label,outcome]) => {
    const key = `${id}.${action}`;
    localized.choices[key] = {label:label[1], description:outcome[1], outcome:outcome[1]};
    return {id:key, label:label[0], description:outcome[0], outcome:outcome[0]};
  });
  return { id, title:title[0], text:text[0], kind:"Life", requiresManual:true, localized, choices };
}

export function restrictionDecision(life: ExpandedLife): Decision | null {
  const id=life.pending;
  if (!id || life.phase !== "alive") return null;
  if (inCustody(life)) {
    const year=life.expansion.succession!.restrictions.custody!.releaseYear;
    const reason: Words=[`You are held in custody until the settlement in K${year}.`,`คุณถูกคุมขังจนกว่าจะสิ้นรอบปี K${year}`];
    return restrictionOffer(id, ["Under guard","ระหว่างถูกคุมขัง"], reason, [["dismiss",["Acknowledge","รับทราบ"],reason]]);
  }
  if (id !== withdrawal) return null;
  const terms=flightTerms(life);
  const rows: [string,Words,Words][]=[["stay",["Stay in Asura","อยู่ในอัสราต่อ"],["You remain in Asura.","คุณยังคงอยู่ในอัสรา"]]];
  if (isBoundSupporter(life)) rows.push(["confirm",["Withdraw the pledge and flee","ถอนคำปฏิญาณและหลบหนี"],[terms.en,terms.th]]);
  return restrictionOffer(id,["Withdraw your pledge?","จะถอนคำปฏิญาณหรือไม่"],[terms.en,terms.th],rows);
}

function destination(id: string, choice?: Choice): RegionId | undefined {
  if (id.startsWith("expanded.travel.move-")) return id.slice("expanded.travel.move-".length) as RegionId;
  if (id === "expanded.university.enroll" || id === "expanded.university.enroll-loan") return "ranoa";
  return choice?.region;
}

export function restrictDestinations(life: ExpandedLife, decision: Decision): Decision {
  const governing = isRuler(life);
  if (!permanentlyExiled(life) && !isBoundSupporter(life) && !governing) return decision;
  const changed = decision.choices.filter(c => {
    const dest=destination(c.id,c);
    return dest && (!canRelocate(life,dest) || governing && dest !== life.region);
  });
  if (!changed.length) return decision;
  const translated=expandedDecisionText(decision,"th");
  const localized = {title:translated.title, text:translated.text, choices:Object.fromEntries(translated.choices.map(c=>[c.id,{label:c.label,description:c.description,outcome:c.outcome}]))};
  const choices=decision.choices.map(c=>{
    if (!changed.includes(c)) return c;
    const ban=permanentlyExiled(life) || governing;
    const reason=governing ? "Your office requires you to remain in Asura." : ban ? "Permanent exile bars your return to Asura." : "Leaving Asura requires withdrawing your pledge. Review the evacuation terms before deciding.";
    const thai=governing ? "การครองราชย์กำหนดให้คุณพำนักในอัสรา" : ban ? "คุณถูกเนรเทศตลอดชีวิต จึงกลับอัสราไม่ได้" : "การออกจากอัสราต้องถอนคำปฏิญาณ อ่านเงื่อนไขการอพยพก่อนตัดสินใจ";
    localized.choices[c.id].description=thai;
    localized.choices[c.id].outcome=thai;
    return {...c, cost:0, disabled:ban || c.disabled, description:reason,outcome:reason};
  });
  return {...decision, choices, localized, requiresManual:true};
}

export function applyRestrictionChoice(life: ExpandedLife, id: string): boolean {
  if (inCustody(life)) return true;
  if (id.startsWith(withdrawal + ".")) {
    if (id === withdrawal + ".confirm" && isBoundSupporter(life) && life.region === "asura") {
      politicalFlight(life);
      markWithdrawn(life);
    }
    return true;
  }
  const dest=destination(id);
  if (dest && isRuler(life) && dest !== life.region) return true;
  if (!dest || canRelocate(life,dest)) return false;
  if (isBoundSupporter(life) && Object.hasOwn(REGIONS,dest) && !life.expansion.queue.includes(withdrawal))
    life.expansion.queue.unshift(withdrawal);
  return true;
}

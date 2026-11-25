import type { Decision, ExpandedLife } from "../types";
import { worldYear } from "./facts";
import { inCustody, permanentlyExiled } from "./succession-restrictions";
import { validOffice, type RulerOffice } from "./governance";
import { serviceAssignment, servicePause, type ServiceAssignment, type ServicePause } from "./service-priority";

interface CrownRequest {
  openedYear: number;
  dueYear: number;
  extended: boolean;
  status: "open" | "service" | "served" | "paid" | "refused" | "final" | "relinquished";
  resolutionYear: number | null;
  acceptedYear?: number;
  pauseReason?: ServicePause;
}
export interface CourtState {
  recognitionYear: number | null;
  nextPetitionYear: number | null;
  refusals: number;
  relinquishedYear: number | null;
  request: CrownRequest | null;
  office: RulerOffice | null;
}
export function newCourtState(): CourtState {
  return {recognitionYear: null, nextPetitionYear: null, refusals: 0,
    relinquishedYear: null, request: null, office: null};
}
export function recognizeAtCourt(life: ExpandedLife, royal: boolean) {
  const c = life.expansion.succession?.court;
  if (!c || c.recognitionYear !== null || c.office || life.phase !== "alive" || permanentlyExiled(life)) return;
  c.recognitionYear = worldYear(life);
  c.nextPetitionYear = c.recognitionYear + (royal ? 0 : 1);
}
function activeCourt(life: ExpandedLife) {
  const c = life.expansion.succession?.court;
  return c && life.phase === "alive" && !c.office && c.recognitionYear !== null &&
    c.relinquishedYear === null && !permanentlyExiled(life) ? c : null;
}
function availableForService(life: ExpandedLife) {
  return !servicePause(life, "asura") && serviceAssignment(life) === null;
}
export function canPetition(life: ExpandedLife): boolean {
  const c = activeCourt(life);
  return !!c && !inCustody(life) && life.region === "asura" && c.refusals < 2 &&
    c.nextPetitionYear !== null && worldYear(life) >= c.nextPetitionYear;
}
export function isCourtServiceYear(life: ExpandedLife): boolean {
  return serviceAssignment(life) === "crown";
}
export function advanceCourtYear(life: ExpandedLife, assignment: ServiceAssignment = serviceAssignment(life)) {
  const c = activeCourt(life), year = worldYear(life);
  if (!c || c.recognitionYear === null) return;
  const r = c.request;
  if (r && ["service", "open", "final"].includes(r.status)) {
    if (year < r.dueYear) return;
    const pause = r.status === "service" && assignment === "crown" ? null : servicePause(life, "asura") ??
      ((r.status === "service" ? assignment !== "crown" : assignment !== null) ? "commitment" : null);
    if (pause) {
      r.dueYear = year + 1;
      r.pauseReason = pause;
      return;
    }
    delete r.pauseReason;
    if (r.status === "service") {
      r.status = "served";
      r.resolutionYear = year;
      c.refusals = 0;
    }
    return;
  }
  if (year <= c.recognitionYear || (year - c.recognitionYear) % 3 !== 0 ||
    r?.openedYear === year || r?.resolutionYear === year) return;
  c.request = {openedYear: year, dueYear: year + (availableForService(life) ? 0 : 1),
    status: "open", extended: false, resolutionYear: null};
}
export function nextCourtDecision(life: ExpandedLife): string | null {
  const r = activeCourt(life)?.request;
  if (!r || worldYear(life) < r.dueYear || !availableForService(life)) return null;
  if (r.status === "final") return "expanded.crown-standing";
  return r.status === "open" ? "expanded.crown-request" : null;
}
type Pair = readonly [string, string];
export function courtCard(id: string, title: Pair, text: Pair): Decision {
  return {id, title: title[0], text: text[0], kind: "world", choices: [], requiresManual: true,
    localized: {title: title[1], text: text[1], choices: {}}};
}
export function courtOption(card: Decision, action: string, label: Pair, effect: Pair, disabled = false) {
  const id = card.id + "." + action;
  card.choices.push({id, label: label[0], description: effect[0], outcome: effect[0], disabled});
  card.localized!.choices[id] = {label: label[1], description: effect[1], outcome: effect[1]};
}
export function courtDecision(life: ExpandedLife): Decision | null {
  const id = life.pending, c = activeCourt(life), year = worldYear(life);
  if (!id || !c) return null;
  if (id === "expanded.crown-petition" && canPetition(life)) {
    const d = courtCard(id, ["A household petition", "คำร้องขอความช่วยเหลือครัวเรือน"],
      ["Court recognition entitles your household to relief.", "ราชสำนักรับรองสิทธิของครัวเรือนในการขอความช่วยเหลือ"]);
    courtOption(d, "claim", ["Claim 12 silver", "รับเงิน 12 เหรียญ"],
      [`Add 12 personal silver. Petition again in K${year + 3}.`, `รับเงินส่วนตัว 12 เหรียญ ยื่นคำร้องอีกครั้งได้ในปี K${year + 3}`]);
    courtOption(d, "later", ["Keep the petition for later", "เก็บสิทธิไว้ใช้ภายหลัง"], ["Keep your relief available.", "ยังคงสิทธิในการขอเงินช่วยเหลือ"]);
    return d;
  }
  const r = c.request;
  if (!r || id !== nextCourtDecision(life)) return null;
  const final = r.status === "final";
  const d = courtCard(id, final ? ["The future of your title", "อนาคตของบรรดาศักดิ์"] : ["A request from the crown", "ภาระที่ราชสำนักขอ"],
    [`Your answer is due in K${r.dueYear}. You have explicitly refused ${c.refusals} times.`,
     `กำหนดตอบในปี K${r.dueYear} คุณเคยปฏิเสธโดยสมัครใจ ${c.refusals} ครั้ง`]);
  courtOption(d, "service", ["Serve in the local administration", "รับงานบริหารท้องถิ่น"],
    [`Serve one full eligible year in Asura, through K${year + 1}. Service replaces ordinary work without a wage and restores petition access. Illness, custody, creditor service and full-time study defer the deadline.`,
     `รับงานในอัสราเป็นเวลาหนึ่งปีเต็มจนถึง K${year + 1} งานนี้แทนงานปกติโดยไม่มีค่าจ้างและคืนสิทธิยื่นคำร้อง การเจ็บป่วย ถูกคุมขัง ทำงานใช้หนี้ หรือเรียนเต็มเวลาจะเลื่อนกำหนด`]);
  if (final) {
    courtOption(d, "relinquish", ["Relinquish the title", "สละบรรดาศักดิ์"],
      ["Give up your noble privileges and court relief permanently. Your ancestry and Powers rank remain on record.", "สละอภิสิทธิ์ขุนนางและสิทธิขอความช่วยเหลือถาวร ยังคงประวัติเชื้อสายและอันดับมหาอำนาจ"]);
  } else {
    courtOption(d, "pay", ["Contribute 12 silver", "จ่าย 12 เหรียญเงิน"], ["Pay 12 personal silver to fulfil this request.", "จ่ายจากเงินส่วนตัว 12 เหรียญเพื่อทำตามคำขอ"], life.coins < 12);
    if (!r.extended) courtOption(d, "extend", ["Negotiate an extension", "เจรจาขอเลื่อนกำหนด"],
      [`Answer in K${year + 1}. No refusal is recorded.`, `ตอบในปี K${year + 1} โดยไม่ถูกนับว่าปฏิเสธ`]);
    const effects: Pair[] = [
      ["Receive a first warning.", "ได้รับคำเตือนครั้งแรก"],
      ["Your second refusal suspends petitions until a year of service is complete.", "การปฏิเสธครั้งที่สองจะพักสิทธิยื่นคำร้องจนกว่าจะรับงานครบหนึ่งปี"],
      ["Your third refusal requires you to negotiate service or relinquish your title.", "การปฏิเสธครั้งที่สามทำให้ต้องเลือกระหว่างรับงานกับสละบรรดาศักดิ์"],
    ];
    courtOption(d, "refuse", ["Explicitly refuse", "ปฏิเสธคำขอ"], effects[Math.min(2, c.refusals)]);
  }
  return d;
}
export function applyCourtChoice(life: ExpandedLife, id: string): boolean {
  const d = courtDecision(life), c = activeCourt(life);
  if (!d || !c || !d.choices.some(o => o.id === id && !o.disabled)) return false;
  const year = worldYear(life), action = id.slice(d.id.length + 1), r = c.request;
  if (d.id === "expanded.crown-petition") {
    if (action === "claim") {
      life.coins = Math.min(1_000_000, life.coins + 12);
      c.nextPetitionYear = year + 3;
    }
    return true;
  }
  if (!r) return false;
  switch (action) {
    case "service": r.status = "service"; r.acceptedYear = year; r.dueYear = year + 1; break;
    case "extend": r.extended = true; r.dueYear = year + 1; break;
    case "pay": life.coins -= 12; r.status = "paid"; r.resolutionYear = year; break;
    case "refuse":
      c.refusals++;
      r.status = c.refusals >= 3 ? "final" : "refused";
      if (r.status === "refused") r.resolutionYear = year;
      break;
    case "relinquish":
      r.status = "relinquished";
      r.resolutionYear = c.relinquishedYear = year;
      life.expansion.standing.status = "commoner";
      life.expansion.origin.patron = false;
      break;
    default: return false;
  }
  return true;
}
export function validCourtState(value: unknown, life: ExpandedLife): value is CourtState {
  if (!value || typeof value !== "object") return false;
  const c = value as CourtState, year = worldYear(life);
  const past = (v: unknown, max = year) => typeof v === "number" && Number.isSafeInteger(v) && v >= 425 && v <= max;
  if (!Number.isInteger(c.refusals) || c.refusals < 0 || c.refusals > 3 ||
    !validOffice(c.office, life)) return false;
  if (c.recognitionYear === null) return c.refusals === 0 && c.relinquishedYear === null && c.nextPetitionYear === null && c.request === null;
  if (!past(c.recognitionYear) || c.office || !past(c.nextPetitionYear, year + 3) || c.nextPetitionYear! < c.recognitionYear ||
    !(c.relinquishedYear === null || past(c.relinquishedYear))) return false;
  const r = c.request;
  if (!r) return r === null && c.relinquishedYear === null && c.refusals === 0;
  if (typeof r !== "object" || !past(r.openedYear) || r.openedYear < c.recognitionYear + 3 ||
    (r.openedYear - c.recognitionYear) % 3 !== 0 || !past(r.dueYear, year + 1) || r.dueYear < r.openedYear ||
    typeof r.extended !== "boolean" || !["open","service","served","paid","refused","final","relinquished"].includes(r.status)) return false;
  if (r.acceptedYear !== undefined && (!past(r.acceptedYear) || r.acceptedYear < r.openedYear ||
      r.acceptedYear >= r.dueYear || !["service", "served"].includes(r.status))) return false;
  if (r.pauseReason !== undefined && !["custody", "governing", "health", "study", "region", "exile", "commitment"].includes(r.pauseReason)) return false;
  const resolved = ["served","paid","refused","relinquished"].includes(r.status);
  return (resolved ? past(r.resolutionYear) && r.resolutionYear! >= r.openedYear : r.resolutionYear === null) &&
    (r.status !== "final" || c.refusals === 3) &&
    (r.status === "relinquished" ? c.relinquishedYear === r.resolutionYear && c.refusals === 3 : c.relinquishedYear === null);
}

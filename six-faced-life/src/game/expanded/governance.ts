import type { Decision, ExpandedLife } from "../types";
import { worldYear } from "./facts";
import { exitDebtService } from "./parental-debt";
import { courtCard, courtOption } from "./crown-service";
import { getProgression } from "../progression";
import { permanentlyExiled, inCustody } from "./succession-restrictions";

type Issue = "relief" | "dispute";
export interface RulerOffice {
  accessionYear: number;
  endYear: number | null;
  endReason: "death" | "abdication" | null;
  treasury: number;
  stability: number;
  lastYear: number;
  nextDecisionYear: number;
  nextIssue: Issue;
  pending: Issue | "crisis" | null;
}
export function isRuler(life: ExpandedLife): boolean {
  return life.expansion.succession?.court.office?.endYear === null;
}
export function accede(life: ExpandedLife): boolean {
  const c = life.expansion.succession?.court;
  if (!c || c.office || c.recognitionYear !== null || life.phase !== "alive" ||
    inCustody(life) || permanentlyExiled(life)) return false;
  const year = worldYear(life), x = life.expansion;
  c.office = {accessionYear: year, endYear: null, endReason: null, treasury: 30,
    stability: 2, lastYear: year, nextDecisionYear: year + 2, nextIssue: "relief", pending: null};
  exitDebtService(life);
  if (x.training?.active) x.training.paused = true;
  x.career.role = "retired";
  life.career = "retired";
  if (x.careerPaths) x.careerPaths.active = null;
  life.progression = getProgression(life);
  x.economy.unsafeWork = false;
  return true;
}
export function closeOffice(life: ExpandedLife, reason: "death" | "abdication") {
  const o = life.expansion.succession?.court.office;
  if (!o || o.endYear !== null) return;
  o.endYear = worldYear(life);
  o.endReason = reason;
  o.pending = null;
  if (reason === "abdication" && life.expansion.education.stage === "university") {
    life.expansion.career.role = "student";
    life.career = "student";
    life.progression = getProgression(life);
  }
}
export function advanceGovernanceYear(life: ExpandedLife) {
  const o = life.expansion.succession?.court.office, year = worldYear(life);
  if (!o || life.phase !== "alive" || o.endYear !== null || year <= o.lastYear) return;
  o.treasury = Math.min(60, o.treasury + 10);
  o.lastYear = year;
  if (year >= o.nextDecisionYear && !o.pending) o.pending = o.nextIssue;
}
export function nextGovernanceDecision(life: ExpandedLife): string | null {
  const o = life.expansion.succession?.court.office;
  return life.phase === "alive" && o?.endYear === null && o.pending ? "expanded.govern-" + o.pending : null;
}
export function governanceDecision(life: ExpandedLife): Decision | null {
  const id = nextGovernanceDecision(life), o = life.expansion.succession?.court.office;
  if (!id || id !== life.pending || !o) return null;
  const d = courtCard(id, o.pending === "crisis" ? ["The crown in crisis", "วิกฤตราชบัลลังก์"] :
    o.pending === "relief" ? ["Relief for the provinces", "เงินบรรเทาทุกข์แก่หัวเมือง"] :
    ["A dispute at court", "ข้อพิพาทในราชสำนัก"],
    [`Public treasury: ${o.treasury}/60 silver. Stability: ${o.stability}/4. Your personal purse is separate.`,
     `คลังแผ่นดิน ${o.treasury}/60 เหรียญเงิน เสถียรภาพ ${o.stability}/4 เงินส่วนตัวแยกจากเงินคลัง`]);
  if (o.pending === "crisis") {
    courtOption(d, "reconcile", ["Reconcile the court", "สมานฉันท์ในราชสำนัก"],
      ["Spend 15 treasury silver and restore stability to 1/4.", "ใช้เงินคลัง 15 เหรียญเพื่อฟื้นเสถียรภาพเป็น 1/4"], o.treasury < 15);
    courtOption(d, "abdicate", ["Abdicate safely", "สละราชบัลลังก์โดยปลอดภัย"],
      ["Your reign and annual salary of 60 silver end. You can seek ordinary work again.", "รัชสมัยและเงินปี 60 เหรียญสิ้นสุด คุณกลับไปเลือกงานทั่วไปได้"]);
    return d;
  }
  const relief = o.pending === "relief", cost = relief ? 15 : 5, up = Math.min(4, o.stability + 1), down = Math.max(0, o.stability - 1);
  courtOption(d, relief ? "fund" : "mediate", relief ? ["Fund provincial relief", "จัดเงินบรรเทาทุกข์"] : ["Mediate the dispute", "ไกล่เกลี่ยข้อพิพาท"],
    [`Spend ${cost} treasury silver. Stability becomes ${up}/4.`, `ใช้เงินคลัง ${cost} เหรียญ เสถียรภาพจะอยู่ที่ ${up}/4`], o.treasury < cost);
  courtOption(d, relief ? "conserve" : "impose", relief ? ["Conserve the treasury", "เก็บเงินคลังไว้"] : ["Impose a settlement", "บังคับใช้ข้อตกลง"],
    [`Keep the treasury. Stability falls to ${down}/4.${down === 0 ? " You must abdicate or reconcile the court for 15 treasury silver." : ""}`,
     `ไม่ใช้เงินคลัง เสถียรภาพลดลงเหลือ ${down}/4${down === 0 ? " คุณต้องสละราชบัลลังก์หรือใช้เงินคลัง 15 เหรียญเพื่อสมานฉันท์" : ""}`]);
  return d;
}
export function applyGovernanceChoice(life: ExpandedLife, id: string): boolean {
  const d = governanceDecision(life), o = life.expansion.succession?.court.office;
  if (!d || !o || !d.choices.some(c => c.id === id && !c.disabled)) return false;
  const action = id.slice(d.id.length + 1);
  if (action === "abdicate") closeOffice(life, "abdication");
  else if (action === "reconcile") {
    o.treasury -= 15;
    o.stability = 1;
    o.pending = null;
  } else {
    const relief = o.pending === "relief", funded = action === "fund" || action === "mediate";
    if (funded) o.treasury -= relief ? 15 : 5;
    o.stability = Math.max(0, Math.min(4, o.stability + (funded ? 1 : -1)));
    o.nextIssue = relief ? "dispute" : "relief";
    o.nextDecisionYear = worldYear(life) + 2;
    o.pending = o.stability === 0 ? "crisis" : null;
  }
  return true;
}
export function validOffice(value: unknown, life: ExpandedLife): value is RulerOffice | null {
  if (value === null) return true;
  if (!value || typeof value !== "object") return false;
  const o = value as RulerOffice, year = worldYear(life);
  const within = (n: unknown, lo: number, hi: number) => typeof n === "number" && Number.isSafeInteger(n) && n >= lo && n <= hi;
  if (!within(o.accessionYear, 425, year) || !within(o.lastYear, o.accessionYear, year) ||
    !within(o.treasury, 0, 60) || !within(o.stability, 0, 4) ||
    !within(o.nextDecisionYear, o.accessionYear + 2, year + 2) ||
    !["relief","dispute"].includes(o.nextIssue) ||
    ![null, "crisis", o.nextIssue].includes(o.pending)) return false;
  if (o.endYear !== null) return within(o.endYear, o.lastYear, year) && o.pending === null &&
    (o.endReason === "abdication" || o.endReason === "death" && life.phase === "ended");
  return life.phase === "alive" && o.endReason === null && (o.pending === "crisis") === (o.stability === 0);
}

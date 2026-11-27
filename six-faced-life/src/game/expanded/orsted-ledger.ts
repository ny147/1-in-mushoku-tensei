import type { ExpandedLife } from "../types";
import { courtCard, courtOption } from "./crown-service";

const ledger = "expanded.orsted-ledger";
const awards = { full: 8, protect: 4 } as const;

export function ledgerAvailable(life: ExpandedLife) {
  const politics = life.expansion.politics;
  return life.phase === "alive" && life.age >= 18 && politics.faction === "orsted" &&
    (politics.orstedLedger === undefined || politics.orstedLedger === "investigating");
}

function reward(life: ExpandedLife, action: keyof typeof awards) {
  return Math.min(100 - life.expansion.politics.trust, awards[action]);
}

export function ledgerDecision(life: ExpandedLife) {
  if (life.pending !== ledger || life.expansion.optionalActivity !== ledger || !ledgerAvailable(life)) return null;
  if (life.expansion.politics.orstedLedger === undefined) {
    const card = courtCard(ledger, ["A lead in the ledger", "เบาะแสในบัญชีเสบียง"],
      ["Two wagons left the depot, but the ledger lists three. A clerk slips you a copy before the ink dries.",
       "เกวียนออกจากคลังสองคัน แต่ในบัญชีลงไว้สามคัน เสมียนแอบส่งสำเนาให้คุณทั้งที่หมึกยังไม่แห้ง"]);
    courtOption(card, "investigate", ["Investigate the missing wagon", "สืบเรื่องเกวียนที่หายไป"],
      ["You traced the extra entry to a forged receipt. Return to Optional activities when you are ready to report.",
       "คุณตามรอยรายการเกินไปจนพบใบรับเสบียงปลอม เมื่อพร้อมส่งรายงานให้กลับไปที่กิจกรรมที่เลือกทำได้"]);
    courtOption(card, "later", ["Leave it for later", "เก็บไว้สืบภายหลัง"],
      ["The clerk keeps the copy for you. The lead remains open.", "เสมียนเก็บสำเนาไว้ให้ คุณกลับมาสืบต่อได้"]);
    return card;
  }
  const card = courtCard(ledger, ["The clerk’s signature", "ลายเซ็นของเสมียน"],
    ["The forged receipt proves the discrepancy. The clerk’s signed statement would corroborate it, but also identify your witness.",
     "ใบรับเสบียงปลอมยืนยันว่ายอดไม่ตรงกัน คำให้การพร้อมลายเซ็นของเสมียนจะช่วยยืนยันหลักฐาน แต่ก็จะเปิดเผยตัวพยาน"]);
  for (const action of ["full", "protect"] as const) {
    const gain = reward(life, action);
    const full = action === "full";
    courtOption(card, action, full ? ["Submit the full report", "ส่งรายงานฉบับเต็ม"] : ["Protect the witness", "ปกปิดตัวพยาน"],
      full ? [`You delivered the receipt and the signed statement. Faction trust +${gain}.`,
              `คุณส่งใบรับเสบียงพร้อมคำให้การที่ลงลายเซ็น ความไว้วางใจของฝ่าย +${gain}`]
           : [`You delivered the receipt and withheld the clerk’s name. Faction trust +${gain}.`,
              `คุณส่งใบรับเสบียงโดยปกปิดชื่อเสมียน ความไว้วางใจของฝ่าย +${gain}`]);
  }
  return card;
}

export function resolveLedgerChoice(life: ExpandedLife, id: string): null {
  if (!ledgerAvailable(life)) return null;
  const politics = life.expansion.politics;
  if (politics.orstedLedger === undefined && id === ledger + ".investigate") {
    politics.orstedLedger = "investigating";
  } else if (politics.orstedLedger === "investigating" && (id === ledger + ".full" || id === ledger + ".protect")) {
    const full = id === ledger + ".full";
    politics.trust += reward(life, full ? "full" : "protect");
    politics.orstedLedger = full ? "full" : "protected";
  }
  return null;
}

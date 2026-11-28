import type { ExpandedLife } from "../types";
import { DEMON_CONTINENT_FARE } from "./balance";
import { courtCard, courtOption } from "./crown-service";
import { worldYear } from "./facts";

const id = "expanded.rikarisu-passage";
const cashPay = 48;
export const rikarisuPassageTitle = ["Passage from Rikarisu", "ตั๋วเดินทางจากริคาริสุ"] as const;

function atRikarisu(life: ExpandedLife) {
  return life.race === "migurd" && life.region === "demon" && life.expansion.origin.locality === "settlement";
}

export function rikarisuPassageAvailable(life: ExpandedLife) {
  const { education, rikarisuPassage: passage } = life.expansion;
  return life.phase === "alive" && life.age >= 15 && atRikarisu(life) &&
    education.stage !== "university" && education.stage !== "graduated" &&
    (!passage || (!passage.settlement && worldYear(life) > passage.startedYear));
}

export function earnedRikarisuFare(life: ExpandedLife) {
  const passage = life.expansion.rikarisuPassage;
  return atRikarisu(life) && passage?.settlement === "fare" ? passage : undefined;
}

export function creditRikarisuWork(life: ExpandedLife) {
  const passage = life.expansion.rikarisuPassage;
  if (passage && passage.workedYear === undefined && life.focus === "work" && rikarisuPassageAvailable(life))
    passage.workedYear = worldYear(life);
}

export function rikarisuPassageDecision(life: ExpandedLife) {
  if (life.pending !== id || life.expansion.optionalActivity !== id || !rikarisuPassageAvailable(life)) return null;
  const passage = life.expansion.rikarisuPassage;
  if (!passage) {
    const card = courtCard(id, rikarisuPassageTitle, [
      `An outfitter in Rikarisu needs help weighing cargo and checking straps. She offers ${cashPay} silver for a year’s work, or adds to your pay to cover the ${DEMON_CONTINENT_FARE}-silver fare when you enroll at Ranoa.`,
      `เจ้าของร้านจัดเสบียงในริคาริสุต้องการคนช่วยชั่งสินค้าและตรวจสายรัด เธอเสนอค่าจ้าง ${cashPay} เหรียญเงินสำหรับการทำงานหนึ่งปี หรือจะสมทบให้พอจ่ายค่าเดินทาง ${DEMON_CONTINENT_FARE} เหรียญเงินเมื่อคุณเข้าเรียนที่ราโนอา`,
    ]);
    courtOption(card, "accept", ["Accept the outfitter’s offer", "รับข้อเสนอของเจ้าของร้าน"], [
      "You agreed to work with the outfitter. Spend an available year in the settlement with Earn a living as your focus, then return for your pay.",
      "คุณตกลงทำงานกับเจ้าของร้าน เลือกทำมาหากินเป็นเป้าหมายประจำปีและทำงานในชุมชนหนึ่งปีที่ไม่มีภาระอื่นมาขัด แล้วกลับมารับค่าจ้าง",
    ]);
    courtOption(card, "later", ["Come back later", "กลับมาภายหลัง"], [
      "The outfitter left the offer open.", "เจ้าของร้านยังเปิดโอกาสให้คุณกลับมารับงาน",
    ]);
    return card;
  }

  const waiting = passage.workedYear === undefined;
  const card = courtCard(id, rikarisuPassageTitle, waiting ? [
    "One available year on Earn a living in the settlement is still due. Assigned service and active full-time training take precedence.",
    "ยังต้องใช้เวลาอีกหนึ่งปีในชุมชนโดยเลือกทำมาหากิน งานรับใช้ที่ได้รับมอบหมายและการฝึกอาชีพเต็มเวลาต้องทำก่อน",
  ] : [
    "The outfitter closes her ledger. Your work is complete. You can collect the silver or have her cover your university fare to Ranoa.",
    "เจ้าของร้านปิดสมุดบัญชี คุณทำงานครบแล้ว จะรับเงินหรือให้เธอจ่ายค่าเดินทางไปเรียนที่ราโนอาก็ได้",
  ]);
  if (!waiting) {
    const cash = Math.min(cashPay, 1_000_000 - life.coins);
    courtOption(card, "cash", ["Take the silver", "รับเงินค่าจ้าง"], [
      `You collected ${cash} silver from the outfitter and closed the agreement.`,
      `คุณรับเงิน ${cash} เหรียญเงินจากเจ้าของร้านและจบข้อตกลง`,
    ]);
    card.choices[0].coins = cash;
    courtOption(card, "fare", ["Put your pay toward passage", "นำค่าจ้างไปเป็นค่าเดินทาง"], [
      `The outfitter set aside your ${DEMON_CONTINENT_FARE}-silver fare. Open University admission from this settlement when ready. Admission, tuition and living costs still apply.`,
      `เจ้าของร้านกันเงิน ${DEMON_CONTINENT_FARE} เหรียญเงินไว้จ่ายค่าเดินทางให้คุณ เมื่อพร้อมให้เปิดเมนูสมัครมหาวิทยาลัยจากชุมชนนี้ คุณยังต้องจ่ายค่าสมัคร ค่าเรียน และค่าครองชีพ`,
    ]);
  }
  courtOption(card, "later", ["Come back later", "กลับมาภายหลัง"], [
    "Your agreement stays open.", "ข้อตกลงของคุณยังมีผลอยู่",
  ]);
  return card;
}

export function resolveRikarisuChoice(life: ExpandedLife, choice: string) {
  const passage = life.expansion.rikarisuPassage;
  if (choice === id + ".accept") {
    life.expansion.rikarisuPassage = { startedYear: worldYear(life) };
  } else if (passage && choice === id + ".cash") {
    passage.settlement = "cash";
  } else if (passage && choice === id + ".fare") {
    passage.settlement = "fare";
  }
}

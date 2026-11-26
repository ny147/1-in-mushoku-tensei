import type { Language, Life } from "../game/types";
import { PARENTAL_DEBT } from "../game/expanded/balance";
import { moneyText } from "./money";

// Match the resolved narrative exactly so a different outcome or revised translation
// keeps its full account until it has a reviewed short version in that language.
const summaries: Record<Language, Map<string, string>> = {
  en: new Map([
    ["You entered custody. Half the remaining purse was confiscated. Release follows the K427 settlement.", "Jailed until after the K427 settlement, you lost half your silver."],
    ["You keep your secret. Words begin to take shape, and the world slowly becomes less unfamiliar.", "You keep your secret and learn the language."],
    ["A warm hand closes around your fingers. Whatever came before, these people are real.", "You bond with your new family."],
    ["You find a faint warmth within. You cannot shape it yet, but the possibility stays with you.", "You sense mana but cannot shape it yet."],
    ["You trace the unfamiliar letters until the marks become words. Your second education begins.", "You teach yourself to read."],
    ["Evening by evening, you learn together. The lessons matter almost as much as the time.", "You learn to read with a parent."],
    ["A worn primer becomes your most treasured possession. You practice the smallest spells in secret.", "You spend 8 silver on a primer and practice magic in secret."],
    ["A trembling bead of water hangs in the air. You collapse into the grass, exhausted and grinning.", "You cast water magic silently, exhausting yourself."],
    ["Wonder replaces worry on their faces. You no longer have to learn entirely alone.", "Your family supports further magic lessons."],
    ["You listen, learn and begin to belong.", "You begin to feel at home."],
    ["Curiosity becomes a small daily practice.", "You start practicing mana daily."],
    ["A free lesson opens a path to study.", "Free lessons open a path to study."],
    ["Your contribution is recorded as support, not military service.", "You provided civilian relief."],
    ["You begin university with the necessary costs reserved.", "You enroll with costs reserved."],
    ["You review qualifications and current vacancies before choosing a job.", "You check job requirements and openings."],
  ]),
  th: new Map([
    ["คุณถูกคุมขังและถูกริบเงินครึ่งหนึ่งของยอดที่เหลือ จะได้รับการปล่อยตัวหลังสะสางบัญชีปี K427", "คุณถูกริบเงินครึ่งหนึ่งและถูกขังจนสะสางบัญชีปี K427 เสร็จ"],
    ["คุณเก็บความลับไว้กับตัว ถ้อยคำเริ่มมีความหมาย และโลกก็ค่อย ๆ แปลกหน้าน้อยลง", "คุณเก็บความลับไว้และเริ่มเข้าใจภาษา"],
    ["มืออุ่นกุมปลายนิ้วของคุณ ไม่ว่าอะไรจะเกิดขึ้นมาก่อน ผู้คนตรงนี้มีตัวตนจริง", "คุณเริ่มผูกพันกับครอบครัวใหม่"],
    ["คุณพบไออุ่นจาง ๆ ภายใน แม้ยังควบคุมไม่ได้ แต่ความเป็นไปได้นั้นยังอยู่ในใจ", "คุณสัมผัสมานาได้ แต่ยังควบคุมไม่ได้"],
    ["คุณไล่นิ้วตามตัวอักษรแปลกตาจนรอยหมึกกลายเป็นคำ การศึกษาครั้งที่สองเริ่มขึ้นแล้ว", "คุณหัดอ่านจนอ่านได้เอง"],
    ["ค่ำแล้วค่ำเล่า คุณเรียนรู้ไปด้วยกัน บทเรียนสำคัญแทบไม่ต่างจากเวลาที่ได้ใช้ร่วมกัน", "คุณเรียนอ่านหนังสือกับพ่อแม่"],
    ["ตำราเก่ากลายเป็นของล้ำค่าที่สุดของคุณ คุณแอบฝึกเวทเล็ก ๆ อย่างเงียบเชียบ", "คุณจ่าย 8 เหรียญเงินซื้อตำราแล้วแอบฝึกเวท"],
    ["หยดน้ำสั่นไหวลอยอยู่กลางอากาศ คุณทรุดลงบนหญ้าทั้งเหนื่อยอ่อนและยิ้มกว้าง", "คุณร่ายเวทน้ำโดยไม่ออกเสียงจนหมดแรง"],
    ["ความกังวลบนใบหน้าพวกเขากลายเป็นความพิศวง คุณไม่ต้องเรียนรู้ตามลำพังทั้งหมดอีกแล้ว", "ครอบครัวสนับสนุนให้คุณเรียนเวทต่อ"],
    ["คุณฟัง เรียนรู้ และค่อย ๆ ผูกพันกับบ้านใหม่", "คุณเริ่มผูกพันกับบ้านใหม่"],
    ["ความอยากรู้กลายเป็นการฝึกเล็ก ๆ ในแต่ละวัน", "คุณเริ่มฝึกมานาทุกวัน"],
    ["บทเรียนที่ไม่ต้องเสียเงินเปิดทางสู่การศึกษา", "คุณได้เรียนอ่านฟรี เปิดทางให้เรียนต่อ"],
    ["ความช่วยเหลือของคุณถูกบันทึกเป็นการบรรเทาทุกข์ ไม่ใช่การรับราชการทหาร", "คุณช่วยบรรเทาทุกข์ในฐานะพลเรือน"],
    ["คุณเริ่มเรียนมหาวิทยาลัยโดยจัดเตรียมค่าใช้จ่ายที่จำเป็นไว้แล้ว", "คุณกันค่าใช้จ่ายไว้แล้วและเริ่มเรียนมหาวิทยาลัย"],
    ["คุณตรวจสอบคุณสมบัติและตำแหน่งที่เปิดรับก่อนเลือกงาน", "คุณตรวจคุณสมบัติและตำแหน่งว่าง"],
  ]),
};

export function shortChoiceText(full: string, language: Language): string {
  return summaries[language].get(full) ?? full;
}

export function parentalDebtSummary(before: Life, after: Life, language: Language): string | undefined {
  if (before.ruleset !== "expanded-1" || after.ruleset !== "expanded-1" ||
      before.pending !== "expanded.parental-debt") return;
  const previous = before.expansion.social?.debt;
  const household = after.expansion.social?.household;
  const debt = after.expansion.social?.debt;
  if (!previous || !household || !debt || previous.status === debt.status) return;
  const balance = moneyText(debt.balance, language);
  const thai = language === "th";
  if (debt.status === "accepted") return thai
    ? `คุณรับหนี้ครอบครัว ${balance} มาผ่อนชำระตามกำลัง`
    : `You took on ${balance} of family debt in affordable instalments.`;
  if (debt.status === "service" && debt.service) {
    const credit = moneyText(PARENTAL_DEBT.annualServiceCredit, language);
    return thai
      ? `คุณรับหนี้ ${balance} และตกลงทำงานใช้หนี้ ${debt.service.requiredYears} ปีที่เข้าเงื่อนไข แต่ละปีจะลดหนี้ได้สูงสุด ${credit} และได้รับปัจจัยจำเป็นแทนค่าจ้าง`
      : `You accepted ${balance} of debt for ${debt.service.requiredYears} eligible years of creditor service. Each eligible year credits up to ${credit} and supplies necessities in place of wages.`;
  }
  if (debt.status === "refused" && household.housing === "security-lost" && household.housingLossYear !== null) {
    const cost = moneyText(PARENTAL_DEBT.refusalHousingCost, language);
    const years = `K${household.housingLossYear + 1}–K${household.housingLossYear + PARENTAL_DEBT.refusalHousingYears}`;
    const bonds = after.stats.bonds - before.stats.bonds;
    const parents = household.affectedParentIds.length;
    return thai
      ? `หนี้ ${balance} ยังเป็นของครัวเรือน การเสียหลักประกันที่อยู่ทำให้ค่าที่พักในภูมิภาคเดิมเพิ่ม ${cost} ต่อปี (${years}) กระทบพ่อแม่ ${parents} คน ความผูกพัน ${bonds} และความสัมพันธ์ในครัวเรือนเหลือ ${household.relationship}`
      : `The household kept the ${balance} debt and lost tenancy security, raising shelter costs in its home region by ${cost}/year (${years}). Parents affected: ${parents}, bonds change: ${bonds}, household relationship: ${household.relationship}.`;
  }
}

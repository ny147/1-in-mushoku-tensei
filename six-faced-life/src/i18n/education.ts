import type { ExpandedLife, Language } from "../game/types";
import type { EducationQuote } from "../game/expanded/education-finance";
import type { TrainingQuote } from "../game/expanded/training";
export type EducationPair = readonly [string, string];
export function talentAssessmentText(
  life: ExpandedLife,
  language: Language,
): string {
  const th = language === "th";
  if (!life.expansion.education.assessed)
    return th
      ? "ยังไม่ได้รับการประเมิน เริ่มประเมินได้จากกิจกรรมเสริมเมื่ออายุ 8 ปี"
      : "Not assessed yet. Seek a talent assessment in Optional activities from age 8.";
  const talents: string[] = [];
  if (life.expansion.genetics.magicTalent)
    talents.push(
      th
        ? "พรสวรรค์ด้านเวทมนตร์ (ประสบการณ์เวทมนตร์ +25%)"
        : "Magical talent (+25% magic experience)",
    );
  if (life.expansion.genetics.academicTalent)
    talents.push(
      th
        ? "พรสวรรค์ด้านวิชาการ (ความรู้ที่เรียนรู้เพิ่ม +25%)"
        : "Academic talent (+25% knowledge gains)",
    );
  if (life.expansion.genetics.swordTalent)
    talents.push(
      th
        ? "พรสวรรค์ด้านดาบ (ประสบการณ์ดาบ +25%)"
        : "Swordsmanship talent (+25% sword experience)",
    );
  const result = talents.length
    ? talents.join(" · ")
    : th
      ? "ไม่พบพรสวรรค์พิเศษ ยังพัฒนาทักษะได้ด้วยการฝึกฝน"
      : "No special talent identified. Practice can still develop your skills.";
  const score = life.expansion.education.assessment;
  return `${th ? "คะแนนประเมิน" : "Assessment score"}: ${score} / 100 · ${result}`;
}
export const educationWords = {
  title: ["Career training", "ฝึกอาชีพ"],
  intro: [
    "Choose an ordinary career. No previous skills or rare talent are needed. Qualified applicants can also apply directly through Browse careers.",
    "เลือกอาชีพทั่วไป เริ่มได้โดยไม่ต้องมีทักษะเดิมหรือพรสวรรค์พิเศษ หากมีคุณสมบัติครบแล้ว สามารถสมัครงานได้โดยตรงจากเมนูดูอาชีพ",
  ],
  quote: ["Your training offer", "ข้อเสนอการฝึกอาชีพ"],
  placement: ["Your guaranteed placement", "งานที่รับรองหลังจบการฝึก"],
  placementInfo: [
    "Accept when you are ready. Injury can delay safe placement; your qualification is retained. No vacancy roll is needed.",
    "รับงานเมื่อพร้อม อาการบาดเจ็บอาจทำให้ต้องรอฟื้นตัว แต่คุณวุฒิยังคงอยู่ ไม่ต้องรอตำแหน่งว่าง",
  ],
  full: ["Full-time paid training", "ฝึกเต็มเวลาแบบมีรายได้"],
  part: ["Part-time training", "ฝึกนอกเวลา"],
  pause: ["Pause training", "พักการฝึก"],
  resume: ["Resume training", "ฝึกต่อ"],
  withdraw: [
    "Withdraw and refund unused funding",
    "ถอนตัวและคืนเงินส่วนที่ยังไม่ได้ใช้",
  ],
  later: ["Continue without committing", "ดำเนินต่อโดยยังไม่ผูกมัด"],
  back: ["Review other careers", "กลับไปดูอาชีพอื่น"],
  recorded: [
    "Your choice is recorded. Time has not advanced.",
    "บันทึกการตัดสินใจแล้ว เวลาไม่ได้เดินไปข้างหน้า",
  ],
  policy: [
    "Interest-free. Repay 10% of positive annual earned surplus after necessities (at least 1 coin when affordable). Paused during hardship or university. Saved wealth is not taken.",
    "ไม่มีดอกเบี้ย ชำระ 10% ของรายได้ส่วนเกินหลังปัจจัยจำเป็นในแต่ละปี (อย่างน้อย 1 เหรียญเมื่อจ่ายไหว) พักชำระเมื่อเดือดร้อนหรือเรียนมหาวิทยาลัย ไม่หักเงินออมเดิม",
  ],
  refund: [
    "Consumed fees are not refundable. Unused borrowed funds cancel debt; unused personal and family contributions return to their owners.",
    "ค่าที่ใช้ไปแล้วไม่คืน เงินกู้ที่ยังไม่ได้ใช้จะหักคืนหนี้ ส่วนเงินส่วนตัวและครอบครัวที่ยังไม่ใช้จะคืนให้เจ้าของ",
  ],
} satisfies Record<string, EducationPair>;
export const ew = (key: keyof typeof educationWords, lang: Language = "en") =>
  educationWords[key][lang === "th" ? 1 : 0];
export function fundingDescription(
  q: EducationQuote,
  language: Language,
): string {
  return language === "th"
    ? `รวม ${q.total} เหรียญ: ค่าสมัคร ${q.admission} ค่าเดินทาง ${q.travel} ค่าเรียน ${q.tuition} ค่าครองชีพ ${q.living} ค่าเริ่มอาชีพ ${q.starterFee} ครอบครัว ${q.family} ส่วนตัว ${q.personal} เงินกู้ ${q.loan} เงินกู้จ่ายให้ผู้จัดการศึกษา ไม่เข้าเงินใช้จ่ายของคุณ`
    : `Total ${q.total} coins: admission ${q.admission}, travel ${q.travel}, tuition ${q.tuition}, living ${q.living}, starter fee ${q.starterFee}. Family ${q.family} · Personal ${q.personal} · Loan ${q.loan}. Borrowed funds pay the provider, never your purse.`;
}
export function courseDescription(
  q: TrainingQuote,
  language: Language,
): string {
  return language === "th"
    ? `${q.mode === "full-time" ? "เต็มเวลา" : "นอกเวลา"} เหลือ ${q.remainingYears} ปี ${q.mode === "full-time" ? "รับ 24 เหรียญต่อปีแทนค่าจ้างและความก้าวหน้าในงานเดิม" : "คงค่าจ้างและความก้าวหน้าจากงานเดิม ไม่มีเบี้ยเลี้ยงเพิ่ม หากไม่มีงานจะไม่มีรายได้จากการฝึก"} ฝึกต่อเนื่องได้โดยไม่ขึ้นกับเป้าหมายประจำปี`
    : `${q.mode === "full-time" ? "Full-time" : "Part-time"} · ${q.remainingYears} years remaining. ${q.mode === "full-time" ? "24 coins/year replaces job wages and career-year advancement." : "Keep actual job wages and advancement; no additional stipend. Without a job, training provides no income."} Attendance is independent of yearly focus.`;
}

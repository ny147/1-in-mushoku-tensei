import type { ExpandedLife, Language } from "../game/types";
import { SWORD_NAMES, type SwordStyle } from "../game/expanded/sword-state";
import {
  SWORD_MENTORS,
  swordMentorPauseReason,
} from "../game/expanded/sword-mentors";
export const swordStyleName = (s: SwordStyle, lang: Language): string =>
  lang === "th"
    ? { "sword-god": "เทพดาบ", "water-god": "เทพวารี", "north-god": "เทพอุดร" }[
        s
      ]
    : SWORD_NAMES[s];
export const swordRankName = (r: number, lang: Language): string =>
  (lang === "th"
    ? [
        "ขั้นต้น",
        "ขั้นกลาง",
        "ขั้นสูง",
        "ชั้นเซียน",
        "ชั้นราชา",
        "ชั้นจักรพรรดิ",
        "ชั้นเทพ",
      ]
    : [
        "Beginner",
        "Intermediate",
        "Advanced",
        "Saint",
        "King",
        "Emperor",
        "God",
      ])[r] ?? "";
export function swordMentorText(l: ExpandedLife, lang: Language): string[] {
  const m = l.expansion.swords?.mentorship;
  if (!m) return [];
  const th = lang === "th",
    reason = swordMentorPauseReason(l);
  const reasons: Record<string, [string, string]> = {
    ended: ["Life ended", "ชีวิตสิ้นสุดแล้ว"],
    decision: ["Resolve the current decision", "ตัดสินใจเรื่องที่รออยู่ก่อน"],
    focus: [
      "Choose sword practice as yearly focus",
      "เลือกฝึกดาบเป็นเป้าหมายประจำปี",
    ],
    style: ["Select the mentored style", "เลือกรูปแบบดาบที่สมัครฝึก"],
    location: ["Return to the mentor region", "กลับไปยังภูมิภาคของอาจารย์"],
    education: [
      "Pause career training or finish university",
      "พักการฝึกอาชีพหรือเรียนมหาวิทยาลัยให้จบ",
    ],
  };
  return [
    `${swordStyleName(m.style, lang)} · ${swordRankName(m.target, lang)} · ${SWORD_MENTORS[m.style][th ? "th" : "en"]}`,
    th
      ? `จ่ายแล้ว ${m.fee} เหรียญ · ฝึก ${Number((m.progress * 100).toFixed(1))}% ของหนึ่งปี ไม่ต้องจ่ายซ้ำ`
      : `Paid ${m.fee} silver · ${Number((m.progress * 100).toFixed(1))}% of one training year; no repeat fee`,
    m.progress === 1
      ? th
        ? "พร้อมทดสอบด้วยตนเอง ผ่านแน่นอนเมื่อครบเงื่อนไข"
        : "Trial ready — manual, guaranteed when requirements hold"
      : reason
        ? (th ? "พักการฝึก: " : "Training paused: ") +
          reasons[reason][th ? 1 : 0]
        : th
          ? "กำลังฝึกพร้อมทำงานเดิมได้ อันตรายตามปกติของชีวิตยังมีผล"
          : "Training alongside your job; normal life hazards still apply",
  ];
}

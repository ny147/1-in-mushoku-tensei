import type { ExpandedLife } from "../game/types";
import {
  ACTIVITIES,
  activityAvailable,
  type Activity,
} from "../game/expanded/activities";
import { useI18n } from "../i18n/context";
const names: Record<Activity, [string, string]> = {
  career: ["Browse careers", "ดูอาชีพ"],
  training: ["Career training", "ฝึกอาชีพ"],
  instruction: ["Seek instruction", "หาผู้สอน"],
  assessment: ["Talent assessment", "ประเมินความสามารถ"],
  university: ["University admission", "สมัครมหาวิทยาลัย"],
  travel: ["Plan a move", "วางแผนย้ายถิ่น"],
  courtship: ["Meet someone", "ทำความรู้จักใครสักคน"],
  challenge: ["Legendary challenges", "ท้าชิงเจ็ดมหาอำนาจ"],
};
export function OptionalActivities({
  life,
  onOpen,
}: {
  life: ExpandedLife;
  onOpen: (key: Activity) => void;
}) {
  const { language } = useI18n(),
    th = language === "th";
  if (life.phase !== "alive" || life.age < 8) return null;
  return (
    <details className="optional-activities">
      <summary>{th ? "กิจกรรมที่เลือกทำได้" : "Optional activities"}</summary>
      <p>
        {life.pending
          ? th
            ? "ตัดสินใจเรื่องที่รออยู่ก่อนเปิดกิจกรรมใหม่"
            : "Finish the current decision before opening another activity."
          : th
            ? "เลือกเรื่องที่ต้องการทำได้เอง เวลาไม่เดินขณะตรวจสอบทางเลือก การเปิดดูไม่ผูกมัดให้ทำ"
            : "Choose what to pursue. Time pauses while you review; opening an activity does not commit you."}
      </p>
      <div className="activity-buttons">
        {ACTIVITIES.map((key) => (
          <button
            className="button secondary"
            key={key}
            disabled={!activityAvailable(life, key)}
            onClick={() => onOpen(key)}
          >
            {names[key][th ? 1 : 0]}
          </button>
        ))}
      </div>
      <p>
        {th
          ? "การประเมินและหาผู้สอนเริ่มอายุ 8 ปี งานและมหาวิทยาลัยเริ่มอายุ 15 ปี การย้ายถิ่นและทำความรู้จักเริ่มอายุ 18 ปี คุณสมบัติและค่าใช้จ่ายยังมีผล งานทั่วไปที่คุณสมบัติครบรับเข้าแน่นอน งานเกียรติยศยังต้องรอตำแหน่งว่าง"
          : "Assessment and instruction open at 8; careers and university at 15; travel and meeting people at 18. Qualifications and costs apply; ordinary qualified applicants get guaranteed entry. Prestige retains vacancies."}
      </p>
      <p>
        {th
          ? "การท้าชิงเป็นกิจกรรมสมัครใจสำหรับผู้ใหญ่หลังปี K430 เฉพาะอันดับ 5–7 ต้องมีประสบการณ์ต่อสู้ 2,000 ระดับการสอน 5 ชื่อเสียง 90 และผลงานสำคัญ 3 รายการ ไม่มีการเริ่มประลองให้อัตโนมัติ"
          : "Legendary challenges are voluntary, for adults after K430, positions 5–7 only. They require 2,000 combat experience, instruction level 5, reputation 90 and three major contributions. A fight never starts automatically."}
      </p>
    </details>
  );
}

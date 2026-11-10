import type { ExpandedLife, Language } from "../game/types";
import {
  CAREER_NODES,
  type CareerNodeId,
  type CareerPathId,
  type CareerBranchId,
} from "../game/expanded/career-catalogue";
import type { CareerProjectQuote } from "../game/expanded/career-work";
import { moneyText } from "./money";
const pathNames: Record<CareerPathId, [string, string]> = {
  livelihood: ["Farming and everyday work", "เกษตรและงานทั่วไป"],
  trade: ["Trade", "การค้า"],
  martial: ["Martial service", "งานดาบและการรับใช้"],
  adventure: ["Adventuring", "นักผจญภัย"],
  magic: ["Magic and scholarship", "เวทมนตร์และวิชาการ"],
  healing: ["Healing and religious service", "การรักษาและศาสนกิจ"],
};
const thai: Record<CareerNodeId, string> = {
  laborer: "คนงาน",
  farmhand: "ผู้ช่วยไร่นา",
  farmer: "เกษตรกร",
  "farm-steward": "ผู้ดูแลไร่นา",
  "trade-assistant": "ผู้ช่วยการค้า",
  merchant: "พ่อค้า",
  "established-merchant": "พ่อค้าผู้ชำนาญ",
  "trade-leader": "ผู้นำกิจการค้า",
  swordsman: "นักดาบ",
  "senior-swordsman": "นักดาบอาวุโส",
  guard: "ทหารยาม",
  "guard-captain": "หัวหน้าทหารยาม",
  "sworn-service": "ผู้รับใช้ในสังกัด",
  knight: "อัศวิน",
  "knight-commander": "ผู้บัญชาการอัศวิน",
  "adventure-f": "นักผจญภัยแรงก์ F",
  "adventure-d": "นักผจญภัยแรงก์ D",
  "adventure-b": "นักผจญภัยแรงก์ B",
  "adventure-s": "นักผจญภัยแรงก์ S",
  mage: "นักเวทอาชีพ",
  "senior-mage": "นักเวทอาวุโส",
  "master-practitioner": "ผู้เชี่ยวชาญเวทปฏิบัติ",
  "magic-teacher": "ครูสอนเวทมนตร์",
  researcher: "นักวิจัย",
  professor: "ศาสตราจารย์",
  "sword-instructor": "ครูสอนดาบ",
  healer: "ผู้รักษา",
  "senior-healer": "ผู้รักษาอาวุโส",
  "clinic-leader": "ผู้ดูแลสถานรักษา",
  cleric: "นักบวช",
  "senior-cleric": "นักบวชอาวุโส",
  "teacher-unspecified": "ครู (ยังไม่ระบุสาขา)",
};
export function careerNodeText(id: CareerNodeId, language: Language): string {
  return language === "th"
    ? thai[id]
    : id === "teacher-unspecified"
      ? "Teacher (specialization unrecorded)"
      : CAREER_NODES[id].title;
}
export function careerPathText(id: CareerPathId, language: Language): string {
  return pathNames[id][language === "th" ? 1 : 0];
}
const requirementNames: Record<string, [string, string]> = {
  "career-years": ["Years in this branch", "ปีที่ทำงานในสายนี้"],
  "knight-years": ["Years as a knight", "ปีที่เป็นอัศวิน"],
  "work-units": ["Work progress", "ความก้าวหน้างาน"],
  milestones: ["Completed projects", "โครงการที่สำเร็จ"],
  requests: ["Completed requests", "คำขอที่ทำสำเร็จ"],
  combat: ["One combat discipline XP", "ประสบการณ์วิชาต่อสู้หนึ่งสาขา"],
  predecessor: ["Previous title earned", "ได้รับตำแหน่งก่อนหน้าแล้ว"],
  inherited: ["Inherited recognition", "การรับรองจากประวัติเดิม"],
  vacancy: ["Appointment available this year", "มีตำแหน่งว่างในปีนี้"],
};
export function careerRequirementLabel(
  id: string,
  language: Language,
): string | undefined {
  return requirementNames[id]?.[language === "th" ? 1 : 0];
}
const projectNames: Record<CareerBranchId, [string, string]> = {
  everyday: ["Improve working tools", "ปรับปรุงเครื่องมือทำงาน"],
  farming: ["Prepare tools and seed", "เตรียมเครื่องมือและเมล็ดพันธุ์"],
  trade: ["Fulfil a local order", "ส่งสินค้าตามคำสั่งซื้อในท้องถิ่น"],
  sword: ["Protect the community", "คุ้มครองชุมชน"],
  guard: ["Complete protection duty", "ทำหน้าที่คุ้มครอง"],
  knight: ["Serve the community", "รับใช้ชุมชน"],
  adventure: ["Complete a routine request", "ทำคำขอทั่วไป"],
  mage: ["Complete a local commission", "รับงานเวทมนตร์ในท้องถิ่น"],
  academic: ["Teach a lesson", "จัดการสอน"],
  instructor: ["Teach a lesson", "จัดการสอน"],
  healer: ["Provide community care", "ดูแลผู้ป่วยในชุมชน"],
  cleric: ["Provide community care", "ดูแลชุมชน"],
};
const riskyNames: Record<CareerBranchId, [string, string]> = {
  ...projectNames,
  everyday: ["Take a harvest investment", "ลงทุนกับผลผลิต"],
  farming: ["Take a harvest investment", "ลงทุนกับผลผลิต"],
  trade: ["Supply a caravan", "จัดสินค้าให้กองคาราวาน"],
  sword: ["Accept a dangerous escort", "รับงานคุ้มกันอันตราย"],
  guard: ["Accept a dangerous escort", "รับงานคุ้มกันอันตราย"],
  knight: ["Accept a dangerous escort", "รับงานคุ้มกันอันตราย"],
  adventure: ["Accept a guild contract", "รับสัญญาจ้างของกิลด์"],
  mage: ["Attempt a complex commission", "รับงานเวทมนตร์ที่ซับซ้อน"],
  academic: ["Undertake research", "ดำเนินการวิจัย"],
  healer: ["Provide emergency care", "ดูแลผู้ป่วยฉุกเฉิน"],
  cleric: ["Provide emergency care", "ดูแลผู้ป่วยฉุกเฉิน"],
};
export function careerProjectName(
  branch: CareerBranchId,
  risk: boolean,
  language: Language,
): string {
  return (risk ? riskyNames : projectNames)[branch][language === "th" ? 1 : 0];
}
export function careerProjectText(
  q: CareerProjectQuote,
  language: Language,
): string {
  const th = language === "th",
    r = q.success;
  const gains = [
    r.units ? `${th ? "ความก้าวหน้างาน" : "work progress"} +${r.units}` : "",
    r.milestones
      ? `${th ? "โครงการสำเร็จ" : "completed projects"} +${r.milestones}`
      : "",
    r.requests
      ? `${th ? "คำขอสำเร็จ" : "completed requests"} +${r.requests}`
      : "",
    r.silver ? moneyText(`+${r.silver}`, language) : "",
    r.service ? `${th ? "การรับใช้" : "service"} +${r.service}` : "",
    r.trust ? `${th ? "ความไว้ใจ" : "trust"} +${r.trust}` : "",
    r.research
      ? `${th ? "งานวิจัย" : "research"} +${r.research}; ${th ? "ชื่อเสียง +10; บันทึกผลงานวิจัย" : "Reputation +10; research achievement recorded"}`
      : "",
  ]
    .filter(Boolean)
    .join("; ");
  return `${th ? "จ่ายก่อนเริ่ม" : "Upfront cost"}: ${moneyText(q.cost, language)}. ${th ? "โอกาสสำเร็จ" : "Success chance"} ${Math.round(q.successChance * 100)}%. ${th ? "เมื่อสำเร็จ" : "On success"}: ${gains}. ${q.successChance < 1 ? (th ? `หากล้มเหลว ไม่ได้รางวัลและไม่คืนเงิน${q.failureHealth ? `; สุขภาพ −${q.failureHealth}` : ""}.` : `On failure: no reward or cost refund${q.failureHealth ? `; health −${q.failureHealth}` : ""}.`) : ""} ${th ? "ทำโครงการได้หนึ่งครั้งต่อปี ไม่มีค่าจ้างรายปีเพิ่ม" : "One project per year; no extra annual salary"}.`;
}
export function careerChoiceOutcome(
  before: ExpandedLife,
  after: ExpandedLife,
  id: string,
  language: Language,
): string | null {
  const a = before.expansion.careerPaths,
    b = after.expansion.careerPaths;
  if (!a || !b) return null;
  const th = language === "th";
  if (
    a.lastProjectYear !== b.lastProjectYear &&
    (id.startsWith("expanded.career-work.") ||
      id === "expanded.research.accept")
  ) {
    const r = b.recent.at(-1),
      ok = r?.code !== "failure";
    const silver = after.coins - before.coins,
      health = after.stats.health - before.stats.health;
    return `${ok ? (th ? "งานสำเร็จ" : "Work completed") : th ? "งานไม่สำเร็จ" : "Work unsuccessful"}. ${th ? "เงินออมเปลี่ยนแปลง" : "Savings change"} ${moneyText(silver, language)}; ${th ? "ความก้าวหน้างาน" : "work progress"} +${r?.units ?? 0}; ${th ? "คำขอสำเร็จ" : "completed requests"} +${b.requests - a.requests}${health ? `; ${th ? "สุขภาพ" : "health"} ${health}` : ""}.`;
  }
  if (
    id.startsWith("expanded.career-path.") &&
    a.active !== b.active &&
    b.active
  )
    return `${th ? "งานปัจจุบัน" : "Current work"}: ${careerNodeText(b.active, language)}.`;
  return null;
}

import type { Language } from "../game/types";
import { RACES, REGIONS } from "../game/world";
import { translate } from "./messages";
import type {
  SceneModel,
  ClipId,
  AgeStage,
} from "../components/life-scene/types";
const activities: Record<ClipId, [string, string]> = {
  idle: ["resting", "พักผ่อน"],
  observe: ["watching the world", "มองดูโลก"],
  magic: ["practicing magic", "ฝึกเวทมนตร์"],
  "sword-god": ["practicing Sword God", "ฝึกวิชาดาบเทพดาบ"],
  "water-god": ["practicing Water God", "ฝึกวิชาดาบเทพวารี"],
  "north-god": ["practicing North God", "ฝึกวิชาดาบเทพอุดร"],
  read: ["reading", "อ่านหนังสือ"],
  work: ["working", "ทำงาน"],
  social: ["spending time with others", "ใช้เวลาร่วมกับผู้อื่น"],
  walk: ["exploring", "สำรวจ"],
  rest: ["resting", "พักผ่อน"],
  celebrate: ["celebrating", "ยินดี"],
  greet: ["greeting", "ทักทาย"],
  arrive: ["arriving", "เดินทางมาถึง"],
  birth: ["beginning life", "เริ่มต้นชีวิต"],
  ending: ["at rest after a completed life", "พักอย่างสงบหลังสิ้นชีวิต"],
  prepare: ["preparing to practice", "เตรียมฝึกฝน"],
};
const stages: Record<AgeStage, [string, string]> = {
  infant: ["baby", "ทารก"],
  child: ["child", "เด็ก"],
  teen: ["teenager", "วัยรุ่น"],
  adult: ["adult", "ผู้ใหญ่"],
  elder: ["elder", "ผู้สูงวัย"],
};
export function sceneDescription(
  model: SceneModel,
  language: Language,
): string {
  const index = language === "th" ? 1 : 0;
  const race = translate(language, RACES[model.race].name);
  const region = translate(language, REGIONS[model.region].name);
  return language === "th"
    ? `ฉากพิกเซล: ${race} ${stages[model.stage][index]} ${activities[model.activity][index]} — ${region}`
    : `Pixel scene: ${stages[model.stage][index]} ${race}, ${activities[model.activity][index]} — ${region}`;
}
export const sceneWords = {
  en: {
    motion: "Scene motion",
    art: "An imagined regional view",
    reduced: "Your device requests reduced motion.",
  },
  th: {
    motion: "การเคลื่อนไหวของฉาก",
    art: "ทิวทัศน์ภูมิภาคในจินตนาการ",
    reduced: "อุปกรณ์ของคุณตั้งค่าให้ลดการเคลื่อนไหว",
  },
};

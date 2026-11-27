import type { Language } from "../game/types";
import type { Genetics } from "../game/expanded/types";

export function confirmedFactorText(genes: Genetics, language: Language): string {
  if (!genes.carrier || !genes.discovered || genes.manifestation === "none") return "";
  const thai = language === "th";
  switch (genes.manifestation) {
    case "mana":
      return (thai ? "ยืนยันปัจจัยลาปลาซด้านมานา การฝึกเวทจากเป้าหมายประจำปีให้ประสบการณ์เพิ่ม 25% เมื่อมีระดับการสอนเวทอย่างน้อย 1 และมีอาหารเพียงพอ"
        : "Mana potential: gain 25% more magic experience from your yearly focus with magic instruction level 1 or higher and no food shortage.") +
        (genes.auraImpaired ? (thai ? " ออร่าต่อสู้บกพร่องทำให้เรียนดาบแบบปกติได้ถึงระดับการสอน 2 และเข้าเรียนกับอาจารย์ประจำสำนักดาบไม่ได้" : " Impaired battle aura limits ordinary sword instruction to level 2 and prevents sword-style mentorship.") : "");
    case "physical":
      return thai ? "ยืนยันปัจจัยลาปลาซด้านร่างกาย การฝึกดาบจากเป้าหมายประจำปีให้ประสบการณ์เพิ่ม 15%"
        : "Physical potential: gain 15% more sword experience from your yearly focus.";
    case "appearance":
      return thai ? "ผลตรวจยืนยันว่าปัจจัยลาปลาซแสดงออกทางรูปลักษณ์ โดยไม่มีโบนัสค่าสถานะจากปัจจัยนี้"
        : "The Factor manifests in your appearance. This manifestation grants no stat bonus.";
  }
}

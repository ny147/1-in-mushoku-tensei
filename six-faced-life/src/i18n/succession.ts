import type { ExpandedLife, Language } from "../game/types";

export function successionHistory(life: ExpandedLife, language: Language): string {
  const s = life.expansion.succession, th = language === "th";
  if (!s) return th ? "แอเรียลขึ้นครองบัลลังก์อัสราในปี K425" : "Ariel took the Asuran throne in K425.";
  if (!s.crisis.revealed) return th ? "การสืบราชบัลลังก์อัสราจะตัดสินในปี K425" : "The Asuran succession will be settled in K425.";
  if (s.court.office) return th ? `${life.name} ขึ้นครองบัลลังก์อัสราในปี K425` : `${life.name} took the Asuran throne in K425.`;
  return s.winner === "ariel"
    ? (th ? "แอเรียลขึ้นครองบัลลังก์อัสราในปี K425" : "Ariel took the Asuran throne in K425.")
    : (th ? "ผู้ท้าชิงจากฝ่ายตรงข้ามขึ้นครองบัลลังก์อัสราในปี K425" : "The opposition took the Asuran throne in K425.");
}

export function successionDetails(life: ExpandedLife, language: Language): string[] {
  const s = life.expansion.succession;
  if (!s) return [];
  const th = language === "th", details: string[] = [];
  if (s.crisis.side) {
    const side = s.crisis.side === "ariel" ? (th ? "แอเรียล" : "Ariel") : (th ? "ฝ่ายตรงข้าม" : "the opposition");
    details.push(th ? `ปี K424 คุณประกาศสนับสนุน${side}` : `You pledged to ${side} in K424.`);
  }
  if (s.crisis.reward) details.push(th ? `รางวัลจากราชสำนัก ${s.crisis.reward} เหรียญเงิน` : `Court recognition brought ${s.crisis.reward} silver.`);
  const {custody, exile} = s.restrictions;
  if (custody) details.push(custody.releasedYear === null
    ? (th ? `ถูกคุมขัง กำหนดปล่อยปี K${custody.releaseYear}` : `In custody. Release is due in K${custody.releaseYear}.`)
    : (th ? `พ้นโทษในปี K${custody.releasedYear}` : `Released from custody in K${custody.releasedYear}.`));
  if (exile) details.push(th ? `ถูกเนรเทศจากอัสราตลอดชีวิตตั้งแต่ปี K${exile.year}` : `Permanently exiled from Asura in K${exile.year}.`);
  const office = s.court.office;
  if (office) {
    details.push(office.endYear === null
      ? (th ? `ครองราชย์ตั้งแต่ K${office.accessionYear} ท้องพระคลัง ${office.treasury}/60 เสถียรภาพ ${office.stability}/4` : `Reigning since K${office.accessionYear}. Treasury ${office.treasury}/60 silver. Stability ${office.stability}/4.`)
      : (th ? `ครองราชย์ K${office.accessionYear}–K${office.endYear}` : `Reigned from K${office.accessionYear} to K${office.endYear}.`));
  }
  return details;
}

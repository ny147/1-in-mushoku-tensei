import type { ExpandedLife, LegacyLife, Language } from "../types";
import type { CompletedSummary } from "./types";
import { descendantCounts } from "./family";
import { worldYear } from "./facts";
import { expandedLabel, expandedRecordLabel } from "../../i18n/expanded";
import { domainText } from "../../i18n/world";
import { RACES, REGIONS } from "../world";
export function legacySummary(l: LegacyLife) {
  return {
    age: l.age,
    cause: l.ending?.cause ?? null,
    marriages: null,
    descendants: null,
  };
}
export function buildSummary(l: ExpandedLife): CompletedSummary {
  const x = l.expansion,
    counts = descendantCounts(l),
    spouseCount = new Set(x.family.marriages.map((m) => m.person)).size,
    cause = l.ending?.cause ?? "illness";
  const sectionsFor = (lang: Language) => {
    const t = (key: string) => expandedLabel(key, lang),
      th = lang === "th";
    const work =
      Object.entries(x.career.records)
        .filter(([, r]) => r.years > 0)
        .map(
          ([role, r]) =>
            `${t(role)}: ${r.years}${th ? " ปี ระดับ " : " years, level "}${r.level}`,
        )
        .join("; ") || t(x.career.role);
    const training = Object.entries(x.training?.records ?? {})
      .filter(([, r]) => r.units > 0)
      .map(
        ([role, r]) =>
          `${t(role)}: ${r.units} ${th ? "หน่วย" : "units"}, ${r.completedYear !== null ? (th ? "จบการฝึก" : "completed") : th ? "ยังไม่จบ" : "unfinished"}, ${r.placementAccepted ? (th ? "รับงานแล้ว" : "placement accepted") : th ? "ยังไม่รับงาน" : "placement not accepted"}`,
      )
      .join("; ");
    const finance = Object.values(x.finance?.purposes ?? {}).reduce(
      (s, r) => ({
        borrowed: s.borrowed + r.borrowed,
        repaid: s.repaid + r.repaid,
        cancelled: s.cancelled + r.cancelled,
        unpaid: s.unpaid + r.balance + r.closedUnpaid,
      }),
      { borrowed: 0, repaid: 0, cancelled: 0, unpaid: 0 },
    );
    const financeText = th
      ? `เงินกู้เพื่อการศึกษา กู้สะสม ${finance.borrowed} ชำระแล้ว ${finance.repaid} คืนเงินที่ยังไม่ใช้ ${finance.cancelled} ค้างเมื่อสิ้นชีวิต ${finance.unpaid} ไม่ส่งต่อหนี้ให้ผู้สืบสกุล`
      : `Education finance: borrowed ${finance.borrowed}; repaid ${finance.repaid}; unused funding cancelled ${finance.cancelled}; unpaid ${finance.unpaid}. Obligations do not pass to descendants.`;
    const marriages = x.family.marriages
      .map(
        (m) =>
          `${x.family.people.find((p) => p.id === m.person)?.name ?? m.person}: K${m.start}–${m.end ?? (th ? "ปัจจุบัน" : "present")}${m.reason ? ` (${m.reason === "widowhood" ? (th ? "คู่เสียชีวิต" : "widowed") : th ? "หย่า" : "divorced"})` : ""}`,
      )
      .join("; ");
    const exposure = x.history
      .map(
        (h) =>
          `K${h.year} ${expandedRecordLabel(h.code, lang)}: ${t(h.exposure)}`,
      )
      .join("; ");
    const people = x.family.people
      .filter((p) => ["parent", "spouse", "child"].includes(p.role))
      .map(
        (p) =>
          `${p.name}: ${t(p.role)}, K${p.born}${p.died !== null ? `–K${p.died}` : ""}`,
      )
      .join("; ");
    const social =
      x.family.friends
        .map((p) => `${p.name}: ${t(p.role)} (${Math.round(p.strength)})`)
        .join("; ") +
      (x.family.projectionLimited
        ? th
          ? " การจำลองผู้สืบสกุลรุ่นไกลถึงขีดจำกัดหนึ่งล้านคนแล้ว ยอดรวมแสดงเฉพาะผู้ที่จำลองไว้"
          : " Distant-family projection reached its one-million-person limit; totals include modeled people only."
        : "");
    const facts = x.facts
      .filter((f) => ["education", "achievement", "discovery"].includes(f.kind))
      .map(
        (f) =>
          `K${f.year} ${expandedRecordLabel(f.code, lang)}${f.detail ? `: ${expandedRecordLabel(f.detail, lang)}` : ""}`,
      )
      .join("; ");
    return [
      `${l.name} ${l.surname}; ${domainText(lang, RACES[l.race].name)}; ${domainText(lang, REGIONS[l.birthRegion].name)}, ${t(x.origin.birthplace === "capital" ? "capital-city" : x.origin.birthplace)}; K${x.birthYear}–K${worldYear(l)}; ${l.age}${th ? " ปี; " : " years; "}${t(cause)}. ${t(x.origin.wealth)}, ${t(x.origin.status)}.`,
      th
        ? `วัยเด็กขาดปัจจัยจำเป็น ${x.economy.deprivedYears} ปี การประเมินความสามารถ ${x.education.assessed ? x.education.assessment : "ยังไม่ได้ประเมิน"} การศึกษา: ${t(x.education.stage)} ปีที่เรียนผ่าน ${x.education.successfulYears} สถานะทุน ${x.education.scholarship ? "ยังได้รับทุน" : "ไม่มีทุนปัจจุบัน"} ${facts}`
        : `Years with unmet necessities: ${x.economy.deprivedYears}. Assessment: ${x.education.assessed ? x.education.assessment : "not assessed"}. Education: ${t(x.education.stage)}; ${x.education.successfulYears} successful years. Current scholarship: ${x.education.scholarship ? "yes" : "no"}. ${facts}`,
      `${work}. ${th ? "การฝึก" : "Training"}: ${training || (th ? "ไม่มีการฝึกที่บันทึกไว้" : "no recorded attendance")}. ${x.career.timeline.map((r) => `K${r.year} ${t(r.role)} ${r.level}: ${expandedRecordLabel(r.reason, lang)}`).join("; ")}`,
      `${t(x.standing.status)}; ${th ? "ชื่อเสียง" : "Reputation"} ${Math.round(x.standing.reputation)}; ${x.politics.faction ? t(x.politics.faction) : th ? "ไม่มีฝ่ายปัจจุบัน" : "no current allegiance"}; ${th ? "ตำแหน่งปัจจุบัน" : "current title"} ${x.standing.title ?? (th ? "ไม่มี" : "none")}. ${exposure}. ${x.politics.records.map((r) => `K${r.year} ${expandedRecordLabel(r.code, lang)}`).join("; ")}`,
      th
        ? `คู่สมรสที่เคยสมรส ${spouseCount} คน บุตรโดยตรง ${counts.born} คน ยังมีชีวิต ${counts.survivingChildren} คน ผู้สืบสกุลที่ยังมีชีวิตทั้งหมด ${counts.survivingDescendants} คน ${marriages}. ${people}. ${social}`
        : `Distinct spouses: ${spouseCount}. Direct children born: ${counts.born}; surviving children: ${counts.survivingChildren}; total surviving descendants: ${counts.survivingDescendants}. ${marriages}. ${people}. ${social}`,
      th
        ? `เงินเมื่อสิ้นชีวิต ${l.coins} เหรียญ เงินสูงสุด ${x.economy.peak} เหรียญ ทรัพย์สิน ${x.economy.assets} ผลงานสำคัญ ${x.standing.feats.length} รายการ ${x.standing.titles.map((t) => `K${t.year}: ${t.position} ${t.won ? "ได้รับ" : "สูญเสีย"}`).join("; ")}`
        : `Coins at death: ${l.coins}; peak personal wealth: ${x.economy.peak}; assets: ${x.economy.assets}; distinct major contributions: ${x.standing.feats.length}. ${x.standing.titles.map((t) => `K${t.year}: ${t.position} ${t.won ? "won" : "lost"}`).join("; ")}`,
    ].map((text, i) => (i === 5 ? `${text} ${financeText}` : text));
  };
  const en = sectionsFor("en"),
    th = sectionsFor("th");
  const early = `${l.name} ${l.surname} was born in K${x.birthYear}, in ${REGIONS[l.birthRegion].name}. The household began with ${expandedLabel(x.origin.wealth).toLowerCase()} resources and ${expandedLabel(x.origin.status).toLowerCase()} standing. This life ended at age ${l.age}, in K${worldYear(l)}, through ${expandedLabel(cause).toLowerCase()}. The short record belongs to a child whose circumstances mattered before adult choices were possible. It records ${x.economy.deprivedYears} years with unmet necessities and preserves the family relationships that were actually known. No adult career, unrecorded marriage, degree or imagined future is added to make the story longer. The surviving chronicle keeps the choices and consequences that occurred, while the family record keeps the names of people who shared this brief life.`;
  const adult = `${l.name} ${l.surname} was born in K${x.birthYear}, in ${REGIONS[l.birthRegion].name}, to a household with ${expandedLabel(x.origin.wealth).toLowerCase()} resources and ${expandedLabel(x.origin.status).toLowerCase()} standing. Birth opened some routes and made others harder. Over ${l.age} years, the recorded life developed through learning, material circumstances and decisions, rather than a guaranteed path to exceptional power. There were ${x.economy.deprivedYears} years in which necessities were not fully met. Education ended with the recorded status of ${expandedLabel(x.education.stage).toLowerCase()}, with ${x.education.successfulYears} successful university years. These details distinguish access and attendance from a completed qualification.

The final primary occupation was ${expandedLabel(x.career.role).toLowerCase()}. Earlier appointments and earned progression remain in the work record even after a change of direction. Public standing ended at ${Math.round(x.standing.reputation)} reputation. The historical record distinguishes personal exposure, voluntary work and distant news; it does not turn every contemporary of a conflict into a soldier. ${spouseCount} distinct spouses and ${counts.born} direct children were recorded. At death, ${counts.survivingChildren} direct children and ${counts.survivingDescendants} descendants in total were alive. Those counts describe recorded relationships, without assigning motives or inventing a family that never formed.

This life ended in K${worldYear(l)} through ${expandedLabel(cause).toLowerCase()}. Personal savings stood at ${l.coins} coins, after a recorded peak of ${x.economy.peak}. The detailed sections preserve the circumstances, successes, interruptions and losses behind those totals. An ordinary livelihood and a life without marriage remain complete outcomes. The final account records what happened and leaves unobserved possibilities unwritten.`;
  const narrativeTh = `${l.name} ${l.surname} เกิดในปี K${x.birthYear} ที่${domainText("th", REGIONS[l.birthRegion].name)} ในครัวเรือน${expandedLabel(x.origin.wealth, "th")} มีฐานะเป็น${expandedLabel(x.origin.status, "th")} ชาติกำเนิด ทรัพยากร และยุคสมัยส่งผลต่อโอกาส แต่ไม่ได้รับประกันความสำเร็จ ตลอดชีวิตมีช่วงที่ขาดปัจจัยจำเป็น ${x.economy.deprivedYears} ปี เรื่องราวสิ้นสุดเมื่ออายุ ${l.age} ปี ในปี K${worldYear(l)} จาก${expandedLabel(cause, "th")}

${l.age < 15 ? "บันทึกวัยเด็กนี้เก็บเฉพาะความสัมพันธ์และเหตุการณ์ที่เกิดขึ้นจริง โดยไม่แต่งเติมอาชีพ การสมรส ปริญญา หรืออนาคตที่ยังไม่ได้ใช้ชีวิต" : `สถานะการศึกษาคือ${expandedLabel(x.education.stage, "th")} เรียนมหาวิทยาลัยผ่าน ${x.education.successfulYears} ปี อาชีพหลักสุดท้ายคือ${expandedLabel(x.career.role, "th")} ประวัติการทำงานก่อนหน้ายังคงอยู่ในรายละเอียด ชื่อเสียงสุดท้าย ${Math.round(x.standing.reputation)} การมีชีวิตร่วมยุคกับสงครามไม่ได้หมายถึงเข้าร่วมรบ บันทึกจึงแยกผลกระทบต่อพลเรือน งานบรรเทาทุกข์ การรับใช้ และข่าวจากแดนไกลอย่างชัดเจน`}

มีคู่สมรสที่เคยสมรส ${spouseCount} คน บุตรโดยตรง ${counts.born} คน เมื่อสิ้นชีวิต บุตรยังมีชีวิต ${counts.survivingChildren} คน และผู้สืบสกุลที่ยังมีชีวิตทั้งหมด ${counts.survivingDescendants} คน เงินที่เหลือ ${l.coins} เหรียญ เคยมีเงินสูงสุด ${x.economy.peak} เหรียญ ตัวเลขเหล่านี้สะท้อนสิ่งที่บันทึกไว้ ไม่ใช่ความตั้งใจที่ไม่มีใครทราบ ชีวิตธรรมดาหรือชีวิตที่ไม่ได้สมรสก็เป็นเรื่องราวที่สมบูรณ์ รายละเอียดเก็บทั้งโอกาส ความพยายาม สิ่งที่สำเร็จ สิ่งที่ยุติลง และความสูญเสีย โดยเว้นอนาคตที่ไม่เคยเกิดขึ้นไว้ตามจริง`;
  return {
    version: 1,
    deathYear: worldYear(l),
    cause,
    spouseCount,
    childrenBorn: counts.born,
    survivingChildren: counts.survivingChildren,
    survivingDescendants: counts.survivingDescendants,
    finalWealth: l.coins,
    peakWealth: x.economy.peak,
    sections: [
      "identity",
      "childhood",
      "work",
      "public",
      "family",
      "legacy",
    ].map((key, i) => ({
      key,
      en: en[i].slice(0, 5000),
      th: th[i].slice(0, 10000),
    })),
    narrative: { en: l.age < 15 ? early : adult, th: narrativeTh },
  };
}

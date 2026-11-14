import { moneyText } from "./money";
import type { ExpandedLife, Life, Language } from "../game/types";
import { CAREERS, FOCUSES, REGIONS } from "../game/world";
import {
  careerIncome,
  getProgression,
  MAGIC_SCHOOLS,
} from "../game/progression";
import { annualIncomeExpanded } from "../game/expanded/careers";
import { statLabels } from "./choice-effects";
import { expandedLabel } from "./expanded";
import { talentAssessmentText } from "./education";
import { effectDelta, effectNumber, effectText } from "./effect-text";
import { translate } from "./messages";
import { SWORD_STYLES, swordRank } from "../game/expanded/sword-state";
import { swordStyleName, swordRankName } from "./sword";
import { careerNodeText } from './careers';

/** Actual differences only; a failed/no-op action must never announce promised gains. */
export function choiceChanges(before: Life, after: Life): string[] {
  const language = after.language ?? "en";
  const text = (en: string, th: string) => effectText(language, en, th);
  const changes: string[] = [];
  const delta = (en: string, th: string, a: number, b: number) => {
    if (Math.abs(b - a) > 0.000001)
      changes.push(effectDelta(language, text(en, th), b - a));
  };
  for (const key of Object.keys(statLabels) as (keyof typeof statLabels)[])
    delta(
      statLabels[key],
      translate("th", statLabels[key]),
      before.stats[key],
      after.stats[key],
    );
  if (Math.abs(after.coins - before.coins) > 0.000001)
    changes.push(moneyText(effectDelta(language, text("Silver", "เงิน"), after.coins - before.coins), language));
  delta(
    "Magic experience",
    "ประสบการณ์เวทมนตร์",
    before.training.magicXp,
    after.training.magicXp,
  );
  if (!(
    before.ruleset === "expanded-1" &&
    after.ruleset === "expanded-1" &&
    before.expansion.swords &&
    after.expansion.swords
  ))
    delta(
      "Sword experience",
      "ประสบการณ์ดาบ",
      before.training.swordXp,
      after.training.swordXp,
    );
  delta(
    "Guild experience",
    "ประสบการณ์กิลด์",
    before.training.guildXp,
    after.training.guildXp,
  );
  for (const [key, en, th] of [
    ["magicCap", "Magic instruction cap", "เพดานการเรียนเวทมนตร์"],
    ["swordCap", "Sword instruction cap", "เพดานการเรียนดาบ"],
  ] as const)
    if (
      !(
        key === "swordCap" &&
        after.ruleset === "expanded-1" &&
        after.expansion.swords
      ) &&
      before.training[key] !== after.training[key]
    )
      changes.push(
        text(
          `${en} → ${after.training[key]}`,
          `${th} → ${after.training[key]}`,
        ),
      );
  if (before.focus !== after.focus)
    changes.push(
      text(
        `Focus → ${FOCUSES[after.focus].name}`,
        `เป้าหมายประจำปี → ${translate(language, FOCUSES[after.focus].name)}`,
      ),
    );
  if (before.region !== after.region)
    changes.push(
      text(
        `Home → ${REGIONS[after.region].name}`,
        `บ้าน → ${translate(language, REGIONS[after.region].name)}`,
      ),
    );
  const bp = getProgression(before),
    ap = getProgression(after);
  if (bp.specialization !== ap.specialization)
    changes.push(
      text(
        `Study → ${MAGIC_SCHOOLS[ap.specialization].name}`,
        `วิชาที่เรียน → ${translate(language, MAGIC_SCHOOLS[ap.specialization].name)}`,
      ),
    );
  const learned = Object.entries(ap.magic).flatMap(([school, track]) =>
    track.spells.filter(
      (id) => !bp.magic[school as keyof typeof bp.magic].spells.includes(id),
    ),
  );
  if (learned.length)
    changes.push(
      text(
        `Spells learned +${learned.length}`,
        `เรียนรู้เวทใหม่ +${learned.length}`,
      ),
    );
  if (before.ruleset === "expanded-1" && after.ruleset === "expanded-1") {
    const ca=before.expansion.careerPaths,cb=after.expansion.careerPaths;
    if(ca && cb) {
      if(ca.active!==cb.active && cb.active)changes.push(text(`Career → ${careerNodeText(cb.active,'en')}`,`อาชีพ → ${careerNodeText(cb.active,'th')}`));
      delta('Completed requests','คำขอสำเร็จ',ca.requests,cb.requests);
      for(const branch of Object.keys(cb.work) as (keyof typeof cb.work)[]) {
        delta('Work progress','ความก้าวหน้างาน',ca.work[branch].units,cb.work[branch].units);
        delta('Completed projects','โครงการสำเร็จ',ca.work[branch].milestones,cb.work[branch].milestones);
      }
    }
    const a = before.expansion.swords,
      b = after.expansion.swords;
    if (a && b) {
      for (const s of SWORD_STYLES) {
        delta(
          `${swordStyleName(s, "en")} experience`,
          `${swordStyleName(s, "th")} ประสบการณ์`,
          a.tracks[s].xp,
          b.tracks[s].xp,
        );
        if (swordRank(a.tracks[s]) !== swordRank(b.tracks[s]))
          changes.push(
            `${swordStyleName(s, language)} → ${swordRankName(swordRank(b.tracks[s]), language)}`,
          );
      }
      if (a.selected !== b.selected && b.selected)
        changes.push(
          text("Practice style → ", "รูปแบบวิชาดาบที่ฝึก → ") +
            swordStyleName(b.selected, language),
        );
      if (!a.mentorship && b.mentorship)
        changes.push(
          text(
            "Mentorship paid; training year starts at 0%",
            "จ่ายค่าฝึกแล้ว เริ่มปีฝึกที่ 0%",
          ),
        );
    }
    changes.push(...expandedChanges(before, after, language));
  } else {
    if (before.career !== after.career)
      changes.push(
        text(
          `Occupation → ${CAREERS[after.career].name}`,
          `อาชีพ → ${translate(language, CAREERS[after.career].name)}`,
        ),
      );
    delta(
      "Career experience",
      "ประสบการณ์อาชีพ",
      bp.career.experience,
      ap.career.experience,
    );
    delta(
      "Reputation",
      "ชื่อเสียง",
      bp.career.reputation,
      ap.career.reputation,
    );
    if (bp.career.level !== ap.career.level)
      changes.push(
        text(`Job level → ${ap.career.level}`, `ระดับงาน → ${ap.career.level}`),
      );
    if (careerIncome(before) !== careerIncome(after))
      changes.push(
        text(
          `Yearly base pay → ${careerIncome(after)} silver`,
          `ค่าจ้างพื้นฐานรายปี → ${careerIncome(after)} เหรียญเงิน`,
        ),
      );
    for (const person of after.family.filter(
      (p) => !before.family.some((b) => b.id === p.id),
    ))
      changes.push(
        text(
          `Family member added: ${person.name}`,
          `สมาชิกครอบครัวใหม่: ${person.name}`,
        ),
      );
  }
  if (before.phase !== "ended" && after.phase === "ended")
    changes.push(text("This life has ended", "ชีวิตนี้สิ้นสุดแล้ว"));
  if (!changes.length)
    changes.push(
      text(
        "Decision recorded; no immediate character change",
        "บันทึกการตัดสินใจแล้ว ไม่มีการเปลี่ยนแปลงตัวละครทันที",
      ),
    );
  return changes;
}

function expandedChanges(
  before: ExpandedLife,
  after: ExpandedLife,
  language: Language,
): string[] {
  const a = before.expansion,
    b = after.expansion;
  const text = (en: string, th: string) => effectText(language, en, th);
  const changes: string[] = [];
  const delta = (en: string, th: string, old: number, value: number, monetary = false) => {
    if (Math.abs(value - old) > 0.000001)
      changes.push(monetary ? moneyText(effectDelta(language, text(en, th), value - old), language) : effectDelta(language, text(en, th), value - old));
  };
  for (const [key, en, th] of [
    ["protectionUntil", "Protection active through", "ความคุ้มครองถึงปี"],
    ["aidUntil", "Household aid active through", "ความช่วยเหลือครัวเรือนถึงปี"],
    ["travelUntil", "Travel exposure through", "เสี่ยงระหว่างเดินทางถึงปี"],
  ] as const) {
    if (a.economy[key] !== b.economy[key])
      changes.push(
        text(`${en} K${b.economy[key]}`, `${th} K${b.economy[key]}`),
      );
  }
  delta(
    "Reputation",
    "ชื่อเสียง",
    a.standing.reputation,
    b.standing.reputation,
  );
  delta(
    "Public trust",
    "ความไว้ใจของชุมชน",
    a.standing.trust,
    b.standing.trust,
  );
  delta("Service", "งานรับใช้", a.standing.service, b.standing.service);
  delta(
    "Research contributions",
    "ผลงานวิจัย",
    a.education.research,
    b.education.research,
  );
  delta(
    "Faction trust",
    "ความไว้ใจของฝ่าย",
    a.politics.trust,
    b.politics.trust,
  );
  delta(
    "Obligations",
    "หน้าที่ผูกพัน",
    a.politics.obligations,
    b.politics.obligations,
  );
  if (a.politics.faction !== b.politics.faction)
    changes.push(
      text(
        `Allegiance → ${b.politics.faction ? expandedLabel(b.politics.faction) : "none"}`,
        `ฝ่ายที่เข้าร่วม → ${b.politics.faction ? expandedLabel(b.politics.faction, "th") : "ไม่มี"}`,
      ),
    );
  if (a.politics.pursuitUntil !== b.politics.pursuitUntil)
    changes.push(
      text(
        `Pursuit active through K${b.politics.pursuitUntil}`,
        `ถูกไล่ล่าถึงปี K${b.politics.pursuitUntil}`,
      ),
    );
  for (const faction of ["orsted", "hitogami"] as const)
    if (a.politics.refused[faction] !== b.politics.refused[faction])
      changes.push(
        text(
          `Offer declined; ${expandedLabel(faction)} may offer again from K${b.politics.refused[faction]! + 5}`,
          `ปฏิเสธข้อเสนอ ${expandedLabel(faction, "th")} อาจเสนออีกตั้งแต่ปี K${b.politics.refused[faction]! + 5}`,
        ),
      );
  if (a.standing.status !== b.standing.status)
    changes.push(
      text(
        `Standing → ${expandedLabel(b.standing.status)}`,
        `ฐานะ → ${expandedLabel(b.standing.status, "th")}`,
      ),
    );
  if (a.standing.title !== b.standing.title)
    changes.push(
      text(
        `Seven Great Powers position → ${b.standing.title ?? "none"}`,
        `อันดับเจ็ดมหาอำนาจ → ${b.standing.title ?? "ไม่มี"}`,
      ),
    );
  if (a.career.role !== b.career.role)
    changes.push(
      text(
        `Occupation → ${expandedLabel(b.career.role)}`,
        `อาชีพ → ${expandedLabel(b.career.role, "th")}`,
      ),
    );
  const oldRecord = a.career.records[b.career.role],
    newRecord = b.career.records[b.career.role];
  if (oldRecord.level !== newRecord.level)
    changes.push(
      text(`Job level → ${newRecord.level}`, `ระดับงาน → ${newRecord.level}`),
    );
  const income = annualIncomeExpanded;
  if (income(before) !== income(after))
    changes.push(
      text(
        `Yearly income ${income(before)} → ${income(after)} silver before expenses`,
        `รายได้รายปี ${income(before)} → ${income(after)} เหรียญเงินก่อนหักค่าใช้จ่าย`,
      ),
    );
  if (a.education.stage !== b.education.stage)
    changes.push(
      text(
        `Education → ${expandedLabel(b.education.stage)}`,
        `การศึกษา → ${expandedLabel(b.education.stage, "th")}`,
      ),
    );
  if (
    a.education.assessed !== b.education.assessed ||
    a.education.assessment !== b.education.assessment
  )
    changes.push(talentAssessmentText(after, language));
  if (!a.genetics.discovered && b.genetics.discovered)
    changes.push(
      text(
        "Observed trait assessment recorded",
        "บันทึกผลประเมินลักษณะพิเศษที่ตรวจพบ",
      ),
    );
  if (a.origin.locality !== b.origin.locality)
    changes.push(
      text(
        `Locality → ${expandedLabel(b.origin.locality)}`,
        `สถานที่อยู่ → ${expandedLabel(b.origin.locality, "th")}`,
      ),
    );
  delta(
    "Family education funds",
    "เงินทุนศึกษาจากครอบครัว",
    a.economy.familyFunds,
    b.economy.familyFunds,
    true,
  );
  const debt = (l: ExpandedLife) =>
    Object.values(l.expansion.finance?.purposes ?? {}).reduce(
      (sum, r) => sum + (r?.balance ?? 0),
      0,
    );
  delta("Education debt", "หนี้การศึกษา", debt(before), debt(after), true);
  const socialA=a.social,socialB=b.social;
  if(socialA&&socialB){
    const personal=(l:ExpandedLife)=>{const d=l.expansion.social?.debt;return d&&(d.status==='accepted'||d.status==='service')?d.balance:0;};
    delta('Personal parental debt','หนี้ครอบครัวที่รับเป็นหนี้ส่วนตัว',personal(before),personal(after),true);
    delta('Parental debt service credit','เครดิตทำงานใช้หนี้ครอบครัว',socialA.debt?.servicePaid??0,socialB.debt?.servicePaid??0,true);
    delta('Household relationship','ความสัมพันธ์ครัวเรือน',socialA.household.relationship,socialB.household.relationship);
    if(socialA.debt?.status!==socialB.debt?.status)changes.push(text(`Parental debt responsibility → ${socialB.debt?.status??'none'}`,`การรับผิดหนี้ครอบครัว → ${{household:'หนี้ครัวเรือน',accepted:'รับผ่อนชำระ',service:'ทำงานใช้หนี้',refused:'ปฏิเสธ',settled:'ชำระครบ',closed:'ปิดเมื่อสิ้นชีวิต'}[socialB.debt?.status??'closed']}`));
    if(socialA.household.housing!==socialB.household.housing)changes.push(text('Household tenancy security lost','ครัวเรือนเสียหลักประกันที่อยู่'));
  }
  if (a.training?.active !== b.training?.active)
    changes.push(
      text(
        `Active training → ${b.training?.active ? expandedLabel(b.training.active) : "none"}`,
        `การฝึกที่กำลังเรียน → ${b.training?.active ? expandedLabel(b.training.active, "th") : "ไม่มี"}`,
      ),
    );
  if (
    a.training?.active &&
    b.training?.active &&
    a.training.paused !== b.training.paused
  )
    changes.push(
      text(
        b.training.paused ? "Training paused" : "Training resumed",
        b.training.paused ? "พักการฝึกแล้ว" : "กลับมาฝึกแล้ว",
      ),
    );
  if (b.training?.active && a.training?.mode !== b.training.mode)
    changes.push(
      text(
        `Attendance → ${b.training.mode}`,
        `รูปแบบเข้าเรียน → ${b.training.mode === "full-time" ? "เต็มเวลา" : "นอกเวลา"}`,
      ),
    );
  const oldMarriages = a.family.marriages.filter((m) => m.end === null).length;
  const newMarriages = b.family.marriages.filter((m) => m.end === null).length;
  if (oldMarriages !== newMarriages)
    delta("Current marriages", "การสมรสปัจจุบัน", oldMarriages, newMarriages);
  delta(
    "Children born",
    "บุตรที่เกิด",
    a.family.directBorn,
    b.family.directBorn,
  );
  const dependantCosts = (l: ExpandedLife) => {
    const year = l.expansion.birthYear + l.age;
    return (
      l.expansion.family.marriages.filter((m) => m.end === null).length * 6 +
      l.expansion.family.people.filter(
        (p) => p.role === "child" && p.died === null && year - p.born < 18,
      ).length *
        4
    );
  };
  if (dependantCosts(before) !== dependantCosts(after))
    changes.push(
      text(
        `Yearly dependant costs → ${dependantCosts(after)} silver`,
        `ค่าใช้จ่ายผู้พึ่งพารายปี → ${dependantCosts(after)} เหรียญเงิน`,
      ),
    );
  for (const person of b.family.people) {
    const old = a.family.people.find((p) => p.id === person.id);
    if (old)
      delta(
        `${person.name}: relationship`,
        `${person.name}: ความสัมพันธ์`,
        old.strength,
        person.strength,
      );
    else
      changes.push(
        text(
          `Family contact added: ${person.name}`,
          `สมาชิกหรือผู้ติดต่อครอบครัวใหม่: ${person.name}`,
        ),
      );
  }
  for (const person of b.family.friends.filter(
    (p) => !a.family.friends.some((old) => old.id === p.id),
  ))
    changes.push(
      text(
        `Social contact added: ${person.name} (${person.role})`,
        `ผู้ติดต่อใหม่: ${person.name} (${person.role === "friend" ? "เพื่อน" : person.role === "rival" ? "คู่แข่ง" : "ศัตรู"})`,
      ),
    );
  const feats = b.standing.feats.filter((f) => !a.standing.feats.includes(f));
  if (feats.length)
    changes.push(
      text(
        `Achievements recorded +${effectNumber(feats.length)}`,
        `บันทึกผลงานสำเร็จ +${effectNumber(feats.length)}`,
      ),
    );
  return changes;
}

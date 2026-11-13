import type { ExpandedLife, Language, NarrativeMessage } from "../game/types";
import { PARENTAL_DEBT } from "../game/expanded/balance";
import { worldYear } from "../game/expanded/facts";
import { REGIONS } from "../game/world";
import { domainText } from "./world";
import { moneyText } from "./money";

export interface SocialPresentation {
  birthRank: string;
  currentStanding: string;
  royalAncestry: string;
  association: string;
  housing: string;
  debt: string;
  commitment: string;
}
const words = (language: Language, en: string, th: string) =>
  language === "th" ? th : en;
function parentNames(life: ExpandedLife, ids: string[]): string[] {
  return ids.flatMap((id) => {
    const p = life.expansion.family.people.find((p) => p.id === id);
    return p ? [p.name] : [];
  });
}
function livingParents(life: ExpandedLife) {
  const h = life.expansion.social?.household;
  return h
    ? life.expansion.family.people.filter(
        (p) =>
          h.parentIds.includes(p.id) &&
          p.role === "parent" &&
          p.died === null &&
          p.home === h.home,
      )
    : [];
}
/** Read-only eligibility description: rendering never advances a contract or RNG. */
function servicePause(life: ExpandedLife, language: Language): string | null {
  const x = life.expansion,
    s = x.social?.debt?.service;
  if (life.phase === "ended") return words(language, "life ended", "สิ้นชีวิต");
  if (life.stats.health < PARENTAL_DEBT.serviceHealth)
    return words(language, "health below 20", "สุขภาพต่ำกว่า 20");
  if (x.education.stage === "university")
    return words(language, "university attendance", "กำลังเรียนมหาวิทยาลัย");
  if (
    x.training?.active &&
    !x.training.paused &&
    x.training.mode === "full-time"
  )
    return words(language, "full-time training", "กำลังฝึกเต็มเวลา");
  if (s && life.region !== s.region)
    return words(
      language,
      "outside the contracted region",
      "อยู่นอกภูมิภาคตามสัญญา",
    );
  if (x.career.role !== "laborer")
    return words(language, "the laborer job is required", "ต้องทำงานกรรมกร");
  return null;
}
export function socialText(
  life: ExpandedLife,
  language: Language,
): SocialPresentation {
  const x = life.expansion,
    s = x.social,
    d = s?.debt;
  const t = (en: string, thai: string) => words(language, en, thai),
    m = (n: number) => moneyText(n, language);
  const rank = (n: string) =>
    n === "noble" ? t("Noble", "ขุนนาง") : t("Commoner", "สามัญชน");
  const wealth: Record<string, string> = {
    poor: t("Poor", "ยากจน"),
    modest: t("Modest", "พอมีพอกิน"),
    comfortable: t("Comfortable", "สุขสบาย"),
    extreme: t("Very wealthy", "มั่งคั่งมาก"),
  };
  const unknown = t("Unrecorded", "ไม่มีบันทึก");
  const result: SocialPresentation = {
    birthRank: `${rank(x.origin.status)} · ${wealth[x.origin.wealth]}`,
    currentStanding: rank(x.standing.status),
    royalAncestry: s
      ? s.royalHouse === "asura"
        ? t(
            "Asura royal family ancestry; no royal office recorded",
            "เชื้อสายราชวงศ์อัสรา ไม่มีบันทึกการดำรงตำแหน่งกษัตริย์",
          )
        : t("No royal ancestry recorded", "ไม่มีบันทึกเชื้อสายราชวงศ์")
      : unknown,
    association: unknown,
    housing: unknown,
    debt: unknown,
    commitment: t(
      "No parental-debt commitment recorded",
      "ไม่มีบันทึกสัญญาชำระหนี้ครอบครัว",
    ),
  };
  if (!s) return result;
  const a = s.association;
  result.association = a
    ? `${a.id === "asura-royal" ? t("Asura royal branch", "สายราชวงศ์อัสรา") : t("Local house contact", "ผู้ติดต่อสกุลท้องถิ่น")}: ${domainText(language, REGIONS[a.region].name)} · ${a.source === "earned" ? t("earned", "ได้รับภายหลัง") : a.source === "birth" ? t("birth", "โดยกำเนิด") : t("inherited record", "รับรองจากบันทึกเดิม")}${a.since === null ? "" : ` · K${a.since}`}. ${x.standing.status === "noble" ? t(`Current noble access. Patron support: ${x.origin.patron ? "yes" : "no"}. Basic education recorded: ${x.education.stage !== "none" ? "yes" : "no"}.`, `มีสิทธิ์เข้าถึงในฐานะขุนนาง ผู้อุปถัมภ์: ${x.origin.patron ? "มี" : "ไม่มี"} บันทึกการศึกษาขั้นพื้นฐาน: ${x.education.stage !== "none" ? "มี" : "ไม่มี"}`) : t("Contact retained; noble privileges inactive.", "ยังคงบันทึกผู้ติดต่อ แต่สิทธิ์ขุนนางไม่ทำงาน")}`
    : t("No house association recorded", "ไม่มีบันทึกสังกัดสกุล");
  if (s.household.housing === "secure-tenancy")
    result.housing = t(
      "Household tenancy security is collateral for the parental liability.",
      "หลักประกันการเช่าที่อยู่ของครัวเรือนค้ำประกันหนี้ครอบครัว",
    );
  else if (
    s.household.housing === "security-lost" &&
    s.household.housingLossYear !== null
  ) {
    const start = s.household.housingLossYear + 1,
      end = s.household.housingLossYear + PARENTAL_DEBT.refusalHousingYears,
      year = worldYear(life);
    const cost = life.region === s.household.home && year <= end;
    result.housing = t(
      `Household tenancy security lost in K${s.household.housingLossYear}. Replacement shelter +${m(PARENTAL_DEBT.refusalHousingCost)}/year in K${start}–K${end} while living in the original region. ${year > end ? "Surcharge expired." : cost ? "The next applicable annual cycle includes this cost." : "No surcharge while living away."}`,
      `ครัวเรือนเสียหลักประกันที่อยู่ในปี K${s.household.housingLossYear} ค่าที่อยู่ทดแทนเพิ่ม ${m(PARENTAL_DEBT.refusalHousingCost)} ต่อปี ใน K${start}–K${end} เมื่ออยู่ภูมิภาคเดิม ${year > end ? "ภาระค่าใช้จ่ายเพิ่มสิ้นสุดแล้ว" : cost ? "คิดค่าใช้จ่ายนี้ในรอบปีที่เข้าเงื่อนไขถัดไป" : "ไม่คิดค่าใช้จ่ายเพิ่มขณะอยู่ต่างภูมิภาค"}`,
    );
    const names = parentNames(life, s.household.affectedParentIds);
    result.housing += t(
      ` Affected parents: ${names.join(", ") || "none"}.`,
      ` บิดามารดาที่ได้รับผล: ${names.join(", ") || "ไม่มี"}`,
    );
  }
  if (!d) {
    result.debt = t("No parental debt recorded", "ไม่มีบันทึกหนี้ครอบครัว");
    return result;
  }
  const personal = d.status === "accepted" || d.status === "service";
  const status: Record<typeof d.status, string> = {
    household: t(
      "Household liability; not personal debt",
      "หนี้ครัวเรือน ไม่ใช่หนี้ส่วนตัว",
    ),
    accepted: t(
      "Personal parental debt — instalments",
      "หนี้ครอบครัวที่รับเป็นหนี้ส่วนตัว — ผ่อนชำระ",
    ),
    service: t(
      "Personal parental debt — creditor service",
      "หนี้ครอบครัวที่รับเป็นหนี้ส่วนตัว — ทำงานใช้หนี้",
    ),
    refused: t(
      "Responsibility refused; household liability, not personal debt",
      "ปฏิเสธรับผิด หนี้ยังเป็นของครัวเรือน ไม่ใช่หนี้ส่วนตัว",
    ),
    settled: t("Settled parental debt", "หนี้ครอบครัวชำระครบแล้ว"),
    closed: t(
      "Parental liability closed at death; not inherited",
      "ปิดหนี้ครอบครัวเมื่อสิ้นชีวิต ไม่ส่งต่อให้ผู้สืบสกุล",
    ),
  };
  result.debt = `${status[d.status]}. ${t("Outstanding", "คงเหลือ")}: ${m(d.balance)}. ${t("Childhood household payments", "ครัวเรือนชำระในวัยเด็ก")}: ${m(d.childhoodPaid)}; ${t("personal repayments", "ชำระส่วนตัว")}: ${m(d.personalPaid)}; ${t("service credit", "เครดิตทำงานใช้หนี้")}: ${m(d.servicePaid)}; ${t("closed unpaid", "ปิดโดยยังไม่ได้ชำระ")}: ${m(d.closedUnpaid)}.`;
  if (d.lastRepaymentYear >= x.birthYear)
    result.debt += ` ${t("Last repayment", "ชำระครั้งล่าสุด")}: ${m(d.lastRepayment)} · K${d.lastRepaymentYear}.`;
  if (personal)
    result.debt += t(
      " Fixed balance; no interest.",
      " ยอดหนี้คงที่ ไม่มีดอกเบี้ย",
    );
  const contract = d.service;
  if (contract) {
    const pause = servicePause(life, language),
      remaining = Math.max(0, contract.requiredYears - contract.completedYears);
    const state =
      contract.endReason === "completed"
        ? t("Completed", "สำเร็จ")
        : contract.endReason === "exit"
          ? t(
              "Exited; remaining balance uses instalments",
              "ยุติสัญญา หนี้ที่เหลือผ่อนชำระ",
            )
          : contract.endReason === "death"
            ? t("Closed at death", "ปิดเมื่อสิ้นชีวิต")
            : pause
              ? t(`Paused: ${pause}`, `พัก: ${pause}`)
              : t("Active", "กำลังทำงาน");
    result.commitment = `${state}. ${contract.completedYears}/${contract.requiredYears} ${t("eligible service years completed", "ปีทำงานที่เข้าเงื่อนไขสำเร็จ")}; ${remaining} ${t("participating years remaining", "ปีที่ต้องทำงานอีก")}. ${t("Accepted balance", "ยอดเมื่อทำสัญญา")}: ${m(contract.acceptedBalance)} · K${contract.startedYear}${contract.endedYear === null ? "" : `–K${contract.endedYear}`}. ${t(`Up to ${m(PARENTAL_DEBT.annualServiceCredit)} debt credit per eligible elapsed year, capped to the remaining balance. Necessities replace wages; no cash stipend.`, `ลดหนี้สูงสุด ${m(PARENTAL_DEBT.annualServiceCredit)} ต่อปีทำงานที่เข้าเงื่อนไข ไม่เกินหนี้คงเหลือ ให้ปัจจัยจำเป็นแทนค่าจ้าง ไม่มีเบี้ยเลี้ยงเงินสด`)}`;
  } else if (d.status === "accepted")
    result.commitment = t(
      "Affordable instalments share one annual repayment budget with education loans; education is repaid first. Hardship or university pauses payment.",
      "ผ่อนตามกำลังโดยใช้งบชำระรายปีร่วมกับเงินกู้การศึกษา ชำระการศึกษาก่อน พักเมื่อเดือดร้อนหรือเรียนมหาวิทยาลัย",
    );
  else if (d.status === "household")
    result.commitment = t(
      "Household support may pay at most 1 silver per childhood year; personal responsibility is offered from age 15.",
      "ทรัพยากรครัวเรือนอาจชำระได้สูงสุดปีละ 1 เหรียญเงินในวัยเด็ก เริ่มเสนอการรับผิดส่วนตัวเมื่ออายุ 15 ปี",
    );
  if (d.status === "accepted" && d.pauseReason !== "none") {
    const reasons = {
      "no-surplus": t("no affordable surplus", "ไม่มีรายได้ส่วนเกินที่จ่ายไหว"),
      hardship: t("unmet necessities", "ขาดปัจจัยจำเป็น"),
      university: t("university attendance", "กำลังเรียนมหาวิทยาลัย"),
      service: t("creditor service", "ทำงานใช้หนี้"),
      ended: t("life ended", "สิ้นชีวิต"),
    };
    result.commitment += t(
      ` Paused: ${reasons[d.pauseReason]}.`,
      ` พัก: ${reasons[d.pauseReason]}`,
    );
  }
  return result;
}

/** Exact quote for Stage 1 decision builders, including clamped relationship effects. */
export function socialEffects(
  life: ExpandedLife,
  action: "accept" | "service" | "refuse" | "exit",
  language: Language,
): string {
  const d = life.expansion.social?.debt;
  if (!d)
    return words(
      language,
      "No parental debt recorded.",
      "ไม่มีบันทึกหนี้ครอบครัว",
    );
  const m = moneyText(d.balance, language),
    year = worldYear(life);
  if (action === "refuse") {
    const parents = livingParents(life),
      names = parents.map((p) => p.name).join(", "),
      bonds = parents.length
        ? Math.min(PARENTAL_DEBT.refusalBonds, life.stats.bonds)
        : 0;
    return words(
      language,
      `No personal debt. Household liability ${m} remains. Tenancy security is lost; shelter +${PARENTAL_DEBT.refusalHousingCost} silver/year in K${year + 1}–K${year + PARENTAL_DEBT.refusalHousingYears} only while living here. ${parents.length} living parents affected${names ? `: ${names}` : ""}; household relationship ${life.expansion.social!.household.relationship} → ${parents.length ? PARENTAL_DEBT.refusalRelationship : life.expansion.social!.household.relationship}. Bonds −${bonds}. No personal savings or nonexistent assets are seized.`,
      `ไม่รับเป็นหนี้ส่วนตัว หนี้ครัวเรือน ${m} ยังอยู่ เสียหลักประกันที่อยู่ ค่าที่อยู่เพิ่ม ${PARENTAL_DEBT.refusalHousingCost} เหรียญเงินต่อปีใน K${year + 1}–K${year + PARENTAL_DEBT.refusalHousingYears} เฉพาะเมื่ออยู่ที่นี่ บิดามารดาที่ยังอยู่ในครัวเรือนได้รับผล ${parents.length} คน${names ? `: ${names}` : ""} ความสัมพันธ์ครัวเรือน ${life.expansion.social!.household.relationship} → ${parents.length ? PARENTAL_DEBT.refusalRelationship : life.expansion.social!.household.relationship} ความผูกพัน −${bonds} ไม่ยึดเงินออมส่วนตัวหรือทรัพย์สินที่ไม่มีจริง`,
    );
  }
  if (action === "service")
    return words(
      language,
      `Accept ${m} personally. ${Math.ceil(d.balance / PARENTAL_DEBT.annualServiceCredit)} eligible years at up to ${PARENTAL_DEBT.annualServiceCredit} silver debt credit/year, final credit capped. Local laborer work; necessities replace cash wages. Study, illness, relocation or changing jobs pauses service.`,
      `รับหนี้ ${m} เป็นส่วนตัว ทำงานที่เข้าเงื่อนไข ${Math.ceil(d.balance / PARENTAL_DEBT.annualServiceCredit)} ปี ลดหนี้สูงสุดปีละ ${PARENTAL_DEBT.annualServiceCredit} เหรียญเงิน ปีสุดท้ายไม่เกินหนี้ที่เหลือ ทำงานกรรมกรในท้องถิ่น รับปัจจัยจำเป็นแทนค่าจ้าง การเรียน เจ็บป่วย ย้ายถิ่นหรือเปลี่ยนงานพักสัญญา`,
    );
  if (action === "exit")
    return words(
      language,
      `Keep completed service credit. Remaining ${m} becomes affordable instalments; no fee.`,
      `คงเครดิตทำงานที่สำเร็จไว้ หนี้ที่เหลือ ${m} เปลี่ยนเป็นผ่อนตามกำลัง ไม่มีค่าธรรมเนียม`,
    );
  return words(
    language,
    `Accept ${m} as fixed personal debt, interest-free. One shared 10% earned-surplus repayment budget after necessities and dependants; education loans first, at least 1 silver when affordable. Hardship and university pause payment. Savings are not taken.`,
    `รับหนี้คงที่ ${m} เป็นหนี้ส่วนตัว ไม่มีดอกเบี้ย ใช้งบชำระร่วม 10% ของรายได้ส่วนเกินหลังปัจจัยจำเป็นและผู้พึ่งพา ชำระเงินกู้การศึกษาก่อน อย่างน้อย 1 เหรียญเงินเมื่อจ่ายไหว พักเมื่อเดือดร้อนหรือเรียนมหาวิทยาลัย ไม่หักเงินออมเดิม`,
  );
}

/** Actual state deltas only; also usable for elapsed-year service records. */
export function socialChoiceOutcome(
  before: ExpandedLife,
  after: ExpandedLife,
  _choiceId: string,
  language: Language,
): string | null {
  const a = before.expansion.social,
    b = after.expansion.social;
  if (!a || !b) return null;
  const d = a.debt,
    e = b.debt,
    parts: string[] = [],
    t = (en: string, th: string) => words(language, en, th),
    m = (n: number) => moneyText(n, language);
  if (d && e) {
    if (d.status !== e.status)
      parts.push(socialText(after, language).debt.split(". ")[0]);
    if (e.personalPaid > d.personalPaid)
      parts.push(
        t(
          `Personal repayment ${m(e.personalPaid - d.personalPaid)}`,
          `ชำระส่วนตัว ${m(e.personalPaid - d.personalPaid)}`,
        ),
      );
    if (e.servicePaid > d.servicePaid)
      parts.push(
        t(
          `Actual service credit ${m(e.servicePaid - d.servicePaid)}`,
          `เครดิตทำงานใช้หนี้จริง ${m(e.servicePaid - d.servicePaid)}`,
        ),
      );
    if (e.closedUnpaid > d.closedUnpaid)
      parts.push(
        t(
          `Closed unpaid ${m(e.closedUnpaid - d.closedUnpaid)}; not inherited`,
          `ปิดโดยยังไม่ได้ชำระ ${m(e.closedUnpaid - d.closedUnpaid)} ไม่ส่งต่อหนี้`,
        ),
      );
    if (d.balance !== e.balance || d.status !== e.status)
      parts.push(
        t(
          `Remaining parental balance ${m(e.balance)}`,
          `หนี้ครอบครัวคงเหลือ ${m(e.balance)}`,
        ),
      );
    if (!d.service && e.service)
      parts.push(socialText(after, language).commitment);
    if (d.service?.endReason !== e.service?.endReason && e.service?.endReason)
      parts.push(socialText(after, language).commitment);
  }
  if (a.household.housing !== b.household.housing) {
    parts.push(socialText(after, language).housing);
    const names = parentNames(after, b.household.affectedParentIds);
    parts.push(
      t(
        `${names.length} parents affected${names.length ? `: ${names.join(", ")}` : ""}. Bonds ${after.stats.bonds - before.stats.bonds}`,
        `บิดามารดาได้รับผล ${names.length} คน${names.length ? `: ${names.join(", ")}` : ""} ความผูกพัน ${after.stats.bonds - before.stats.bonds}`,
      ),
    );
  }
  if (a.household.relationship !== b.household.relationship)
    parts.push(
      t(
        `Household relationship ${a.household.relationship} → ${b.household.relationship}`,
        `ความสัมพันธ์ครัวเรือน ${a.household.relationship} → ${b.household.relationship}`,
      ),
    );
  return parts.length ? parts.join(". ") : null;
}
/** Store bounded bilingual snapshots, never rebuild past outcomes from current debt. */
export function socialChoiceMessage(
  before: ExpandedLife,
  after: ExpandedLife,
  choiceId: string,
  titleEn: string,
  titleTh: string,
): NarrativeMessage | null {
  const en = socialChoiceOutcome(before, after, choiceId, "en");
  if (!en) return null;
  const chunks = (prefix: string, value: string) =>
    Object.fromEntries(
      Array.from({ length: Math.ceil(value.length / 500) }, (_, i) => [
        i === 0 ? prefix : `${prefix}${i}`,
        value.slice(i * 500, (i + 1) * 500),
      ]),
    );
  return {
    key: "expanded.social-choice",
    params: {
      titleEn: titleEn.slice(0, 240),
      titleTh: titleTh.slice(0, 240),
      ...chunks("textEn", en.slice(0, 2400)),
      ...chunks(
        "textTh",
        (socialChoiceOutcome(before, after, choiceId, "th") ?? en).slice(
          0,
          4800,
        ),
      ),
    },
  };
}

import type { ExpandedLife, Language } from "../game/types";
import { eligibleHouse, type HouseProvider } from "../game/expanded/house-state";
import { houseBenefitsSuspended } from "../game/expanded/house-service";
import type { ServicePause } from "../game/expanded/service-priority";

const providers: Record<HouseProvider, readonly [string, string]> = {
  "asura-local": ["Asuran local house", "สกุลท้องถิ่นอัสรา"],
  "asura-royal": ["Asuran royal house", "ราชสกุลอัสรา"],
  "ranoa-local": ["Ranoan local house", "สกุลท้องถิ่นราโนอา"],
  "millis-local": ["Millis local house", "สกุลท้องถิ่นมิลิส"],
};

export const houseSponsorName = (provider: HouseProvider, language: Language) =>
  providers[provider][language === "th" ? 1 : 0];

const servicePauses: Record<ServicePause, readonly [string, string]> = {
  custody: ["Held in custody", "ถูกคุมขัง"],
  governing: ["Serving as ruler", "กำลังครองราชย์"],
  health: ["Health is too low", "สุขภาพต่ำเกินไป"],
  study: ["Attending full-time study", "กำลังเรียนเต็มเวลา"],
  region: ["Away from the provider's region", "อยู่นอกภูมิภาคของสกุล"],
  exile: ["Exiled from the provider's region", "ถูกเนรเทศจากภูมิภาคของสกุล"],
  commitment: ["Another obligation takes priority", "มีภาระอื่นที่ต้องทำก่อน"],
};

function pauseText(reason: ServicePause | null, language: Language): string {
  if (!reason) return "";
  return language === "th" ? ` พักงานรับใช้เพราะ${servicePauses[reason][1]}`
    : ` Service deferred. ${servicePauses[reason][0]}.`;
}

export function houseEducationText(life: ExpandedLife, language: Language): string | null {
  const house = life.expansion.house;
  const sponsor = house?.sponsorship;
  if (!sponsor) return null;
  const th = language === "th";
  const name = houseSponsorName(sponsor.providerId, language);
  const reserved = sponsor.status === "studying" ? sponsor.amount - sponsor.spent : 0;
  const term = {
    studying: th ? "หากมีค่าเล่าเรียนที่จ่ายแล้ว ต้องรับใช้หนึ่งปีหลังหยุดเรียน" : "One eligible service year follows study if the house pays tuition.",
    owed: th ? "เหลืองานรับใช้สกุลหนึ่งปี" : "One year of house service is due.",
    served: th ? "รับใช้สกุลครบแล้ว" : "House service completed.",
    closed: th ? "ปิดสัญญาแล้ว" : "Sponsorship closed.",
  }[sponsor.status];
  const text = th
    ? `${name} จ่ายค่าเล่าเรียนแล้ว ${sponsor.spent} เหรียญเงิน กันไว้ ${reserved} เหรียญเงิน ${term}`
    : `${name} paid ${sponsor.spent} silver in tuition. ${reserved} silver remains reserved. ${term}`;
  return text + (sponsor.status === "owed" ? pauseText(house.service.sponsorPauseReason, language) : "");
}

export function houseStandingText(life: ExpandedLife, language: Language): string[] {
  const house = life.expansion.house;
  if (!house) return [];
  const th = language === "th", details: string[] = [];
  const current = eligibleHouse(life);
  if (life.phase === "alive" && life.expansion.social?.association) {
    if (!current) details.push(th ? "สิทธิประโยชน์ของสกุลใช้ไม่ได้ในขณะนี้" : "Local house benefits are currently unavailable.");
    else if (houseBenefitsSuspended(life, current.id))
      details.push(th ? "สกุลพักการให้สิทธิประโยชน์ใหม่" : "The house has suspended new benefits.");
  }
  for (const provider of Object.keys(house.service.providers) as HouseProvider[]) {
    const record = house.service.providers[provider];
    if (!record) continue;
    const name = houseSponsorName(provider, language);
    if (record.refusals) details.push(th ? `${name} บันทึกการปฏิเสธหน้าที่ ${record.refusals} ครั้ง` : `${name} recorded ${record.refusals} duty refusals.`);
    const request = record.request;
    if (request?.status === "relinquished") details.push(th
      ? `สละบรรดาศักดิ์ของ${name}ในปี K${request.resolutionYear}`
      : `Relinquished the title with the ${name} in K${request.resolutionYear}.`);
    if (request?.status === "service") details.push((th ? `ต้องรับใช้${name}หนึ่งปี` : `One year of service is due to the ${name}.`) +
      pauseText(request.pauseReason, language));
  }
  const marriageService = house.service.terms.find(term => term.completedYear === null && term.cancelledYear === null);
  if (marriageService) details.push((th ? "ต้องรับใช้หนึ่งปีตามพันธมิตรสมรส" : "One year of marriage alliance service is due.") +
    pauseText(marriageService.pauseReason, language));
  for (const alliance of house.marriage.alliances) {
    const name = life.expansion.family.people.find(p => p.id === alliance.candidateId)?.name;
    if (!name) continue;
    details.push(alliance.endedYear === null
      ? th ? `สมรสทางราชวงศ์กับ ${name} ในปี K${alliance.acceptedYear} คุ้มครองถึงปี K${alliance.protectionUntil}`
        : `Royal marriage to ${name} in K${alliance.acceptedYear}. Protection through K${alliance.protectionUntil}.`
      : th ? `พันธมิตรสมรสกับ ${name} สิ้นสุดในปี K${alliance.endedYear}`
        : `Marriage alliance with ${name} ended in K${alliance.endedYear}.`);
  }
  return details;
}

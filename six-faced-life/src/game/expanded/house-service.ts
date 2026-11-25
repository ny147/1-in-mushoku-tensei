import type { Decision, ExpandedLife } from "../types";
import { fact, worldYear } from "./facts";
import { eligibleHouse } from "./house-state";
import { courtCard, courtOption } from "./crown-service";
import type { HouseAssociation } from "./social-state";
import { permanentlyExiled } from "./succession-restrictions";
import { providerRegion, serviceAssignment, servicePause, type ServiceAssignment, type ServicePause } from "./service-priority";

type Provider = HouseAssociation["id"];
type HouseServiceSource = "duty" | "sponsorship" | "marriage";
type RequestStatus = "open" | "final" | "service" | "served" | "paid" | "refused" | "relinquished" | "superseded";
type Pause = ServicePause | null;
const requestStatuses: RequestStatus[] = ["open", "final", "service", "served", "paid", "refused", "relinquished", "superseded"];
const pauseReasons: Pause[] = [null, "custody", "governing", "health", "study", "region", "exile", "commitment"];
const interval = 3;
const contribution = 8;
const requestId = "expanded.house-request";
const standingId = "expanded.house-standing";
const petitionId = "expanded.house-petition";

interface HouseRequest {
  openedYear: number;
  dueYear: number;
  acceptedYear: number | null;
  resolutionYear: number | null;
  extended: boolean;
  status: RequestStatus;
  pauseReason: Pause;
}
interface ProviderService {
  request: HouseRequest | null;
  refusals: number;
  lastPetitionYear: number | null;
}
interface MarriageServiceTerm {
  source: "marriage";
  provider: Provider;
  acceptedYear: number;
  completedYear: number | null;
  cancelledYear: number | null;
  pauseReason: Pause;
}
export interface HouseServiceState {
  providers: Partial<Record<Provider, ProviderService>>;
  terms: MarriageServiceTerm[];
  sponsorPauseReason: Pause;
  lastCreditYear: number | null;
  lastCreditSource: HouseServiceSource | null;
}
export function newHouseServiceState(): HouseServiceState {
  return { providers: {}, terms: [], sponsorPauseReason: null, lastCreditYear: null, lastCreditSource: null };
}

function providerService(state: HouseServiceState, provider: Provider): ProviderService {
  return state.providers[provider] ??= { request: null, refusals: 0, lastPetitionYear: null };
}
function activeRequest(request: HouseRequest | null | undefined): boolean {
  return !!request && ["open", "final", "service"].includes(request.status);
}
function outstandingMarriage(term: MarriageServiceTerm): boolean {
  return term.completedYear === null && term.cancelledYear === null;
}
function crownSchedulesDuties(life: ExpandedLife): boolean {
  const court = life.expansion.succession?.court;
  return !!court && court.recognitionYear !== null && court.relinquishedYear === null &&
    life.region === "asura" && !permanentlyExiled(life);
}
export function houseBenefitsSuspended(life: ExpandedLife, provider: Provider): boolean {
  return (life.expansion.house?.service.providers[provider]?.refusals ?? 0) >= 2;
}
export function hasHouseCommitment(life: ExpandedLife): boolean {
  const house = life.expansion.house;
  if (!house) return false;
  const crown = life.expansion.succession?.court.request;
  return Object.values(house.service.providers).some((record) => activeRequest(record.request)) ||
    house.service.terms.some(outstandingMarriage) || house.sponsorship?.status === "studying" ||
    house.sponsorship?.status === "owed" ||
    !!(crownSchedulesDuties(life) && crown && ["open", "final", "service"].includes(crown.status));
}

export function startMarriageService(life: ExpandedLife, provider: Provider): void {
  const house = life.expansion.house;
  if (!house || house.accessYears[provider] === undefined || house.service.terms.some(outstandingMarriage)) return;
  house.service.terms.push({
    source: "marriage", provider, acceptedYear: worldYear(life),
    completedYear: null, cancelledYear: null, pauseReason: null,
  });
}
export function endMarriageService(life: ExpandedLife): void {
  const term = life.expansion.house?.service.terms.find(outstandingMarriage);
  if (!term) return;
  term.cancelledYear = worldYear(life);
  term.pauseReason = null;
}

function isHouseAssignment(assignment: ServiceAssignment): assignment is HouseServiceSource {
  return assignment === "duty" || assignment === "sponsorship" || assignment === "marriage";
}
export function consumesWorkThisYear(life: ExpandedLife): boolean {
  return isHouseAssignment(serviceAssignment(life));
}

export function advanceHouseYear(life: ExpandedLife, assignment = serviceAssignment(life)): void {
  const house = life.expansion.house, year = worldYear(life);
  if (!house || life.phase !== "alive") return;
  const state = house.service;
  function credit(source: HouseServiceSource, provider: Provider): void {
    state.lastCreditYear = year;
    state.lastCreditSource = source;
    fact(life, "politics", "house-service-completed", `${source}:${provider}`);
  }
  for (const [key, record] of Object.entries(state.providers)) {
    const provider = key as Provider, request = record.request;
    if (!request || !activeRequest(request)) continue;
    if (crownSchedulesDuties(life) && providerRegion(provider) === "asura" &&
        (request.status === "open" || request.status === "final")) {
      request.status = "superseded";
      request.resolutionYear = year;
      request.pauseReason = null;
      continue;
    }
    if (year < request.dueYear) continue;
    const region = providerRegion(provider);
    const pause = servicePause(life, region);
    if (request.status === "service") {
      request.pauseReason = assignment === "duty" && life.region === region ? null : pause ?? "commitment";
      if (!request.pauseReason && state.lastCreditYear !== year) {
        request.status = "served";
        request.resolutionYear = year;
        record.refusals = 0;
        credit("duty", provider);
      }
    } else {
      request.pauseReason = pause ?? (assignment || crownSchedulesDuties(life) ? "commitment" : null);
    }
  }
  const sponsorship = house.sponsorship;
  if (sponsorship?.status === "owed" && sponsorship.endedYear !== null && year > sponsorship.endedYear) {
    state.sponsorPauseReason = assignment === "sponsorship" ? null :
      servicePause(life, providerRegion(sponsorship.providerId)) ?? "commitment";
    if (!state.sponsorPauseReason && state.lastCreditYear !== year) {
      sponsorship.status = "served";
      sponsorship.servedYear = year;
      credit("sponsorship", sponsorship.providerId);
    }
  } else {
    state.sponsorPauseReason = null;
  }
  for (const term of state.terms) {
    if (!outstandingMarriage(term) || year <= term.acceptedYear) continue;
    term.pauseReason = assignment === "marriage" ? null :
      servicePause(life, providerRegion(term.provider)) ?? "commitment";
    if (!term.pauseReason && state.lastCreditYear !== year) {
      term.completedYear = year;
      credit("marriage", term.provider);
    }
  }

  const provider = eligibleHouse(life)?.id;
  if (!provider || life.age < 18 || crownSchedulesDuties(life) || hasHouseCommitment(life)) return;
  const since = house.accessYears[provider];
  if (since === undefined || year < since + interval) return;
  const openedYear = year - (year - since) % interval;
  const record = providerService(state, provider);
  if (record.request && (record.request.openedYear >= openedYear || record.request.resolutionYear === year)) return;
  record.request = {
    openedYear, dueYear: year, acceptedYear: null, resolutionYear: null,
    status: "open", extended: false,
    pauseReason: servicePause(life, providerRegion(provider)) ?? (assignment ? "commitment" : null),
  };
}

export function nextHouseDecision(life: ExpandedLife): string | null {
  const provider = eligibleHouse(life)?.id;
  if (!provider || life.age < 18 || crownSchedulesDuties(life) ||
      servicePause(life, providerRegion(provider)) || serviceAssignment(life)) return null;
  const request = life.expansion.house?.service.providers[provider]?.request;
  if (!request || worldYear(life) < request.dueYear) return null;
  if (request.status === "final") return standingId;
  return request.status === "open" ? requestId : null;
}

export function canPetitionHouse(life: ExpandedLife): boolean {
  const provider = eligibleHouse(life)?.id, house = life.expansion.house;
  if (!provider || !house || house.accessYears[provider] === undefined ||
      crownSchedulesDuties(life) || houseBenefitsSuspended(life, provider)) return false;
  const previous = house.service.providers[provider]?.lastPetitionYear;
  return previous == null || worldYear(life) >= previous + interval;
}
export function houseProtectionActive(life: ExpandedLife): boolean {
  const provider = eligibleHouse(life)?.id, house = life.expansion.house;
  if (!provider || !house || houseBenefitsSuspended(life, provider)) return false;
  const previous = house.service.providers[provider]?.lastPetitionYear;
  return previous !== null && previous !== undefined && worldYear(life) === previous + 1;
}

export function houseServiceDecision(life: ExpandedLife): Decision | null {
  const id = life.pending;
  if (id !== petitionId && id !== requestId && id !== standingId) return null;
  if (id === petitionId) {
    const d = courtCard(id, ["A petition to the local house", "คำร้องต่อสกุลท้องถิ่น"],
      ["Ask your local house to protect your household for the coming year.", "ขอให้สกุลท้องถิ่นคุ้มครองครอบครัวของคุณในปีถัดไป"]);
    if (canPetitionHouse(life))
      courtOption(d, "claim", ["Ask for protection", "ขอความคุ้มครอง"],
        ["The house protects your household for one annual settlement while you remain eligible locally. You can petition again in three years.", "สกุลจะคุ้มครองครอบครัวหนึ่งรอบปีตราบที่ยังมีสิทธิในท้องถิ่น ยื่นคำร้องได้อีกครั้งในสามปี"]);
    courtOption(d, "later", ["Close the petition", "ปิดคำร้อง"], ["Return to your chronicle.", "กลับไปยังบันทึกชีวิต"]);
    return d;
  }
  const provider = eligibleHouse(life)?.id;
  const record = provider ? life.expansion.house?.service.providers[provider] : undefined;
  if (!record || !record.request || id !== nextHouseDecision(life)) {
    const d = courtCard(id, ["A deferred house request", "คำขอจากสกุลที่ต้องพักไว้"],
      ["The house cannot take your answer under your current circumstances.", "ตอนนี้สกุลยังรับคำตอบไม่ได้เนื่องจากสถานการณ์ของคุณ"]);
    courtOption(d, "later", ["Close the request", "ปิดคำขอ"], ["Keep the request on record without adding a refusal.", "เก็บคำขอไว้โดยไม่นับว่าปฏิเสธ"]);
    return d;
  }
  const final = id === standingId, year = worldYear(life);
  const d = courtCard(id, final ? ["The future of your title", "อนาคตของบรรดาศักดิ์"] :
    ["A request from the local house", "คำขอจากสกุลท้องถิ่น"],
    [`The house asks for an answer in K${year}. You have explicitly refused ${record.refusals} times.`,
     `สกุลขอคำตอบในปี K${year} คุณเลือกปฏิเสธมาแล้ว ${record.refusals} ครั้ง`]);
  courtOption(d, "service", ["Accept one year of service", "รับภาระงานหนึ่งปี"],
    ["Serve the local house for one full eligible year in place of your usual paid work and advancement. Hardship and other commitments defer service. Completion clears refusal strikes.",
     "รับใช้สกุลท้องถิ่นหนึ่งปีเต็มเมื่อพร้อม โดยพักงานประจำ ค่าจ้าง และความก้าวหน้า ความลำบากและภาระอื่นจะเลื่อนการรับใช้ เมื่อทำครบจะล้างประวัติการปฏิเสธ"]);
  if (final) {
    courtOption(d, "relinquish", ["Relinquish the title", "สละบรรดาศักดิ์"],
      ["Lose your title, local house protection and access to new sponsorship. Your ancestry and education stay on record.",
       "เสียบรรดาศักดิ์ ความคุ้มครองของสกุล และสิทธิขอทุนอุปถัมภ์ใหม่ ประวัติเชื้อสายและการศึกษายังคงอยู่"]);
    return d;
  }
  courtOption(d, "pay", [`Contribute ${contribution} silver`, `จ่าย ${contribution} เหรียญเงิน`],
    [`Pay ${contribution} personal silver to fulfil this request.`, `จ่ายจากเงินส่วนตัว ${contribution} เหรียญเพื่อทำตามคำขอ`], life.coins < contribution);
  if (!record.request.extended)
    courtOption(d, "extend", ["Ask for one more year", "ขอเลื่อนหนึ่งปี"],
      [`Answer in K${year + 1}. No refusal is recorded.`, `ตอบในปี K${year + 1} โดยไม่นับว่าปฏิเสธ`]);
  const consequences = [
    ["The house issues a first warning.", "สกุลจะเตือนเป็นครั้งแรก"],
    ["The house suspends new benefits until you complete negotiated service.", "สกุลจะพักสิทธิประโยชน์ใหม่จนกว่าจะรับใช้ครบตามที่ตกลง"],
    ["Choose between negotiated service and relinquishing your title.", "ต้องเลือกระหว่างรับใช้สกุลตามข้อตกลงกับสละบรรดาศักดิ์"],
  ] as const;
  courtOption(d, "refuse", ["Explicitly refuse", "ปฏิเสธคำขอ"], consequences[Math.min(2, record.refusals)]);
  return d;
}

export function applyHouseServiceChoice(life: ExpandedLife, choice: string): boolean {
  if (![requestId, standingId, petitionId].some((id) => choice.startsWith(id + "."))) return false;
  const id = choice.slice(0, choice.lastIndexOf("."));
  const card = houseServiceDecision({ ...life, pending: id });
  if (!card?.choices.some((option) => option.id === choice && !option.disabled)) return false;
  const action = choice.slice(id.length + 1);
  if (action === "later") return true;
  const state = life.expansion.house!.service;
  const provider = eligibleHouse(life)!.id;
  const record = providerService(state, provider);
  const request = record.request, year = worldYear(life);
  if (action === "claim") {
    record.lastPetitionYear = year;
    return true;
  }
  if (!request) return false;
  switch (action) {
    case "service":
      request.status = "service";
      request.acceptedYear = year;
      request.dueYear = year + 1;
      break;
    case "extend":
      request.extended = true;
      request.dueYear = year + 1;
      break;
    case "pay":
      life.coins -= contribution;
      request.status = "paid";
      request.resolutionYear = year;
      break;
    case "refuse":
      record.refusals = Math.min(3, record.refusals + 1);
      request.status = record.refusals >= 3 ? "final" : "refused";
      if (request.status === "refused") request.resolutionYear = year;
      break;
    case "relinquish":
      request.status = "relinquished";
      request.resolutionYear = year;
      life.expansion.standing.status = "commoner";
      life.expansion.origin.patron = false;
      break;
    default:
      return false;
  }
  request.pauseReason = null;
  return true;
}

export function validHouseServiceState(value: unknown, life: ExpandedLife): value is HouseServiceState {
  if (!value || typeof value !== "object") return false;
  const state = value as HouseServiceState;
  const access = life.expansion.house?.accessYears;
  if (!access || !state.providers || typeof state.providers !== "object" ||
      Array.isArray(state.providers) || !Array.isArray(state.terms) || state.terms.length > life.age + 1 ||
      !pauseReasons.includes(state.sponsorPauseReason)) return false;
  const now = worldYear(life);
  const dated = (value: unknown, min: number, max = now): value is number =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;
  const validDate = (value: unknown, min: number) => value === null || dated(value, min);
  const credits: number[] = [];
  let active = 0;
  for (const [key, record] of Object.entries(state.providers)) {
    const since = access[key as Provider];
    if (!Object.hasOwn(access, key) || since === undefined || !record || typeof record !== "object" ||
        !dated(record.refusals, 0, 3) || !validDate(record.lastPetitionYear, since)) return false;
    const r = record.request;
    if (r === null) {
      if (record.refusals !== 0) return false;
      continue;
    }
    if (!r || typeof r !== "object" || !requestStatuses.includes(r.status) ||
        !pauseReasons.includes(r.pauseReason) || typeof r.extended !== "boolean" ||
        !dated(r.openedYear, since + interval) || (r.openedYear - since) % interval !== 0 ||
        !dated(r.dueYear, r.openedYear, now + 1) || !validDate(r.acceptedYear, r.openedYear) ||
        !validDate(r.resolutionYear, r.openedYear)) return false;
    if ((["service", "served"].includes(r.status)) !== (r.acceptedYear !== null) ||
        (activeRequest(r) !== (r.resolutionYear === null)) ||
        (r.acceptedYear !== null && r.dueYear !== r.acceptedYear + 1) ||
        (r.status === "final" && record.refusals !== 3) ||
        (r.status === "served" && (r.resolutionYear! < r.dueYear || record.refusals !== 0)) ||
        (r.status === "relinquished" && record.refusals !== 3)) return false;
    if (r.status === "served") credits.push(r.resolutionYear!);
    if (activeRequest(r)) active++;
  }
  for (const term of state.terms) {
    if (!term || typeof term !== "object" || term.source !== "marriage") return false;
    const since = access[term.provider];
    if (!Object.hasOwn(access, term.provider) || since === undefined || !dated(term.acceptedYear, since) ||
        !validDate(term.completedYear, term.acceptedYear + 1) ||
        !validDate(term.cancelledYear, term.acceptedYear) ||
        (term.completedYear !== null && term.cancelledYear !== null) ||
        !pauseReasons.includes(term.pauseReason)) return false;
    if (term.completedYear !== null) credits.push(term.completedYear);
    if (outstandingMarriage(term)) active++;
  }
  const sponsor = life.expansion.house?.sponsorship;
  if (sponsor?.status === "studying" || sponsor?.status === "owed") active++;
  if (sponsor?.status === "served") credits.push(sponsor.servedYear!);
  const creditYear = state.lastCreditYear;
  if (active > 1 || new Set(credits).size !== credits.length ||
      !validDate(creditYear, life.expansion.birthYear + 18) ||
      (creditYear === null ? state.lastCreditSource !== null :
        !isHouseAssignment(state.lastCreditSource) || credits.some((year) => year > creditYear))) return false;
  const court = life.expansion.succession?.court.request;
  const creditor = life.expansion.social?.debt?.service;
  return creditYear === null || !(court?.status === "served" && court.resolutionYear === creditYear ||
    creditor?.lastCreditYear === creditYear || creditor?.endReason === "completed" && creditor.endedYear === creditYear);
}

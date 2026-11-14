import type { Choice, Decision, ExpandedLife } from "../types";
import { socialEffects } from "../../i18n/social";
import { acceptParentalDebt, exitDebtService, parentalResponsibilityDue } from "./parental-debt";

export function debtServiceExitAvailable(life: ExpandedLife): boolean {
  const d = life.expansion.social?.debt;
  return life.phase === "alive" && life.age >= 15 && d?.status === "service" &&
    d.balance > 0 && !!d.service && d.service.endedYear === null;
}

/** Quotes are derived from the current ledger, never saved as another liability. */
export function socialDecision(life: ExpandedLife): Decision | null {
  const responsibility = life.pending === "expanded.parental-debt" && parentalResponsibilityDue(life);
  const exit = life.pending === "expanded.debt-service-exit" && debtServiceExitAvailable(life);
  if (!responsibility && !exit) return null;
  const choices: Choice[] = [], localized: NonNullable<Decision["localized"]> = {
    title: responsibility ? "ความรับผิดชอบต่อหนี้ครัวเรือน" : "ทบทวนสัญญาทำงานใช้หนี้",
    text: responsibility ? "หนี้นี้ยังเป็นของครัวเรือน คุณเป็นผู้ตัดสินใจว่าจะรับเป็นหนี้ส่วนตัวหรือไม่" : "การเปิดดูยังไม่เปลี่ยนสัญญาหรือเวลาที่ผ่านไป",
    choices: {},
  };
  const option = (action: string, en: string, th: string, effect: "accept" | "service" | "refuse" | "exit" | null) => {
    const id = `${life.pending}.${action}`;
    const description = effect ? socialEffects(life, effect, "en") : "Keep the existing contract without changing its balance or terms.";
    const descriptionTh = effect ? socialEffects(life, effect, "th") : "คงสัญญาเดิมโดยไม่เปลี่ยนยอดหนี้หรือเงื่อนไข";
    choices.push({id, label: en, description, outcome: "Your decision is recorded."});
    localized.choices[id] = {label: th, description: descriptionTh, outcome: "บันทึกการตัดสินใจแล้ว"};
  };
  if (responsibility) {
    option("accept", "Accept affordable instalments", "รับหนี้และผ่อนตามกำลัง", "accept");
    option("service", "Accept creditor service", "รับสัญญาทำงานใช้หนี้", "service");
    const service = choices.at(-1)!;
    const studying = life.expansion.education.stage === "university" || life.expansion.training?.active && !life.expansion.training.paused && life.expansion.training.mode === "full-time";
    const pause = studying || life.stats.health < 20 || life.region !== life.expansion.social!.household.home;
    if (pause) {
      service.description += " Service starts paused until health, study, location and laborer work permit participation. Existing education and its reserves remain intact.";
      localized.choices[service.id].description += " สัญญาเริ่มโดยพักจนสุขภาพ การเรียน ที่อยู่และงานกรรมกรเข้าเงื่อนไข ไม่ยกเลิกการศึกษาหรือเงินที่กันไว้";
    }
    option("refuse", "Refuse personal responsibility", "ไม่รับเป็นหนี้ส่วนตัว", "refuse");
  } else {
    option("confirm", "Exit service; keep earned credit", "ออกจากสัญญาและคงเครดิตที่ได้", "exit");
    choices[0].description += ` Already-earned credit: ${life.expansion.social!.debt!.servicePaid} silver.`;
    localized.choices[choices[0].id].description += ` เครดิตที่ได้แล้ว ${life.expansion.social!.debt!.servicePaid} เหรียญเงิน`;
    option("keep", "Keep the service contract", "คงสัญญาทำงานใช้หนี้", null);
  }
  return {id: life.pending!, title: responsibility ? "Household debt responsibility" : "Review creditor service",
    text: responsibility ? "This is household liability until you choose to accept it personally." : "Reviewing the contract does not change time, money or its terms.",
    kind: "family", choices, localized, requiresManual: true};
}

/** Domain checks remain independent of the current pending UI decision. */
export function applySocialChoice(life: ExpandedLife, id: string): boolean {
  switch (id) {
    case "expanded.parental-debt.accept": return acceptParentalDebt(life, "instalments");
    case "expanded.parental-debt.service": return acceptParentalDebt(life, "service");
    case "expanded.parental-debt.refuse": return acceptParentalDebt(life, "refuse");
    case "expanded.debt-service-exit.confirm": return exitDebtService(life);
    case "expanded.debt-service-exit.keep": return debtServiceExitAvailable(life);
    default: return false;
  }
}

import {
  currentRequirementText,
  isMonetaryRequirement,
} from "./current-requirements";
import { expandedLabel } from "./expanded";
import type { Decision, Language, Life } from "../game/types";
import { decisionText } from "./story";
import { moneyText } from "./money";
import { courseDescription, fundingDescription, ew } from "./education";
import { quoteTraining, type TrainingQuote } from "../game/expanded/training";
import type { EducationQuote } from "../game/expanded/education-finance";
import { universityQuote } from "../game/expanded/education";
import { isOrdinaryRole } from "../game/expanded/career-access";
import { quoteSwordMentor } from "../game/expanded/sword-mentors";
import { swordApproach } from "../game/expanded/sword-events";
import { isSwordStyle } from "../game/expanded/sword-state";
import { swordMentorText } from "./sword";

function funding(q: EducationQuote, language: Language): string {
  const th = language === "th",
    m = (n: number) => moneyText(n, language);
  return th
    ? `รวม ${m(q.total)}: ค่าสมัคร ${m(q.admission)} ค่าเดินทาง ${m(q.travel)} ค่าเรียน ${m(q.tuition)} ค่าครองชีพ ${m(q.living)} ค่าเริ่มอาชีพ ${m(q.starterFee)} ครอบครัว ${m(q.family)} ส่วนตัว ${m(q.personal)} เงินกู้ ${m(q.loan)} เงินกู้จ่ายให้ผู้จัดการศึกษา ไม่เข้าเงินใช้จ่ายของคุณ`
    : `Total ${m(q.total)}: admission ${m(q.admission)}, travel ${m(q.travel)}, tuition ${m(q.tuition)}, living ${m(q.living)}, starter fee ${m(q.starterFee)}. Family ${m(q.family)} · Personal ${m(q.personal)} · Loan ${m(q.loan)}. Borrowed funds pay the provider, never your purse.`;
}
function course(q: TrainingQuote, language: Language): string {
  // Exact authored fragment, scoped to this quote; preserve duration/attendance copy.
  return courseDescription(q, language).replace(
    language === "th" ? "24 เหรียญต่อปี" : "24 coins/year",
    language === "th" ? "24 เหรียญเงินต่อปี" : "24 silver/year",
  );
}
const liveIntro: Record<string, readonly [string, string]> = {
  instruction: [
    "Eight silver buy a year of instruction. Readiness still limits the rank you can learn.",
    "ค่าเรียนแปดเหรียญเงินช่วยให้คุณฝึกกับผู้สอนหนึ่งปี แต่ระดับที่เรียนได้ยังขึ้นอยู่กับความพร้อม",
  ],
  aid: [
    "Eight silver secure two years of twelve additional household resources. This does not guarantee survival.",
    "แปดเหรียญเงินช่วยเพิ่มทรัพยากรครัวเรือนปีละสิบสองหน่วยเป็นเวลาสองปี แต่ไม่ได้รับประกันการรอดชีวิต",
  ],
  service: [
    "Voluntary military service pays thirty silver but carries a ten percent immediate fatal risk and may endanger dependants. You must decide manually.",
    "งานทหารโดยสมัครใจให้ค่าจ้างสามสิบเหรียญเงิน แต่มีโอกาสเสียชีวิตทันทีสิบเปอร์เซ็นต์และอาจทำให้ผู้พึ่งพาเดือดร้อน คุณต้องตัดสินใจด้วยตนเอง",
  ],
  assignment: [
    "An authored assignment pays twenty silver, but carries a five percent fatal risk. Unfulfilled obligations erode trust.",
    "ภารกิจที่แต่งขึ้นนี้ให้ค่าจ้างยี่สิบเหรียญเงิน แต่มีโอกาสเสียชีวิตห้าเปอร์เซ็นต์ การละเลยหน้าที่ทำให้ความไว้ใจลดลง",
  ],
};
/** Only current labels/descriptions: canonical choices, outcomes and history stay intact. */
export function currentDecisionText(
  decision: Decision,
  life: Life,
  language: Language,
): Decision {
  const d = decisionText(decision, life, language);
  if (life.ruleset !== "expanded-1" || !d.id.startsWith("expanded.")) return d;
  const key = d.id.slice(9),
    th = language === "th";
  const adaptQuote = (text: string, q: EducationQuote) =>
    text
      .replace(fundingDescription(q, language), funding(q, language))
      .replace(
        ew("policy", language),
        ew("policy", language).replace(
          th ? "1 เหรียญเมื่อ" : "1 coin when",
          th ? "1 เหรียญเงินเมื่อ" : "1 silver when",
        ),
      );
  const t = life.expansion.training;
  let quote: EducationQuote | undefined;
  if (key === "university") quote = universityQuote(life);
  if (key === "training-quote" && t?.selection)
    quote = quoteTraining(life, t.selection.role, t.selection.mode);
  const adapt = (text: string) => {
    let result = quote ? adaptQuote(text, quote) : text;
    if (key === "training-quote" && quote)
      result = result.replace(
        courseDescription(quote as TrainingQuote, language),
        course(quote as TrainingQuote, language),
      );
    if (key === "sword-mentor") {
      const q = quoteSwordMentor(life);
      if (q) {
        if (th)
          result = result.replace(
            `${q.fee} เหรียญ`,
            moneyText(q.fee, language),
          );
        const capital = q.requirements.find((r) => r.id === "capital");
        if (capital) {
          const values = `${capital.current}/${capital.required}`;
          result = result.replace(
            `${th ? "เงินส่วนตัว" : "Personal silver"}: ${values}`,
            `${th ? "เงินส่วนตัว" : "Personal silver"}: ${moneyText(values, language)}`,
          );
        }
      }
      swordMentorText(life, language).forEach((line, i) => {
        result = result.replace(line, swordMentorText(life, language, true)[i]);
      });
    }
    return result;
  };
  return {
    ...d,
    text: liveIntro[key]?.[th ? 1 : 0] ?? adapt(d.text),
    choices: d.choices.map((c) => {
      let label = adapt(c.label),
        description = adapt(c.description);
      const action = c.id.split(".")[2];
      if (quote && action?.startsWith("enroll") && quote.loan > 0)
        label = th
          ? `กู้ ${moneyText(quote.loan, language)}และ${key === "university" ? "เข้าเรียนมหาวิทยาลัย" : "เริ่มฝึก"}`
          : `Borrow ${moneyText(quote.loan, language)} and enroll${key === "university" ? " at university" : ""}`;
      if (key === "training") {
        const role = action?.startsWith("course-") ? action.slice(7) : null;
        if (role && isOrdinaryRole(role)) {
          const q = quoteTraining(life, role, "full-time");
          description = description.replace(
            courseDescription(q, language),
            course(q, language),
          );
        }
        if (action === "mode-full-time")
          description = th
            ? "24 เหรียญเงินต่อปีแทนค่าจ้างและความก้าวหน้าในงานเดิม"
            : "24 silver/year replaces regular wages and work progression.";
      }
      if (
        (key === "service" || key === "assignment") &&
        isSwordStyle(action) &&
        th
      ) {
        const a = swordApproach(life, key);
        if (a)
          description = `${a.th} ต้องใช้รูปแบบดาบที่เลือกขั้นสูงขึ้นไป ได้ ${moneyText(a.reward, language)}เมื่อสำเร็จ เสี่ยงเสียชีวิตทันที ${a.risk * 100}%`;
      }
      for (const r of c.requirements ?? []) {
        if (!isMonetaryRequirement(r.id)) continue;
        description = description.replace(
          `${expandedLabel(r.id, language)} ${Math.floor(r.current)}/${r.required}`,
          currentRequirementText(r, language, Math.floor, "/"),
        );
      }
      return { ...c, label, description };
    }),
  };
}

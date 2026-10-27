import type { Choice, Decision, ExpandedLife } from "../types";
import { ORDINARY_ROLES, isOrdinaryRole } from "./career-access";
import { ensureEducationAccess, emptyTraining } from "./education-access-state";
import {
  quoteTraining,
  enrollTraining,
  setTrainingMode,
  pauseTraining,
  withdrawTraining,
  placementRequirements,
  acceptTrainingPlacement,
} from "./training";
import {
  educationRequirements,
  scholarshipEligible,
  universityQuote,
  enrollUniversity,
} from "./education";
import { expandedLabel } from "../../i18n/expanded";
import {
  courseDescription,
  fundingDescription,
  ew,
  type EducationPair,
} from "../../i18n/education";

export function trainingDecision(l: ExpandedLife): Decision | null {
  const key = l.pending?.slice(9);
  if (
    l.phase !== "alive" ||
    l.age < 15 ||
    ![
      "training",
      "training-quote",
      "training-placement",
      "university",
    ].includes(key ?? "")
  )
    return null;
  const t = l.expansion.training ?? emptyTraining(l.expansion.birthYear);
  const copy: NonNullable<Decision["localized"]> = {
    title: "",
    text: "",
    choices: {},
  };
  const choices: Choice[] = [];
  const option = (
    action: string,
    label: EducationPair,
    description: EducationPair = [ew("recorded"), ew("recorded", "th")],
    disabled = false,
  ) => {
    const id = `expanded.${key}.${action}`;
    choices.push({
      id,
      label: label[0],
      description: description[0],
      outcome: ew("recorded"),
      disabled,
    });
    copy.choices[id] = {
      label: label[1],
      description: description[1],
      outcome: ew("recorded", "th"),
    };
  };
  let title: EducationPair = [ew("title"), ew("title", "th")],
    text: EducationPair = [ew("intro"), ew("intro", "th")];
  if (key === "training") {
    if (t.active) {
      const r = t.records[t.active];
      text = [
        `${expandedLabel(t.active)} · ${r.units} units. ${ew("refund")}`,
        `${expandedLabel(t.active, "th")} · ${r.units} หน่วย ${ew("refund", "th")}`,
      ];
      option(
        t.paused ? "resume" : "pause",
        t.paused
          ? [ew("resume"), ew("resume", "th")]
          : [ew("pause"), ew("pause", "th")],
      );
      option(
        "mode-full-time",
        [ew("full"), ew("full", "th")],
        [
          "24 coins/year replaces regular wages and work progression.",
          "24 เหรียญต่อปีแทนค่าจ้างและความก้าวหน้าในงานเดิม",
        ],
        t.mode === "full-time",
      );
      option(
        "mode-part-time",
        [ew("part"), ew("part", "th")],
        [
          "Keep your current job income; no stipend. Progress is half as fast.",
          "คงรายได้งานเดิม ไม่มีเบี้ยเลี้ยง ใช้เวลาฝึกเป็นสองเท่า",
        ],
        t.mode === "part-time",
      );
      option(
        "withdraw",
        [ew("withdraw"), ew("withdraw", "th")],
        [ew("refund"), ew("refund", "th")],
      );
    }
    for (const role of ORDINARY_ROLES) {
      const r = t.records[role];
      if (r.completedYear !== null) {
        option(
          `placement-${role}`,
          [
            `Review ${expandedLabel(role)} placement`,
            `ดูงาน${expandedLabel(role, "th")}หลังจบการฝึก`,
          ],
          [ew("placementInfo"), ew("placementInfo", "th")],
          l.expansion.career.role === role,
        );
        continue;
      }
      if (t.active === role) continue;
      const q = quoteTraining(l, role, "full-time");
      option(
        `course-${role}`,
        [
          `Train as ${expandedLabel(role)}`,
          `ฝึกเป็น${expandedLabel(role, "th")}`,
        ],
        [
          `${courseDescription(q, "en")} ${t.active ? "Switching refunds unused funds and retains progress." : ""}`,
          `${courseDescription(q, "th")} ${t.active ? "เปลี่ยนหลักสูตรจะคืนเงินที่ยังไม่ใช้และเก็บความก้าวหน้าเดิมไว้" : ""}`,
        ],
        l.expansion.education.stage === "university",
      );
    }
  } else if (key === "training-quote") {
    if (!t.selection) return null;
    const { role, mode } = t.selection,
      q = quoteTraining(l, role, mode);
    title = [
      `${ew("quote")}: ${expandedLabel(role)}`,
      `${ew("quote", "th")}: ${expandedLabel(role, "th")}`,
    ];
    text = [
      `${courseDescription(q, "en")} ${fundingDescription(q, "en")} ${ew("policy")}`,
      `${courseDescription(q, "th")} ${fundingDescription(q, "th")} ${ew("policy", "th")}`,
    ];
    option(
      "full-time",
      [ew("full"), ew("full", "th")],
      undefined,
      mode === "full-time",
    );
    option(
      "part-time",
      [ew("part"), ew("part", "th")],
      undefined,
      mode === "part-time",
    );
    option(
      q.loan ? "enroll-loan" : "enroll-funded",
      q.loan
        ? [
            `Borrow ${q.loan} coins and enroll`,
            `กู้ ${q.loan} เหรียญและเริ่มฝึก`,
          ]
        : ["Use quoted funds and enroll", "ใช้เงินตามใบเสนอและเริ่มฝึก"],
      [ew("refund"), ew("refund", "th")],
    );
    option("back", [ew("back"), ew("back", "th")]);
  } else if (key === "training-placement") {
    const role = t.selection?.role;
    if (!role || t.records[role].completedYear === null) return null;
    title = [ew("placement"), ew("placement", "th")];
    const missing = placementRequirements(l, role).filter((r) => !r.met);
    const requirements = (lang: "en" | "th") =>
      missing
        .map(
          (r) =>
            `${expandedLabel(r.id, lang)} ${Math.floor(r.current)}/${r.required}`,
        )
        .join("; ");
    text = [
      `${expandedLabel(role)}. ${ew("placementInfo")} ${requirements("en")} ${l.expansion.education.stage === "university" ? "Finish university or withdraw before accepting placement." : ""}`,
      `${expandedLabel(role, "th")}. ${ew("placementInfo", "th")} ${requirements("th")} ${l.expansion.education.stage === "university" ? "เรียนมหาวิทยาลัยให้จบหรือถอนตัวก่อนรับงาน" : ""}`,
    ];
    option(
      `accept-${role}`,
      [
        `Accept ${expandedLabel(role)} placement`,
        `รับงาน${expandedLabel(role, "th")}`,
      ],
      text,
      missing.length > 0 ||
        l.expansion.education.stage === "university" ||
        l.expansion.career.role === role,
    );
  } else {
    if (["university", "graduated"].includes(l.expansion.education.stage))
      return null;
    title = ["A place at university", "โอกาสเรียนมหาวิทยาลัย"];
    const q = universityQuote(l),
      missing = educationRequirements(l).filter(
        (r) => r.id !== "funding" && !r.met,
      );
    const desc = (lang: "en" | "th") =>
      `${scholarshipEligible(l)?(lang==="th"?"ทุนการศึกษาจ่ายค่าสมัคร ค่าเรียน ค่าครองชีพ และค่าเดินทางทั้งหมด ไม่ต้องกู้":"Scholarship covers admission, tuition, living and travel; no borrowing."):""} ${fundingDescription(q, lang)} ${ew("policy", lang)} ${missing.map((r) => `${expandedLabel(r.id, lang)} ${Math.floor(r.current)}/${r.required}`).join("; ")} ${l.expansion.training?.active ? (lang === "th" ? "ต้องถอนตัวจากการฝึกอาชีพก่อน" : "Withdraw from active career training before enrolling.") : ""}`;
    text = [desc("en"), desc("th")];
    option(
      "enroll",
      ["Accept a funded place", "รับโอกาสเรียนที่มีทุนพร้อม"],
      text,
      missing.length > 0 || q.loan > 0 || !!t.active,
    );
    if (q.loan > 0)
      option(
        "enroll-loan",
        [
          `Borrow ${q.loan} coins and enroll at university`,
          `กู้ ${q.loan} เหรียญและเข้าเรียนมหาวิทยาลัย`,
        ],
        text,
        missing.length > 0 || !!t.active,
      );
  }
  option("later", [ew("later"), ew("later", "th")]);
  copy.title = title[1];
  copy.text = text[1];
  return {
    id: l.pending!,
    kind: "Life",
    title: title[0],
    text: text[0],
    choices,
    requiresManual: true,
    localized: copy,
  };
}
export function applyTrainingChoice(l: ExpandedLife, id: string): boolean {
  const [, key, action] = id.split(".");
  if (
    ![
      "training",
      "training-quote",
      "training-placement",
      "university",
    ].includes(key)
  )
    return false;
  const { training: t } = ensureEducationAccess(l);
  const queue = (k: string) => {
    l.expansion.queue.unshift(`expanded.${k}`);
  };
  if (key === "university") {
    if (action === "enroll" || action === "enroll-loan")
      enrollUniversity(l, {
        quote: universityQuote(l),
        borrow: action === "enroll-loan",
      });
    return true;
  }
  if (action === "later") return true;
  if (key === "training") {
    const role = action.slice(action.indexOf("-") + 1);
    if (action.startsWith("course-") && isOrdinaryRole(role)) {
      t.selection = { role, mode: "full-time" };
      queue("training-quote");
    } else if (action.startsWith("placement-") && isOrdinaryRole(role)) {
      t.selection = { role, mode: t.mode };
      queue("training-placement");
    } else {
      if (action === "pause" || action === "resume")
        pauseTraining(l, action === "pause");
      if (action === "withdraw") withdrawTraining(l);
      if (action === "mode-full-time" || action === "mode-part-time")
        setTrainingMode(
          l,
          action === "mode-full-time" ? "full-time" : "part-time",
        );
      queue("training");
    }
  } else if (key === "training-quote" && t.selection) {
    if (action === "full-time" || action === "part-time") {
      t.selection.mode = action;
      queue("training-quote");
    }
    if (action === "back") queue("training");
    if (action === "enroll-funded" || action === "enroll-loan")
      enrollTraining(
        l,
        quoteTraining(l, t.selection.role, t.selection.mode),
        action === "enroll-loan",
      );
  } else if (
    key === "training-placement" &&
    action.startsWith("accept-") &&
    isOrdinaryRole(action.slice(7))
  ) {
    acceptTrainingPlacement(
      l,
      action.slice(7) as (typeof ORDINARY_ROLES)[number],
    );
  }
  return true;
}

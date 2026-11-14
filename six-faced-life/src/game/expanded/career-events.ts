import type { Choice, Decision, ExpandedLife, Language } from "../types";
import {
  CAREER_NODES,
  CAREER_PATHS,
  isCareerNode,
  isCareerPath,
} from "./career-catalogue";
import {
  careerNode,
  enterCareerNode,
  pathRequirements,
  promoteCareerNode,
} from "./career-paths";
import {
  applyCareerProject,
  careerProject,
  type CareerProjectKind,
} from "./career-work";
import { isOrdinaryRole } from "./career-access";
import {
  careerNodeText,
  careerPathText,
  careerProjectName,
  careerProjectText,
} from "../../i18n/careers";
import { currentRequirementText } from "../../i18n/current-requirements";
import { moneyText } from "../../i18n/money";
import { worldYear } from "./facts";
import { nobleFamilyFunds } from "./careers";

export function careerDecision(l: ExpandedLife): Decision | null {
  const s = l.expansion.careerPaths,
    key = l.pending?.slice(9);
  if (
    !s ||
    l.phase !== "alive" ||
    l.age < 15 ||
    !["career", "career-path", "career-work", "research", "training"].includes(
      key ?? "",
    )
  )
    return null;
  if (key === "training" && s.selection) return null;
  const choices: Choice[] = [],
    localized: NonNullable<Decision["localized"]> = {
      title: "",
      text: "",
      choices: {},
    };
  const option = (
    action: string,
    label: (lang: Language) => string,
    description: (lang: Language) => string,
    extra: Partial<Choice> = {},
  ) => {
    const id = `expanded.${key}.${action}`;
    const outcome = (lang: Language) =>
      lang === "th"
        ? "บันทึกการตัดสินใจและผลที่เกิดขึ้นจริง"
        : "Your decision and its actual effects are recorded.";
    choices.push({
      id,
      label: label("en"),
      description: description("en"),
      outcome: outcome("en"),
      ...extra,
    });
    localized.choices[id] = {
      label: label("th"),
      description: description("th"),
      outcome: outcome("th"),
    };
  };
  const noChange = (lang: Language) =>
    lang === "th"
      ? "ยังไม่เปลี่ยนงานหรือจ่ายเงิน"
      : "No job change or payment yet.";
  const later = (lang: Language) => (lang === "th" ? "ไว้ภายหลัง" : "Later");
  let title = ["Choose your career path", "เลือกเส้นทางอาชีพ"],
    text = [
      "Explore six paths. Each keeps its own earned progress.",
      "สำรวจหกเส้นทาง แต่ละสายเก็บความก้าวหน้าที่ได้รับไว้",
    ];
  if (key === "career" || key === "training") {
    if (key === "training")
      title = ["Choose a training path", "เลือกเส้นทางฝึกอาชีพ"];
    for (const p of CAREER_PATHS)
      option(`path-${p.id}`, (lang) => careerPathText(p.id, lang), noChange);
    if (key === "training" && l.expansion.training?.active)
      option(
        "manage",
        (lang) =>
          lang === "th" ? "จัดการหลักสูตรปัจจุบัน" : "Manage current course",
        noChange,
      );
    if (key === "career" && careerProject(l, "safe"))
      option(
        "work",
        (lang) => (lang === "th" ? "งานประจำสายอาชีพ" : "Career work"),
        noChange,
      );
  } else if (key === "career-path") {
    if (!s.selection) return null;
    title = [
      careerPathText(s.selection, "en"),
      careerPathText(s.selection, "th"),
    ];
    const nodes = Object.values(CAREER_NODES).filter(
      (n) => n.path === s.selection,
    );
    for (const n of nodes) {
      const active = s.active === n.id,
        earned = !!s.earned[n.id],
        promotion = !!n.predecessor && n.predecessor === s.active && !earned;
      const requirements = pathRequirements(l, n.id);
      const enterable =
        !n.predecessor || earned || n.id === "knight" || n.id === "professor";
      const desc = (lang: Language) =>
        `${moneyText(Math.max(n.pay, s.payFloor[n.occupation] ?? 0), lang)} ${lang === "th" ? "ต่อปี ก่อนหักค่าใช้จ่าย" : "per year before living costs"}. ${requirements.map((r) => currentRequirementText(r, lang)).join("; ")}. ${n.id.startsWith("adventure-") && !n.predecessor ? (lang === "th" ? "ผู้สมัครใหม่เริ่มที่แรงก์ F" : "New guild members start at F.") : ""}`;
      const fee =
        l.expansion.career.role === n.occupation
          ? 0
          : n.occupation === "merchant"
            ? 10
            : n.occupation === "adventurer"
              ? 5
              : n.occupation === "knight"
                ? Math.max(
                    0,
                    120 - nobleFamilyFunds(l),
                  )
                : 0;
      option(
        `${promotion ? "promote" : "enter"}-${n.id}`,
        (lang) =>
          `${active ? (lang === "th" ? "ปัจจุบัน: " : "Current: ") : promotion ? (lang === "th" ? "เลื่อนเป็น " : "Advance to ") : ""}${careerNodeText(n.id, lang)}`,
        (lang) =>
          `${desc(lang)} ${lang === "th" ? "ค่าเริ่มงาน" : "Entry cost"}: ${moneyText(fee, lang)}.`,
        {
          requirements,
          vacancy: !requirements.some((r) => r.id === "vacancy" && !r.met),
          disabled:
            active ||
            (!promotion && !enterable) ||
            requirements.some((r) => !r.met) ||
            l.expansion.education.stage === "university",
          cost: fee,
        },
      );
    }
    const roles = [
      ...new Set(nodes.map((n) => n.occupation).filter(isOrdinaryRole)),
    ];
    for (const role of roles)
      option(
        `train-${role}`,
        (lang) =>
          lang === "th"
            ? `ฝึกอาชีพ: ${careerNodeText(nodes.find((n) => n.occupation === role)!.id, lang)}`
            : `Training: ${careerNodeText(nodes.find((n) => n.occupation === role)!.id, lang)}`,
        noChange,
        { disabled: l.expansion.education.stage === "university" },
      );
    option(
      "back",
      (lang) => (lang === "th" ? "ทุกเส้นทาง" : "All paths"),
      noChange,
    );
  } else {
    title =
      key === "research"
        ? ["Research project", "โครงการวิจัย"]
        : ["Career work", "งานประจำสายอาชีพ"];
    text = [
      "Choose one project this year. Review the cost and possible outcomes before committing.",
      "เลือกทำหนึ่งโครงการในปีนี้ ตรวจสอบค่าใช้จ่ายและผลที่อาจเกิดขึ้นก่อนยืนยัน",
    ];
    for (const kind of (key === "research"
      ? ["research"]
      : ["safe", "risk"]) as CareerProjectKind[]) {
      const q = careerProject(l, kind);
      if (!q) continue;
      option(
        key === "research" ? "accept" : kind,
        (lang) => careerProjectName(q.branch, kind !== "safe", lang),
        (lang) => careerProjectText(q, lang),
        { cost: q.cost, disabled: l.coins < q.cost },
      );
    }
    if (choices.length === 0)
      text = [
        "No project is available now. A project may already be recorded for this year, or work is paused for study/training.",
        "ขณะนี้ยังทำโครงการไม่ได้ อาจทำไปแล้วในปีนี้ หรือกำลังพักงานเพื่อเรียนหรือฝึกเต็มเวลา",
      ];
  }
  option("later", later, (lang) =>
    lang === "th"
      ? "เลื่อนไว้ก่อนได้ เก็บความก้าวหน้าเดิม"
      : "Defer this choice and keep your progress.",
  );
  localized.title = title[1];
  localized.text = text[1];
  return {
    id: l.pending!,
    kind: "Life",
    title: title[0],
    text: text[0],
    choices,
    requiresManual: true,
    localized,
  };
}
export function applyCareerChoice(l: ExpandedLife, id: string): boolean {
  const s = l.expansion.careerPaths;
  if (!s) return false;
  const [, key, action] = id.split(".");
  if (
    !action ||
    !["career", "career-path", "career-work", "research", "training"].includes(
      key,
    )
  )
    return false;
  const queue = (key: string) => {
    if (!l.expansion.queue.includes(`expanded.${key}`))
      l.expansion.queue.unshift(`expanded.${key}`);
  };
  if (
    action.startsWith("path-") &&
    (key === "career" || key === "training") &&
    isCareerPath(action.slice(5))
  ) {
    s.selection = action.slice(5) as typeof s.selection;
    queue(key === "training" ? "training" : "career-path");
    return true;
  }
  if (key === "training") {
    if (action === "paths") {
      s.selection = null;
      queue("training");
      return true;
    }
    if (action === "manage" && l.expansion.training?.active) {
      const n = Object.values(CAREER_NODES).find(
        (n) => n.occupation === l.expansion.training!.active && n.path,
      );
      s.selection = n?.path ?? "magic";
      queue("training");
      return true;
    }
    return false;
  }
  if (key === "research" && action === "accept")
    return applyCareerProject(l, "research");
  if (key === "career-work")
    return (
      action === "later" ||
      ((action === "safe" || action === "risk") &&
        applyCareerProject(l, action))
    );
  if (key === "career" && action === "work") {
    queue("career-work");
    return true;
  }
  if (action === "later") return true;
  if (key !== "career-path") return false;
  if (action === "back") {
    s.selection = null;
    queue("career");
    return true;
  }
  if (action.startsWith("train-") && s.selection) {
    const role = action.slice(6),
      t = l.expansion.training;
    if (
      !isOrdinaryRole(role) ||
      !t ||
      !Object.values(CAREER_NODES).some(
        (n) => n.path === s.selection && n.occupation === role,
      )
    )
      return false;
    if (
      role === "teacher" &&
      t.records.teacher.units === 0 &&
      t.records.teacher.completedYear === null &&
      t.active !== "teacher"
    ) {
      const magic = s.selection === "magic";
      s.teacherCourse = {
        kind: magic ? "magic" : "sword",
        school: magic ? l.expansion.study : null,
      };
    }
    t.selection = { role, mode: t.mode };
    queue(
      t.active === role
        ? "training"
        : t.records[role].completedYear !== null
          ? "training-placement"
          : "training-quote",
    );
    return true;
  }
  const promotion = action.startsWith("promote-"),
    target = action.slice(promotion ? 8 : 6);
  if (
    (promotion || action.startsWith("enter-")) &&
    isCareerNode(target) &&
    CAREER_NODES[target].path === s.selection
  )
    return promotion
      ? promoteCareerNode(l, target)
      : enterCareerNode(l, target);
  return false;
}

/** Used only by view feedback; cannot generate a work result. */
export function careerWorkAvailable(l: ExpandedLife): boolean {
  return (
    !!careerProject(l, "safe") &&
    l.expansion.careerPaths!.lastProjectYear < worldYear(l) &&
    !!careerNode(l)
  );
}

import type { Choice, Decision, ExpandedLife } from "../types";
import {
  allocateSwordStyle,
  isSwordStyle,
  SWORD_STYLES,
  SWORD_XP,
  swordRank,
  type SwordStyle,
} from "./sword-state";
import { serviceRecord } from "./history";
import { draw, clamp } from "./random";
import { fact } from "./facts";
import {
  quoteSwordMentor,
  enrollSwordMentor,
  completeSwordTrial,
  abandonSwordMentorship,
  SWORD_MENTORS,
} from "./sword-mentors";
import { ordinaryEntry } from "./career-access";
import {
  swordStyleName,
  swordRankName,
  swordMentorText,
} from "../../i18n/sword";
export function queueReadySwordTrial(l: ExpandedLife): void {
  const s = l.expansion.swords,
    m = s?.mentorship;
  if (
    l.phase !== "alive" ||
    !m ||
    m.progress !== 1 ||
    m.deferred ||
    s!.selected !== m.style ||
    l.region !== SWORD_MENTORS[m.style].region ||
    l.pending === "expanded.sword-trial" ||
    l.expansion.queue.includes("expanded.sword-trial") ||
    l.expansion.queue.length >= 16
  )
    return;
  l.expansion.queue.push("expanded.sword-trial");
}
export function swordDecision(l: ExpandedLife): Decision | null {
  const s = l.expansion.swords;
  if (!s || l.phase !== "alive" || !l.pending) return null;
  const key = l.pending.slice(9),
    role = l.expansion.training?.selection?.role;
  const initial =
    !s.selected &&
    (!s.legacy || key === "sword-select") &&
    l.age >= 5 &&
    (key === "practice" ||
      key === "sword-select" ||
      (key === "training-quote" && role && ordinaryEntry(role).sword));
  if (
    !initial &&
    !["sword-mentor", "sword-trial", "sword-abandon", "sword-select"].includes(
      key,
    )
  )
    return null;
  const choices: Choice[] = [],
    localized: NonNullable<Decision["localized"]> = {
      title: "",
      text: "",
      choices: {},
    };
  const option = (
    action: string,
    en: string,
    th: string,
    desc: string,
    descTh: string,
    extra: Partial<Choice> = {},
  ) => {
    const id = `expanded.${key}.${action}`;
    choices.push({ id, label: en, description: desc, outcome: desc, ...extra });
    localized.choices[id] = { label: th, description: descTh, outcome: descTh };
  };
  let title = "Sword mentorship",
    titleTh = "ฝึกดาบกับอาจารย์",
    text = "",
    textTh = "";
  if (initial) {
    title = "Choose your sword style";
    titleTh = "เลือกรูปแบบวิชาดาบ";
    text =
      "Practice one style at a time. Each keeps its own experience. Self-practice reaches Advanced.";
    textTh =
      "ฝึกครั้งละหนึ่งรูปแบบ แต่ละรูปแบบเก็บประสบการณ์แยกกัน ฝึกเองได้ถึงขั้นสูง";
    for (const style of SWORD_STYLES)
      option(
        style,
        swordStyleName(style, "en"),
        swordStyleName(style, "th"),
        text,
        textTh,
        { swordXp: key === "practice" ? 12 : undefined },
      );
    if (key === "practice")
      option(
        "magic",
        "Practice magic",
        "ฝึกเวทมนตร์",
        "Develop magic instead.",
        "พัฒนาเวทมนตร์แทน",
        { magicXp: 12 },
      );
  } else if (key === "sword-select") return null;
  else if (key === "sword-abandon") {
    title = "Abandon this mentorship?";
    titleTh = "ยกเลิกการฝึกกับอาจารย์หรือไม่";
    text =
      "Forfeit the paid fee and unfinished training time. Keep all sword experience and earned ranks.";
    textTh =
      "เสียค่าฝึกที่จ่ายแล้วและเวลาฝึกที่ยังไม่สำเร็จ เก็บประสบการณ์และระดับดาบที่ได้มาไว้";
    option(
      "confirm",
      "Abandon mentorship",
      "ยืนยันยกเลิกการฝึก",
      text,
      textTh,
      { disabled: !s.mentorship },
    );
  } else if (key === "sword-trial") {
    const m = s.mentorship;
    if (!m) return null;
    const name = SWORD_MENTORS[m.style];
    title = `${swordRankName(m.target, "en")} trial — ${swordStyleName(m.style, "en")}`;
    titleTh = `ทดสอบ${swordRankName(m.target, "th")} — ${swordStyleName(m.style, "th")}`;
    const scene: Record<SwordStyle, [string, string]> = {
      "sword-god": [
        "Across the chalk line, you gather your strength into one committed advance.",
        "หน้าเส้นชอล์ก คุณรวบรวมกำลังแล้วก้าวเข้าฟันอย่างเด็ดเดี่ยว",
      ],
      "water-god": [
        "You hold the quiet center, turning each measured strike away from your partner.",
        "คุณตั้งรับอย่างสงบ เบี่ยงการโจมตีแต่ละครั้งให้พ้นคู่ฝึก",
      ],
      "north-god": [
        "You read the uneven ground, change your angle and finish the assigned route.",
        "คุณอ่านพื้นขรุขระ เปลี่ยนมุมเข้าหาและผ่านเส้นทางที่ได้รับมอบหมาย",
      ],
    };
    text = `${name.en} watches. ${scene[m.style][0]} This manual trial guarantees the next rank, costs nothing more, and cannot injure you.`;
    textTh = `${name.th} เฝ้าดู ${scene[m.style][1]} การทดสอบด้วยตนเองผ่านแน่นอนเมื่อครบเงื่อนไข ไม่มีค่าใช้จ่ายเพิ่มและไม่ทำให้บาดเจ็บ`;
    const t = s.tracks[m.style];
    option("complete", "Complete the trial", "เข้าทดสอบ", text, textTh, {
      disabled:
        m.progress !== 1 ||
        s.selected !== m.style ||
        l.region !== name.region ||
        t.xp < SWORD_XP[m.target] ||
        t.cap !== m.target - 1 ||
        l.expansion.genetics.auraImpaired,
    });
    option(
      "defer",
      "Defer the trial",
      "เลื่อนการทดสอบ",
      "Keep your paid access and completed training. Seek the mentor when ready.",
      "เก็บสิทธิ์และเวลาฝึกไว้ กลับมาหาอาจารย์เมื่อพร้อม",
    );
  } else {
    const regions = {
      asura: ["Asura", "อัสรา"],
      millis: ["Millis", "มิลิส"],
      demon: ["Demon Continent", "ทวีปปีศาจ"],
    };
    text =
      SWORD_STYLES.map(
        (k) =>
          `${swordStyleName(k, "en")}: ${SWORD_MENTORS[k].en}, ${regions[SWORD_MENTORS[k].region as keyof typeof regions][0]}`,
      ).join("; ") +
      ". One eligible year per promotion, alongside employment with sword focus. Normal life hazards remain. Travel still requires age 18. Original game teachers and balance.";
    textTh =
      SWORD_STYLES.map(
        (k) =>
          `${swordStyleName(k, "th")}: ${SWORD_MENTORS[k].th} ${regions[SWORD_MENTORS[k].region as keyof typeof regions][1]}`,
      ).join("; ") +
      " แต่ละระดับใช้เวลาฝึกที่เข้าเงื่อนไขหนึ่งปีพร้อมทำงานเดิม โดยเลือกเป้าหมายฝึกดาบ อันตรายตามปกติยังมีผล ย้ายถิ่นได้เมื่ออายุ 18 ปี อาจารย์และสมดุลนี้แต่งขึ้นสำหรับเกม";
    if (s.mentorship) {
      text += " " + swordMentorText(l, "en").join(". ");
      textTh += " " + swordMentorText(l, "th").join(" ");
      if (s.mentorship.progress === 1)
        option(
          "trial",
          "Review ready trial",
          "ดูการทดสอบที่พร้อม",
          "Open the manual trial without another payment.",
          "เปิดการทดสอบด้วยตนเอง ไม่จ่ายซ้ำ",
          {
            disabled:
              s.selected !== s.mentorship.style ||
              l.region !== SWORD_MENTORS[s.mentorship.style].region,
          },
        );
      option(
        "abandon",
        "Review abandonment",
        "ดูการยกเลิกการฝึก",
        "Review the lost fee and time before confirming.",
        "ตรวจสอบค่าฝึกและเวลาที่จะเสียก่อนยืนยัน",
      );
    } else {
      const q = quoteSwordMentor(l);
      if (q) {
        const names: Record<string, [string, string]> = {
          age: ["Age", "อายุ"],
          instruction: ["Prior rank", "ระดับก่อนหน้า"],
          sword: ["Style experience", "ประสบการณ์รูปแบบนี้"],
          location: ["At mentor region", "ต้องอยู่ในภูมิภาคอาจารย์"],
          capital: ["Personal silver", "เงินส่วนตัว"],
          aura: ["Aura available", "ใช้พลังต่อสู้ได้"],
          mentorship: ["No other mentorship", "ไม่มีการฝึกกับอาจารย์อื่น"],
        };
        const requirements = (th: boolean) =>
          q.requirements
            .map((r) =>
              r.id === "instruction"
                ? `${names[r.id][th ? 1 : 0]}: ${swordRankName(r.current, th ? "th" : "en")} / ${swordRankName(r.required, th ? "th" : "en")}`
                : `${names[r.id][th ? 1 : 0]}: ${r.current}/${r.required}${r.met ? "" : th ? " (ยังไม่ครบ)" : " (unmet)"}`,
            )
            .join("; ");
        const req = requirements(false);
        const reqTh = requirements(true);
        const desc = `${swordStyleName(q.style, "en")} → ${swordRankName(q.target, "en")}. Pay ${q.fee} silver once; train one eligible year, then manually pass the guaranteed trial. ${req}`;
        const descTh = `${swordStyleName(q.style, "th")} → ${swordRankName(q.target, "th")} จ่าย ${q.fee} เหรียญครั้งเดียว ฝึกหนึ่งปีที่เข้าเงื่อนไขแล้วทดสอบด้วยตนเอง ผ่านแน่นอนเมื่อครบเงื่อนไข ${reqTh}`;
        text += " " + desc;
        textTh += " " + descTh;
        option(
          "enroll",
          `Enroll — ${q.fee} silver`,
          `สมัครฝึก — ${q.fee} เหรียญ`,
          desc,
          descTh,
          {
            cost: q.fee,
            requirements: q.requirements,
            disabled: q.requirements.some((r) => !r.met),
          },
        );
      } else {
        text +=
          " Select a style between events; God rank needs no further mentorship.";
        textTh += " เลือกรูปแบบดาบระหว่างเหตุการณ์ ชั้นเทพไม่ต้องสมัครฝึกเพิ่ม";
      }
    }
  }
  if (key !== "sword-trial" && key !== "practice")
    option(
      "later",
      "Leave without commitment",
      "ออกโดยไม่ยืนยัน",
      "No payment; existing progress remains.",
      "ไม่จ่ายเงิน เก็บความก้าวหน้าเดิมไว้",
    );
  localized.title = titleTh;
  localized.text = textTh;
  return {
    id: l.pending,
    kind: "Life",
    title,
    text,
    choices,
    localized,
    requiresManual: true,
  };
}
export function applySwordChoice(l: ExpandedLife, id: string): boolean {
  const [, key, action] = id.split("."),
    s = l.expansion.swords;
  if (!s) return false;
  const queue = (k: string) => {
    if (!l.expansion.queue.includes(`expanded.${k}`))
      l.expansion.queue.unshift(`expanded.${k}`);
  };
  if (
    ["practice", "sword-select", "training-quote"].includes(key) &&
    isSwordStyle(action) &&
    !s.selected &&
    (!s.legacy || key === "sword-select")
  ) {
    allocateSwordStyle(l, action);
    if (key === "sword-select") l.focus = "sword";
    if (key === "training-quote") queue("training-quote");
    return true;
  }
  if (key === "sword-mentor") {
    if (action === "enroll") {
      const q = quoteSwordMentor(l);
      if (q) enrollSwordMentor(l, q);
    }
    if (action === "trial") {
      if (s.mentorship) s.mentorship.deferred = false;
      queue("sword-trial");
    }
    if (action === "abandon") queue("sword-abandon");
    return true;
  }
  if (key === "sword-trial") {
    if (action === "complete") completeSwordTrial(l);
    if (action === "defer" && s.mentorship) s.mentorship.deferred = true;
    return true;
  }
  if (key === "sword-abandon") {
    if (action === "confirm") abandonSwordMentorship(l);
    return true;
  }
  return false;
}
export interface SwordApproach {
  style: SwordStyle;
  risk: number;
  reward: number;
  reputation: number;
  serviceCredit: number;
  obligations: number;
  trust: number;
  en: string;
  th: string;
}
export function swordApproach(
  l: ExpandedLife,
  event: "service" | "assignment",
): SwordApproach | null {
  const s = l.expansion.swords,
    style = s?.selected;
  if (
    !s ||
    !style ||
    s.compatibilityDecision?.id === `expanded.${event}` ||
    l.age < 18 ||
    swordRank(s.tracks[style]) < 2
  )
    return null;
  const assignment = event === "assignment",
    scout = style === "north-god";
  return {
    style,
    risk: scout
      ? 0
      : style === "water-god"
        ? assignment
          ? 0.025
          : 0.05
        : assignment
          ? 0.05
          : 0.1,
    reward: scout
      ? assignment
        ? 6
        : 10
      : style === "sword-god"
        ? assignment
          ? 30
          : 40
        : assignment
          ? 20
          : 30,
    reputation: scout ? 0 : 8,
    serviceCredit: scout ? 0 : 1,
    obligations: assignment ? (scout ? 1 : 3) : 0,
    trust: assignment && !scout ? 10 : 0,
    en:
      style === "sword-god"
        ? "Take the offensive"
        : style === "water-god"
          ? "Protect the team"
          : "Complete a limited scouting task",
    th:
      style === "sword-god"
        ? "บุกเข้าจู่โจม"
        : style === "water-god"
          ? "ปกป้องทีม"
          : "ลาดตระเวนในขอบเขตจำกัด",
  };
}
export function applySwordApproach(
  l: ExpandedLife,
  event: "service" | "assignment",
  style: SwordStyle,
): string | null {
  const a = swordApproach(l, event);
  if (
    !a ||
    a.style !== style ||
    l.phase !== "alive" ||
    (event === "service" ? !serviceRecord(l) : !l.expansion.politics.faction)
  )
    return null;
  const x = l.expansion,
    h = event === "service" ? serviceRecord(l) : undefined;
  if (a.risk && draw(l) < a.risk) {
    l.stats.health = 0;
    if (event === "service") x.serviceContext = null;
    return event;
  }
  l.coins = clamp(l.coins + a.reward, 0, 1_000_000);
  x.standing.service = Math.min(1000, x.standing.service + a.serviceCredit);
  x.standing.reputation = clamp(x.standing.reputation + a.reputation);
  x.politics.obligations = Math.max(0, x.politics.obligations - a.obligations);
  x.politics.trust = clamp(x.politics.trust + a.trust);
  if (a.serviceCredit) {
    const feat = `${event}-${l.region}`;
    if (!x.standing.feats.includes(feat) && x.standing.feats.length < 64)
      x.standing.feats.push(feat);
  }
  if (h) h.exposure = a.serviceCredit ? "participant" : "support";
  if (event === "service") x.serviceContext = null;
  fact(
    l,
    a.serviceCredit ? "achievement" : "history",
    a.serviceCredit ? event : "scouting",
    style,
  );
  return null;
}

import type { Choice, ExpandedLife, Language } from "../game/types";
import { PAY, HAZARDS } from "../game/expanded/balance";
import type { Occupation } from "../game/expanded/types";
import { titleEligible, titleWinChance } from "../game/expanded/politics";
import { worldYear } from "../game/expanded/facts";
import { expandedLabel } from "./expanded";
import { effectDelta, effectNumber, effectText } from "./effect-text";
import { swordApproach } from "../game/expanded/sword-events";
import { isSwordStyle } from "../game/expanded/sword-state";

export function expandedChoiceEffects(
  l: ExpandedLife,
  c: Choice,
  language: Language,
): string[] {
  const [, key, action] = c.id.split(".");
  const x = l.expansion,
    y = worldYear(l);
  const text = (en: string, th: string) => effectText(language, en, th);
  if ((key === "service" || key === "assignment") && isSwordStyle(action)) {
    const a = swordApproach(l, key);
    if (!a) return [];
    return [
      text(
        `Selected style Advanced+; immediate fatal risk ${a.risk * 100}%; success: ${a.reward} silver, reputation +${a.reputation}, service +${a.serviceCredit}, obligations −${a.obligations}, faction trust +${a.trust}`,
        `รูปแบบดาบที่เลือกต้องขั้นสูงขึ้นไป เสี่ยงเสียชีวิตทันที ${a.risk * 100}% เมื่อสำเร็จ: เงิน ${a.reward} เหรียญ ชื่อเสียง +${a.reputation} งานรับใช้ +${a.serviceCredit} ภาระหน้าที่ −${a.obligations} ความไว้ใจของฝ่าย +${a.trust}`,
      ),
    ];
  }
  if (
    key === "sword-mentor" ||
    key === "sword-trial" ||
    key === "sword-abandon" ||
    key === "sword-select"
  )
    return [
      language === "th"
        ? c.description === c.outcome
          ? c.description
          : c.outcome
        : c.description,
    ];
  if (
    key === "instruction" &&
    action === "sword" &&
    x.swords &&
    !x.swords.compatibilityDecision
  )
    return [
      text(
        "Opens sword mentor requirements; no payment or rank granted yet",
        "เปิดเงื่อนไขอาจารย์ดาบ ยังไม่จ่ายเงินหรือเพิ่มระดับ",
      ),
    ];
  const delta = (en: string, th: string, current: number, gain: number) =>
    text(
      effectDelta(
        "en",
        en,
        Math.max(0, Math.min(100, current + gain)) - current,
      ),
      effectDelta(
        "th",
        th,
        Math.max(0, Math.min(100, current + gain)) - current,
      ),
    );
  const menu = text(
    "Opens another decision; no commitment yet",
    "เปิดตัวเลือกถัดไป ยังไม่ยืนยันรับข้อเสนอ",
  );
  const none = text(
    "No immediate change; existing effects and obligations continue",
    "ไม่มีการเปลี่ยนแปลงทันที ผลเดิมและหน้าที่ที่มีอยู่ยังคงดำเนินต่อ",
  );
  const focus = (name: string, th: string) =>
    text(
      `Focus → ${name}, until you change it`,
      `เป้าหมายประจำปี → ${th} จนกว่าคุณจะเปลี่ยน`,
    );
  const bonds = () => [
    focus("Family & friends", "ครอบครัวและเพื่อน"),
    text(
      "Yearly focus gains: Bonds +4, Happiness +3; replaces previous focus gains",
      "ผลจากเป้าหมายในแต่ละปี: สายสัมพันธ์ +4 ความสุข +3 แทนผลจากเป้าหมายเดิม",
    ),
  ];
  const protection = (end: number) =>
    text(
      `Violence risk ×0.5 through K${end}; other hazards remain`,
      `ความเสี่ยงความรุนแรง ×0.5 ถึงปี K${end} อันตรายอื่นยังคงอยู่`,
    );
  const stipend = () =>
    x.training?.active && !x.training.paused && x.training.mode === "full-time"
      ? [
          text(
            "Full-time training still replaces job wages with its 24/year stipend",
            "ระหว่างฝึกเต็มเวลา ยังคงรับเบี้ยเลี้ยง 24 ต่อปีแทนค่าจ้างงาน",
          ),
        ]
      : [];
  const job = (role: Occupation) => {
    const pay =
      PAY[role] +
      (PAY[role] > 0 ? [0, 8, 18, 32][x.career.records[role].level] : 0);
    return [
      text(
        `Occupation → ${expandedLabel(role)}; replaces your current job`,
        `อาชีพ → ${expandedLabel(role, "th")} แทนงานปัจจุบัน`,
      ),
      text(
        `Job pay ${pay} silver/year before expenses and work-focus bonus`,
        `ค่าจ้างงาน ${pay} เหรียญต่อปี ก่อนหักค่าใช้จ่ายและโบนัสเป้าหมายทำงาน`,
      ),
      ...stipend(),
    ];
  };
  if (action === "later") return [none];
  if (
    key === "opportunity" ||
    (key === "work" && action === "career") ||
    (key === "career" && action === "training")
  )
    return [menu];
  if (key === "reading" && action === "learn")
    return [text("Basic education unlocked", "ปลดล็อกการศึกษาขั้นพื้นฐาน")];
  if (key === "assessment")
    return [
      text(
        "Reveals your assessment score and talent; grants no new talent",
        "แสดงคะแนนประเมินและพรสวรรค์ที่มีอยู่ ไม่ได้มอบพรสวรรค์ใหม่",
      ),
    ];
  if (key === "school-year")
    return [
      focus("Read & learn", "อ่านและเรียนรู้"),
      text(
        "Study supports university progress; no immediate year is skipped",
        "เป้าหมายเรียนช่วยให้ก้าวหน้าในมหาวิทยาลัย ไม่ข้ามปีทันที",
      ),
    ];
  if (key === "work" && (action === "farmer" || action === "laborer"))
    return job(action);
  if (key === "career") {
    if (action.startsWith("job-")) return job(action.slice(4) as Occupation);
    const role = x.career.role,
      level = Math.min(3, x.career.records[role].level + 1);
    const pay = PAY[role] + (PAY[role] > 0 ? [0, 8, 18, 32][level] : 0);
    const oldPay =
      PAY[role] +
      (PAY[role] > 0 ? [0, 8, 18, 32][x.career.records[role].level] : 0);
    return [
      text(
        `Job level → ${level}; Job base pay ${oldPay} → ${pay} silver/year before work-focus bonus`,
        `ระดับงาน → ${level} ค่าจ้างงานพื้นฐาน ${oldPay} → ${pay} เหรียญต่อปี ก่อนโบนัสเป้าหมายทำงาน`,
      ),
      ...stipend(),
    ];
  }
  if (key === "instruction") {
    const magic = action === "magic",
      cap = l.training[magic ? "magicCap" : "swordCap"];
    return [
      text(
        `${magic ? "Magic" : "Sword"} instruction cap ${cap} → ${cap + 1}; no immediate experience gain`,
        `เพดานการเรียน${magic ? "เวทมนตร์" : "ดาบ"} ${cap} → ${cap + 1} ไม่ได้เพิ่มประสบการณ์ทันที`,
      ),
    ];
  }
  if (key === "aid")
    return [
      text(
        `Household resources +12/year through K${y + 2}; covers necessities before savings`,
        `ทรัพยากรครัวเรือน +12 ต่อปี ถึงปี K${y + 2} ใช้จ่ายปัจจัยจำเป็นก่อนเงินออม`,
      ),
    ];
  if (key === "protection")
    return [protection(Math.max(x.economy.protectionUntil, y + 3)), ...bonds()];
  if (key === "travel")
    return [
      text(
        "Moves your household to the selected region",
        "ย้ายครัวเรือนไปยังภูมิภาคที่เลือก",
      ),
      text(
        `Travel fatal risk ${effectNumber(HAZARDS.travel * 100)}% per year through K${y + 1}`,
        `เสี่ยงเสียชีวิตระหว่างเดินทาง ${effectNumber(HAZARDS.travel * 100)}% ต่อปี ถึงปี K${y + 1}`,
      ),
    ];
  if (["calamity", "succession", "conflict"].includes(key)) {
    if (action === "aid")
      return [
        delta("Reputation", "ชื่อเสียง", x.standing.reputation, 5),
        delta("Public trust", "ความไว้ใจของชุมชน", x.standing.trust, 5),
        text(
          "Recorded as relief support",
          "บันทึกว่าให้ความช่วยเหลือบรรเทาทุกข์",
        ),
      ];
    if (action === "service") return [menu];
    return [
      key === "conflict"
        ? protection(y + 1)
        : text(
            "Civilian response recorded; no additional protection or stat gain",
            "บันทึกการรับมือในฐานะพลเรือน ไม่เพิ่มความคุ้มครองหรือค่าสถานะ",
          ),
    ];
  }
  if (key === "orsted" || key === "hitogami")
    return action === "accept"
      ? [
          text(
            `Join ${expandedLabel(key)}; faction trust → 20; obligations → 1`,
            `เข้าร่วม${expandedLabel(key, "th")} ความไว้ใจของฝ่าย → 20 หน้าที่ผูกพัน → 1`,
          ),
          text(
            "Obligations grow yearly; neglect reduces trust and can trigger pursuit",
            "หน้าที่เพิ่มทุกปี การละเลยลดความไว้ใจและอาจนำไปสู่การไล่ล่า",
          ),
        ]
      : [
          text(
            "Remain unaffiliated; this faction cannot offer again for 5 years",
            "ไม่เข้าร่วมฝ่ายนี้ และฝ่ายนี้จะไม่เสนออีกเป็นเวลา 5 ปี",
          ),
        ];
  if (key === "defect")
    return [
      text(
        `Leave faction; faction trust → 0; obligations → 0; pursuit through K${y + 3}`,
        `ออกจากฝ่าย ความไว้ใจของฝ่าย → 0 หน้าที่ → 0 ถูกไล่ล่าถึงปี K${y + 3}`,
      ),
      text(
        "Pursuit adds 2 percentage points to yearly violence risk before protection; adds an enemy",
        "การไล่ล่าเพิ่มความเสี่ยงความรุนแรงรายปี 2 จุดเปอร์เซ็นต์ก่อนหักผลคุ้มครอง และเพิ่มศัตรูหนึ่งคน",
      ),
    ];
  if (key === "service" || key === "assignment") {
    const assignment = key === "assignment",
      coins = assignment ? 20 : 30;
    const rewards = [
      `${coins} ${text("silver", "เหรียญ")}`,
      delta("Reputation", "ชื่อเสียง", x.standing.reputation, 8),
      text("Service +1", "งานรับใช้ +1"),
    ];
    if (assignment)
      rewards.push(
        delta("Faction trust", "ความไว้ใจของฝ่าย", x.politics.trust, 10),
        text(
          `Obligations −${Math.min(3, x.politics.obligations)}`,
          `หน้าที่ −${Math.min(3, x.politics.obligations)}`,
        ),
      );
    return [
      text(
        `${effectNumber((c.risk ?? 0) * 100)}% immediate fatal risk`,
        `เสี่ยงเสียชีวิตทันที ${effectNumber((c.risk ?? 0) * 100)}%`,
      ),
      text(
        `If you survive: ${rewards.join(" · ")}`,
        `หากรอดชีวิต: ${rewards.join(" · ")}`,
      ),
    ];
  }
  if (key === "challenge" || key === "defense") {
    if (action === "yield")
      return [
        text(
          "Current title lost; past achievements retained",
          "เสียตำแหน่งปัจจุบัน แต่เก็บความสำเร็จเดิมไว้",
        ),
      ];
    const rank = key === "defense" ? x.standing.title : Number(action.slice(5));
    if (!rank || !titleEligible(l, rank))
      return [
        text(
          "Requirements not met; challenge cannot proceed",
          "คุณสมบัติยังไม่ครบ จึงไม่สามารถประลองได้",
        ),
      ];
    return [
      text(
        `Win chance ${effectNumber(titleWinChance(l) * 100)}%; victory grants or retains position ${rank}`,
        `โอกาสชนะ ${effectNumber(titleWinChance(l) * 100)}% ชนะแล้วได้รับหรือรักษาอันดับ ${rank}`,
      ),
      l.stats.health <= 35
        ? text(
            "Losing costs 35 Health and is fatal at your current health",
            "แพ้แล้วเสียสุขภาพ 35 และจะเสียชีวิตด้วยสุขภาพปัจจุบัน",
          )
        : text(
            "Losing costs 35 Health and carries a 12% fatal risk; an existing defended title is lost",
            "แพ้แล้วเสียสุขภาพ 35 และเสี่ยงเสียชีวิต 12% พร้อมเสียตำแหน่งที่กำลังป้องกัน",
          ),
    ];
  }
  if (key === "courtship")
    return [
      text(
        "Meet a potential partner, then review marriage; no automatic marriage",
        "พบคนที่อาจเป็นคู่ชีวิต แล้วพิจารณาสมรส ไม่ได้แต่งงานโดยอัตโนมัติ",
      ),
    ];
  if (key === "marriage")
    return [
      text(
        "Marriage recorded; household expenses +6 silver/year while married",
        "บันทึกการสมรส ค่าใช้จ่ายครัวเรือนเพิ่ม 6 เหรียญต่อปีขณะยังสมรส",
      ),
    ];
  if (key === "child")
    return [
      text(
        "If an eligible spouse and record space are available: one child; expenses +4 silver/year until age 18",
        "หากมีคู่สมรสที่มีคุณสมบัติครบและมีพื้นที่บันทึก จะมีลูกหนึ่งคน ค่าใช้จ่ายเพิ่ม 4 เหรียญต่อปีจนลูกอายุ 18 ปี",
      ),
    ];
  if (key === "family") {
    if (action === "care") return bonds();
    if (action === "separate")
      return [
        text(
          "Ends the first active marriage; spouse relationship −30; expenses −6 silver/year",
          "ยุติการสมรสปัจจุบันลำดับแรก ความสัมพันธ์กับคู่สมรส −30 ค่าใช้จ่ายลด 6 เหรียญต่อปี",
        ),
      ];
    return [
      text(
        `Adds a named ${action === "friend" ? "friend" : "rival"}; no immediate Bonds gain`,
        `เพิ่ม${action === "friend" ? "เพื่อน" : "คู่แข่ง"}ที่มีชื่อหนึ่งคน ไม่เพิ่มสายสัมพันธ์ทันที`,
      ),
    ];
  }
  if (key === "discovery")
    return [
      text(
        "Records a finding only if the observed evidence permits; grants no new trait",
        "บันทึกสิ่งที่ตรวจพบเมื่อมีหลักฐานเพียงพอ ไม่ได้มอบลักษณะพิเศษใหม่",
      ),
    ];
  if (key === "grant")
    return [
      text(
        "Standing → noble; patron support recognized; occupation and skills unchanged",
        "ฐานะ → ขุนนาง ได้รับการรับรองผู้อุปถัมภ์ อาชีพและทักษะยังคงเดิม",
      ),
    ];
  if (key === "retire") return job("retired");
  if (key === "research")
    return [
      text("Research contributions +1", "ผลงานวิจัย +1"),
      delta("Reputation", "ชื่อเสียง", x.standing.reputation, 10),
      text(
        "Records an achievement for your current subject",
        "บันทึกผลงานในวิชาที่กำลังศึกษา",
      ),
    ];
  // Education quote and management screens already display exact funding and duration.
  if (key === "university")
    return [
      text(
        "Enrollment moves you to Ranoa; occupation → student, job wages stop; quoted funding applies",
        "เข้าเรียนแล้วย้ายไปราโนอา อาชีพ → นักเรียน ค่าจ้างงานหยุด ใช้เงินตามใบเสนอ",
      ),
    ];
  if (key === "training-placement")
    return action.startsWith("accept-")
      ? job(action.slice(7) as Occupation)
      : [menu];
  if (key === "training-quote")
    return action.startsWith("enroll-")
      ? [
          text(
            "Starts the quoted course using the displayed funding and attendance mode",
            "เริ่มหลักสูตรตามเงินทุนและรูปแบบการเข้าเรียนที่แสดง",
          ),
        ]
      : [menu];
  if (key === "training") {
    if (action === "pause")
      return [
        text(
          "Pauses course progress, tuition and full-time stipend; job wages resume",
          "หยุดความก้าวหน้า ค่าเรียน และเบี้ยเลี้ยงเต็มเวลา ค่าจ้างงานกลับมาจ่าย",
        ),
      ];
    if (action === "resume")
      return [
        text(
          "Resumes course progress and attendance costs; full-time attendance replaces wages",
          "กลับมาฝึกและจ่ายค่าเรียนตามรูปแบบเดิม หากเต็มเวลา เบี้ยเลี้ยงจะแทนค่าจ้าง",
        ),
      ];
    if (action === "withdraw")
      return [
        text(
          "Stops attendance; retains progress; refunds unused personal/family funds and cancels unused loan reserves",
          "หยุดเข้าเรียน เก็บความก้าวหน้า คืนเงินส่วนตัวและครอบครัวที่ยังไม่ใช้ และยกเลิกหนี้ส่วนที่สำรองไว้แต่ยังไม่ได้ใช้",
        ),
      ];
    if (action.startsWith("mode-"))
      return [
        text(
          "Changes attendance and yearly income; retains earned course progress",
          "เปลี่ยนรูปแบบเข้าเรียนและรายได้รายปี โดยเก็บความก้าวหน้าที่ได้ไว้",
        ),
      ];
    return [menu];
  }
  return [];
}

import type { Decision, ExpandedLife } from "../types";
import { ASURA_CRISIS as balance } from "./balance";
import { draw } from "./random";
import { worldYear, fact } from "./facts";
import { flightTerms, politicalFlight } from "./succession-restrictions";
import {
  quoteDefeat,
  resolveAccession,
  resolveDefeat,
} from "./succession-outcomes";
import type { CrisisState } from "./succession-core";

export function applySuccessionYear(life: ExpandedLife): string[] {
  const state = life.expansion.succession;
  if (!state || life.phase !== "alive") return [];
  const c = state.crisis,
    year = worldYear(life);
  function record(code: string, news: boolean) {
    const x = life.expansion;
    x.history.push({
      year,
      code,
      exposure: news ? "news" : "civilian",
      region: life.region,
      locality: x.origin.locality,
    });
    if (x.history.length > 128) x.history.shift();
    fact(life, "history", code, news ? "news" : "civilian");
  }
  if (year === 424 && c.route === "waiting") {
    const royal = life.expansion.social?.royalHouse === "asura";
    const eligible =
      life.region === "asura" &&
      (royal || life.expansion.standing.status === "noble");
    c.royal = eligible && royal;
    c.route = eligible ? (life.age >= 18 ? "adult" : "child") : "news";
    c.due =
      c.route === "adult" ? "oath" : c.route === "child" ? "household" : null;
    if (c.route === "child") {
      c.helperIds = life.expansion.family.people
        .filter(
          (p) => p.role === "parent" && p.died === null && p.home === "asura",
        )
        .map((p) => p.id);
    }
    record("asura-succession", c.route === "news");
  }
  if (
    (year === 425 || (year > 425 && life.age === 0)) &&
    !c.revealed &&
    c.due === null
  ) {
    if (c.route === "waiting") c.route = "news";
    c.revealed = true;
    c.due = "result";
    record(
      state.winner === "ariel" ? "ariel-accession" : "opposition-accession",
      c.route === "news" || life.region !== "asura",
    );
  }
  return [];
}

export function dueCrisisDecision(life: ExpandedLife): string | null {
  const c = life.expansion.succession?.crisis;
  if (life.phase !== "alive" || !c?.due) return null;
  if (c.due === "defeat" && !c.quote) {
    c.quote = quoteDefeat(life);
    draw(life);
  }
  return "expanded.asura-" + c.due;
}
const office = {
  en: "If crowned, your primary wage becomes 60 personal silver per full year. Courses and mentorship pause. Creditor service ends with earned credit retained and the unpaid balance due in affordable instalments. The public treasury starts at 30.",
  th: "หากขึ้นครองราชย์ คุณจะได้รับเงินส่วนตัว 60 เหรียญเงินต่อปีเต็มแทนค่าจ้างเดิม การเรียนและการฝึกกับอาจารย์จะพักไว้ งานใช้หนี้สิ้นสุดโดยคงเครดิตเดิมและผ่อนยอดค้างตามกำลัง คลังแผ่นดินเริ่มที่ 30 เหรียญเงิน",
};
type Copy = { en: string; th: string };
function namedHelpers(life: ExpandedLife, ids: string[]) {
  return ids
    .map((id) => life.expansion.family.people.find((p) => p.id === id)?.name)
    .filter(Boolean)
    .join(", ");
}
function resultCopy(life: ExpandedLife): Copy {
  const { crisis: c, winner } = life.expansion.succession!;
  const accession =
    winner === "ariel"
      ? {
          en: "Ariel wins the Asuran succession in K425.",
          th: "แอเรียลชนะการชิงราชบัลลังก์อัสราในปี K425",
        }
      : {
          en: "The opposition wins the Asuran succession in K425.",
          th: "ฝ่ายตรงข้ามชนะแอเรียลในการชิงราชบัลลังก์อัสราในปี K425",
        };
  let consequence: Copy = {
    en: "Word of the accession reaches you.",
    th: "ข่าวการขึ้นครองราชย์เดินทางมาถึงคุณ",
  };
  if (c.outcome === "pledged") {
    const pay = c.funded ? 48 : 40;
    consequence =
      c.side !== winner
        ? {
            en: "Your side has lost. You must choose surrender, escape or resistance.",
            th: "ฝ่ายของคุณพ่ายแพ้ คุณต้องเลือกว่าจะยอมจำนน หลบหนี หรือขัดขืน",
          }
        : c.claimant
          ? {
              en: `You take the throne and receive ${pay} personal silver. ${office.en}`,
              th: `คุณขึ้นครองราชย์และรับเงินส่วนตัว ${pay} เหรียญเงิน ${office.th}`,
            }
          : {
              en: `The crown recognizes your service. Receive ${pay} silver and access to court petitions.`,
              th: `ราชสำนักรับรองการรับใช้ของคุณ มอบเงิน ${pay} เหรียญเงิน และสิทธิ์ยื่นคำร้องต่อราชสำนัก`,
            };
  } else if (c.outcome === "sheltered") {
    const helpers = namedHelpers(
      life,
      c.helperIds.filter((id) =>
        life.expansion.family.people.some(
          (p) => p.id === id && p.died === null && p.home === "asura",
        ),
      ),
    );
    consequence =
      c.householdSide === winner
        ? {
            en: "Your household keeps its protection. You remain safe.",
            th: "ครัวเรือนยังได้รับความคุ้มครอง คุณยังปลอดภัย",
          }
        : {
            en: `You remain safe. Your household loses local protection.${helpers ? " Affected: " + helpers + "." : ""}`,
            th: `คุณยังปลอดภัย ครัวเรือนสูญเสียความคุ้มครองในท้องถิ่น ${helpers}`,
          };
  }
  return {
    en: accession.en + " " + consequence.en,
    th: accession.th + " " + consequence.th,
  };
}
const titles: Record<NonNullable<CrisisState["due"]>, Copy> = {
  oath: { en: "An oath in Asura", th: "คำสัตย์ในอัสรา" },
  household: { en: "Shelter for the household", th: "ที่พักพิงของครอบครัว" },
  result: { en: "The Asuran accession", th: "การขึ้นครองราชย์แห่งอัสรา" },
  defeat: { en: "After the defeat", th: "หลังความพ่ายแพ้" },
};
export function crisisDecision(life: ExpandedLife): Decision | null {
  const c = life.expansion.succession?.crisis;
  if (
    life.phase !== "alive" ||
    !c?.due ||
    life.pending !== "expanded.asura-" + c.due
  )
    return null;
  const title = titles[c.due];
  const labels: Record<NonNullable<CrisisState["due"]>, Copy> = {
    oath: {
      en: "Two camps seek your pledge in K424. Once sworn, it binds until the accession. Leaving means permanent exile.",
      th: "สองฝ่ายขอคำสัตย์จากคุณในปี K424 คำสัตย์ผูกมัดจนกว่าจะทราบผล หากถอนตัวต้องลี้ภัยตลอดชีวิต",
    },
    household: {
      en:
        "Your household favors " +
        (c.householdSide === "ariel" ? "Ariel" : "the opposition") +
        ". Choose shelter or evacuation.",
      th:
        "ครัวเรือนสนับสนุน" +
        (c.householdSide === "ariel" ? "แอเรียล" : "ฝ่ายตรงข้าม") +
        " เลือกที่พักพิงหรืออพยพ",
    },
    result: c.due === "result" ? resultCopy(life) : { en: "", th: "" },
    defeat: {
      en: "The new court demands your surrender. These are your chances and the price of each attempt.",
      th: "ราชสำนักใหม่เรียกร้องให้คุณยอมจำนน นี่คือโอกาสและสิ่งที่ต้องจ่ายสำหรับแต่ละทางเลือก",
    },
  };
  const text = labels[c.due],
    localized: NonNullable<Decision["localized"]> = {
      title: title.th,
      text: text.th,
      choices: {},
    };
  const d: Decision = {
    id: life.pending,
    title: title.en,
    text: text.en,
    kind: "world",
    requiresManual: true,
    choices: [],
    localized,
  };
  function option(
    action: string,
    en: string,
    th: string,
    desc: Copy,
    disabled = false,
  ) {
    const id = d.id + "." + action;
    d.choices.push({
      id,
      label: en,
      description: desc.en,
      outcome: desc.en,
      disabled,
    });
    localized.choices[id] = {
      label: th,
      description: desc.th,
      outcome: desc.th,
    };
  }
  if (c.due === "oath") {
    for (const [action, en, th] of [
      ["ariel", "Pledge to Ariel", "สาบานตนต่อแอเรียล"],
      [
        "opposition",
        "Support the opposition candidate",
        "สนับสนุนผู้ชิงบัลลังก์ฝ่ายตรงข้าม",
      ],
      ...(c.royal
        ? [
            [
              "claimant",
              "Stand as the opposition claimant",
              "ประกาศตนเป็นผู้ชิงบัลลังก์ฝ่ายตรงข้าม",
            ],
          ]
        : []),
    ]) {
      const terms =
        action === "claimant"
          ? office
          : {
              en: "Victory brings recognition at court. Defeat puts you at risk of prison, exile or death.",
              th: "เมื่อชนะจะได้รับการรับรองจากราชสำนัก หากพ่ายแพ้อาจถูกจำคุก ลี้ภัย หรือเสียชีวิต",
            };
      option(action, en, th, terms);
      const lack = life.coins < balance.supply;
      option(
        action + "-funded",
        en + " and supply 12 silver",
        th + " และสมทบเสบียง 12 เหรียญเงิน",
        {
          en: `${terms.en} Pay 12 silver now for recorded supply service and an extra 8 on victory.${lack ? " You need 12 silver." : ""}`,
          th: `${terms.th} จ่าย 12 เหรียญเงินเพื่อส่งเสบียงและบันทึกการรับใช้ หากชนะจะได้รับเพิ่ม 8 เหรียญเงิน${lack ? " ต้องมีเงิน 12 เหรียญ" : ""}`,
        },
        lack,
      );
    }
  }
  if (c.due === "household") {
    const helpers = namedHelpers(life, c.helperIds);
    option(
      "stay",
      helpers ? "Take shelter with " + helpers : "Seek public sanctuary",
      helpers ? "พักพิงกับ " + helpers : "เข้าที่หลบภัยสาธารณะ",
      {
        en: "Stay safe. If your household loses, it loses local protection.",
        th: "คุณจะปลอดภัย หากฝ่ายของครัวเรือนพ่ายแพ้ ครัวเรือนจะเสียความคุ้มครองในท้องถิ่น",
      },
    );
  }
  if (c.due === "oath" || c.due === "household") {
    option(
      "flee",
      "Leave Asura permanently",
      "ลี้ภัยจากอัสราตลอดชีวิต",
      flightTerms(life, c.helperIds[0]),
    );
  } else if (c.due === "result") {
    option(
      "read",
      "Receive the accession news",
      "รับข่าวการขึ้นครองราชย์",
      text,
    );
  } else if (c.due === "defeat" && c.quote) {
    const q = c.quote;
    const custody = {
      en: "Custody confiscates half your remaining silver, rounded down. Serve two full years.",
      th: "เมื่อถูกคุมขังจะถูกริบเงินครึ่งหนึ่งของยอดที่เหลือโดยปัดลง และรับโทษสองปีเต็ม",
    };
    option("surrender", "Surrender", "ยอมจำนน", custody);
    for (const paid of [false, true]) {
      const chance = paid ? q.paidEscape : q.escape,
        cost = paid ? q.fee : 0;
      const terms = flightTerms({
        ...life,
        coins: Math.max(0, life.coins - cost),
      });
      option(
        paid ? "escape-paid" : "escape",
        paid ? "Pay for escape" : "Attempt escape",
        paid ? "จ่ายค่าช่วยหลบหนี" : "พยายามหลบหนี",
        {
          en: `Pay ${cost} silver. ${chance}% chance of permanent exile in Ranoa${q.friendName ? " with help from " + q.friendName : ""}. Failure leads to custody. ${custody.en} ${terms.en}`,
          th: `จ่าย ${cost} เหรียญเงิน โอกาสลี้ภัยถาวรในรานัว ${chance}%${q.friendName ? " โดยมี " + q.friendName + " ช่วยเหลือ" : ""} หากพลาดจะถูกจับ ${custody.th} ${terms.th}`,
        },
        life.coins < cost,
      );
    }
    option("resist", "Resist the new court", "ขัดขืนราชสำนักใหม่", {
      en: `${q.resist}% chance to survive under permanent exile. Failure means immediate death. ${flightTerms(life).en}`,
      th: `โอกาสรอดชีวิตและลี้ภัยถาวร ${q.resist}% หากพลาดจะเสียชีวิตทันที ${flightTerms(life).th}`,
    });
  }
  return d;
}
export function applyCrisisChoice(
  life: ExpandedLife,
  id: string,
): string | null {
  const c = life.expansion.succession?.crisis;
  if (
    life.phase !== "alive" ||
    !c?.due ||
    !id.startsWith("expanded.asura-" + c.due + ".")
  )
    return null;
  const action = id.slice(("expanded.asura-" + c.due + ".").length);
  if (c.due === "result" && action === "read") {
    resolveAccession(life);
    return null;
  }
  if (c.due === "defeat") return resolveDefeat(life, action);
  if (worldYear(life) !== 424) return null;
  if (action === "flee" && (c.due === "household" || c.due === "oath")) {
    politicalFlight(life, c.helperIds[0]);
    c.outcome = "fled";
    c.due = null;
  } else if (c.due === "household" && action === "stay") {
    c.outcome = "sheltered";
    c.due = null;
    life.expansion.economy.protectionUntil = Math.max(
      425,
      life.expansion.economy.protectionUntil,
    );
  } else if (c.due === "oath") {
    const funded = action.endsWith("-funded"),
      side = funded ? action.slice(0, -7) : action;
    if (
      (side !== "ariel" &&
        side !== "opposition" &&
        !(side === "claimant" && c.royal)) ||
      (funded && life.coins < balance.supply)
    )
      return null;
    c.side = side === "ariel" ? "ariel" : "opposition";
    c.claimant = side === "claimant";
    c.funded = funded;
    c.due = null;
    c.outcome = "pledged";
    const h = life.expansion.history.find(
      (h) => h.code === "asura-succession" && h.year === 424,
    );
    if (h) h.exposure = funded ? "support" : "participant";
    if (funded) {
      life.coins -= balance.supply;
      life.expansion.standing.service++;
      fact(life, "history", "succession-supplies", c.side, 12);
    }
  }
  return null;
}
export function crisisChoiceOutcome(
  life: ExpandedLife,
  id: string,
): Copy | null {
  if (!id.startsWith("expanded.asura-defeat.")) return null;
  const c = life.expansion.succession?.crisis;
  if (c?.outcome === "captured")
    return {
      en: "You entered custody. Half the remaining purse was confiscated. Release follows the K427 settlement.",
      th: "คุณถูกคุมขังและถูกริบเงินครึ่งหนึ่งของยอดที่เหลือ จะได้รับการปล่อยตัวหลังสะสางบัญชีปี K427",
    };
  if (c?.outcome === "escaped")
    return {
      en: "You escaped to Ranoa under permanent exile.",
      th: "คุณหลบหนีไปถึงรานัวและต้องลี้ภัยตลอดชีวิต",
    };
  if (c?.outcome === "killed")
    return {
      en: "You died resisting the new court.",
      th: "คุณเสียชีวิตขณะขัดขืนราชสำนักใหม่",
    };
  return null;
}

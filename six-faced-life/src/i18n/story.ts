import type { Decision, Entry, Language, Life } from "../game/types";
import { translate } from "./messages";
import { STORIES_TH } from "./story-th";
import { YEARS_TH } from "./narrative-th";
import { REGIONS } from "../game/world";
import { MAGIC_SCHOOLS } from "../game/progression";

/** Only the returned presentation copy is localized; engine choices stay canonical. */
export function decisionText(
  decision: Decision,
  life: Life,
  language: Language,
): Decision {
  if (language === "en" || !Object.hasOwn(STORIES_TH, decision.id))
    return decision;
  const story = STORIES_TH[decision.id];
  return {
    ...decision,
    title: story.title,
    text: story.text,
    kind: translate(language, decision.kind),
    choices: decision.choices.map((choice) => {
      const text = Object.hasOwn(story.choices, choice.id)
        ? story.choices[choice.id]
        : undefined;
      return {
        ...choice,
        label:
          decision.id === "help-neighbor" &&
          choice.id === "focus" &&
          life.age < 18
            ? "กลับไปเรียนต่อ"
            : text?.[0] || translate(language, choice.label),
        description: text?.[2] ?? translate(language, choice.description),
        outcome: text?.[1] ?? translate(language, choice.outcome),
      };
    }),
  };
}

export function entryText(
  entry: Entry,
  language: Language,
): { title: string; text: string } {
  const fallback = { title: entry.title, text: entry.text };
  const message = entry.message;
  if (language === "en" || !message) return fallback;
  const params = message.params ?? {};
  const t = (value: string) => translate(language, value);
  if (
    message.key === "birth" &&
    Object.hasOwn(REGIONS, String(params.region)) &&
    typeof params.background === "string" &&
    params.background.length > 0
  ) {
    const region = REGIONS[params.region as keyof typeof REGIONS];
    return {
      title: t(entry.title),
      text: `คุณเข้าสู่โลกนี้ใน${t(region.name)} ใน${t(String(params.background))} ชื่อใหม่ ครอบครัวใหม่ และความทรงจำที่เหมือนเป็นของที่อื่น`,
    };
  }
  const year =
    message.key === "infancy"
      ? "infancy"
      : message.key.startsWith("year.")
        ? message.key.slice(5)
        : "";
  if (Object.hasOwn(YEARS_TH, year))
    return { title: YEARS_TH[year][0], text: YEARS_TH[year][1] };
  if (
    message.key === "ending" &&
    typeof params.cause === "string" &&
    typeof params.legacy === "string"
  )
    return {
      title: t(entry.title),
      text: `${t(params.cause)} ${t(params.legacy)}`,
    };
  if (
    message.key === "farewell" &&
    typeof params.name === "string" &&
    typeof params.role === "string"
  )
    return {
      title: `ระลึกถึง ${params.name}`,
      text: `${t(params.role)}ของคุณถึงปลายทางของชีวิตอันยาวนาน สิ่งที่เขาสอนยังคงอยู่`,
    };
  if (
    (message.key === "spells.choice" || message.key === "spells.year") &&
    typeof params.spells === "string"
  ) {
    const all = Object.values(MAGIC_SCHOOLS).flatMap((s) => s.spells);
    const names = params.spells
      .split("|")
      .map((id) => all.find((spell) => spell.id === id));
    if (names.some((spell) => !spell)) return fallback;
    const spells = names.map((spell) => t(spell!.name)).join(", ");
    return {
      title: t(entry.title),
      text:
        message.key === "spells.choice"
          ? `ด้วยการฝึกและการเรียน คุณเรียนรู้${spells}`
          : `การฝึกตลอดปีช่วยให้คุณเรียนรู้${spells}ได้`,
    };
  }
  const parts = message.key.split(".");
  if (
    parts.length === 3 &&
    parts[0] === "choice" &&
    Object.hasOwn(STORIES_TH, parts[1])
  ) {
    const [eventId, choiceId] = parts.slice(1);
    const story = STORIES_TH[eventId];
    const text = Object.hasOwn(story.choices, choiceId)
      ? story.choices[choiceId]
      : undefined;
    const generated =
      (eventId === "journey" &&
        /^travel-(asura|ranoa|millis|forest|demon|begaritt)$/.test(choiceId)) ||
      (eventId === "study-path" &&
        /^study-(water|fire|earth|wind|healing)$/.test(choiceId)) ||
      (eventId === "career-promotion" && choiceId === "accept-promotion");
    if (!text && !generated) return fallback;
    return {
      title:
        eventId === "help-neighbor" &&
        choiceId === "focus" &&
        params.label === "Return to your lessons"
          ? "กลับไปเรียนต่อ"
          : text?.[0] || t(String(params.label ?? entry.title)),
      text:
        params.failed === 1
          ? t(entry.text)
          : (text?.[1] ?? t(String(params.outcome ?? entry.text))),
    };
  }
  return fallback;
}

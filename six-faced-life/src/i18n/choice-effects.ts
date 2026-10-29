import type { Choice, Language, Life, Stat } from "../game/types";
import { CAREERS, REGIONS } from "../game/world";
import { getProgression, MAGIC_SCHOOLS } from "../game/progression";
import { talentMultiplier } from "../game/expanded/genetics";
import { expandedChoiceEffects } from "./expanded-choice-effects";
import { effectDelta, effectNumber, effectText } from "./effect-text";
import { translate } from "./messages";
import { maxSwordXp, selectedSwordTrack } from "../game/expanded/sword-state";

export const statLabels: Record<Stat, string> = {
  health: "Health",
  happiness: "Happiness",
  knowledge: "Knowledge",
  bonds: "Bonds",
  mana: "Mana",
  sword: "Sword skill",
};

/** Presentation only: never choose, draw RNG, mutate a life or reveal latent talent. */
export function choiceEffects(
  life: Life,
  choice: Choice,
  language: Language,
): string[] {
  const text = (en: string, th: string) => effectText(language, en, th);
  const expanded = life.ruleset === "expanded-1";
  const unassessed = expanded && !life.expansion.education.assessed;
  const gains: string[] = [];
  for (const [key, value] of Object.entries(choice.effects ?? {})) {
    const stat = key as Stat;
    const learning = stat === "knowledge" && value > 0;
    const bonus =
      expanded && !unassessed && learning
        ? talentMultiplier(life, "academic")
        : 1;
    const gain =
      Math.max(0, Math.min(100, life.stats[stat] + value * bonus)) -
      life.stats[stat];
    const prefix = unassessed && learning ? text("Base ", "ค่าพื้นฐาน ") : "";
    gains.push(prefix + effectDelta(language, statLabels[stat], gain));
  }
  for (const [key, label, kind] of [
    ["magicXp", "Magic experience", "magic"],
    ["swordXp", "Sword experience", "sword"],
  ] as const) {
    const value = choice[key] ?? 0;
    if (!value) continue;
    const bonus =
      expanded && !unassessed && value > 0 ? talentMultiplier(life, kind) : 1;
    gains.push(
      (unassessed && value > 0 ? text("Base ", "ค่าพื้นฐาน ") : "") +
        effectDelta(language, label, value * bonus),
    );
    if (expanded) {
      const stat = kind === "magic" ? "mana" : "sword";
      const floor = kind === "magic" ? 14 : 5;
      const xp =
        kind === "sword" &&
        life.ruleset === "expanded-1" &&
        life.expansion.swords
          ? Math.max(
              maxSwordXp(life),
              (selectedSwordTrack(life)?.xp ??
                life.expansion.swords.legacy?.xp ??
                0) +
                value * bonus,
            )
          : life.training[key] + value * bonus;
      const developed = Math.min(
        100,
        Math.max(life.stats[stat], floor + Math.sqrt(xp) * 3),
      );
      if (developed > life.stats[stat])
        gains.push(
          (unassessed ? text("Base ", "ค่าพื้นฐาน ") : "") +
            effectDelta(
              language,
              statLabels[stat],
              developed - life.stats[stat],
            ),
        );
    }
  }
  if (choice.coins) {
    const purseAfterFee = life.coins - (choice.cost ?? 0);
    const reward =
      Math.max(0, Math.min(1_000_000, purseAfterFee + choice.coins)) -
      purseAfterFee;
    gains.push(effectDelta(language, "Silver", reward));
  }
  if (!expanded) {
    const p = getProgression(life);
    if (choice.careerXp)
      gains.push(effectDelta(language, "Career experience", choice.careerXp));
    if (choice.reputation)
      gains.push(
        effectDelta(
          language,
          "Reputation",
          Math.max(0, Math.min(100, p.career.reputation + choice.reputation)) -
            p.career.reputation,
        ),
      );
    for (const [key, label] of [
      ["magicCap", "Magic instruction cap"],
      ["swordCap", "Sword instruction cap"],
    ] as const)
      if (choice[key] !== undefined && choice[key]! > life.training[key])
        gains.push(
          `${text(label, key === "magicCap" ? "เพดานการเรียนเวทมนตร์" : "เพดานการเรียนดาบ")} → ${choice[key]}`,
        );
    if (choice.career)
      gains.push(
        text(
          `Occupation → ${CAREERS[choice.career].name}`,
          `อาชีพ → ${translate(language, CAREERS[choice.career].name)}`,
        ),
      );
    if (choice.region)
      gains.push(
        text(
          `Home → ${REGIONS[choice.region].name}`,
          `บ้าน → ${translate(language, REGIONS[choice.region].name)}`,
        ),
      );
    if (choice.specialization)
      gains.push(
        text(
          `Study → ${MAGIC_SCHOOLS[choice.specialization].name}`,
          `วิชาที่เรียน → ${translate(language, MAGIC_SCHOOLS[choice.specialization].name)}`,
        ),
      );
    for (const [school, xp] of Object.entries(choice.schoolXp ?? {}))
      gains.push(
        `${translate(language, MAGIC_SCHOOLS[school as keyof typeof MAGIC_SCHOOLS].name)}: +${xp} ${text("experience", "ประสบการณ์")}`,
      );
    if (choice.promoteCareer)
      gains.push(
        text(
          "Earned promotion; higher yearly pay",
          "เลื่อนตำแหน่งตามคุณสมบัติและเพิ่มค่าจ้างรายปี",
        ),
      );
    if (choice.partner)
      gains.push(
        text("A partner joins your family", "มีคู่ชีวิตเข้ามาในครอบครัว"),
      );
    if (choice.child)
      gains.push(
        text(
          "A child joins your family; higher living expenses",
          "มีลูกเข้ามาในครอบครัวและค่าใช้จ่ายเพิ่มขึ้น",
        ),
      );
    if (choice.risk) {
      const risk = `${effectNumber(choice.risk * 100)}%`;
      return [
        text(
          `${risk} setback risk: Health −18 to −33 and Happiness −4; no reward on failure. Fees still apply.`,
          `เสี่ยงล้มเหลว ${risk}: สุขภาพ −18 ถึง −33 และความสุข −4 ไม่ได้รางวัลเมื่อล้มเหลว แต่ยังเสียค่าใช้จ่าย`,
        ),
        ...(gains.length
          ? [
              text(
                `On success: ${gains.join(" · ")}`,
                `เมื่อสำเร็จ: ${gains.join(" · ")}`,
              ),
            ]
          : []),
      ];
    }
  }
  const domain = expanded ? expandedChoiceEffects(life, choice, language) : [];
  return [...gains, ...domain];
}

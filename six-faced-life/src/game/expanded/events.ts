import type { Choice, Decision, ExpandedLife, RegionId } from "../types";
import { EXPANDED_COPY, expandedLabel } from "../../i18n/expanded";
import { OCCUPATIONS } from "./balance";
import {
  educationRequirements,
  assessTalent,
  enrollUniversity,
  travelCost,
} from "./education";
import {
  appoint,
  careerRequirements,
  promotionReady,
  promote,
} from "./careers";
import {
  factionEligible,
  acceptFaction,
  refuseFaction,
  defect,
  titleEligible,
  contestTitle,
} from "./politics";
import {
  introducePartner,
  marriageAllowed,
  marry,
  addChild,
  addSocialTie,
  divorce,
} from "./family";
import { discoverGenetics } from "./genetics";
import { worldYear, fact } from "./facts";
import { draw, clamp } from "./random";
import { REGIONS } from "../world";
export const MANUAL = new Set([
  "orsted",
  "hitogami",
  "marriage",
  "service",
  "challenge",
  "defect",
  "defense",
  "assignment",
]);
export function getExpandedDecision(life: ExpandedLife): Decision | null {
  if (!life.pending || life.phase !== "alive") return null;
  const key = life.pending.slice(9);
  const copy = EXPANDED_COPY[key];
  if (!copy) return null;
  const x = life.expansion,
    y = worldYear(life);
  if ((key === "orsted" || key === "hitogami") && !factionEligible(life, key))
    return null;
  if (
    [
      "marriage",
      "courtship",
      "child",
      "service",
      "challenge",
      "defect",
      "assignment",
      "defense",
    ].includes(key) &&
    life.age < 18
  )
    return null;
  if (
    key === "university" &&
    (life.age < 15 || ["university", "graduated"].includes(x.education.stage))
  )
    return null;
  if (key === "school-year" && x.education.stage !== "university") return null;
  if (key === "assignment" && !x.politics.faction) return null;
  if (key === "defect" && !x.politics.faction) return null;
  if (key === "defense" && x.standing.title === null) return null;
  if (
    ["career", "work", "retire", "grant", "research"].includes(key) &&
    life.age < 15
  )
    return null;
  const option = (action: string, extra: Partial<Choice> = {}): Choice => {
    const c = copy.choices[action];
    return {
      id: `expanded.${key}.${action}`,
      label: c?.[0] ?? action,
      description: c?.[2] ?? "Your qualifications and the stated cost apply.",
      outcome: c?.[2] ?? "The result is recorded in your life details.",
      ...extra,
    };
  };
  let choices = Object.keys(copy.choices).map((action) => option(action));
  switch (key) {
    case "memory":
      choices = [
        option("observe", { effects: { knowledge: 3, bonds: 2 } }),
        option("practice", { magicXp: 8 }),
      ];
      break;
    case "reading":
      choices = [
        option("learn", { effects: { knowledge: 8 } }),
        option("home", { effects: { bonds: 4 } }),
      ];
      break;
    case "practice":
      choices = [
        option("magic", { magicXp: 12 }),
        option("sword", { swordXp: 12 }),
      ];
      break;
    case "work":
      choices = [
        option("farmer", {
          disabled: careerRequirements(life, "farmer").some((r) => !r.met),
        }),
        option("laborer"),
        option("later"),
      ];
      break;
    case 'family':choices=choices.map(c=>({...c,disabled:c.id.endsWith('.separate')?!x.family.marriages.some(m=>m.end===null):(c.id.endsWith('.friend')||c.id.endsWith('.rival'))&&x.family.friends.length>=32}));break;
    case "university":
      choices = [
        option("enroll", {
          disabled: educationRequirements(life).some((r) => !r.met),
        }),
        option("later"),
      ];
      break;
    case "instruction":
      choices = [
        option("magic", {
          cost: 8,
          disabled:
            life.training.magicXp < 60 * life.training.magicCap ||
            life.training.magicCap >= 6,
        }),
        option("sword", {
          cost: 8,
          disabled:
            life.training.swordXp < 60 * life.training.swordCap ||
            life.training.swordCap >= 6 ||
            (x.genetics.auraImpaired && life.training.swordCap >= 2),
        }),
        option("later"),
      ];
      break;
    case "aid":
      choices = [option("accept", { cost: 8 }), option("later")];
      break;
    case "career": {
      choices = OCCUPATIONS.filter(
        (role) =>
          !["child", "student", "retired"].includes(role) &&
          role !== x.career.role,
      ).map((role) =>
        option(`job-${role}`, {
          label: expandedLabel(role),
          cost:
            role === "merchant"
              ? 30
              : role === "adventurer"
                ? 10
                : role === "knight"
                  ? x.origin.status === "noble"
                    ? Math.max(0, 120 - x.economy.familyFunds)
                    : 120
                  : 0,
          disabled:
            careerRequirements(life, role).some((r) => !r.met) ||
            !appointmentAvailable(life, role),
        }),
      );
      choices.unshift(option("promote", { disabled: !promotionReady(life) }));
      choices.push(option("later"));
      break;
    }
    case "travel":
      choices = (Object.keys(REGIONS) as RegionId[])
        .filter((r) => r !== life.region)
        .map((region) =>
          option(`move-${region}`, {
            label: REGIONS[region].name,
            cost: travelCost(life),
          }),
        );
      choices.push(option("later"));
      break;
    case "marriage":
      choices = x.family.people
        .filter(
          (p) => p.role === "spouse" && p.partner === null && p.died === null,
        )
        .map((p) =>
          option(`marry-${p.id}`, {
            label: p.name,
            disabled: !marriageAllowed(life, p.id),
          }),
        );
      if (!choices.length) return null;
      choices.push(option("later"));
      break;
    case "child":
      choices = [
        option("accept", {
          disabled:
            x.family.directBorn >= 12 ||
            !x.family.marriages.some((m) => m.end === null),
        }),
        option("later"),
      ];
      break;
    case "challenge":
      choices = ([5, 6, 7] as const).map((rank) =>
        option(`rank-${rank}`, {
          label: `Position ${rank}`,
          risk: 1,
          disabled: !titleEligible(life, rank),
        }),
      );
      choices.push(option("later"));
      break;
    case "service":
      choices = [option("accept", { risk: 0.1 }), option("later")];
      break;
    case "assignment":
      choices = [option("accept", { risk: 0.05 }), option("later")];
      break;
    case "research":
      choices = [
        option("accept", {
          disabled:
            x.education.stage !== "graduated" ||
            life.training.magicXp < 500 ||
            x.education.research >= 64,
        }),
        option("later"),
      ];
      break;
    case "grant":
      choices = [
        option("accept", {
          disabled:
            x.standing.reputation < 70 ||
            x.standing.feats.length < 5 ||
            x.standing.status === "noble",
        }),
        option("later"),
      ];
      break;
    case "opportunity":
      choices = choices.map((c) => ({
        ...c,
        disabled: life.age < 18 && c.id.endsWith(".courtship"),
      }));
      break;
  }
  // No decisions remain actionable after the protagonist's death or invalidation.
  if (life.age < 18)
    choices = choices.filter((c) => !c.id.endsWith(".service"));
  if (y < x.birthYear) return null;
  return {
    id: life.pending,
    kind: "Life",
    title: copy.title[0],
    text: copy.text[0],
    choices,
    requiresManual: MANUAL.has(key)||(key==='family'&&x.family.marriages.some(m=>m.end===null)),
  };
}
export function appointmentAvailable(life: ExpandedLife, role: string) {
  if (["farmer", "laborer"].includes(role)) return true;
  const stream = {
    rng:
      (life.expansion.worldSeed ^
        Math.imul(worldYear(life), 2654435761) ^
        role
          .split("")
          .reduce(
            (h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0,
            2166136261,
          )) >>>
      0,
  };
  return draw(stream) < (role === "professor" ? 0.02 : 0.1);
}
export function applyExpandedChoice(
  life: ExpandedLife,
  id: string,
): string | null {
  const [, key, action] = id.split("."),
    x = life.expansion,
    y = worldYear(life);
  const queue = (event: string) => {
    if (!x.queue.includes(`expanded.${event}`))
      x.queue.unshift(`expanded.${event}`);
  };
  if (key === "opportunity" && action !== "later") queue(action);
  if (key === "reading" && action === "learn") x.education.stage = "basic";
  if (key === "assessment" && action === "take") assessTalent(life);
  if (key === "university" && action === "enroll") enrollUniversity(life);
  if (key === "school-year" && action === "study") life.focus = "study";
  if (key === "work" && ["farmer", "laborer"].includes(action))
    appoint(life, action as "farmer" | "laborer");
  if (key === "career" && action === "promote") promote(life);
  if (key === "career" && action.startsWith("job-"))
    appoint(life, action.slice(4) as typeof x.career.role);
  if (key === "instruction" && action === "magic") life.training.magicCap++;
  if (key === "instruction" && action === "sword") life.training.swordCap++;
  if (key === "protection" && action === "accept") {
    x.economy.protectionUntil = Math.max(x.economy.protectionUntil, y + 3);
    life.focus = "bonds";
    fact(life, "need", "protected");
  }
  if (key === "aid" && action === "accept") {
    x.economy.aidUntil = y + 2;
    fact(life, "need", "household-aid");
  }
  if (key === "travel" && action.startsWith("move-")) {
    life.region = action.slice(5) as RegionId;
    x.origin.locality = life.region === "asura" ? "countryside" : "settlement";
    x.economy.travelUntil = y + 1;
    fact(life, "history", "migration", life.region);
  }
  if (
    ["calamity", "succession", "conflict"].includes(key) &&
    action === "aid"
  ) {
    x.standing.reputation = clamp(x.standing.reputation + 5);
    x.standing.trust = clamp(x.standing.trust + 5);
    const record = [...x.history].reverse().find((h) => h.year === y);
    if (record) record.exposure = "support";
    fact(life, "history", "relief", key);
  }
  if (["succession", "conflict"].includes(key) && action === "service")
    queue("service");
  if (key === "conflict" && action === "neutral")
    x.economy.protectionUntil = y + 1;
  if ((key === "orsted" || key === "hitogami") && action === "accept")
    acceptFaction(life, key);
  if ((key === "orsted" || key === "hitogami") && action === "refuse")
    refuseFaction(life, key);
  if (key === "defect" && action === "accept") {
    defect(life);
    addSocialTie(life, "enemy");
  }
  if ((key === "service" || key === "assignment") && action === "accept") {
    if (draw(life) < (key === "service" ? 0.1 : 0.05)) {
      life.stats.health = 0;
      return key;
    }
    life.coins += key === "service" ? 30 : 20;
    x.standing.service++;
    x.standing.reputation = clamp(x.standing.reputation + 8);
    if (key === "assignment") {
      x.politics.obligations = Math.max(0, x.politics.obligations - 3);
      x.politics.trust = clamp(x.politics.trust + 10);
    }
    const feat = `${key}-${life.region}`;
    if (!x.standing.feats.includes(feat) && x.standing.feats.length < 64)
      x.standing.feats.push(feat);
    const h = [...x.history].reverse().find((h) => h.year === y);
    if (h && key === "service") h.exposure = "participant";
    fact(life, "achievement", key, feat);
  }
  if (key === "challenge" && action.startsWith("rank-")) {
    contestTitle(life, Number(action.slice(5)) as 5 | 6 | 7);
    if (life.stats.health <= 0) return "duel";
  }
  if (key === "defense" && action === "accept" && x.standing.title) {
    contestTitle(life, x.standing.title);
    if (life.stats.health <= 0) return "duel";
  }
  if (key === "defense" && action === "yield" && x.standing.title) {
    x.standing.titles.push({ year: y, position: x.standing.title, won: false });
    x.standing.title = null;
  }
  if (key === "courtship" && action === "meet") {
    introducePartner(life);
    queue("marriage");
  }
  if (key === "marriage" && action.startsWith("marry-"))
    marry(life, action.slice(6));
  if (key === "child" && action === "accept") addChild(life);
  if (key === "family" && action === "care") life.focus = "bonds";
  if(key==='family'&&action==='separate'){const m=x.family.marriages.find(m=>m.end===null);if(m)divorce(life,m.person);}
  if (key === "family" && (action === "friend" || action === "rival"))
    addSocialTie(life, action);
  if (key === "discovery" && action === "assess") discoverGenetics(life);
  if (key === "grant" && action === "accept") {
    x.standing.status = "noble";
    x.origin.patron = true;
    fact(life, "achievement", "noble-grant");
  }
  if (key === "retire" && action === "accept") appoint(life, "retired");
  if (key === "research" && action === "accept") {
    x.education.research++;
    x.standing.reputation = clamp(x.standing.reputation + 10);
    const feat = `research-${x.study}`;
    if (!x.standing.feats.includes(feat)) x.standing.feats.push(feat);
    fact(life, "education", "research", x.study);
  }
  return null;
}

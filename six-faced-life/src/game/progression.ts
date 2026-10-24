import { CAREERS } from "./world";
import type { Career, Choice, Life, MagicSchool, Progression } from "./types";

export interface Spell {
  id: string;
  name: string;
  xp: number;
  rank: number;
  description: string;
}
const spell = (
  id: string,
  name: string,
  xp: number,
  rank: number,
  description: string,
): Spell => ({ id, name, xp, rank, description });
export const MAGIC_SCHOOLS: Record<
  MagicSchool,
  { name: string; description: string; spells: Spell[] }
> = {
  water: {
    name: "Water magic",
    description: "Control, precision, and the movement of water.",
    spells: [
      spell(
        "water-drop",
        "Gather water",
        8,
        0,
        "Draw a small amount of water from mana.",
      ),
      spell(
        "water-ball",
        "Water Ball",
        35,
        1,
        "Shape and direct a stable sphere of water.",
      ),
      spell(
        "water-lance",
        "Water Lance",
        110,
        2,
        "Maintain a precise, pressurized stream.",
      ),
      spell(
        "rain-calling",
        "Raincalling",
        260,
        3,
        "Coordinate water over a broad area.",
      ),
      spell(
        "river-ward",
        "River Ward",
        560,
        4,
        "Sustain a powerful protective current.",
      ),
      spell(
        "tidal-sanctuary",
        "Tidal Sanctuary",
        1000,
        5,
        "Balance a vast, moving field of water.",
      ),
    ],
  },
  fire: {
    name: "Fire magic",
    description: "Temperature, restraint, and controlled release.",
    spells: [
      spell("ember", "Ember", 8, 0, "Kindle a steady flame."),
      spell(
        "fire-ball",
        "Fireball",
        35,
        1,
        "Direct flame without losing control.",
      ),
      spell(
        "flame-lance",
        "Flame Lance",
        110,
        2,
        "Concentrate heat into a narrow point.",
      ),
      spell(
        "fire-storm",
        "Firestorm",
        260,
        3,
        "Control many flames without burning beyond their bounds.",
      ),
      spell(
        "hearth-ward",
        "Hearth Ward",
        560,
        4,
        "Regulate a large field of heat.",
      ),
      spell(
        "sun-forge",
        "Sunforge",
        1000,
        5,
        "Sustain extraordinary heat with disciplined precision.",
      ),
    ],
  },
  earth: {
    name: "Earth magic",
    description: "Structure, craftsmanship, and enduring defenses.",
    spells: [
      spell(
        "earth-shaping",
        "Earth Shaping",
        8,
        0,
        "Give a handful of earth a new form.",
      ),
      spell(
        "stone-cannon",
        "Stone Cannon",
        35,
        1,
        "Shape and launch a reliable stone projectile.",
      ),
      spell(
        "stone-wall",
        "Stone Wall",
        110,
        2,
        "Raise a stable defensive structure.",
      ),
      spell(
        "earth-rampart",
        "Earth Rampart",
        260,
        3,
        "Build complex, reinforced earthworks.",
      ),
      spell(
        "living-foundation",
        "Living Foundation",
        560,
        4,
        "Strengthen a network of interconnected structures.",
      ),
      spell(
        "mountain-keep",
        "Mountain Keep",
        1000,
        5,
        "Sustain massive protective earthworks.",
      ),
    ],
  },
  wind: {
    name: "Wind magic",
    description: "Pressure, movement, and reading the air.",
    spells: [
      spell("breeze", "Breeze", 8, 0, "Guide a gentle current of air."),
      spell(
        "wind-blade",
        "Wind Blade",
        35,
        1,
        "Shape a directed cutting current.",
      ),
      spell(
        "storm-step",
        "Storm Step",
        110,
        2,
        "Coordinate precise bursts of moving air.",
      ),
      spell(
        "storm-ward",
        "Storm Ward",
        260,
        3,
        "Maintain a broad protective circulation.",
      ),
      spell(
        "sky-passage",
        "Sky Passage",
        560,
        4,
        "Stabilize complex currents over distance.",
      ),
      spell(
        "tempest-weave",
        "Tempest Weave",
        1000,
        5,
        "Coordinate many powerful, interlocking air currents.",
      ),
    ],
  },
  healing: {
    name: "Healing magic",
    description: "Care, anatomy, and learning when magic is not enough.",
    spells: [
      spell(
        "first-aid",
        "First Aid",
        8,
        0,
        "Support the treatment of small injuries.",
      ),
      spell(
        "healing-touch",
        "Healing Touch",
        35,
        1,
        "Guide focused healing through careful contact.",
      ),
      spell(
        "mending-circle",
        "Mending Circle",
        110,
        2,
        "Sustain a more demanding course of treatment.",
      ),
      spell(
        "restoration",
        "Restoration",
        260,
        3,
        "Coordinate complex healing under supervision.",
      ),
      spell(
        "sanctuary",
        "Sanctuary",
        560,
        4,
        "Support a team through prolonged, difficult treatment.",
      ),
      spell(
        "lifeward",
        "Lifeward",
        1000,
        5,
        "Apply exceptional precision to the protection of life.",
      ),
    ],
  },
};
export const SCHOOL_IDS = Object.keys(MAGIC_SCHOOLS) as MagicSchool[];
export const PROMOTION_XP = [25, 75, 150];
const PROMOTION_REPUTATION = [15, 30, 50];
export const CAREER_TITLES: Partial<Record<Career, string[]>> = {
  adventurer: [
    "Guild adventurer",
    "Seasoned adventurer",
    "Party leader",
    "Guild veteran",
  ],
  merchant: [
    "Merchant",
    "Established trader",
    "Caravan master",
    "Guild factor",
  ],
  healer: ["Town healer", "Senior healer", "Clinic lead", "Master healer"],
  guard: ["Town guard", "Senior guard", "Watch sergeant", "Watch captain"],
  teacher: [
    "Teacher",
    "Senior instructor",
    "Department tutor",
    "Head instructor",
  ],
};

function legacySchool(life: Life): MagicSchool {
  const label = life.training.discipline.toLowerCase();
  return SCHOOL_IDS.find((id) => label.includes(id)) ?? "water";
}
function freshCareer(role: Career, reputation = 20): Progression["career"] {
  return { role, level: 0, experience: 0, years: 0, reputation };
}
export function getProgression(life: Life): Progression {
  if (life.progression)
    return life.progression.career.role === life.career
      ? life.progression
      : {
          ...life.progression,
          career: freshCareer(
            life.career,
            Math.max(20, life.progression.career.reputation - 10),
          ),
        };
  const specialization = legacySchool(life);
  const magic = Object.fromEntries(
    SCHOOL_IDS.map((id) => [
      id,
      {
        xp: id === specialization ? life.training.magicXp : 0,
        spells: [] as string[],
      },
    ]),
  ) as Progression["magic"];
  for (const id of SCHOOL_IDS)
    magic[id].spells = MAGIC_SCHOOLS[id].spells
      .filter((s) => magic[id].xp >= s.xp && life.training.magicCap >= s.rank)
      .map((s) => s.id);
  return {
    version: 1,
    specialization,
    magic,
    career: freshCareer(life.career),
  };
}
export function migrateLife(life: Life): Life {
  return life.progression
    ? life
    : { ...life, progression: getProgression(life) };
}
export function syncSpells(life: Life): string[] {
  const p = (life.progression = getProgression(life));
  const learned: string[] = [];
  for (const id of SCHOOL_IDS) {
    for (const s of MAGIC_SCHOOLS[id].spells) {
      if (
        p.magic[id].xp >= s.xp &&
        life.training.magicCap >= s.rank &&
        !p.magic[id].spells.includes(s.id)
      ) {
        p.magic[id].spells.push(s.id);
        learned.push(s.name);
      }
    }
  }
  return learned;
}
export function setSpecialization(life: Life, school: MagicSchool): Life {
  if (
    life.phase !== "alive" ||
    life.age < 8 ||
    !Object.hasOwn(MAGIC_SCHOOLS, school)
  )
    return life;
  const next = structuredClone(life);
  next.progression = getProgression(next);
  next.progression.specialization = school;
  next.training.discipline = MAGIC_SCHOOLS[school].name;
  return next;
}
export function careerTitle(life: Life): string {
  return (
    CAREER_TITLES[life.career]?.[getProgression(life).career.level] ??
    CAREERS[life.career].name
  );
}
export function careerIncome(life: Life): number {
  const base = CAREERS[life.career].income;
  return (
    base +
    (CAREER_TITLES[life.career]
      ? [0, 12, 28, 48][getProgression(life).career.level]
      : 0)
  );
}
export function promotionSkill(life: Life): {
  current: number;
  required: number;
  label: string;
} {
  const p = getProgression(life);
  const level = Math.min(p.career.level, 2);
  if (life.career === "guard")
    return {
      current: life.training.swordXp,
      required: [25, 90, 200][level],
      label: "sword experience",
    };
  if (life.career === "adventurer")
    return {
      current: life.training.guildXp,
      required: [40, 140, 300][level],
      label: "guild experience",
    };
  if (life.career === "healer")
    return {
      current: p.magic.healing.xp,
      required: [25, 90, 200][level],
      label: "healing experience",
    };
  return {
    current: life.stats.knowledge,
    required: [25, 45, 65][level],
    label: "knowledge",
  };
}
export function canPromote(life: Life): boolean {
  const { career } = getProgression(life);
  const skill = promotionSkill(life);
  return (
    life.phase === "alive" &&
    life.age >= 15 &&
    !!CAREER_TITLES[life.career] &&
    career.level < 3 &&
    career.experience >= PROMOTION_XP[career.level] &&
    career.reputation >= PROMOTION_REPUTATION[career.level] &&
    skill.current >= skill.required
  );
}
export function applyChoiceProgression(life: Life, option: Choice): string[] {
  const p = (life.progression = getProgression(life));
  if (option.specialization) p.specialization = option.specialization;
  else if (option.discipline?.toLowerCase().includes("healing"))
    p.specialization = "healing";
  if (option.specialization || option.discipline)
    life.training.discipline = MAGIC_SCHOOLS[p.specialization].name;
  p.magic[p.specialization].xp += option.magicXp ?? 0;
  for (const id of SCHOOL_IDS) {
    const gain = option.schoolXp?.[id] ?? 0;
    p.magic[id].xp += gain;
    life.training.magicXp += gain;
  }
  p.career.experience += option.careerXp ?? 0;
  p.career.reputation = Math.max(
    0,
    Math.min(100, p.career.reputation + (option.reputation ?? 0)),
  );
  if (option.promoteCareer && canPromote(life)) {
    p.career.level++;
    p.career.reputation = Math.min(100, p.career.reputation + 6);
  }
  return syncSpells(life);
}
export function advanceProgression(
  life: Life,
  practiceXp: number,
  vocationXp: number,
): string[] {
  const p = (life.progression = getProgression(life));
  p.magic[p.specialization].xp += practiceXp;
  p.magic[life.career === "healer" ? "healing" : p.specialization].xp +=
    vocationXp;
  if (CAREER_TITLES[life.career]) {
    p.career.years++;
    const expertise = promotionSkill(life).current;
    p.career.experience +=
      5 +
      (life.focus === "work" ? 6 : 0) +
      Math.min(3, Math.floor(expertise / 30));
    p.career.reputation = Math.min(
      100,
      p.career.reputation + (life.stats.bonds >= 60 ? 3 : 1),
    );
  }
  return syncSpells(life);
}

export function isProgression(
  value: unknown,
  role: Career,
): value is Progression {
  const obj = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === "object" && !Array.isArray(v);
  const num = (v: unknown, max = 1_000_000) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max;
  if (
    !obj(value) ||
    value.version !== 1 ||
    typeof value.specialization !== "string" ||
    !Object.hasOwn(MAGIC_SCHOOLS, value.specialization) ||
    !obj(value.magic) ||
    !obj(value.career)
  )
    return false;
  if (Object.keys(value.magic).length !== SCHOOL_IDS.length) return false;
  for (const id of SCHOOL_IDS) {
    const study = value.magic[id];
    if (
      !Object.hasOwn(value.magic, id) ||
      !obj(study) ||
      !num(study.xp) ||
      !Array.isArray(study.spells) ||
      study.spells.length > 6 ||
      new Set(study.spells).size !== study.spells.length ||
      !study.spells.every(
        (s) =>
          typeof s === "string" &&
          MAGIC_SCHOOLS[id].spells.some((known) => known.id === s),
      )
    )
      return false;
  }
  const career = value.career;
  return (
    career.role === role &&
    num(career.level, 3) &&
    Number.isInteger(career.level) &&
    num(career.experience) &&
    num(career.years, 300) &&
    Number.isInteger(career.years) &&
    num(career.reputation, 100)
  );
}

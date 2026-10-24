import { EVENT_MAP, EVENTS } from "./events";
import { FIRST_NAMES, FOCUSES, RACES, REGIONS, SURNAMES } from "./world";
import type { Decision, Entry, Focus, Life, RegionId, Stats } from "./types";
import {
  advanceProgression,
  applyChoiceProgression,
  careerIncome,
  getProgression,
} from "./progression";

const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, n));
function random(state: { rng: number }) {
  state.rng = (state.rng + 0x6d2b79f5) >>> 0;
  let t = state.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function pick<T>(state: { rng: number }, items: readonly T[]) {
  return items[Math.floor(random(state) * items.length)];
}
function addEntry(
  life: Life,
  title: string,
  text: string,
  kind: Entry["kind"] = "life",
) {
  life.history.push({
    id: (life.history.at(-1)?.id ?? 0) + 1,
    age: life.age,
    title,
    text,
    kind,
  });
  if (life.history.length > 600) life.history.shift();
}
function normalizeStats(life: Life) {
  for (const key of Object.keys(life.stats) as (keyof Stats)[])
    life.stats[key] = clamp(Math.round(life.stats[key] * 10) / 10);
  life.coins = clamp(Math.round(life.coins), 0, 1_000_000);
}

export function createLife(
  options: { name?: string; seed?: number; region?: RegionId } = {},
): Life {
  const seed =
    (options.seed ?? crypto.getRandomValues(new Uint32Array(1))[0]) >>> 0;
  const source = { rng: seed };
  const ids = Object.keys(REGIONS) as RegionId[];
  let target = random(source) * 100;
  const region =
    options.region ??
    ids.find((id) => (target -= REGIONS[id].weight) < 0) ??
    "asura";
  const race = pick(source, REGIONS[region].races);
  const name = options.name?.trim().slice(0, 32) || pick(source, FIRST_NAMES);
  const surname = pick(source, SURNAMES);
  const background = pick(source, [
    "A farming family",
    "A family of craftspeople",
    "A traveling merchant family",
    "A modest household",
    "A well-established family",
  ]);
  const stats: Stats = {
    health: 74 + Math.floor(random(source) * 17),
    happiness: 60 + Math.floor(random(source) * 15),
    knowledge: 18,
    bonds: 55 + Math.floor(random(source) * 20),
    mana: 12 + Math.floor(random(source) * 18),
    sword: 5,
  };
  const life: Life = {
    version: 1,
    id: `life-${seed.toString(16)}`,
    seed,
    rng: source.rng,
    name,
    surname,
    race,
    birthRegion: region,
    region,
    hometown: REGIONS[region].place,
    background,
    aptitude: pick(source, [
      "A feel for water magic",
      "A quick, curious mind",
      "An instinct for the sword",
      "A gift for connecting with people",
    ]),
    personality: pick(source, [
      "Quietly curious",
      "Warm-hearted",
      "Resolute",
      "Thoughtful",
      "Restlessly hopeful",
    ]),
    phase: "birth",
    age: 0,
    progress: 0,
    memories: true,
    stats,
    coins:
      12 +
      Math.floor(random(source) * 48) +
      (background === "A well-established family" ? 40 : 0),
    focus: "balanced",
    career: "child",
    training: {
      magicXp: 0,
      swordXp: 0,
      magicCap: 1,
      swordCap: 1,
      discipline: "Elemental magic",
      school: "Not yet chosen",
      guildXp: 0,
    },
    family: [],
    flags: {},
    history: [],
    pending: null,
    seen: {},
    deathAge: Math.min(
      RACES[race].maxAge,
      Math.floor(RACES[race].lifespan * (0.88 + random(source) * 0.3)),
    ),
    ending: null,
  };
  life.rng = source.rng;
  life.family = [
    {
      id: "mother",
      name: `${pick(life, ["Elena", "Celia", "Nara", "Maris"])} ${surname}`,
      role: "Mother",
      bornAt: -(24 + Math.floor(random(life) * 9)),
      lifespan: RACES[race].lifespan,
    },
    {
      id: "father",
      name: `${pick(life, ["Tomas", "Alden", "Eren", "Corin"])} ${surname}`,
      role: "Father",
      bornAt: -(26 + Math.floor(random(life) * 9)),
      lifespan: RACES[race].lifespan + 3,
    },
  ];
  addEntry(
    life,
    "You are born. Again.",
    `You enter this world in ${REGIONS[region].name}, into ${background.toLowerCase()}. A new name, a new family—and memories that belong somewhere else.`,
    "birth",
  );
  life.progression = getProgression(life);
  return life;
}

export function beginLife(life: Life): Life {
  if (life.phase !== "birth") return life;
  return {
    ...life,
    phase: "alive",
    pending: "first-memory",
    seen: { ...life.seen, "first-memory": 0 },
  };
}
export function getDecision(life: Life): Decision | null {
  if (!life.pending || life.phase !== "alive") return null;
  const event = EVENT_MAP.get(life.pending);
  return event
    ? {
        id: event.id,
        title: event.title,
        text: event.text,
        kind: event.kind,
        choices: event.choices(life),
      }
    : null;
}
export function setFocus(life: Life, focus: Focus): Life {
  if (
    life.phase !== "alive" ||
    !FOCUSES[focus] ||
    life.age < FOCUSES[focus].minAge
  )
    return life;
  return { ...life, focus };
}
export function finishLife(life: Life, cause: string) {
  life.phase = "ended";
  life.pending = null;
  life.progress = 0;
  const legacy = life.flags.taughtOthers
    ? "You left knowledge in the hands of others."
    : life.stats.bonds >= 70
      ? "You made a home in the hearts of the people you loved."
      : life.training.magicXp > 200
        ? "You never stopped asking what might be possible."
        : life.training.swordXp > 200
          ? "You met the world with courage, one step at a time."
          : "An ordinary life, filled with things that mattered.";
  life.ending = { cause, legacy };
  addEntry(life, "The last page of this life", `${cause} ${legacy}`, "ending");
}

export function choose(life: Life, choiceId: string): Life {
  const decision = getDecision(life);
  const option = decision?.choices.find((item) => item.id === choiceId);
  if (!option || option.disabled || (option.cost ?? 0) > life.coins)
    return life;
  const next = structuredClone(life);
  next.progression = getProgression(next);
  next.pending = null;
  next.coins -= option.cost ?? 0;
  const failed = option.risk !== undefined && random(next) < option.risk;
  let outcome = option.outcome;
  if (failed) {
    next.stats.health -= 18 + Math.floor(random(next) * 16);
    next.stats.happiness -= 4;
    outcome =
      "The risk does not pay off. You return hurt, with no reward, but with a lesson you will not soon forget. Recovery will take time.";
  } else {
    next.coins += option.coins ?? 0;
    next.training.magicXp += option.magicXp ?? 0;
    next.training.swordXp += option.swordXp ?? 0;
    if (option.effects)
      for (const [key, value] of Object.entries(option.effects))
        next.stats[key as keyof Stats] += value;
    for (const flag of option.flags ?? []) next.flags[flag] = true;
    if (option.career) next.career = option.career;
    if (option.region) next.region = option.region;
    if (option.discipline) next.training.discipline = option.discipline;
    if (option.school) next.training.school = option.school;
    if (option.magicCap !== undefined)
      next.training.magicCap = Math.max(
        next.training.magicCap,
        option.magicCap,
      );
    if (option.swordCap !== undefined)
      next.training.swordCap = Math.max(
        next.training.swordCap,
        option.swordCap,
      );
    if (option.partner)
      next.family.push({
        id: "partner",
        name: `${pick(next, FIRST_NAMES)} ${pick(next, SURNAMES)}`,
        role: "Partner",
        bornAt: next.age - 23,
        lifespan: RACES[next.race].lifespan,
      });
    if (option.child)
      next.family.push({
        id: "child",
        name: `${pick(next, FIRST_NAMES)} ${next.surname}`,
        role: "Child",
        bornAt: next.age,
        lifespan: RACES[next.race].lifespan,
      });
    if (decision?.id === "guild-quest") next.training.guildXp += 32;
    const learned = applyChoiceProgression(next, option);
    if (learned.length)
      addEntry(
        next,
        "Your spellbook grows",
        `Through practice and instruction, you learn ${learned.join(", ")}.`,
        "training",
      );
  }
  addEntry(
    next,
    option.label,
    outcome,
    decision?.kind === "Past-life memory" || decision?.id === "first-memory"
      ? "memory"
      : "choice",
  );
  normalizeStats(next);
  if (next.stats.health <= 0)
    finishLife(
      next,
      "The injuries of a dangerous journey brought this life to an early close.",
    );
  return next;
}

function endYear(life: Life) {
  life.progression = getProgression(life);
  const previousMagicXp = life.training.magicXp;
  life.age += 1;
  life.progress = 0;
  const focus = FOCUSES[life.focus];
  for (const [key, value] of Object.entries(focus.effects))
    life.stats[key as keyof Stats] += value;
  const practiceXp =
    (focus.magic ?? 0) * (life.flags.earlyMana && life.age <= 15 ? 1.5 : 1);
  life.training.magicXp += practiceXp;
  life.training.swordXp += focus.sword ?? 0;
  life.stats.health -= 0.8;
  life.stats.happiness -= 0.8;
  life.stats.bonds -= 0.7;
  const agingAt = RACES[life.race].lifespan * 0.7;
  if (life.age > agingAt)
    life.stats.health -= 1.2 + (life.age - agingAt) * 0.035;
  if (life.age < 15)
    life.coins += life.background === "A well-established family" ? 5 : 2;
  else {
    const income = careerIncome(life);
    const bonus = life.focus === "work" ? 10 : 0;
    const expenses = Math.floor(income * 0.5) + (life.flags.parent ? 3 : 0);
    life.coins += Math.max(0, income + bonus - expenses);
    if (life.career === "adventurer") {
      life.training.guildXp += 9;
      life.training.swordXp += 3;
      life.training.magicXp += 2;
    }
    if (
      life.career === "student" ||
      life.career === "healer" ||
      life.career === "teacher"
    )
      life.training.magicXp += 4;
    if (life.career === "guard") life.training.swordXp += 5;
  }
  const learned = advanceProgression(
    life,
    practiceXp,
    life.training.magicXp - previousMagicXp - practiceXp,
  );
  if (learned.length)
    addEntry(
      life,
      "Your spellbook grows",
      `A year of practice brings ${learned.join(", ")} within your reach.`,
      "training",
    );
  life.stats.mana = Math.max(
    life.stats.mana,
    Math.min(100, 14 + Math.sqrt(life.training.magicXp) * 3),
  );
  life.stats.sword = Math.max(
    life.stats.sword,
    Math.min(100, 5 + Math.sqrt(life.training.swordXp) * 3),
  );
  normalizeStats(life);
  for (const person of life.family) {
    const flag = `farewell-${person.id}`;
    if (life.age - person.bornAt >= person.lifespan && !life.flags[flag]) {
      life.flags[flag] = true;
      life.stats.happiness = Math.max(0, life.stats.happiness - 8);
      addEntry(
        life,
        `Remembering ${person.name.split(" ")[0]}`,
        `Your ${person.role.toLowerCase()} reaches the end of a long life. The things they taught you remain.`,
        "life",
      );
    }
  }
  if (life.age >= life.deathAge || life.stats.health <= 0) {
    finishLife(
      life,
      life.stats.health <= 0
        ? "Your health declined, and this life came gently to its close."
        : "After a lifetime of seasons, you passed away of old age.",
    );
    return;
  }
  const eligible = EVENTS.filter(
    (event) =>
      event.id !== "first-memory" &&
      life.age >= event.minAge &&
      life.age <= (event.maxAge ?? Infinity) &&
      (event.atAge === undefined || event.atAge === life.age) &&
      (!event.once || life.seen[event.id] === undefined) &&
      (life.seen[event.id] === undefined ||
        life.age - life.seen[event.id] >= (event.cooldown ?? 1)) &&
      (!event.condition || event.condition(life)),
  );
  let event = eligible.find((item) => item.atAge === life.age);
  if (!event && eligible.length && random(life) < 0.68) {
    let threshold =
      random(life) *
      eligible.reduce((sum, item) => sum + (item.weight ?? 1), 0);
    event = eligible.find((item) => (threshold -= item.weight ?? 1) <= 0);
  }
  if (event) {
    life.pending = event.id;
    life.seen[event.id] = life.age;
  } else {
    const messages: Record<Focus, [string, string]> = {
      balanced: [
        "Another season, another small beginning",
        "You learn a little, work a little, and make room for the people around you. This life is becoming your own.",
      ],
      magic: [
        "Practice becomes understanding",
        "Through patient repetition, your control of mana grows a little steadier.",
      ],
      sword: [
        "The familiar rhythm of training",
        "Step, breathe, strike. You carry the discipline of the training yard into the rest of your day.",
      ],
      study: [
        "A world between the pages",
        "The more you read, the larger this world becomes. Old knowledge and new discoveries begin to fit together.",
      ],
      work: [
        "An honest year’s work",
        "Silver finds its way into your purse. You try to remember what you are earning it for.",
      ],
      bonds: [
        "Time well spent",
        "Conversations, shared meals, and familiar walks. You strengthen the ties that make this world feel like home.",
      ],
      explore: [
        "The road teaches you something",
        "A new path, an unfamiliar face, a story you had never heard. Your map of the world grows.",
      ],
      rest: [
        "A little room to breathe",
        "You take care of yourself. For once, progress means giving yourself time.",
      ],
    };
    const [title, text] =
      life.age < 3
        ? [
            "The world comes into focus",
            "Sounds become words, faces become family. Your body is small, but your curiosity is anything but.",
          ]
        : messages[life.focus];
    addEntry(
      life,
      title,
      text,
      life.focus === "magic" || life.focus === "sword" ? "training" : "life",
    );
  }
}

export function advance(
  life: Life,
  mode: "year" | "decision" | "tick",
  deltaYears = 1 / 12,
): Life {
  if (life.phase !== "alive" || life.pending) return life;
  const next = structuredClone(life);
  if (mode === "tick") {
    if (!Number.isFinite(deltaYears) || deltaYears <= 0) return life;
    next.progress += Math.min(0.25, deltaYears);
    if (next.progress >= 1 - 1e-9) endYear(next);
  } else {
    const limit = mode === "year" ? 1 : 12;
    for (let i = 0; i < limit; i++) {
      endYear(next);
      if (next.pending || next.phase !== "alive") break;
    }
  }
  return next;
}

import type { Career, Focus, RaceId, RegionId, Stat } from "./types";

export const RACES: Record<
  RaceId,
  { name: string; lifespan: number; maxAge: number; description: string }
> = {
  human: {
    name: "Human",
    lifespan: 78,
    maxAge: 105,
    description: "A brief life, with room for extraordinary things.",
  },
  elf: {
    name: "Elf",
    lifespan: 210,
    maxAge: 270,
    description: "The seasons turn slowly for your people.",
  },
  beastfolk: {
    name: "Beastfolk",
    lifespan: 90,
    maxAge: 120,
    description: "Keen senses and a deep connection to your kin.",
  },
  migurd: {
    name: "Migurd",
    lifespan: 190,
    maxAge: 240,
    description: "A long-lived demon people of the Demon Continent.",
  },
  dwarf: {
    name: "Dwarf",
    lifespan: 125,
    maxAge: 165,
    description: "Patient hands, enduring spirit, and a gift for craft.",
  },
};
export const REGIONS: Record<
  RegionId,
  {
    name: string;
    short: string;
    place: string;
    description: string;
    races: RaceId[];
    weight: number;
    opportunity: string;
    x: number;
    y: number;
  }
> = {
  asura: {
    name: "Asura Kingdom",
    short: "Asura",
    place: "a village in the Asura countryside",
    description:
      "Golden fields, busy trade roads, and the long shadow of the nobility. Opportunity and inequality grow side by side.",
    races: ["human", "human", "human", "elf"],
    weight: 35,
    opportunity: "Trade & swordsmanship",
    x: 28,
    y: 42,
  },
  ranoa: {
    name: "Ranoa Kingdom",
    short: "Ranoa",
    place: "the outskirts of Sharia",
    description:
      "Snow on the rooftops and magic in the lecture halls. The northern lands reward curious minds and stubborn resolve.",
    races: ["human", "human", "elf", "dwarf"],
    weight: 22,
    opportunity: "Magic & scholarship",
    x: 36,
    y: 24,
  },
  millis: {
    name: "Holy Country of Millis",
    short: "Millis",
    place: "a town outside Millishion",
    description:
      "Cathedral bells ring over white stone streets. Healers, merchants, and faithful travelers find a home here.",
    races: ["human", "human", "dwarf"],
    weight: 17,
    opportunity: "Healing & community",
    x: 53,
    y: 60,
  },
  forest: {
    name: "The Great Forest",
    short: "Great Forest",
    place: "a settlement beneath the Great Forest canopy",
    description:
      "Ancient trees shelter close-knit communities. The forest gives generously to those who learn to listen.",
    races: ["beastfolk", "beastfolk", "elf"],
    weight: 12,
    opportunity: "Kinship & exploration",
    x: 64,
    y: 51,
  },
  demon: {
    name: "Demon Continent",
    short: "Demon Continent",
    place: "a settlement near Rikarisu",
    description:
      "Rugged earth, strange skies, and formidable monsters. The people here know the value of trust and a shared meal.",
    races: ["migurd", "migurd", "dwarf"],
    weight: 9,
    opportunity: "Adventuring & resilience",
    x: 78,
    y: 27,
  },
  begaritt: {
    name: "Begaritt Continent",
    short: "Begaritt",
    place: "an oasis settlement near Rapan",
    description:
      "Caravans cross the desert between ancient labyrinths. Every journey begins with water, preparation, and a little courage.",
    races: ["human", "human", "dwarf", "beastfolk"],
    weight: 5,
    opportunity: "Trade & labyrinths",
    x: 28,
    y: 76,
  },
};
export const FOCUSES: Record<
  Focus,
  {
    name: string;
    description: string;
    minAge: number;
    effects: Partial<Record<Stat, number>>;
    magic?: number;
    sword?: number;
  }
> = {
  balanced: {
    name: "Take it all in",
    description: "A little learning, a little living.",
    minAge: 0,
    effects: { happiness: 2, bonds: 1, knowledge: 1 },
  },
  magic: {
    name: "Practice magic",
    description: "Develop mana and magical skill.",
    minAge: 3,
    effects: { mana: 2, knowledge: 1, happiness: -1 },
    magic: 9,
  },
  sword: {
    name: "Train with a sword",
    description: "Build technique and resilience.",
    minAge: 5,
    effects: { sword: 2, health: 1, bonds: -1 },
    sword: 9,
  },
  study: {
    name: "Read & learn",
    description: "Turn old memories into new knowledge.",
    minAge: 3,
    effects: { knowledge: 4, happiness: -1 },
  },
  work: {
    name: "Earn a living",
    description: "More silver, less time for yourself.",
    minAge: 15,
    effects: { happiness: -2, health: -1, bonds: -1 },
  },
  bonds: {
    name: "Family & friends",
    description: "Make this life a shared one.",
    minAge: 0,
    effects: { bonds: 4, happiness: 3 },
  },
  explore: {
    name: "Explore the world",
    description: "Find stories beyond the familiar.",
    minAge: 10,
    effects: { knowledge: 2, happiness: 2, health: -1 },
  },
  rest: {
    name: "Slow down",
    description: "Look after your body and mind.",
    minAge: 0,
    effects: { health: 4, happiness: 2 },
  },
};
export const CAREERS: Record<Career, { name: string; income: number }> = {
  child: { name: "A new beginning", income: 0 },
  student: { name: "Magic student", income: 2 },
  adventurer: { name: "Guild adventurer", income: 24 },
  merchant: { name: "Merchant", income: 29 },
  healer: { name: "Town healer", income: 25 },
  guard: { name: "Town guard", income: 22 },
  teacher: { name: "Teacher", income: 23 },
  retired: { name: "A quieter chapter", income: 9 },
};
export const RANKS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Saint",
  "King",
  "Emperor",
  "God",
];
export const RANK_XP = [0, 35, 110, 260, 560, 1000, 1800];
export function rankFor(xp: number, cap: number) {
  return RANKS[Math.min(cap, RANK_XP.filter((n) => xp >= n).length - 1)];
}
export function guildRank(xp: number) {
  return ["F", "E", "D", "C", "B", "A", "S"][Math.min(6, Math.floor(xp / 75))];
}
export function lifeStage(age: number, race: RaceId) {
  return age < 3
    ? "Infancy"
    : age < 12
      ? "Childhood"
      : age < 18
        ? "Youth"
        : age < RACES[race].lifespan * 0.7
          ? "Adulthood"
          : "Later years";
}
export const FIRST_NAMES = [
  "Aster",
  "Elian",
  "Liora",
  "Ren",
  "Sera",
  "Theo",
  "Mira",
  "Noel",
  "Arin",
  "Luca",
  "Faye",
  "Eden",
];
export const SURNAMES = [
  "Ashvale",
  "Valen",
  "Mirel",
  "Thorne",
  "Rowan",
  "Avel",
  "Linden",
  "Veyra",
];

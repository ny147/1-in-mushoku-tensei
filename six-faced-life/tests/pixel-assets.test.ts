// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { REGIONS, RACES } from "../src/game/world";
import { OCCUPATIONS } from "../src/game/expanded/balance";
import type { AgeStage, Rank } from "../src/components/life-scene/types";
import type { MagicSchool } from "../src/game/types";
import { SWORD_STYLES } from "../src/game/expanded/sword-state";
import manifest from "../src/components/life-scene/assets.json";
import {
  getSceneLayers,
  sceneAssetBytes,
} from "../src/components/life-scene/assets";
import {
  resolveScene,
  sampleSceneFacts,
} from "../src/components/life-scene/model";
import { expandedSceneLife } from "../src/components/life-scene/fixtures";

it("ships correctly sized original regional PNG backgrounds", () => {
  for (const region of Object.keys(REGIONS)) {
    const data = readFileSync(
      new URL(
        `../public/assets/pixel-life/regions/${region}.png`,
        import.meta.url,
      ),
    );
    expect(data.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([data.readUInt32BE(16), data.readUInt32BE(20)]).toEqual([768, 256]);
    expect(data.byteLength).toBeLessThan(2000000);
  }
});

it("validates every delivered PNG against its manifest metadata", () => {
  for (const asset of Object.values(manifest.assets)) {
    const data = readFileSync(
      new URL(`../public${asset.url}`, import.meta.url),
    );
    expect([data.readUInt32BE(16), data.readUInt32BE(20)]).toEqual([
      asset.width,
      asset.height,
    ]);
    expect(data.byteLength).toBe(asset.bytes);
    if (asset.alpha) expect([4, 6]).toContain(data[25]);
  }
});
it("loads only current layers and stops effects while idling", () => {
  const l = expandedSceneLife();
  l.focus = "magic";
  const model = resolveScene(sampleSceneFacts(l));
  const active = getSceneLayers(model, "magic");
  expect(active.some((x) => x.id.startsWith("effects/"))).toBe(true);
  expect(
    getSceneLayers(model, "idle").some((x) => x.id.startsWith("effects/")),
  ).toBe(false);
  expect(
    active.filter((x) => x.id.startsWith("regions/")).map((x) => x.id),
  ).toEqual([`regions/${l.region}`]);
  expect(sceneAssetBytes(active)).toBeLessThan(2000000);
  expect(active.length).toBeLessThanOrEqual(20);
});
it("covers every current race, age, occupation, training discipline and earned rank", () => {
  const base = resolveScene(sampleSceneFacts(expandedSceneLife()));
  for (const race of Object.keys(RACES) as (keyof typeof RACES)[])
    for (const stage of [
      "infant",
      "child",
      "teen",
      "adult",
      "elder",
    ] as AgeStage[]) {
      for (const occupation of [...OCCUPATIONS, "neutral"] as const) {
        const model = {
          ...base,
          race,
          stage,
          occupation,
          outfit: stage === "infant" ? ("neutral" as const) : occupation,
          training: null,
        };
        const layers = getSceneLayers(model, "idle");
        expect(sceneAssetBytes(layers)).toBeLessThan(2000000);
      }
      if (stage === "infant") continue;
      for (const rank of [0, 1, 2, 3, 4, 5, 6] as Rank[]) {
        for (const discipline of [
          "water",
          "fire",
          "earth",
          "wind",
          "healing",
        ] as MagicSchool[]) {
          const layers = getSceneLayers(
            {
              ...base,
              race,
              stage,
              outfit: "magic-training",
              training: { family: "magic", discipline, rank },
            },
            "magic",
          );
          expect(sceneAssetBytes(layers)).toBeLessThan(2000000);
          expect(layers.length).toBeLessThanOrEqual(20);
        }
        for (const discipline of SWORD_STYLES) {
          const layers = getSceneLayers(
            {
              ...base,
              race,
              stage,
              outfit: "sword-training",
              training: { family: "sword", discipline, rank },
            },
            discipline,
          );
          expect(sceneAssetBytes(layers)).toBeLessThan(2000000);
        }
      }
    }
});

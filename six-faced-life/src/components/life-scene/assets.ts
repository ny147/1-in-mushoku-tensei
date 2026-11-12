import manifest from "./assets.json";
import type {
  AssetRecord,
  ClipId,
  SceneCompanion,
  SceneLayer,
  SceneModel,
} from "./types";
export const CLIPS: readonly ClipId[] = [
  "idle",
  "observe",
  "magic",
  "sword-god",
  "water-god",
  "north-god",
  "read",
  "work",
  "social",
  "walk",
  "rest",
  "celebrate",
  "greet",
  "arrive",
  "birth",
  "ending",
  "prepare",
];
const assets: Readonly<Record<string, AssetRecord>> = manifest.assets;
export function getCompanionLayers(
  person: SceneCompanion,
): readonly SceneLayer[] {
  return [
    `bodies/${person.race}-${person.stage}`,
    `outfits/${person.stage}-${person.outfit}`,
  ].map((id, z) => {
    const asset = assets[id];
    if (!asset) throw new Error(`Missing pixel scene asset: ${id}`);
    return {
      id,
      asset,
      anchor: "hero",
      row: 0,
      frames: 4,
      durationMs: 1000,
      z,
    };
  });
}
export function getSceneLayers(
  model: SceneModel,
  clip: ClipId,
): readonly SceneLayer[] {
  const row = CLIPS.indexOf(clip);
  const frames = clip === "idle" ? 4 : clip === "ending" ? 1 : 8;
  const durationMs = ["celebrate", "greet", "arrive", "birth"].includes(clip)
    ? 2000
    : 1000;
  const layers: SceneLayer[] = [];
  function add(
    id: string,
    anchor: SceneLayer["anchor"],
    r = row,
    count = frames,
    duration = durationMs,
  ) {
    const asset = assets[id];
    if (!asset) throw new Error(`Missing pixel scene asset: ${id}`);
    layers.push({
      id,
      asset,
      anchor,
      row: r,
      frames: count,
      durationMs: duration,
      z: layers.length,
    });
  }
  add(`regions/${model.region}`, "background", 0, 1, 0);
  add(`bodies/${model.race}-${model.stage}`, "hero");
  add(`outfits/${model.stage}-${model.outfit}`, "hero");
  if (
    model.training?.rank !== null &&
    model.training &&
    model.stage !== "infant"
  ) {
    add(
      `ranks/${model.stage}-${model.training.family}-${model.training.rank}`,
      "hero",
    );
    if (
      model.training.discipline &&
      (clip === "magic" || clip === model.training.discipline)
    )
      add(`effects/${model.training.discipline}`, "effect", 0, 8, 1000);
  }
  return layers;
}
export function sceneAssetBytes(layers: readonly SceneLayer[]): number {
  return [
    ...new Map(layers.map((l) => [l.asset.url, l.asset.bytes])).values(),
  ].reduce((a, b) => a + b, 0);
}

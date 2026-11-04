import { expect, it } from "vitest";
import { sceneDescription } from "./life-scene";
import { resolveScene, sampleSceneFacts } from "../components/life-scene/model";
import { expandedSceneLife } from "../components/life-scene/fixtures";
it("describes current activity and identity in English and Thai", () => {
  const l = expandedSceneLife();
  l.focus = "magic";
  l.race = "elf";
  const model = resolveScene(sampleSceneFacts(l));
  expect(sceneDescription(model, "en")).toContain("magic");
  expect(sceneDescription(model, "th")).toContain("เวท");
  expect(sceneDescription(model, "th")).not.toContain("undefined");
});

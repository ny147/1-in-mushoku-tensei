import { expect, it } from "vitest";
import { sceneDescription } from "./life-scene";
import { resolveScene, sampleSceneFacts } from "../components/life-scene/model";
import {
  expandedSceneLife,
  expandedFamilySceneLife,
} from "../components/life-scene/fixtures";
it.each(["en", "th"] as const)(
  "describes only present family in %s",
  (language) => {
    const life = expandedFamilySceneLife();
    const spouse = life.expansion.family.people.find(
      (p) => p.role === "spouse",
    )!;
    expect(
      sceneDescription(resolveScene(sampleSceneFacts(life)), language),
    ).toContain(spouse.name);
    expect(
      sceneDescription(resolveScene(sampleSceneFacts(life)), language),
    ).toContain(language === "en" ? "Partner" : "คู่ครอง");
    spouse.home = life.region === "asura" ? "ranoa" : "asura";
    expect(
      sceneDescription(resolveScene(sampleSceneFacts(life)), language),
    ).not.toContain(spouse.name);
  },
);
it("describes current activity and identity in English and Thai", () => {
  const l = expandedSceneLife();
  l.focus = "magic";
  l.race = "elf";
  const model = resolveScene(sampleSceneFacts(l));
  expect(sceneDescription(model, "en")).toContain("magic");
  expect(sceneDescription(model, "th")).toContain("เวท");
  expect(sceneDescription(model, "th")).not.toContain("undefined");
});

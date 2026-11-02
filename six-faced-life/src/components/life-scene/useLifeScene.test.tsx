// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { expandedSceneLife } from "./fixtures";
import { useLifeScene } from "./useLifeScene";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
it("uses activity while playing, idle while paused/pending and stops hidden work", () => {
  const life = expandedSceneLife();
  life.focus = "study";
  const { result, rerender } = renderHook(useLifeScene, {
    initialProps: { life, enabled: true, playing: true, motionEnabled: true },
  });
  expect(result.current.presentation?.clip).toBe("read");
  rerender({ life, enabled: true, playing: false, motionEnabled: true });
  expect(result.current.presentation?.clip).toBe("idle");
  expect(result.current.presentation?.ambientMotion).toBe(true);
  rerender({
    life: { ...life, pending: "birth" },
    enabled: true,
    playing: true,
    motionEnabled: true,
  });
  expect(result.current.presentation?.clip).toBe("idle");
  act(() => result.current.setVisible(false));
  expect(result.current.presentation?.characterMotion).toBe(false);
  expect(result.current.presentation?.ambientMotion).toBe(false);
});
it("expires reactions after two seconds without replay on navigation or load", () => {
  vi.useFakeTimers();
  const life = expandedSceneLife();
  const { result, rerender } = renderHook(useLifeScene, {
    initialProps: { life, enabled: true, playing: true, motionEnabled: true },
  });
  expect(result.current.presentation?.reaction).toBeNull();
  const arrived = {
    ...life,
    region: life.region === "asura" ? ("demon" as const) : ("asura" as const),
  };
  rerender({
    life: arrived,
    enabled: true,
    playing: true,
    motionEnabled: true,
  });
  expect(result.current.presentation?.reaction).toBe("arrival");
  act(() => vi.advanceTimersByTime(2000));
  expect(result.current.presentation?.reaction).toBeNull();
  rerender({ life, enabled: false, playing: true, motionEnabled: true });
  rerender({
    life: arrived,
    enabled: true,
    playing: true,
    motionEnabled: true,
  });
  expect(result.current.presentation?.reaction).toBeNull();
});
it("honors motion off and ends in a still pose", () => {
  const life = expandedSceneLife();
  const { result, rerender } = renderHook(useLifeScene, {
    initialProps: { life, enabled: true, playing: true, motionEnabled: false },
  });
  expect(result.current.presentation?.characterMotion).toBe(false);
  rerender({
    life: { ...life, phase: "ended" },
    enabled: true,
    playing: true,
    motionEnabled: true,
  });
  expect(result.current.presentation).toMatchObject({
    clip: "ending",
    characterMotion: false,
    ambientMotion: false,
  });
});

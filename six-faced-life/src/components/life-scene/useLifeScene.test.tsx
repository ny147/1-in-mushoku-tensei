// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { expandedSceneLife } from "./fixtures";
import { useLifeScene } from "./useLifeScene";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("reacts to reduced-motion changes and removes its media subscription", () => {
  let changed: (() => void) | undefined;
  const media = {
    matches: false,
    addEventListener: vi.fn((_event, callback) => { changed = callback; }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal("matchMedia", () => media);
  const { result, unmount } = renderHook(useLifeScene, {
    initialProps: { life: expandedSceneLife(), enabled: true, playing: true, motionEnabled: true },
  });
  act(() => { media.matches = true; changed?.(); });
  expect(result.current.presentation).toMatchObject({ reducedMotion: true, characterMotion: false, ambientMotion: false });
  act(() => { media.matches = false; changed?.(); });
  expect(result.current.presentation?.characterMotion).toBe(true);
  unmount();
  expect(media.removeEventListener).toHaveBeenCalledWith("change", changed);
});
it("drops hidden transitions and clears reaction timers and document listeners", () => {
  vi.useFakeTimers();
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  const remove = vi.spyOn(document, "removeEventListener");
  const life = expandedSceneLife();
  const input = { life, enabled: true, playing: true, motionEnabled: true };
  const { result, rerender, unmount } = renderHook(useLifeScene, { initialProps: input });
  const arrived = { ...life, region: life.region === "asura" ? "demon" as const : "asura" as const };
  rerender({ ...input, life: arrived });
  expect(result.current.presentation?.reaction).toBe("arrival");
  expect(vi.getTimerCount()).toBe(1);
  act(() => { hidden.mockReturnValue(true); document.dispatchEvent(new Event("visibilitychange")); });
  expect(result.current.presentation?.ambientMotion).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
  rerender(input);
  act(() => { hidden.mockReturnValue(false); document.dispatchEvent(new Event("visibilitychange")); });
  expect(result.current.presentation?.reaction).toBeNull();
  rerender({ ...input, life: arrived });
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(remove.mock.calls.some(([name]) => name === "visibilitychange")).toBe(true);
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

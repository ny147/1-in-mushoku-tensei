// @vitest-environment jsdom
import {
  cleanup,
  render,
  screen,
  fireEvent,
  act,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PixelLifeScene } from "./PixelLifeScene";
import { expandedSceneLife } from "./fixtures";
import { resolveScene, sampleSceneFacts } from "./model";
let images: {
  src: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;
}[] = [];
beforeEach(() => {
  images = [];
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      onload = null;
      onerror = null;
      constructor() {
        images.push(this);
      }
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const props = () => ({
  presentation: {
    model: resolveScene(sampleSceneFacts(expandedSceneLife())),
    clip: "idle" as const,
    characterMotion: true,
    ambientMotion: true,
    reaction: null,
  },
  onVisibilityChange: vi.fn(),
  motionEnabled: true,
  onMotionChange: vi.fn(),
});
it("uses a complete fallback until all current layers load, and keeps controls accessible", () => {
  const p = props();
  const { container } = render(<PixelLifeScene {...p} />);
  expect(container.querySelector('[data-scene-ready="false"]')).not.toBeNull();
  act(() => images.forEach((i) => i.onload?.()));
  expect(container.querySelector('[data-scene-ready="true"]')).not.toBeNull();
  expect(screen.getByRole("img", { name: /pixel scene/i })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Scene motion" }));
  expect(p.onMotionChange).toHaveBeenCalledWith(false);
});
it("never lets stale images replace a newer scene and handles failures", () => {
  const p = props();
  const { rerender, container } = render(<PixelLifeScene {...p} />);
  const old = [...images];
  // A callback already queued by the browser survives handler detachment.
  const queued = old.map((i) => i.onload);
  const next = {
    ...p,
    presentation: {
      ...p.presentation,
      model: {
        ...p.presentation.model,
        region:
          p.presentation.model.region === "asura"
            ? ("demon" as const)
            : ("asura" as const),
      },
    },
  };
  rerender(<PixelLifeScene {...next} />);
  act(() => queued.forEach((load) => load?.()));
  expect(container.querySelector('[data-scene-ready="false"]')).not.toBeNull();
  act(() =>
    images.filter((i) => !old.includes(i)).forEach((i) => i.onerror?.()),
  );
  expect(container.querySelector('[data-scene-ready="false"]')).not.toBeNull();
});
it("settles only the newest complete scene and disconnects visibility observation", () => {
  const disconnect = vi.fn();
  let notify: (entries: { isIntersecting: boolean }[]) => void = () => {};
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: typeof notify) { notify = callback; }
    observe() {}
    disconnect = disconnect;
  });
  const p = props();
  const { container, unmount } = render(<PixelLifeScene {...p} />);
  act(() => notify([{ isIntersecting: false }]));
  expect(p.onVisibilityChange).toHaveBeenLastCalledWith(false);
  act(() => images.slice(1).forEach((image) => image.onload?.()));
  expect(container.querySelector('[data-scene-ready="false"]')).not.toBeNull();
  act(() => images[0].onload?.());
  expect(container.querySelector('[data-scene-ready="true"]')).not.toBeNull();
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(images.every((image) => image.onload === null && image.onerror === null)).toBe(true);
});

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
import { expandedSceneLife, expandedFamilySceneLife } from "./fixtures";
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
it("renders present family with their own age sprites and removes them immediately when away", () => {
  const life = expandedFamilySceneLife();
  const p = props();
  p.presentation.model = resolveScene(sampleSceneFacts(life));
  const { container, rerender } = render(<PixelLifeScene {...p} />);
  act(() => images.forEach((i) => i.onload?.()));
  expect(container.querySelectorAll(".pixel-companion").length).toBe(2);
  expect(
    container.querySelectorAll('.pixel-companion [style*="infant"]').length,
  ).toBe(2);
  expect(screen.getByText(/Together here/).textContent).toContain("Partner");
  expect(screen.getByText(/Together here/).textContent).toContain("Child");
  expect(screen.getByRole("img", { name: /Together here/ })).toBeTruthy();
  const child = life.expansion.family.people.find(
    (person) => person.role === "child",
  )!;
  child.home = life.region === "asura" ? "ranoa" : "asura";
  rerender(
    <PixelLifeScene
      {...p}
      presentation={{
        ...p.presentation,
        model: resolveScene(sampleSceneFacts(life)),
      }}
    />,
  );
  // Existing cached layers must not retain an absent person's artwork or name.
  expect(
    container.querySelector(`[data-companion-id="${child.id}"]`),
  ).toBeNull();
  expect(screen.getByText(/Together here/).textContent).not.toContain(
    child.name,
  );
  life.expansion.family.marriages[0].end = life.expansion.birthYear + life.age;
  rerender(
    <PixelLifeScene
      {...p}
      presentation={{
        ...p.presentation,
        model: resolveScene(sampleSceneFacts(life)),
      }}
    />,
  );
  expect(screen.queryByText(/Together here/)).toBeNull();
  expect(container.querySelector(".pixel-companion")).toBeNull();
});
it("keeps family motion stopped with the scene and preserves fallback on family art failure", () => {
  const p = props();
  p.presentation.model = resolveScene(
    sampleSceneFacts(expandedFamilySceneLife()),
  );
  p.presentation.characterMotion = false;
  const { container } = render(<PixelLifeScene {...p} />);
  act(() => images.forEach((i) => i.onload?.()));
  const layers = [
    ...container.querySelectorAll<HTMLElement>(".pixel-companion .pixel-layer"),
  ];
  expect(layers).toHaveLength(4);
  expect(layers.every((layer) => layer.style.animationName === "none")).toBe(
    true,
  );
});
it("uses the painted fallback when a family-specific asset fails", () => {
  const p = props();
  p.presentation.model = resolveScene(
    sampleSceneFacts(expandedFamilySceneLife()),
  );
  const { container } = render(<PixelLifeScene {...p} />);
  act(() => {
    images
      .filter((i) => !i.src.includes("infant"))
      .forEach((i) => i.onload?.());
    images
      .filter((i) => i.src.includes("infant"))
      .forEach((i) => i.onerror?.());
  });
  expect(container.querySelector('[data-scene-ready="false"]')).toBeTruthy();
  expect(container.querySelector(".landscape")).toBeTruthy();
  expect(container.querySelector(".pixel-companion")).toBeNull();
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
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof notify) {
        notify = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
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
  expect(
    images.every((image) => image.onload === null && image.onerror === null),
  ).toBe(true);
});

import { LanguageProvider } from "../../i18n/context";
it.each(["en", "th"] as const)(
  "keeps %s text and reduced-motion controls available through fallback and load",
  (language) => {
    const p = props();
    const { container } = render(
      <LanguageProvider language={language}>
        <PixelLifeScene
          {...p}
          presentation={{ ...p.presentation, reducedMotion: true }}
        />
      </LanguageProvider>,
    );
    const button = screen.getByRole("button", {
      name: language === "en" ? "Scene motion" : "การเคลื่อนไหวของฉาก",
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    const description = document.getElementById(
      button.getAttribute("aria-describedby")!,
    );
    expect(description?.textContent).toBeTruthy();
    expect(container.querySelector(".scene-top")?.textContent).toBeTruthy();
    expect(
      container.querySelector(".scene-caption h2")?.textContent,
    ).toBeTruthy();
    expect(
      container.querySelector(".scene-art-note")?.textContent,
    ).toBeTruthy();
    act(() => images.forEach((i) => i.onerror?.()));
    expect(container.querySelector('[data-scene-ready="false"]')).toBeTruthy();
  },
);

// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { createExpandedLife } from "../game/expanded/origins";
import { SwordProgress } from "./SwordProgress";
import { Training } from "./LifeView";
import App from "../App";
import { saveGame, loadGame } from "../game/storage";
import { allocateSwordStyle } from "../game/expanded/sword-state";
afterEach(cleanup);
it("immediately persists switches, restores them, and retries failed saves", () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const l = createExpandedLife({ seed: 1 });
  l.age = 30;
  l.phase = "alive";
  l.pending = null;
  window.localStorage.clear();
  saveGame(window.localStorage, { version: 1, active: l, archive: [] });
  const view = render(<App />);
  fireEvent.change(screen.getByRole("combobox", { name: "Practice style" }), {
    target: { value: "water-god" },
  });
  let saved = loadGame(window.localStorage).data.active;
  expect(
    saved?.ruleset === "expanded-1" && saved.expansion.swords?.selected,
  ).toBe("water-god");
  view.unmount();
  render(<App />);
  expect(
    (
      screen.getByRole("combobox", {
        name: "Practice style",
      }) as HTMLSelectElement
    ).value,
  ).toBe("water-god");
  const fail = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw Error("quota");
  });
  fireEvent.change(screen.getByRole("combobox", { name: "Practice style" }), {
    target: { value: "north-god" },
  });
  expect(screen.getByRole("button", { name: "Retry save" })).toBeTruthy();
  fail.mockRestore();
  fireEvent.click(screen.getByRole("button", { name: "Retry save" }));
  saved = loadGame(window.localStorage).data.active;
  expect(
    saved?.ruleset === "expanded-1" && saved.expansion.swords?.selected,
  ).toBe("north-god");
  window.localStorage.clear();
  vi.restoreAllMocks();
});
it("pairs the selected style label with its own XP in the existing skill panel", () => {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 30;
  allocateSwordStyle(l, "sword-god");
  l.expansion.swords!.tracks["sword-god"] = { xp: 1800, cap: 6 };
  allocateSwordStyle(l, "water-god");
  render(<Training life={l} />);
  expect(screen.queryByText(/1800 experience/)).toBeNull();
});
it.each(["en", "th"] as const)(
  "shows independent tracks and locks pending selection in %s",
  (language) => {
    const l = createExpandedLife({ seed: 1, language });
    l.phase = "alive";
    l.age = 30;
    l.pending = null;
    allocateSwordStyle(l, "water-god");
    const onSelect = vi.fn();
    const { rerender } = render(<SwordProgress life={l} onSelect={onSelect} />);
    const label = language === "en" ? "Practice style" : "รูปแบบวิชาดาบที่ฝึก";
    const select = screen.getByRole("combobox", {
      name: label,
    }) as HTMLSelectElement;
    expect(select.value).toBe("water-god");
    expect(select.disabled).toBe(false);
    fireEvent.change(select, { target: { value: "north-god" } });
    expect(onSelect).toHaveBeenCalledWith("north-god");
    l.pending = "expanded.practice";
    rerender(<SwordProgress life={l} onSelect={onSelect} />);
    expect(select.disabled).toBe(true);
  },
);
it("explains one-time allocation and paid paused progress", () => {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 30;
  l.pending = null;
  l.expansion.swords!.legacy = { xp: 560, cap: 4 };
  const { rerender } = render(<SwordProgress life={l} onSelect={() => {}} />);
  expect(screen.getByText(/once, into one style/)).toBeTruthy();
  allocateSwordStyle(l, "sword-god");
  l.focus = "rest";
  l.expansion.swords!.tracks["sword-god"].cap = 2;
  l.expansion.swords!.mentorship = {
    style: "sword-god",
    target: 3,
    fee: 16,
    progress: 0.25,
    deferred: false,
  };
  rerender(<SwordProgress life={l} onSelect={() => {}} />);
  expect(screen.getByText(/Paid 16 silver/)).toBeTruthy();
  expect(screen.getByText(/Training paused/)).toBeTruthy();
});

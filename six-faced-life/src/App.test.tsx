// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { beginLife, choose, createLife } from "./game/engine";
import { loadGame, saveGame, SAVE_KEY } from "./game/storage";

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe("clear next actions and recovery", () => {
  function startPending() {
    const life = beginLife(createLife({ seed: 32 }));
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    return life;
  }

  it("takes the player to the blocking choice without advancing time", () => {
    const life = startPending();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Review choices" }));
    expect(document.activeElement).toBe(
      screen.getByRole("heading", {
        name: "A familiar mind. An unfamiliar world.",
      }),
    );
    expect(loadGame(window.localStorage).data.active?.age).toBe(life.age);
    expect(loadGame(window.localStorage).data.active?.pending).toBe(
      "first-memory",
    );
  });

  it("shows the actual choice outcome in place with a focused next step", () => {
    startPending();
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: /^Listen\. Watch\. Learn\./ }),
    );
    const result = screen.getByRole("region", { name: "Your choice" });
    expect(within(result).getByText(/You keep your secret/)).toBeTruthy();
    expect(within(result).getByText("Knowledge +8")).toBeTruthy();
    expect(document.activeElement).toBe(within(result).getByRole("heading"));
    fireEvent.click(
      within(result).getByRole("button", { name: "Continue to next decision" }),
    );
    expect(loadGame(window.localStorage).data.active?.pending).not.toBeNull();
    expect(screen.queryByRole("region", { name: "Your choice" })).toBeNull();
    expect(document.activeElement?.id).toBe("decision-heading");
  });

  it("focuses new page content after navigation", () => {
    startPending();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "How to play" }));
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "A little guidance." }),
    );
  });

  it("keeps automatic decisions from stealing focus or announcing every tick", () => {
    vi.useFakeTimers();
    startPending();
    render(<App />);
    const watch = screen.getByRole("checkbox", { name: "Watch mode" });
    watch.focus();
    fireEvent.click(watch);
    fireEvent.click(screen.getByRole("button", { name: "Play time" }));
    expect(screen.getByText(/Watch mode is choosing/)).toBeTruthy();
    act(() => vi.advanceTimersByTime(1200));
    expect(loadGame(window.localStorage).data.active?.pending).toBeNull();
    expect(document.activeElement).toBe(watch);
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("keeps the last manual outcome visible during ordinary timed playback", () => {
    vi.useFakeTimers();
    startPending();
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: /^Listen\. Watch\. Learn\./ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Play time" }));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole("region", { name: "Your choice" })).toBeTruthy();
    expect(loadGame(window.localStorage).data.active?.pending).toBeNull();
  });

  it("retries the latest in-memory save after repeated failures without losing the life", () => {
    const life = startPending();
    let blocked = true;
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (blocked) throw new DOMException("Full", "QuotaExceededError");
      setItem.call(this, key, value);
    });
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: /^Listen\. Watch\. Learn\./ }),
    );
    expect(screen.getByRole("alert").textContent).toMatch(/not been saved/i);
    fireEvent.click(screen.getByRole("button", { name: "Retry save" }));
    expect(screen.getByText("Not saved")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: /Take it all in A little/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Family & friends/ }));
    blocked = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry save" }));
    const restored = loadGame(window.localStorage).data.active!;
    expect(restored.id).toBe(life.id);
    expect(restored.pending).toBeNull();
    expect(restored.focus).toBe("bonds");
    expect(restored.stats.knowledge).toBe(life.stats.knowledge + 8);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Saved on this device")).toBeTruthy();
  });

  it("retries loading without overwriting unreadable data with an empty game", () => {
    const life = startPending();
    const raw = window.localStorage.getItem(SAVE_KEY);
    const getItem = Storage.prototype.getItem;
    let blocked = true;
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (
      this: Storage,
      key,
    ) {
      if (blocked) throw new DOMException("Blocked", "SecurityError");
      return getItem.call(this, key);
    });
    render(<App />);
    expect(
      screen.queryByText("Your story is saved in this browser."),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Retry loading" }));
    expect(getItem.call(window.localStorage, SAVE_KEY)).toBe(raw);
    blocked = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry loading" }));
    expect(loadGame(window.localStorage).data.active?.id).toBe(life.id);
    expect(
      screen.getByRole("heading", {
        name: "A familiar mind. An unfamiliar world.",
      }),
    ).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("browser playback and saving", () => {
  it("does not start time when Space is used on the spell disclosure", () => {
    const life = choose(beginLife(createLife({ seed: 32 })), "observe");
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    const { container } = render(<App />);
    const summary = container.querySelector(".known-spells summary")!;
    fireEvent.keyDown(summary, { key: " ", code: "Space" });
    expect(screen.getByRole("button", { name: "Play time" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Pause time" })).toBeNull();
  });

  it("keeps a queued watch-mode choice pending when the page becomes hidden", () => {
    vi.useFakeTimers();
    const life = beginLife(createLife({ seed: 32 }));
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    render(<App />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Watch mode" }));
    fireEvent.click(screen.getByRole("button", { name: "Play time" }));
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => vi.advanceTimersByTime(1200));
    expect(loadGame(window.localStorage).data.active?.pending).toBe(
      "first-memory",
    );
    hidden.mockReturnValue(false);
    act(() => vi.advanceTimersByTime(1000));
    expect(loadGame(window.localStorage).data.active?.pending).toBeNull();
  });

  it("saves every focus change immediately even when paused and changed quickly", () => {
    vi.useFakeTimers();
    const life = choose(beginLife(createLife({ seed: 32 })), "observe");
    life.age = 6;
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: /Take it all in A little/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Read & learn Turn old/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Read & learn Turn old/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Practice magic Develop/ }),
    );
    expect(loadGame(window.localStorage).data.active?.focus).toBe("magic");
  });

  it("opens the chronicle at the top after leaving the birth record", () => {
    saveGame(window.localStorage, {
      version: 1,
      active: createLife({ seed: 32 }),
      archive: [],
    });
    render(<App />);
    vi.mocked(window.scrollTo).mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Open my chronicle" }));
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "instant",
    });
  });
  it("saves study selection immediately without discarding an existing life", () => {
    vi.useFakeTimers();
    const life = choose(beginLife(createLife({ seed: 32 })), "observe");
    life.age = 10;
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    render(<App />);
    const select = screen.getByRole("combobox", { name: "Magic discipline" });
    fireEvent.change(select, { target: { value: "fire" } });
    fireEvent.change(select, { target: { value: "healing" } });
    const restored = loadGame(window.localStorage).data.active!;
    expect(restored.id).toBe(life.id);
    expect(restored.progression?.specialization).toBe("healing");
    expect(restored.coins).toBe(life.coins);
  });
});

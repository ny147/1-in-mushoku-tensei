// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { beginLife, choose, createLife } from "./game/engine";
import { loadGame, saveGame } from "./game/storage";

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("browser playback and saving", () => {
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

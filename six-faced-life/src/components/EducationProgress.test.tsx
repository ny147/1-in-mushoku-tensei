// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  fireEvent,
  within,
  act,
} from "@testing-library/react";
import App from "../App";
import { createExpandedLife } from "../game/expanded/origins";
import { loadGame, saveGame } from "../game/storage";
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it("enrolls through the visible quote and immediately saves the manual choice", () => {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 20;
  l.coins = 0;
  l.expansion.economy.familyFunds = 0;
  saveGame(window.localStorage, { version: 1, active: l, archive: [] });
  render(<App />);
  fireEvent.click(
    within(
      screen.getByRole("region", { name: "Training and education finance" }),
    ).getByRole("button", { name: "Career training" }),
  );
  fireEvent.click(screen.getByRole("button", { name: /^Train as Swordsman/ }));
  fireEvent.click(screen.getByRole('button',{name:/^Sword God Practice one style/}));
  expect(document.activeElement?.id).toBe("decision-heading");
  expect(screen.getByText(/Loan 24/)).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: /^Borrow 24 coins and enroll/ }),
  );
  const stored = loadGame(window.localStorage).data.active;
  expect(
    stored?.ruleset === "expanded-1" && stored.expansion.training?.active,
  ).toBe("swordsman");
  expect(screen.getByText(/0 \/ 6/)).toBeTruthy();
  expect(stored?.age).toBe(20);
  fireEvent.click(
    screen.getByRole("button", { name: "Manage training" }),
  );
  fireEvent.click(screen.getByRole("button", { name: /^Pause training / }));
  fireEvent.click(
    screen.getByRole("button", { name: /^Part-time training Keep/ }),
  );
  const changed = loadGame(window.localStorage).data.active;
  expect(
    changed?.ruleset === "expanded-1" && changed.expansion.training?.paused,
  ).toBe(true);
  expect(
    changed?.ruleset === "expanded-1" && changed.expansion.training?.mode,
  ).toBe("part-time");
});
it.each(["en", "th"] as const)(
  "keeps the %s borrowing quote manual in Watch mode and after reload",
  (language) => {
    vi.useFakeTimers();
    const l = createExpandedLife({ seed: 1, language });
    l.phase = "alive";
    l.age = 20;
    l.coins = 0;
    l.expansion.economy.familyFunds = 0;
    l.expansion.training!.selection = { role: "mage", mode: "full-time" };
    l.pending = "expanded.training-quote";
    saveGame(window.localStorage, { version: 1, active: l, archive: [] });
    const view = render(<App />);
    expect(
      screen.getByRole("button", {
        name:
          language === "en"
            ? /^Borrow 24 coins and enroll/
            : /^กู้ 24 เหรียญและเริ่มฝึก/,
      }),
    ).toBeTruthy();
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    fireEvent.click(
      screen.getByRole("button", {
        name: language === "en" ? "Play time" : "เดินเวลา",
      }),
    );
    act(() => vi.advanceTimersByTime(2200));
    let stored = loadGame(window.localStorage).data.active;
    expect(stored?.pending).toBe("expanded.training-quote");
    expect(stored?.age).toBe(20);
    expect(
      stored?.ruleset === "expanded-1" && stored.expansion.training?.active,
    ).toBe(null);
    view.unmount();
    render(<App />);
    stored = loadGame(window.localStorage).data.active;
    expect(stored?.pending).toBe("expanded.training-quote");
  },
);

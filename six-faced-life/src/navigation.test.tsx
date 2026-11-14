// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { beginLife, choose, createLife, finishLife } from "./game/engine";
import { loadGame, saveGame, SAVE_KEY } from "./game/storage";
import { archiveRowId } from "./navigation";

function alive() {
  const life = beginLife(createLife({ seed: 32, ruleset: "legacy-1" }));
  return choose(life, "observe");
}
function seed() {
  const life = alive();
  saveGame(localStorage, { version: 1, active: life, archive: [] });
  return life;
}
function mainNav(name: string) {
  return within(
    screen.getByRole("navigation", { name: "Main navigation" }),
  ).getByRole("link", { name });
}
function pop(href: string, state: unknown = {}) {
  act(() => {
    history.replaceState(state, "", href);
    window.dispatchEvent(new PopStateEvent("popstate", { state }));
  });
}
beforeEach(() => {
  history.replaceState({}, "", "/");
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe("archive return navigation", () => {
  it("does not steal focus or scroll when fonts finish after the player moves", async () => {
    let finishFonts!: () => void;
    const fontsReady = new Promise<void>((resolve) => {
      finishFonts = resolve;
    });
    const originalFonts = Object.getOwnPropertyDescriptor(document, "fonts");
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: fontsReady },
    });
    try {
      const { old } = archiveFixture();
      render(<App />);
      fireEvent.click(mainNav("Past lives 1"));
      fireEvent.click(screen.getByRole("link", { name: /OldRecord/ }));
      pop("/?view=archive", {
        sflNavigation: {
          version: 1,
          entryId: "saved-list",
          archiveScrollY: 120,
          archiveLifeId: old.id,
        },
      });
      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });
      const other = mainNav("Your character");
      other.focus();
      fireEvent.wheel(window);
      vi.mocked(window.scrollTo).mockClear();
      await act(async () => {
        finishFonts();
        await fontsReady;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });
      expect(document.activeElement).toBe(other);
      expect(window.scrollTo).not.toHaveBeenCalled();
    } finally {
      if (originalFonts)
        Object.defineProperty(document, "fonts", originalFonts);
      else delete (document as unknown as Record<string, unknown>).fonts;
    }
  });
  function archiveFixture() {
    const live = seed();
    const old = createLife({
      ruleset: "legacy-1",
      seed: 5,
      name: "OldRecord",
      language: "th",
    });
    finishLife(old, "After a lifetime of seasons, you passed away of old age.");
    saveGame(localStorage, { version: 1, active: live, archive: [old] });
    return { live, old };
  }
  it("opens linked retrospective, records list provenance and uses Back for both return controls", () => {
    const { old } = archiveFixture();
    render(<App />);
    fireEvent.click(mainNav("Past lives 1"));
    const row = screen.getByRole("link", { name: /OldRecord/ });
    expect(row.id).toBe(archiveRowId(old.id));
    fireEvent.click(row);
    expect(location.search).toBe(
      `?view=archive&life=${encodeURIComponent(old.id)}`,
    );
    expect(document.documentElement.lang).toBe("th");
    const previewEntry = history.state;
    expect(previewEntry.sflNavigation.archiveReturnEntryId).toBeTruthy();
    const back = vi.spyOn(history, "back").mockImplementation(() => {});
    fireEvent.click(
      screen.getByRole("button", { name: "กลับสู่ชีวิตที่ผ่านมา" }),
    );
    expect(back).toHaveBeenCalledTimes(1);
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "เส้นทางนำทาง" }),
      ).getByRole("link", { name: "ชีวิตที่ผ่านมา" }),
    );
    expect(back).toHaveBeenCalledTimes(2);
  });

  it("direct preview return stays in app and preserves latest active life and archived snapshot", () => {
    const { old } = archiveFixture();
    const raw = localStorage.getItem(SAVE_KEY);
    history.replaceState(
      {},
      "",
      `/?view=archive&life=${encodeURIComponent(old.id)}`,
    );
    render(<App />);
    const back = vi.spyOn(history, "back");
    fireEvent.click(
      screen.getByRole("button", { name: "กลับสู่ชีวิตที่ผ่านมา" }),
    );
    expect(back).not.toHaveBeenCalled();
    expect(location.search).toBe("?view=archive");
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw);
  });

  it("does not mistake a copied fragment entry for an immediate archive-list predecessor", () => {
    const { old } = archiveFixture();
    render(<App />);
    fireEvent.click(mainNav("Past lives 1"));
    fireEvent.click(screen.getByRole("link", { name: /OldRecord/ }));
    pop(
      `/?view=archive&life=${encodeURIComponent(old.id)}#main-content`,
      history.state,
    );
    const back = vi.spyOn(history, "back").mockImplementation(() => {});
    fireEvent.click(
      screen.getByRole("button", { name: "กลับสู่ชีวิตที่ผ่านมา" }),
    );
    expect(back).not.toHaveBeenCalled();
    expect(location.search).toBe("?view=archive");
  });

  it("restores list row focus and clamped scroll after popstate, including after preview reload", async () => {
    const { old } = archiveFixture();
    const view = render(<App />);
    fireEvent.click(mainNav("Past lives 1"));
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 120,
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 2000,
    });
    const listEntryId = history.state.sflNavigation.entryId;
    fireEvent.click(screen.getByRole("link", { name: /OldRecord/ }));
    view.unmount();
    render(<App />);
    expect(history.state.sflNavigation.archiveReturnEntryId).toBe(listEntryId);
    pop("/?view=archive", {
      sflNavigation: {
        version: 1,
        entryId: listEntryId,
        archiveScrollY: 120,
        archiveLifeId: old.id,
      },
    });
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
    expect(document.activeElement?.id).toBe(archiveRowId(old.id));
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 120,
      behavior: "instant",
    });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    delete (document.documentElement as unknown as Record<string, unknown>)
      .scrollHeight;
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("browser section navigation", () => {
  it("navigation cannot consume a pending decision and old routes show the actual chosen result", () => {
    vi.useFakeTimers();
    const life = beginLife(createLife({ seed: 32, ruleset: "legacy-1" }));
    saveGame(localStorage, { version: 1, active: life, archive: [] });
    render(<App />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Watch mode" }));
    fireEvent.click(mainNav("Your character"));
    pop("/?view=chronicle");
    act(() => vi.advanceTimersByTime(5000));
    expect(loadGame(localStorage).data.active).toEqual(life);
    fireEvent.click(
      screen.getByRole("button", { name: /^Listen\. Watch\. Learn\./ }),
    );
    const chosen = loadGame(localStorage).data.active;
    expect(chosen?.pending).not.toBe(life.pending);
    fireEvent.click(mainNav("Your character"));
    pop("/?view=chronicle");
    expect(loadGame(localStorage).data.active).toEqual(chosen);
  });

  it("reaching new-life setup never replaces the life and actual creation replaces its route entry", () => {
    const life = seed();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "New life" }));
    expect(loadGame(localStorage).data.active).toEqual(life);
    pop("/?view=chronicle");
    pop("/?view=new");
    expect(loadGame(localStorage).data.active).toEqual(life);
    fireEvent.change(screen.getByRole("textbox", { name: /Your name/ }), {
      target: { value: "NextLife" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Begin a new life" }));
    expect(loadGame(localStorage).data.active).toEqual(life);
    const push = vi.spyOn(history, "pushState");
    fireEvent.click(
      screen.getByRole("button", { name: "Leave this life and begin again" }),
    );
    expect(location.search).toBe("?view=chronicle");
    expect(push).not.toHaveBeenCalled();
    const latest = loadGame(localStorage).data.active;
    expect(latest?.name).toBe("NextLife");
    pop("/?view=new");
    pop("/?view=chronicle");
    expect(loadGame(localStorage).data.active).toEqual(latest);
  });

  it("recovers from failed initial URL normalization on an explicit current-section click", () => {
    seed();
    history.replaceState({}, "", "/?view=unknown");
    vi.spyOn(history, "replaceState").mockImplementationOnce(() => {
      throw new DOMException("Blocked");
    });
    render(<App />);
    expect(location.search).toBe("?view=unknown");
    expect(screen.getByRole("alert").textContent).toContain(
      "could not be opened",
    );
    fireEvent.click(mainNav("Your chronicle"));
    expect(location.search).toBe("?view=chronicle");
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("restores the requested section on mount and reload without rewriting the save", () => {
    seed();
    const raw = localStorage.getItem(SAVE_KEY);
    history.replaceState({}, "", "/?view=character");
    const view = render(<App />);
    expect(
      screen.getByRole("heading", { name: "The person you’re becoming." }),
    ).toBeTruthy();
    expect(mainNav("Your character").getAttribute("aria-current")).toBe("page");
    view.unmount();
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "The person you’re becoming." }),
    ).toBeTruthy();
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw);
  });

  it("pushes once per destination, handles popstate without pushing, and keeps latest data", () => {
    const life = seed();
    render(<App />);
    const push = vi.spyOn(history, "pushState");
    fireEvent.click(mainNav("Your character"));
    fireEvent.click(mainNav("Your character"));
    expect(location.search).toBe("?view=character");
    expect(push).toHaveBeenCalledTimes(1);
    fireEvent.click(mainNav("The world"));
    expect(push).toHaveBeenCalledTimes(2);
    pop("/?view=character");
    expect(
      screen.getByRole("heading", { name: "The person you’re becoming." }),
    ).toBe(document.activeElement);
    expect(push).toHaveBeenCalledTimes(2);
    expect(loadGame(localStorage).data.active).toEqual(life);
  });

  it("pauses on departure and never resumes from route history", () => {
    vi.useFakeTimers();
    seed();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Play time" }));
    fireEvent.click(mainNav("Your character"));
    const saved = localStorage.getItem(SAVE_KEY);
    act(() => vi.advanceTimersByTime(5000));
    pop("/?view=chronicle");
    expect(screen.getByRole("button", { name: "Play time" })).toBeTruthy();
    act(() => vi.advanceTimersByTime(5000));
    expect(localStorage.getItem(SAVE_KEY)).toBe(saved);
  });

  it("offers real home and breadcrumb links and leaves modified clicks native", () => {
    seed();
    render(<App />);
    const link = mainNav("Your character");
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    let nativeAllowed = false;
    document.addEventListener(
      "click",
      (event) => {
        nativeAllowed = !event.defaultPrevented;
        event.preventDefault(); // jsdom cannot perform native navigation; observe before preventing it.
      },
      { once: true },
    );
    link.dispatchEvent(event);
    expect(nativeAllowed).toBe(true);
    expect(location.search).toBe("?view=chronicle");
    fireEvent.click(link);
    const crumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(
      within(crumb)
        .getByRole("link", { name: "Your chronicle" })
        .getAttribute("href"),
    ).toBe("/?view=chronicle");
    expect(
      within(crumb).getByText("Your character").getAttribute("aria-current"),
    ).toBe("page");
    const home = screen.getAllByRole("link", {
      name: "Return to your chronicle",
    })[0];
    fireEvent.click(home);
    expect(location.search).toBe("?view=chronicle");
  });

  it("retains view and URL after a rejected history write and recovers on next click", () => {
    seed();
    render(<App />);
    vi.spyOn(history, "pushState").mockImplementationOnce(() => {
      throw new DOMException("Blocked");
    });
    fireEvent.click(mainNav("Your character"));
    expect(location.search).toBe("?view=chronicle");
    expect(screen.getByRole("alert").textContent).toContain(
      "This section could not be opened",
    );
    fireEvent.click(mainNav("Your character"));
    expect(location.search).toBe("?view=character");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does not refocus or clear feedback on a same-route fragment traversal", () => {
    seed();
    render(<App />);
    fireEvent.click(mainNav("Your character"));
    const home = screen.getAllByRole("link", {
      name: "Return to your chronicle",
    })[0];
    home.focus();
    pop("/?view=character#main-content");
    expect(document.activeElement).toBe(home);
  });

  it("keeps a requested archive while unreadable storage is retried", () => {
    const dead = alive();
    finishLife(
      dead,
      "After a lifetime of seasons, you passed away of old age.",
    );
    history.replaceState(
      {},
      "",
      `/?view=archive&life=${encodeURIComponent(dead.id)}`,
    );
    localStorage.setItem(SAVE_KEY, "{broken");
    render(<App />);
    expect(location.search).toContain("life=");
    fireEvent.click(screen.getByRole("button", { name: "Retry loading" }));
    expect(localStorage.getItem(SAVE_KEY)).toBe("{broken");
    saveGame(localStorage, { version: 1, active: null, archive: [dead] });
    fireEvent.click(screen.getByRole("button", { name: "Retry loading" }));
    expect(
      screen.getByRole("heading", { name: /Once, you were/ }),
    ).toBeTruthy();
    expect(location.search).toContain("life=");
  });
});

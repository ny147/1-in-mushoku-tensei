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
import { beginLife, choose, createLife, openActivity } from "./game/engine";
import { loadGame, saveGame, SAVE_KEY } from "./game/storage";
import { createExpandedLife } from "./game/expanded/origins";
import { enterCareerNode } from './game/expanded/career-paths';
import type { ExpandedLife } from "./game/types";

function responsibilitySave(): ExpandedLife {
  for (let seed = 0; seed < 100; seed++) {
    const life = createExpandedLife({ seed, language: "en" });
    if (!life.expansion.social?.debt) continue;
    life.phase = "alive";
    life.age = 15;
    life.pending = "expanded.parental-debt";
    life.stats.health = 100;
    return life;
  }
  throw Error("Missing seeded household debt");
}

describe("manual household responsibility persistence", () => {
  it("keeps a malformed household ledger intact through visible load retries and recovers from the repaired save", () => {
    const life = responsibilitySave();
    const invalid = structuredClone(life);
    invalid.expansion.social!.debt!.balance--;
    const raw = JSON.stringify({ version: 1, active: invalid, archive: [] });
    window.localStorage.setItem(SAVE_KEY, raw);
    render(<App />);
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry loading" }));
    expect(window.localStorage.getItem(SAVE_KEY)).toBe(raw);
    expect(screen.getByRole("alert")).toBeTruthy();
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    fireEvent.click(screen.getByRole("button", { name: "Retry loading" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("heading", { name: "Household debt responsibility" })).toBeTruthy();
    expect(loadGame(window.localStorage).data.active).toEqual(life);
  });

  it.each([
    ["Accept affordable instalments", "accepted"],
    ["Accept creditor service", "service"],
    ["Refuse personal responsibility", "refused"],
  ])("holds Watch, saves %s immediately, and reloads paused", (label, status) => {
    vi.useFakeTimers();
    const life = responsibilitySave();
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    const view = render(<App />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Watch mode" }));
    fireEvent.click(screen.getByRole("button", { name: "Play time" }));
    act(() => vi.advanceTimersByTime(2200));
    expect(loadGame(window.localStorage).data.active).toEqual(life);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    act(() => vi.advanceTimersByTime(2200));
    expect(loadGame(window.localStorage).data.active).toEqual(life);
    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${label}`) }));
    const chosen = loadGame(window.localStorage).data.active as ExpandedLife;
    expect(chosen.expansion.social!.debt!.status).toBe(status);
    expect(chosen.expansion.social!.debt!.decisionYear).toBe(life.expansion.birthYear + 15);
    expect(chosen.coins).toBe(life.coins);
    expect(chosen.age).toBe(15);
    expect(chosen.history.length).toBe(life.history.length + 1);
    view.unmount();
    render(<App />);
    expect(screen.getByRole("button", { name: "Play time" })).toBeTruthy();
    act(() => vi.advanceTimersByTime(5000));
    expect(loadGame(window.localStorage).data.active).toEqual(chosen);
  });

  it.each([
    ["Keep the service contract", "service"],
    ["Exit service; keep earned credit", "accepted"],
  ])("keeps saved service review manual and persists %s", (label, status) => {
    vi.useFakeTimers();
    const accepted = choose(responsibilitySave(), "expanded.parental-debt.service");
    const review = openActivity(accepted, "debt-service-exit") as ExpandedLife;
    expect(review.pending).toBe("expanded.debt-service-exit");
    saveGame(window.localStorage, { version: 1, active: review, archive: [] });
    render(<App />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Watch mode" }));
    fireEvent.click(screen.getByRole("button", { name: "Play time" }));
    act(() => vi.advanceTimersByTime(2200));
    expect(loadGame(window.localStorage).data.active).toEqual(review);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${label}`) }));
    const saved = loadGame(window.localStorage).data.active as ExpandedLife;
    expect(saved.expansion.social!.debt!.status).toBe(status);
    expect(saved.expansion.social!.debt!.balance).toBe(48);
    expect(saved.age).toBe(review.age);
    expect(saved.pending).toBeNull();
  });

  it("retries the actual refused route after a failed write without applying the family strike twice", () => {
    vi.useFakeTimers();
    const life = responsibilitySave();
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    const raw = window.localStorage.getItem(SAVE_KEY);
    const view = render(<App />);
    let blocked = true;
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (blocked) throw new DOMException("Full", "QuotaExceededError");
      setItem.call(this, key, value);
    });
    fireEvent.click(screen.getByRole("button", { name: /^Refuse personal responsibility/ }));
    expect(screen.getByRole("alert").textContent).toMatch(/not been saved/i);
    expect(window.localStorage.getItem(SAVE_KEY)).toBe(raw);
    fireEvent.click(screen.getByRole("button", { name: "Retry save" }));
    expect(window.localStorage.getItem(SAVE_KEY)).toBe(raw);
    blocked = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry save" }));
    const saved = loadGame(window.localStorage).data.active as ExpandedLife;
    expect(saved.expansion.social!.debt!.status).toBe("refused");
    expect(saved.stats.bonds).toBe(Math.max(0, life.stats.bonds - 8));
    expect(saved.history.length).toBe(life.history.length + 1);
    expect(screen.queryByRole("alert")).toBeNull();
    view.unmount();
    render(<App />);
    act(() => vi.advanceTimersByTime(5000));
    expect(loadGame(window.localStorage).data.active).toEqual(saved);
  });
});

it('keeps a career project manual in Watch mode and persists its exact cost immediately',()=>{
  vi.useFakeTimers();
  const l=createExpandedLife({seed:1});l.phase='alive';l.age=25;l.pending=null;l.stats.health=90;
  delete l.expansion.social; // Existing adult without a retrospective household obligation.
  l.coins=200;l.expansion.economy.peak=200;enterCareerNode(l,'farmhand');
  saveGame(window.localStorage,{version:1,active:l,archive:[]});render(<App/>);
  fireEvent.click(screen.getByRole('checkbox',{name:'Watch mode'}));
  fireEvent.click(screen.getByText('Optional activities',{exact:true}));
  fireEvent.click(screen.getByRole('button',{name:'Career work'}));
  fireEvent.click(screen.getByRole('button',{name:'Play time'}));
  act(()=>vi.advanceTimersByTime(2200));
  expect(loadGame(window.localStorage).data.active?.pending).toBe('expanded.career-work');
  const hidden=vi.spyOn(document,'hidden','get').mockReturnValue(true);
  act(()=>vi.advanceTimersByTime(1200));
  expect(loadGame(window.localStorage).data.active?.pending).toBe('expanded.career-work');
  hidden.mockReturnValue(false);
  fireEvent.click(screen.getByRole('button',{name:/^Prepare tools and seed /}));
  const after=loadGame(window.localStorage).data.active;
  expect(after?.coins).toBe(196);expect(after?.age).toBe(25);
  expect(after?.ruleset==='expanded-1' && after.expansion.careerPaths?.work.farming.milestones).toBe(1);
});

it("keeps a live ending still across the chronicle boundary and archive preview", () => {
  const life = beginLife(createLife({ seed: 32 }));
  life.phase = "alive";
  life.age = 25;
  life.deathAge = 26;
  life.pending = null;
  saveGame(window.localStorage, { version: 1, active: life, archive: [] });
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "+1 year" }));
  expect(loadGame(window.localStorage).data.active?.phase).toBe("ended");
  expect(container.querySelector('.pixel-scene')?.getAttribute('data-clip')).toBe('ending');
  expect(container.querySelector('.pixel-layer[style*="pixel-frames"]')).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Past lives 1" }));
  expect(container.querySelector('.pixel-scene')).toBeNull();
});

it('keeps scene motion independent of gameplay and starts the scene paused',()=>{
  const life=createExpandedLife({seed:32});life.phase='alive';life.age=25;life.pending=null;life.focus='study';
  saveGame(window.localStorage,{version:1,active:life,archive:[]});
  const {container}=render(<App/>);
  const before=loadGame(window.localStorage).data.active;
  expect(container.querySelector('.pixel-scene')?.getAttribute('data-clip')).toBe('idle');
  fireEvent.click(screen.getByRole('button',{name:'Scene motion'}));
  expect(loadGame(window.localStorage).data.active).toEqual(before);
  fireEvent.click(screen.getByRole('button',{name:'Play time'}));
  expect(container.querySelector('.pixel-scene')?.getAttribute('data-clip')).toBe('read');
  expect(screen.getByRole('button',{name:'Scene motion'}).getAttribute('aria-pressed')).toBe('false');
});

it("keeps expanded allegiance decisions manual even when watch mode finds a free option", () => {
  vi.useFakeTimers();
  let life = createExpandedLife({ seed: 0 });
  for (let seed = 1; life.expansion.birthYear > 407; seed++)
    life = createExpandedLife({ seed });
  life.phase = "alive";
  life.age = 425 - life.expansion.birthYear;
  life.pending = "expanded.orsted";
  life.expansion.politics.contact = true;
  life.training.magicXp = 100;
  saveGame(window.localStorage, { version: 1, active: life, archive: [] });
  render(<App />);
  fireEvent.click(screen.getByRole("checkbox", { name: "Watch mode" }));
  fireEvent.click(screen.getByRole("button", { name: "Play time" }));
  act(() => vi.advanceTimersByTime(2200));
  const stored = loadGame(window.localStorage).data.active;
  expect(stored?.pending).toBe("expanded.orsted");
  if (stored?.ruleset !== "expanded-1") throw Error("expanded");
  expect(stored.expansion.politics.faction).toBeNull();
});

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe("clear next actions and recovery", () => {
  it("opens optional careers and keeps the manual browser after reload", () => {
    const l = createExpandedLife({ seed: 2 });
    delete l.expansion.social;
    l.phase = "alive";
    l.age = 35;
    l.coins = 200;
    l.expansion.economy.peak = 200;
    l.stats.knowledge = 50;
    saveGame(window.localStorage, { version: 1, active: l, archive: [] });
    const view = render(<App />);
    fireEvent.click(screen.getByText("Optional activities", { exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Browse careers" }));
    expect(loadGame(window.localStorage).data.active?.pending).toBe(
      "expanded.career",
    );
    expect(document.activeElement?.id).toBe("decision-heading");
    view.unmount();
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Choose your career path" }),
    ).toBeTruthy();
    expect(loadGame(window.localStorage).data.active?.age).toBe(35);
    fireEvent.click(screen.getByRole('button',{name:/^Trade No job/}));
    const detail=loadGame(window.localStorage).data.active;
    expect(detail?.pending).toBe('expanded.career-path');
    expect(detail?.ruleset==='expanded-1' && detail.expansion.careerPaths?.selection).toBe('trade');
    fireEvent.click(screen.getByRole('button',{name:/^Trade Assistant /}));
    const hired=loadGame(window.localStorage).data.active;
    expect(hired?.ruleset==='expanded-1' && hired.expansion.careerPaths?.active).toBe('trade-assistant');
    expect(hired?.coins).toBe(190);
  });
  it("keeps a voluntarily opened legendary challenge manual in Watch mode and permits declining it", () => {
    vi.useFakeTimers();
    const l = createExpandedLife({ seed: 2 });
    delete l.expansion.social;
    l.phase = "alive";
    l.age = 35;
    saveGame(window.localStorage, { version: 1, active: l, archive: [] });
    render(<App />);
    fireEvent.click(screen.getByText("Optional activities", { exact: true }));
    fireEvent.click(
      screen.getByRole("button", { name: "Legendary challenges" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Watch mode" }));
    fireEvent.click(screen.getByRole("button", { name: "Play time" }));
    act(() => vi.advanceTimersByTime(2200));
    expect(loadGame(window.localStorage).data.active?.pending).toBe(
      "expanded.challenge",
    );
    fireEvent.click(
      screen.getByRole("button", { name: /^Continue without committing/ }),
    );
    expect(loadGame(window.localStorage).data.active?.pending).toBeNull();
    expect(loadGame(window.localStorage).data.active?.age).toBe(35);
  });
  function startPending() {
    const life = beginLife(createLife({ ruleset: "legacy-1", seed: 32 }));
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

  it("shows the actual outcome without a continuation button and waits for playback", () => {
    vi.useFakeTimers();
    startPending();
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: /^Listen\. Watch\. Learn\./ }),
    );
    const result = screen.getByRole("region", { name: "Your choice" });
    expect(within(result).getByText(/You keep your secret/)).toBeTruthy();
    expect(within(result).getByText("Knowledge +8")).toBeTruthy();
    expect(document.activeElement).toBe(within(result).getByRole("heading"));
    expect(within(result).queryByRole("button")).toBeNull();
    expect(
      screen.getByText(
        "The next event appears as time passes. If paused, press Play above.",
      ),
    ).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(loadGame(window.localStorage).data.active?.age).toBe(0);
    expect(loadGame(window.localStorage).data.active?.pending).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Play time" }));
    act(() => vi.advanceTimersByTime(120000));
    expect(loadGame(window.localStorage).data.active?.pending).not.toBeNull();
    expect(screen.queryByRole("region", { name: "Your choice" })).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Letters from another world" }),
    ).toBeTruthy();
    expect(loadGame(window.localStorage).data.active?.age).toBe(3);
  });

  it.each(["en", "th"] as const)(
    "quiet time has no continuation shortcut in %s",
    (language) => {
      const life = choose(
        beginLife(createLife({ ruleset: "legacy-1", seed: 32, language })),
        "observe",
      );
      saveGame(window.localStorage, { version: 1, active: life, archive: [] });
      render(<App />);
      expect(
        screen.queryByRole("button", {
          name: /Continue to next decision|ไปยังทางเลือกถัดไป/,
        }),
      ).toBeNull();
      expect(
        screen.getByText(
          language === "th"
            ? "เลือกเป้าหมายด้านล่าง ทางเลือกใหม่จะปรากฏเมื่อเวลาผ่านไป หากหยุดเวลาอยู่ ให้กดเล่นด้านบน"
            : "Choose your focus below. New choices appear as time passes. If paused, press Play above.",
        ),
      ).toBeTruthy();
    },
  );

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
    expect(screen.getByRole("status", { name: "" }).textContent).toBe("");
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
    const life = choose(
      beginLife(createLife({ ruleset: "legacy-1", seed: 32 })),
      "observe",
    );
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    const { container } = render(<App />);
    const summary = container.querySelector(".known-spells summary")!;
    fireEvent.keyDown(summary, { key: " ", code: "Space" });
    expect(screen.getByRole("button", { name: "Play time" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Pause time" })).toBeNull();
  });

  it("keeps a queued watch-mode choice pending when the page becomes hidden", () => {
    vi.useFakeTimers();
    const life = beginLife(createLife({ ruleset: "legacy-1", seed: 32 }));
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
    const life = choose(
      beginLife(createLife({ ruleset: "legacy-1", seed: 32 })),
      "observe",
    );
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
      active: createLife({ ruleset: "legacy-1", seed: 32 }),
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
    const life = choose(
      beginLife(createLife({ ruleset: "legacy-1", seed: 32 })),
      "observe",
    );
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

it.each(["en","th"] as const)("keeps %s time controls in order and focuses the full spellbook",language=>{
 const life=createExpandedLife({seed:32,language});life.phase="alive";life.age=8;life.pending=null;
 saveGame(window.localStorage,{version:1,active:life,archive:[]});
 const {container}=render(<App/>);
 const main=container.querySelector(".time-main")!;
 const forward=container.querySelector(".time-forward")!;
 expect(main.compareDocumentPosition(forward)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
 expect([...main.querySelectorAll("button")].map(b=>b.textContent)).toEqual([language==="en"?"Play":"เล่น","1×","2×","4×","8×"]);
 fireEvent.click(screen.getByRole("button",{name:language==="en"?"Open your full spellbook":"เปิดตำราเวทฉบับเต็ม"}));
 expect(document.activeElement?.id).toBe("spellbook-heading");
});

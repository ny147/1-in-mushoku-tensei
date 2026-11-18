// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App";
import { BirthRecord } from "./components/NewLife";
import { OptionalActivities } from "./components/OptionalActivities";
import { WorldView } from "./components/WorldView";
import { beginLife, createLife, openActivity } from "./game/engine";
import { createExpandedLife } from "./game/expanded/origins";
import { loadGame, saveGame } from "./game/storage";
import { LanguageProvider } from "./i18n/context";

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("puts the birth action before the closed household record and keeps liability visible", () => {
  const life = Array.from({ length: 100 }, (_, seed) => createExpandedLife({ seed }))
    .find((candidate) => candidate.expansion.social?.debt);
  if (!life) throw Error("Missing seeded indebted birth");
  render(<BirthRecord life={life} onBegin={() => {}} />);
  const button = screen.getByRole("button", { name: "Open my chronicle" });
  const record = screen.getByText("Origins and household").closest("details")!;
  expect(button.compareDocumentPosition(record) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(record.open).toBe(false);
  expect(screen.getByText(/^Your family starts with a household liability/i).closest("details")).toBeNull();
  expect(within(record).getByText("Royal ancestry")).toBeTruthy();
});

it("preserves a classic birth's actual aptitude", () => {
  const life = createLife({ ruleset: "legacy-1", seed: 32 });
  render(<BirthRecord life={life} onBegin={() => {}} />);
  expect(screen.getByText("A natural gift").nextElementSibling?.textContent).toBe(life.aptitude);
});

it("predicts playback after a manual choice and reloads paused", () => {
  const life = beginLife(createLife({ ruleset: "legacy-1", seed: 32 }));
  saveGame(localStorage, { version: 1, active: life, archive: [] });
  const view = render(<App />);
  const guidance = () => document.querySelector(".decision-note")?.textContent;
  expect(guidance()).toMatch(/stay paused after you choose/i);
  fireEvent.click(screen.getByRole("button", { name: "Play time" }));
  expect(guidance()).toMatch(/resume once your decisions are resolved/i);
  fireEvent.click(screen.getByRole("checkbox", { name: "Watch mode" }));
  expect(guidance()).toMatch(/Watch mode will choose/i);
  expect(screen.getByRole("button", { name: "Pause time" })).toBeTruthy();
  view.unmount();
  render(<App />);
  expect(guidance()).toMatch(/stay paused after you choose/i);
});

it("leaves an optional decision manual in Watch mode", () => {
  const life = createExpandedLife({ seed: 32 });
  life.phase = "alive";
  life.age = 8;
  life.pending = null;
  saveGame(localStorage, { version: 1, active: openActivity(life, "instruction"), archive: [] });
  render(<App />);
  fireEvent.click(screen.getByRole("checkbox", { name: "Watch mode" }));
  fireEvent.click(screen.getByRole("button", { name: "Play time" }));
  expect(document.querySelector(".decision-note")?.textContent).toMatch(/resume once your decisions are resolved/i);
  const activities = screen.getByText("Optional activities").closest("details")!;
  const review = within(activities).getByText("Review choices");
  fireEvent.click(review);
  expect(document.activeElement?.id).toBe("decision-heading");
  expect(within(activities).queryByText("Later opportunities")).toBeNull();
});

it.each([7, 8])("shows specific future activities and available actions at age %i", (age) => {
  const life = createExpandedLife({ seed: 32 });
  life.phase = "alive";
  life.age = age;
  life.pending = null;
  saveGame(localStorage, { version: 1, active: life, archive: [] });
  render(<App />);
  const activities = screen.getByText("Optional activities").closest("details")!;
  const later = within(activities).getByText("Later opportunities").closest("details")!;
  expect(later.open).toBe(false);
  expect(within(later).getByText("Browse careers").parentElement?.textContent).toMatch(/age 15/i);
  if (age === 7) {
    expect(within(later).getByText("Seek instruction").parentElement?.textContent).toMatch(/age 8/i);
  } else {
    expect(within(activities).getByText("Seek instruction").tagName).toBe("BUTTON");
  }
  expect(within(activities).queryByText("Review creditor service")).toBeNull();
});

it("describes both gates for an early-era legendary challenge", () => {
  const life = createExpandedLife({ seed: 32 });
  life.phase = "alive";
  life.age = 7;
  life.pending = null;
  life.expansion.birthYear = 397;
  render(<OptionalActivities life={life} onOpen={() => {}} />);
  const challenge = screen.getByText("Legendary challenges").parentElement?.textContent;
  expect(challenge).toMatch(/age 18.*K431/i);
});

it("describes empty storage once and names the saved life during replacement", () => {
  const setup = render(<App />);
  expect(screen.getAllByText("Your life will be saved in this browser.")).toHaveLength(1);
  expect(screen.queryByText("Saved in this browser")).toBeNull();
  setup.unmount();
  window.history.replaceState(null, "", "/?view=chronicle");
  const life = createExpandedLife({ seed: 32, name: "Eira" });
  saveGame(localStorage, { version: 1, active: life, archive: [] });
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "New life" }));
  expect(screen.getByText(/Eira .* is saved in this browser/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Begin a new life" }));
  expect(loadGame(localStorage).data.active?.id).toBe(life.id);
  expect(screen.getByRole("button", { name: "Leave this life and begin again" })).toBeTruthy();
});

it("requires confirmation even if an imported unfinished life has no display name", () => {
  const life = createLife({ ruleset: "legacy-1", seed: 32 });
  life.name = "";
  life.surname = "";
  saveGame(localStorage, { version: 1, active: life, archive: [] });
  window.history.replaceState(null, "", "/?view=new");
  render(<App />);
  expect(screen.getByText("Your unfinished life is saved in this browser.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Begin a new life" }));
  expect(screen.getByRole("button", { name: "Leave this life and begin again" })).toBeTruthy();
  expect(loadGame(localStorage).data.active?.id).toBe(life.id);
});

it("keeps the phone region input, label and description in sync without moving home", () => {
  const life = createExpandedLife({ seed: 32, region: "asura" });
  render(<LanguageProvider language="en"><WorldView life={life} /></LanguageProvider>);
  const select = screen.getByRole("combobox", { name: "Explore a region" });
  select.focus();
  for (const option of within(select).getAllByRole("option") as HTMLOptionElement[]) {
    fireEvent.change(select, { target: { value: option.value } });
    const detail = screen.getByRole("heading", { name: option.textContent!.replace(/ · Your home$/, "") });
    expect(detail.parentElement?.textContent).toContain(option.textContent!.replace(/ · Your home$/, ""));
    expect(document.activeElement).toBe(select);
  }
  expect(within(select).getAllByRole("option")).toHaveLength(6);
  expect(life.region).toBe("asura");
});

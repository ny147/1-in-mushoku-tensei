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
import { beginLife, createLife, finishLife } from "./game/engine";
import { loadGame, saveGame, SAVE_KEY } from "./game/storage";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.lang = "en";
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("new-life language ownership", () => {
  it("contains no untranslated authored text on Thai chronicle, character, world, archive and help pages", () => {
    const life = beginLife(
      createLife({ seed: 44, language: "th", name: "TestName" }),
    );
    life.age = 30;
    life.pending = null;
    life.career = "merchant";
    life.progression!.career.role = "merchant";
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    render(<App />);
    const names = [
      life.name,
      life.surname,
      ...life.family.flatMap((p) => p.name.split(" ")),
    ];
    function audit() {
      const english = new Set<string>();
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      let node;
      while ((node = walker.nextNode())) {
        let text = node.textContent ?? "";
        for (const name of ["Six-Faced Life", ...names])
          text = text.replaceAll(name, "");
        if (/[A-Za-z]{2,}/.test(text)) english.add(text.trim());
      }
      for (const element of document.querySelectorAll(
        "[aria-label],[title],[alt]",
      )) {
        for (const attribute of ["aria-label", "title", "alt"]) {
          const text = element.getAttribute(attribute) ?? "";
          if (/[A-Za-z]{2,}/.test(text)) english.add(text);
        }
      }
      expect([...english]).toEqual([]);
    }
    audit();
    for (const label of [
      "ตัวตนของคุณ",
      "โลกกว้าง",
      "ชีวิตที่ผ่านมา",
      "วิธีเล่น",
    ]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      audit();
    }
  });
  it("previews Thai, creates a fixed-language life, and restores its pending decision and outcome", () => {
    let view = render(<App />);
    expect(screen.getByLabelText("Language / ภาษา")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Language / ภาษา"), {
      target: { value: "th" },
    });
    expect(document.documentElement.lang).toBe("th");
    expect(
      screen.getByText(
        "ภาษานี้จะอยู่กับชีวิตใหม่ตลอดไป ชีวิตเดิมยังใช้ภาษาเดิม",
      ),
    ).toBeTruthy();
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull();
    expect(window.localStorage.getItem("six-faced-life.language")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "เริ่มชีวิตใหม่" }));
    expect(loadGame(window.localStorage).data.active?.language).toBe("th");
    expect(window.localStorage.getItem("six-faced-life.language")).toBe("th");
    fireEvent.click(screen.getByRole("button", { name: "เปิดบันทึกชีวิต" }));
    view.unmount();
    view = render(<App />);
    expect(document.documentElement.lang).toBe("th");
    expect(screen.getByRole("button", { name: "เดินเวลา" })).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: /^ฟัง มอง แล้วเรียนรู้/ }),
    );
    const result = screen.getByRole("region", { name: "ทางเลือกของคุณ" });
    expect(within(result).getByText("ความรู้ +8")).toBeTruthy();
    expect(document.activeElement).toBe(within(result).getByRole("heading"));
    expect(
      loadGame(window.localStorage).data.active?.history.at(-1)?.message?.key,
    ).toBe("choice.first-memory.observe");
    view.unmount();
    render(<App />);
    expect(
      screen.getAllByText(/คุณเก็บความลับไว้กับตัว/).length,
    ).toBeGreaterThan(0);
    expect(document.documentElement.lang).toBe("th");
    expect(screen.queryByLabelText("Language / ภาษา")).toBeNull();
  });

  it("cancels a Thai preview without changing an English life or its save", () => {
    saveGame(window.localStorage, {
      version: 1,
      active: beginLife(createLife({ seed: 24 })),
      archive: [],
    });
    const raw = window.localStorage.getItem(SAVE_KEY);
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "New life" }));
    fireEvent.change(screen.getByLabelText("Language / ภาษา"), {
      target: { value: "th" },
    });
    expect(document.documentElement.lang).toBe("th");
    expect(window.localStorage.getItem(SAVE_KEY)).toBe(raw);
    fireEvent.click(screen.getByRole("button", { name: "กลับสู่บันทึกชีวิต" }));
    expect(document.documentElement.lang).toBe("en");
    expect(window.localStorage.getItem(SAVE_KEY)).toBe(raw);
    expect(
      screen.getByRole("heading", {
        name: "A familiar mind. An unfamiliar world.",
      }),
    ).toBeTruthy();
  });

  it("requires replacement confirmation and remembers the language only after creation", () => {
    saveGame(window.localStorage, {
      version: 1,
      active: beginLife(createLife({ seed: 24 })),
      archive: [],
    });
    const raw = window.localStorage.getItem(SAVE_KEY);
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "New life" }));
    fireEvent.change(screen.getByLabelText("Language / ภาษา"), {
      target: { value: "th" },
    });
    fireEvent.click(screen.getByRole("button", { name: "เริ่มชีวิตใหม่" }));
    expect(window.localStorage.getItem(SAVE_KEY)).toBe(raw);
    expect(screen.getByRole("alert").textContent).toContain("ชีวิตที่ยังไม่จบ");
    fireEvent.click(
      screen.getByRole("button", { name: "จากชีวิตนี้แล้วเริ่มใหม่" }),
    );
    expect(loadGame(window.localStorage).data.active?.language).toBe("th");
    fireEvent.click(screen.getByRole("button", { name: "ชีวิตใหม่" }));
    expect(
      (screen.getByLabelText("Language / ภาษา") as HTMLSelectElement).value,
    ).toBe("th");
  });

  it("uses an archived life's language and restores the active language on return", () => {
    const archived = createLife({
      seed: 2,
      language: "th",
      name: "ThaiRecord",
    });
    finishLife(
      archived,
      "After a lifetime of seasons, you passed away of old age.",
    );
    saveGame(window.localStorage, {
      version: 1,
      active: beginLife(createLife({ seed: 24 })),
      archive: [archived],
    });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Past lives/ }));
    expect(screen.getByText("ไทย")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /ThaiRecord/ }));
    expect(document.documentElement.lang).toBe("th");
    expect(
      screen.getByText("หลังฤดูกาลตลอดหนึ่งชีวิต คุณจากไปด้วยวัยชรา"),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "กลับสู่ชีวิตที่ผ่านมา" }),
    );
    expect(document.documentElement.lang).toBe("en");
  });

  it("clears a prior-language live announcement when opening another life's retrospective", () => {
    const archived = createLife({
      seed: 2,
      language: "th",
      name: "ThaiRecord",
    });
    finishLife(
      archived,
      "After a lifetime of seasons, you passed away of old age.",
    );
    saveGame(window.localStorage, {
      version: 1,
      active: beginLife(createLife({ seed: 24 })),
      archive: [archived],
    });
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: /^Listen\. Watch\. Learn\./ }),
    );
    expect(screen.getByRole("status").textContent).toContain(
      "You keep your secret",
    );
    fireEvent.click(screen.getByRole("button", { name: /Past lives/ }));
    fireEvent.click(screen.getByRole("button", { name: /ThaiRecord/ }));
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("preserves a personal name even when it is also a translatable domain label", () => {
    const life = createLife({ seed: 24, language: "th", name: "Human" });
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    render(<App />);
    expect(
      screen.getAllByText(new RegExp(`Human ${life.surname}`)).length,
    ).toBeGreaterThan(0);
  });

  it("keeps game saving functional when preference storage fails", () => {
    const original = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (key === "six-faced-life.language") throw Error("preference blocked");
      original.call(this, key, value);
    });
    render(<App />);
    fireEvent.change(screen.getByLabelText("Language / ภาษา"), {
      target: { value: "th" },
    });
    fireEvent.click(screen.getByRole("button", { name: "เริ่มชีวิตใหม่" }));
    expect(loadGame(window.localStorage).data.active?.language).toBe("th");
    expect(screen.getByText("บันทึกในอุปกรณ์นี้แล้ว")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows Thai recovery and retries the game save when all writes fail", () => {
    const write = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw Error("full");
      });
    render(<App />);
    fireEvent.change(screen.getByLabelText("Language / ภาษา"), {
      target: { value: "th" },
    });
    fireEvent.click(screen.getByRole("button", { name: "เริ่มชีวิตใหม่" }));
    expect(
      screen.getByRole("button", { name: "ลองบันทึกอีกครั้ง" }),
    ).toBeTruthy();
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull();
    write.mockRestore();
    fireEvent.click(screen.getByRole("button", { name: "ลองบันทึกอีกครั้ง" }));
    expect(loadGame(window.localStorage).data.active?.language).toBe("th");
  });

  it("localizes study, world and help without changing persisted study IDs", () => {
    const life = beginLife(createLife({ seed: 44, language: "th" }));
    life.age = 10;
    life.pending = null;
    saveGame(window.localStorage, { version: 1, active: life, archive: [] });
    render(<App />);
    fireEvent.change(screen.getByLabelText("สาขาเวทมนตร์"), {
      target: { value: "fire" },
    });
    expect(
      loadGame(window.localStorage).data.active?.progression?.specialization,
    ).toBe("fire");
    fireEvent.click(
      screen.getByRole("button", { name: "เปิดตำราเวทฉบับเต็ม" }),
    );
    expect(document.activeElement?.id).toBe("spellbook-heading");
    expect(screen.getByRole("heading", { name: "ตำราเวทของคุณ" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "โลกกว้าง" }));
    expect(
      screen.getByRole("navigation", { name: "ภูมิภาคของโลก" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "วิธีเล่น" }));
    expect(screen.getByText("คุณมีโอกาสใช้ชีวิตอีกครั้ง")).toBeTruthy();
    act(() => {
      fireEvent.keyDown(document.body, { code: "Space", key: " " });
    });
    expect(loadGame(window.localStorage).data.active?.age).toBe(10);
  });
});

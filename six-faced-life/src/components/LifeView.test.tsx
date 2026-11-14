// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LifeTimeline } from "./LifeView";
import { Ending } from "./Archive";
import { beginLife, createLife } from "../game/engine";

afterEach(cleanup);

describe("completed life presentation", () => {
  it("ends the timeline at the final year instead of promising a future", () => {
    const life = beginLife(createLife({ ruleset: 'legacy-1', seed: 32 }));
    life.phase = "ended";
    life.pending = null;
    life.age = 74;
    const { container } = render(<LifeTimeline life={life} />);
    expect(screen.queryByText("The story still ahead")).toBeNull();
    expect(container.querySelectorAll(".year-grid > span")).toHaveLength(75);
    expect(container.querySelector('[title*="Unwritten"]')).toBeNull();
  });

  it("does not claim a failed ending save succeeded", () => {
    const life = beginLife(createLife({ ruleset: 'legacy-1', seed: 32 }));
    life.phase = "ended";
    life.ending = { cause: "Old age", legacy: "A full life" };
    render(<Ending life={life} onNew={() => {}} saved={false} />);
    expect(
      screen.queryByText("This life is kept in your past lives."),
    ).toBeNull();
    expect(screen.getByText(/not yet saved/i)).toBeTruthy();
  });
});

import { CharacterView } from "./LifeView";
import { createExpandedLife } from "../game/expanded/origins";
import { LanguageProvider } from "../i18n/context";

it.each(["en", "th"] as const)(
  "reads all compact %s ending facts before the detailed sword records",
  (language) => {
    const life = createExpandedLife({ seed: 32, language });
    life.phase = "ended";
    life.age = 71;
    life.pending = null;
    life.ending = { cause: "aging", legacy: "A full life" };
    life.expansion.swords!.selected = "sword-god";
    life.expansion.swords!.tracks["sword-god"] = { xp: 475, cap: 2 };
    render(
      <LanguageProvider language={language}>
        <Ending life={life} onNew={() => {}} />
      </LanguageProvider>,
    );
    const swordHeading = screen.getByRole("heading", {
      name: language === "en" ? "Sword styles" : "วิชาดาบสามรูปแบบ",
    });
    for (const label of language === "en"
      ? ["Your last home", "Magic rank", "Sword rank", "One part of your story"]
      : ["บ้านหลังสุดท้าย", "ระดับเวทมนตร์", "ระดับวิชาดาบ", "ส่วนหนึ่งในเรื่องราวของคุณ"]) {
      expect(
        screen.getByText(label).compareDocumentPosition(swordHeading) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(screen.getByText(/475 XP/)).toBeTruthy();
    expect(screen.getAllByText(/0 XP/)).toHaveLength(2);
    expect(screen.queryByRole("combobox")).toBeNull();
  },
);

it.each(["en", "th"] as const)("presents %s condition before background, training, family and spellbook", language=>{
 const l=createExpandedLife({seed:1,language});l.phase="alive";
 const {container}=render(<LanguageProvider language={language}><CharacterView life={l} onStudyChange={()=>{}} onSwordStyle={()=>{}}/></LanguageProvider>);
 const headings=[...container.querySelectorAll(".character-detail-grid h2")].map(e=>e.textContent);
 const labels=language==="en"?["Your condition0–100","Your life in history","The life you were given","The skills you carry","Sword styles","Work and opportunity","The people beside you","Your spellbook"]:["สภาพของคุณ0–100","ชีวิตในยุคสมัยนี้","ชีวิตที่ได้รับมา","ทักษะที่ติดตัว","วิชาดาบสามรูปแบบ","งานและโอกาส","ผู้คนข้างกาย","ตำราเวทของคุณ"];
 expect(headings[0]).toBe(labels[0]);
 const condition=container.querySelector(".money-row")!;
 const training=container.querySelector(".training-section")!;
 const family=container.querySelector(".family-section") ?? container.querySelector(".expanded-family")!;
 const spellbook=container.querySelector(".spellbook")!;
 expect(condition.compareDocumentPosition(training)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
 expect(training.compareDocumentPosition(spellbook)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
 if(family) expect(family.compareDocumentPosition(spellbook)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
 expect(container.querySelectorAll(".stat-list")).toHaveLength(1);
});

import { LifeRecord } from "./LifeView";
it.each(["en","th"] as const)("announces only explicit %s filter changes with full counts and retained focus",language=>{
 const l=createExpandedLife({seed:1,language});l.phase="alive";
 l.history=Array.from({length:20},(_,i)=>({id:i+1,age:i,title:`Moment ${i}`,text:"A recorded moment.",kind:i<8?"memory":"life"}));
 const view=(life:typeof l,all=false)=><LanguageProvider language={language}><LifeRecord life={life} all={all}/></LanguageProvider>;
 const {container,rerender}=render(view(l));
 const group=screen.getByRole("group",{name:language==="en"?"Chronicle filters":"ตัวกรองบันทึกชีวิต"});
 const buttons=group.querySelectorAll("button");const status=screen.getByRole("status");
 expect(buttons[0].getAttribute("aria-pressed")).toBe("true");expect(status.textContent).toBe("");
 expect(container.querySelectorAll(".record-entry")).toHaveLength(5);
 buttons[1].focus();fireEvent.click(buttons[1]);
 expect(document.activeElement).toBe(buttons[1]);
 expect(buttons[1].getAttribute("aria-pressed")).toBe("true");expect(buttons[0].getAttribute("aria-pressed")).toBe("false");
 expect(status.textContent).toContain("8");const announced=status.textContent;
 expect(screen.getByRole("region",{name:language==="en"?"Chronicle results":"รายการบันทึกชีวิต"})).toBeTruthy();
 const next={...l,history:[...l.history,{id:21,age:20,title:"New memory",text:"Remembering.",kind:"memory" as const}]};
 rerender(view(next));expect(status.textContent).toBe(announced);
 fireEvent.click(buttons[1]);expect(status.textContent).toBe(announced);
 fireEvent.click(screen.getByRole("button",{name:language==="en"?"Read earlier moments":"อ่านช่วงเวลาก่อนหน้า"}));
 expect(container.querySelectorAll(".record-entry")).toHaveLength(9);
 fireEvent.click(buttons[0]);expect(status.textContent).toContain("21");
 rerender(view({...next,history:[]}));fireEvent.click(buttons[1]);expect(status.textContent).toContain("0");
});
it("retains the full-record limit for ended chronicles",()=>{
 const l=createExpandedLife({seed:1});l.phase="ended";
 l.history=Array.from({length:20},(_,i)=>({id:i+1,age:i,title:`Moment ${i}`,text:"A recorded moment.",kind:"life"}));
 const {container}=render(<LifeRecord life={l} all/>);
 expect(container.querySelectorAll(".record-entry")).toHaveLength(20);
 expect(screen.getByRole("button",{name:"All"}).getAttribute("aria-pressed")).toBe("true");
});

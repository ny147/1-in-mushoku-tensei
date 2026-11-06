// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
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

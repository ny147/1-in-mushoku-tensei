import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { openActivity, choose, getDecision } from "../engine";
import { isLife, loadGame } from "../storage";
import { canAutoChoose } from "../simulation";
import { expandedDecisionText, expandedEntryText } from "../../i18n/expanded";
const adult = () => {
  const l = createExpandedLife({ seed: 1 });
  l.phase = "alive";
  l.age = 20;
  l.coins = 0;
  l.expansion.economy.familyFunds = 0;
  return l;
};
describe("manual education choices", () => {
  it("explains university attendance when a qualified graduate cannot accept placement",()=>{
    const l=adult();l.expansion.education.stage="university";l.expansion.education.scholarship=true;
    l.expansion.training!.selection={role:"mage",mode:"full-time"};
    Object.assign(l.expansion.training!.records.mage,{units:6,school:"water",completedYear:l.expansion.birthYear+l.age});
    l.pending="expanded.training-placement";
    const d=getDecision(l)!;expect(d.choices[0].disabled).toBe(true);
    expect(d.text).toContain("Finish university or withdraw before accepting placement");
    expect(expandedDecisionText(d,"th").text).toContain("เรียนมหาวิทยาลัยให้จบหรือถอนตัวก่อนรับงาน");
  });
  it("opens, quotes, borrows and restores a course without any time or random draws", () => {
    const l = adult();
    let n = openActivity(l, "training");
    expect(n.pending).toBe("expanded.training");
    expect(canAutoChoose(n)).toBe(false);
    n = choose(n, "expanded.training.course-swordsman");
    expect(n.pending).toBe("expanded.training-quote");
    expect(isLife(n)).toBe(true);
    const d = getDecision(n)!;
    expect(d.text).toContain("24");
    expect(expandedDecisionText(d, "th").text).toContain("24");
    n = loadGame({
      getItem: () => JSON.stringify({ version: 1, active: n, archive: [] }),
      setItem: () => {},
    }).data.active!;
    expect(canAutoChoose(n)).toBe(false);
    n = choose(n, "expanded.training-quote.enroll-loan");
    if (n.ruleset !== "expanded-1") throw Error("expanded");
    expect(n.expansion.training!.active).toBe("swordsman");
    expect(n.coins).toBe(0);
    expect(n.rng).toBe(l.rng);
    expect(n.age).toBe(20);
    expect(isLife(n)).toBe(true);
    expect(expandedEntryText(n.history.at(-1)!, "th")?.text).toMatch(/[ก-๙]/);
    n = openActivity(n, "training");
    n = choose(n, "expanded.training.pause");
    expect(n.ruleset === "expanded-1" && n.expansion.training?.paused).toBe(
      true,
    );
    n = choose(n, "expanded.training.mode-part-time");
    expect(n.ruleset === "expanded-1" && n.expansion.training?.mode).toBe(
      "part-time",
    );
  });
  it("keeps university loans manual and refuses to bypass readiness", () => {
    const l = adult();
    l.stats.knowledge = 40;
    l.training.magicXp = 60;
    const n = openActivity(l, "university");
    expect(canAutoChoose(n)).toBe(false);
    expect(
      getDecision(n)!.choices.find(
        (c) => c.id === "expanded.university.enroll-loan",
      )?.disabled,
    ).toBe(false);
    const enrolled = choose(n, "expanded.university.enroll-loan");
    expect(
      enrolled.ruleset === "expanded-1" && enrolled.expansion.education.stage,
    ).toBe("university");
    expect(isLife(enrolled)).toBe(true);
    l.stats.knowledge = 39;
    const blocked = openActivity(l, "university");
    expect(
      getDecision(blocked)!.choices.find(
        (c) => c.id === "expanded.university.enroll-loan",
      )?.disabled,
    ).toBe(true);
  });
});

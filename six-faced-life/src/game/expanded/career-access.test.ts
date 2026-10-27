import { describe, expect, it } from "vitest";
import { createExpandedLife } from "./origins";
import { ORDINARY_ROLES } from "./career-access";
import { appoint, careerRequirements } from "./careers";
import { getExpandedDecision } from "./events";
describe("reliable ordinary direct entry", () => {
  it.each(ORDINARY_ROLES)("accepts %s at its ordinary thresholds without consuming availability RNG", role => {
    for (const seed of [1, 4, 17, 99]) {
      const l=createExpandedLife({seed}); l.phase="alive";l.age=15;l.pending="expanded.career";
      l.coins=10;l.stats.health=30;l.stats.knowledge=25;l.training.swordXp=30;l.training.magicCap=1;l.training.swordCap=1;
      l.training.magicXp=30;l.progression!.magic.water.xp=30;l.progression!.magic.healing.xp=25;
      l.expansion.standing.trust=10;l.expansion.standing.reputation=5;
      const rng=l.rng;
      const choice=getExpandedDecision(l)!.choices.find(c=>c.id===`expanded.career.job-${role}`)!;
      expect(choice.disabled).toBe(false); expect(choice.vacancy).toBe(true);expect(l.rng).toBe(rng);
      const before=l.coins;expect(appoint(l,role)).toBe(true);
      expect(l.coins).toBe(before-(role==="merchant"?10:role==="adventurer"?5:0));
    }
  });
  it("checks exact skill, discipline and age boundaries while prestige stays earned",()=>{
    const l=createExpandedLife({seed:1});l.age=15;l.coins=10000;l.training.swordXp=29;l.training.swordCap=1;
    expect(appoint(l,"swordsman")).toBe(false);l.training.swordXp=30;expect(appoint(l,"swordsman")).toBe(true);
    l.age=14;expect(appoint(l,"laborer")).toBe(false);l.age=15;
    l.expansion.study="fire";l.progression!.magic.water.xp=100;l.progression!.magic.fire.xp=29;
    expect(appoint(l,"mage")).toBe(false);l.progression!.magic.fire.xp=30;expect(appoint(l,"mage")).toBe(true);
    expect(careerRequirements(l,"knight").some(r=>!r.met)).toBe(true);
    expect(appoint(l,"professor")).toBe(false);
  });
});

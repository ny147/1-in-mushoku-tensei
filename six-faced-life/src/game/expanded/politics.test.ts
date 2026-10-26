import { describe,expect,it } from 'vitest';
import { createExpandedLife } from './origins';
import { factionEligible, acceptFaction, refuseFaction, defect, titleEligible, contestTitle } from './politics';
describe('optional allegiances and exceptional titles',()=>{
  it('enforces historical dates, explicit acceptance, refusal cooldown and one allegiance',()=>{
    const l=createExpandedLife({seed:1});l.expansion.birthYear=397;l.age=20;l.training.magicXp=100;l.expansion.politics.contact=true;
    expect(factionEligible(l,'orsted')).toBe(false);expect(factionEligible(l,'hitogami')).toBe(true);
    refuseFaction(l,'hitogami');expect(l.expansion.politics.faction).toBeNull();expect(factionEligible(l,'hitogami')).toBe(false);
    l.age=28;expect(factionEligible(l,'hitogami')).toBe(true);expect(acceptFaction(l,'hitogami')).toBe(true);expect(factionEligible(l,'orsted')).toBe(false);
    defect(l);expect(l.expansion.politics.faction).toBeNull();expect(l.expansion.politics.pursuitUntil).toBe(428);
  });
  it('excludes positions 1–4 even with maximum power and preserves title history',()=>{
    const l=createExpandedLife({seed:1});l.expansion.birthYear=400;l.age=31;l.training.swordXp=4000;l.training.swordCap=6;l.expansion.standing.reputation=100;l.expansion.standing.feats=['rescue','service','research'];
    expect(titleEligible(l,5)).toBe(true);for(const p of [1,2,3,4])expect(titleEligible(l,p)).toBe(false);
    contestTitle(l,5);expect(l.expansion.standing.titles).toHaveLength(1);
    l.age=30;expect(titleEligible(l,5)).toBe(false);
  });
});

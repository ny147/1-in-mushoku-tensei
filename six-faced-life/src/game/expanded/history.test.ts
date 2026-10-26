import { describe,expect,it } from 'vitest';
import { createExpandedLife } from './origins';
import { applyHistoryYear, regionalConflict } from './history';
describe('local history and original conflicts',()=>{
  it('distinguishes Fittoa victims, other Asura residents, distant news and post-event births',()=>{
    for(const [region,locality,want] of [['asura','fittoa','civilian'],['asura','capital','news'],['demon','settlement','news']] as const){
      const l=createExpandedLife({seed:1});l.expansion.birthYear=400;l.age=17;l.region=region;l.expansion.origin.locality=locality;
      applyHistoryYear(l);expect(l.expansion.history.find(h=>h.code==='calamity')?.exposure).toBe(want);
      applyHistoryYear(l);expect(l.expansion.history.filter(h=>h.code==='calamity')).toHaveLength(1);
    }
    const later=createExpandedLife({seed:1});later.expansion.birthYear=420;applyHistoryYear(later);expect(later.expansion.history.some(h=>h.code==='calamity')).toBe(false);
  });
  it('keeps Ariel accession fixed regardless of player ability or faction',()=>{
    const l=createExpandedLife({seed:1});l.expansion.birthYear=400;l.age=25;l.expansion.politics.faction='hitogami';applyHistoryYear(l);
    expect(l.expansion.history.some(h=>h.code==='ariel-accession')).toBe(true);
  });
  it('does not use personal RNG and keeps at least five quiet years between conflicts',()=>{
    const l=createExpandedLife({seed:1}),rng=l.rng;let lastEnd=-Infinity;
    for(let year=397;year<=1200;year++){
      const conflict=regionalConflict(l.expansion.worldSeed,'asura',year);
      expect(conflict).toEqual(regionalConflict(l.expansion.worldSeed,'asura',year));
      if(conflict?.start===year){expect(year-lastEnd).toBeGreaterThanOrEqual(6);lastEnd=conflict.end;}
    }expect(l.rng).toBe(rng);
  });
});

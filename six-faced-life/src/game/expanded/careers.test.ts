import { describe,expect,it } from 'vitest';
import { createExpandedLife } from './origins';
import { careerRequirements, appoint, applyCareerYear, careerIncomeExpanded } from './careers';
describe('independent careers and access',()=>{
  it('has ordinary work with no hero prerequisite and pays only the primary occupation',()=>{
    const l=createExpandedLife({seed:1});l.age=15;
    expect(appoint(l,'farmer')).toBe(true);expect(careerIncomeExpanded(l)).toBe(20);
    applyCareerYear(l);expect(l.expansion.career.records.farmer.years).toBe(1);
    expect(appoint(l,'laborer')).toBe(true);expect(careerIncomeExpanded(l)).toBe(12);
    expect(l.expansion.career.records.farmer.years).toBe(1);
  });
  it('does not let wealthy untrained characters become knights or professors',()=>{
    const l=createExpandedLife({seed:1});l.age=25;l.coins=10000;l.expansion.origin.patron=true;
    expect(appoint(l,'knight')).toBe(false);expect(appoint(l,'professor')).toBe(false);
    l.training.swordXp=150;l.expansion.standing.service=3;
    expect(careerRequirements(l,'knight').every(r=>r.met)).toBe(true);expect(appoint(l,'knight')).toBe(true);
    expect(l.coins).toBe(9880);
  });
  it('retains per-career progress on switch and requires an appointment for reentry',()=>{
    const l=createExpandedLife({seed:1});l.age=25;appoint(l,'farmer');l.expansion.career.records.farmer.xp=180;l.expansion.career.records.farmer.years=5;l.expansion.career.records.farmer.reputation=25;
    appoint(l,'laborer');appoint(l,'farmer');expect(l.expansion.career.records.farmer.xp).toBe(180);expect(l.expansion.career.timeline).toHaveLength(3);
  });
});

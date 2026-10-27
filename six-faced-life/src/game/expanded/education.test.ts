import { describe,expect,it } from 'vitest';
import { advance, getDecision } from '../engine';
import { createExpandedLife } from './origins';
import { assessTalent, enrollUniversity, applyEducationYear, educationRequirements } from './education';
describe('education access and funded progress',()=>{
  it('offers an ordinary livelihood immediately when university attendance ends',()=>{
    const l=createExpandedLife({seed:1});l.phase='alive';l.age=20;l.coins=500;l.expansion.economy.peak=500;l.focus='study';l.career='student';l.expansion.career.role='student';
    Object.assign(l.expansion.education,{stage:'university',scholarship:true,successfulYears:3,previousKnowledge:18,previousXp:0});
    const next=advance(l,'year');expect(getDecision(next)?.id).toBe('expanded.work');
  });
  it('lets a poor talented pupil qualify through free assessment but not poverty alone',()=>{
    const l=createExpandedLife({seed:1});l.phase='alive';l.age=15;l.coins=0;l.stats.knowledge=50;l.training.magicXp=80;l.expansion.genetics.magicTalent=true;
    assessTalent(l);expect(l.expansion.education.assessment).toBeGreaterThanOrEqual(60);
    expect(enrollUniversity(l)).toBe(true);expect(l.expansion.education.scholarship).toBe(true);expect(l.coins).toBe(0);
    const poor=createExpandedLife({seed:1});poor.phase='alive';poor.age=15;poor.expansion.genetics.magicTalent=false;poor.expansion.genetics.academicTalent=false;poor.stats.knowledge=50;poor.training.magicXp=80;assessTalent(poor);
    expect(enrollUniversity(poor)).toBe(false);
  });
  it('requires readiness despite wealth and reserves all necessary costs when funded',()=>{
    const l=createExpandedLife({seed:1});l.phase='alive';l.age=15;l.expansion.economy.familyFunds=1600;
    expect(educationRequirements(l).some(r=>!r.met)).toBe(true);expect(enrollUniversity(l)).toBe(false);
    l.stats.knowledge=50;l.training.magicXp=80;assessTalent(l);expect(enrollUniversity(l)).toBe(true);
    expect(l.expansion.economy.familyFunds).toBeLessThan(1600);expect(l.expansion.education.budget).toBe(232);
  });
  it('warns for one probation year, withdraws after another, and graduates only after four successful years',()=>{
    const l=createExpandedLife({seed:1});l.phase='alive';l.age=15;l.stats.knowledge=50;l.training.magicXp=80;l.expansion.genetics.magicTalent=true;assessTalent(l);enrollUniversity(l);
    l.focus='rest';applyEducationYear(l);expect(l.expansion.education.probation).toBe(true);applyEducationYear(l);expect(l.expansion.education.stage).toBe('withdrawn');
    const s=createExpandedLife({seed:2});s.phase='alive';s.age=15;s.stats.knowledge=50;s.training.magicXp=80;s.expansion.genetics.magicTalent=true;assessTalent(s);enrollUniversity(s);s.focus='magic';
    for(let i=0;i<4;i++){s.training.magicXp+=12;applyEducationYear(s);}
    expect(s.expansion.education.stage).toBe('graduated');expect(s.expansion.education.successfulYears).toBe(4);
  });
});

import { describe, expect, it } from 'vitest';
import { createExpandedLife } from './origins';
import { getExpandedDecision } from './events';
import { chooseExpanded } from './engine';
import { canAutoChoose } from '../simulation';
import { loadGame, isLife } from '../storage';
import { enterCareerNode } from './career-paths';
import { openExpandedActivity } from './activities';
import { applyTrainingYear, enrollTraining, quoteTraining } from './training';

function adult() {
  const l=createExpandedLife({seed:1});l.age=25;l.phase='alive';l.pending=null;
  l.coins=500;l.expansion.economy.peak=500;l.stats.health=90;l.stats.knowledge=50;
  return l;
}
describe('six manual career journeys',()=>{
  it('opens only six path choices, persists detail navigation and never auto-chooses',()=>{
    let l=openExpandedActivity(adult(),'career');const rng=l.rng;
    expect(getExpandedDecision(l)?.choices.filter(c=>c.id.includes('.path-'))).toHaveLength(6);
    expect(canAutoChoose(l)).toBe(false);
    l=chooseExpanded(l,'expanded.career.path-magic');
    expect(l.pending).toBe('expanded.career-path');expect(l.rng).toBe(rng);
    expect(l.expansion.careerPaths!.selection).toBe('magic');expect(isLife(l)).toBe(true);
    const raw=JSON.stringify({version:1,active:l,archive:[]});
    const restored=loadGame({getItem:()=>raw,setItem:()=>{throw Error('no write')}});
    expect(restored.error).toBeNull();expect(restored.data.active).toEqual(l);
    expect(canAutoChoose(l)).toBe(false);
  });
  it('rejects forged cross-path or unqualified advancement without changing anything',()=>{
    let l=openExpandedActivity(adult(),'career');
    l=chooseExpanded(l,'expanded.career.path-trade');
    expect(chooseExpanded(l,'expanded.career-path.enter-professor')).toBe(l);
    expect(chooseExpanded(l,'expanded.career-path.promote-trade-leader')).toBe(l);
    l=chooseExpanded(l,'expanded.career-path.enter-trade-assistant');
    expect(l.expansion.careerPaths!.active).toBe('trade-assistant');expect(l.coins).toBe(490);
  });
  it('keeps work manual and charges exactly once',()=>{
    let l=adult();enterCareerNode(l,'farmhand');l=openExpandedActivity(l,'career-work');
    expect(canAutoChoose(l)).toBe(false);
    l=chooseExpanded(l,'expanded.career-work.safe');
    expect(l.coins).toBe(496);expect(l.expansion.careerPaths!.work.farming.milestones).toBe(1);
    expect(openExpandedActivity(l,'career-work')).toBe(l);
  });
  it('groups course browsing into paths instead of ten competing roles',()=>{
    let l=openExpandedActivity(adult(),'training');
    expect(getExpandedDecision(l)?.choices.filter(c=>c.id.includes('.path-'))).toHaveLength(6);
    l=chooseExpanded(l,'expanded.training.path-healing');
    const ids=getExpandedDecision(l)!.choices.map(c=>c.id);
    expect(ids).toContain('expanded.training.course-healer');
    expect(ids).toContain('expanded.training.course-cleric');
    expect(ids).not.toContain('expanded.training.course-merchant');
  });
  it('freezes a new magic teaching course to its quoted school through reload and study changes',()=>{
    let l=openExpandedActivity(adult(),'career');l.expansion.study='fire';
    l=chooseExpanded(l,'expanded.career.path-magic');
    l=chooseExpanded(l,'expanded.career-path.train-teacher');
    expect(l.pending).toBe('expanded.training-quote');
    expect(getExpandedDecision(l)?.id).toBe('expanded.training-quote');
    expect(l.expansion.careerPaths!.teacherCourse).toEqual({kind:'magic',school:'fire'});
    const q=quoteTraining(l,'teacher','full-time');expect(q.school).toBe('fire');
    l.pending=null;expect(enrollTraining(l,q,false)).toBe(true);
    l.expansion.study='water';
    for(let i=0;i<3;i++){l.age++;applyTrainingYear(l);}
    expect(l.progression!.magic.fire.xp).toBeGreaterThanOrEqual(25);
    expect(l.progression!.magic.water.xp).toBe(0);
    expect(l.expansion.training!.records.teacher.school).toBeNull();
    expect(l.expansion.training!.records.teacher.completedYear).not.toBeNull();
    expect(isLife(l)).toBe(true);
  });
  it('leaves a pending unversioned career menu in its original form',()=>{
    const l=adult();delete l.expansion.careerPaths;l.pending='expanded.career';
    expect(getExpandedDecision(l)?.choices.some(c=>c.id==='expanded.career.job-farmer')).toBe(true);
    expect(getExpandedDecision(l)?.choices.some(c=>c.id.includes('.path-'))).toBe(false);
  });
  it('also selects magic teaching when entering through grouped course browsing',()=>{
    let l=openExpandedActivity(adult(),'training');l.expansion.study='wind';
    l=chooseExpanded(l,'expanded.training.path-magic');
    l=chooseExpanded(l,'expanded.training.course-teacher');
    expect(l.pending).toBe('expanded.training-quote');
    expect(l.expansion.careerPaths!.teacherCourse).toEqual({kind:'magic',school:'wind'});
  });
});

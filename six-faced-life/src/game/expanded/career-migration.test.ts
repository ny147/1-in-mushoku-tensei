import { describe, expect, it } from 'vitest';
import { createExpandedLife } from './origins';
import { activateCareerPaths } from './career-migration';
import { OCCUPATIONS, PAY } from './balance';
import type { Occupation } from './types';
import type { Career } from '../types';
import { pathIncome } from './career-paths';

describe('lossless career recognition',()=>{
  it.each(OCCUPATIONS)('retains %s work across levels and languages',(role)=>{
    for(const language of ['en','th'] as const) for(const level of [0,1,2,3]) {
      const l=createExpandedLife({seed:1,language});
      delete l.expansion.careerPaths;
      l.phase='alive';l.age=30;l.pending=null;l.expansion.queue=[];
      l.expansion.career.role=role;
      const mirror:Partial<Record<Occupation,Career>>={laborer:'guard',farmer:'merchant',swordsman:'guard',mage:'healer',cleric:'healer',knight:'guard',professor:'teacher'};
      l.career=mirror[role]??role as Career;
      l.expansion.career.records[role]={level,xp:45,years:3,reputation:10};
      const before=JSON.stringify(l), n=activateCareerPaths(l);
      expect(JSON.stringify(l)).toBe(before);
      expect(n.rng).toBe(l.rng);expect(n.history).toEqual(l.history);
      expect(n.expansion.career).toEqual(l.expansion.career);
      expect(n.expansion.finance).toEqual(l.expansion.finance);
      expect(n.coins).toBe(l.coins);
      expect(n.expansion.careerPaths?.requests).toBe(0);
      expect(activateCareerPaths(n)).toBe(n);
      if(PAY[role]) expect(pathIncome(n)).toBeGreaterThanOrEqual(PAY[role]+[0,8,18,32][level]);
      else expect(n.expansion.careerPaths?.active).toBeNull();
      if(role==='teacher') expect(n.expansion.careerPaths?.active).toBe('teacher-unspecified');
      if(role==='adventurer') expect(n.expansion.careerPaths?.active).toBe(['adventure-f','adventure-d','adventure-b','adventure-s'][level]);
    }
  });
  it('does not fabricate unused roles or past requests',()=>{
    const l=createExpandedLife({seed:1});l.phase='alive';l.age=20;l.pending=null;
    delete l.expansion.careerPaths;
    const n=activateCareerPaths(l);
    expect(n.expansion.careerPaths?.earned).toEqual({});
    expect(n.expansion.careerPaths?.payFloor).toEqual({});
  });
  it('defers pending/queued offers and never modifies completed lives',()=>{
    const l=createExpandedLife({seed:1});delete l.expansion.careerPaths;l.phase='alive';l.age=20;
    l.pending='expanded.career';expect(activateCareerPaths(l)).toBe(l);
    l.pending=null;l.expansion.queue=['expanded.training'];expect(activateCareerPaths(l)).toBe(l);
    l.expansion.queue=[];l.phase='ended';expect(activateCareerPaths(l)).toBe(l);
  });
});

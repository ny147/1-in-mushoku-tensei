import { describe, expect, it } from 'vitest';
import { createExpandedLife } from './origins';
import { activateCareerPaths } from './career-migration';
import { validateCareerPaths } from './career-validation';
import { isLife, loadGame, SAVE_KEY } from '../storage';

function life() {
  const l=createExpandedLife({seed:1});l.phase='alive';l.age=20;l.pending=null;
  delete l.expansion.careerPaths;
  return activateCareerPaths(l);
}
describe('career ledger restoration boundaries',()=>{
  it('accepts old missing ledgers and valid activated ones',()=>{
    const l=life();expect(validateCareerPaths(undefined,l)).toBe(true);
    expect(validateCareerPaths(l.expansion.careerPaths,l)).toBe(true);
    expect(isLife(l)).toBe(true);
  });
  it.each<[string, (s:any)=>void]>([
    ['unknown version',(s:any)=>s.version=2],
    ['negative requests',(s:any)=>s.requests=-1],
    ['fractional units',(s:any)=>s.work.trade.units=0.5],
    ['NaN',(s:any)=>s.requests=NaN],
    ['unknown active',(s:any)=>s.active='adventure-a'],
    ['unearned active',(s:any)=>s.active='professor'],
    ['unknown branch',(s:any)=>s.work.fake={years:0,units:0,milestones:0}],
    ['future project',(s:any)=>s.lastProjectYear=9999],
    ['oversized history',(s:any)=>s.recent=Array(65).fill({year:400,node:'laborer',code:'safe',units:1})],
    ['invalid teacher school',(s:any)=>s.teacherCourse={kind:'magic',school:null}],
  ])('rejects %s and leaves stored input untouched',(_,mutate)=>{
    const l=life();mutate(l.expansion.careerPaths!);
    expect(validateCareerPaths(l.expansion.careerPaths,l)).toBe(false);
    const raw=JSON.stringify({version:1,active:l,archive:[]});
    let writes=0; const storage={getItem:()=>raw,setItem:()=>{writes++}};
    expect(loadGame(storage).error).not.toBeNull();expect(writes).toBe(0);
    expect(storage.getItem()).toBe(raw);expect(SAVE_KEY).toBe('six-faced-life.v1');
  });
  it('keeps an old pending career offer untouched on load',()=>{
    const l=createExpandedLife({seed:1});delete l.expansion.careerPaths;
    l.phase='alive';l.age=20;l.pending='expanded.career';
    const raw=JSON.stringify({version:1,active:l,archive:[]});
    const result=loadGame({getItem:()=>raw,setItem:()=>{throw Error('must not write')}});
    expect(result.error).toBeNull();expect(result.data.active).toEqual(l);
  });
});

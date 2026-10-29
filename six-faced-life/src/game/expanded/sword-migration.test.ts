import { describe, expect, it } from 'vitest';
import { createExpandedLife } from './origins';
import { migrateSwordState } from './sword-migration';
import { selectSwordStyle } from './sword-state';
import { getExpandedDecision } from './events';
import { loadGame, SAVE_KEY, isLife } from '../storage';
const old = () => {const l=createExpandedLife({seed:1}); delete l.expansion.swords; l.phase='alive'; l.age=30; l.pending='expanded.instruction'; l.training.swordXp=560; l.training.swordCap=4; l.training.school=''; l.progress=.75; return l;};
describe('sword save migration',()=>{
  it('preserves_old_pending_instruction_and_rng',()=>{
    const l=old(), offer=getExpandedDecision(l), n=migrateSwordState(l,offer);
    expect(getExpandedDecision(n)).toEqual(offer); expect(n.rng).toBe(l.rng); expect(n.coins).toBe(l.coins); expect(n.progress).toBe(.75);
    expect(migrateSwordState(n,offer)).toBe(n);
    l.training.school='Water God'; const w=migrateSwordState(l,getExpandedDecision(l)); expect(w.expansion.swords!.tracks['water-god']).toEqual({xp:560,cap:4});
  });
  it('allocates_unassigned_progress_once',()=>{
    const l=old(); l.pending=null; const n=migrateSwordState(l,null); expect(n.expansion.swords!.legacy).toEqual({xp:560,cap:4});
    const a=selectSwordStyle(n,'north-god') as typeof l; const b=selectSwordStyle(a,'water-god') as typeof l;
    expect(b.expansion.swords!.tracks['north-god'].xp).toBe(560); expect(b.expansion.swords!.tracks['water-god'].xp).toBe(0); expect(b.expansion.swords!.legacy).toBeNull();
  });
  it('rejects_malformed_present_state',()=>{
    const l=migrateSwordState(old(),getExpandedDecision(old()));
    for(const mutate of [(n:typeof l)=>{n.expansion.swords!.tracks['north-god'].xp=-1;},(n:typeof l)=>{n.expansion.swords!.version=2 as 1;},(n:typeof l)=>{n.expansion.swords!.compatibilityDecision!.choices[0].coins=10000;},(n:typeof l)=>{n.expansion.swords!.mentorship={style:'sword-god',target:3,fee:0,progress:2,deferred:false};}]){
      const n=structuredClone(l); mutate(n); expect(isLife(n)).toBe(false);
      const raw=JSON.stringify({version:1,active:n,archive:[]}); const storage={getItem:()=>raw,setItem:()=>{throw Error('no overwrite');}};
      expect(loadGame(storage).error).toBeTruthy(); expect(storage.getItem()).toBe(raw);
    }
  });
  it('leaves_ended_active_and_archives_unchanged',()=>{const l=old(); l.phase='ended'; expect(migrateSwordState(l,null)).toBe(l); expect(l.expansion.swords).toBeUndefined();});
  it('round trips a migrated pending offer',()=>{const l=old(); const r=loadGame({getItem:k=>k===SAVE_KEY?JSON.stringify({version:1,active:l,archive:[]}):null,setItem:()=>{}}); expect(r.error).toBeNull(); expect(r.data.active?.ruleset==='expanded-1'&&r.data.active.expansion.swords?.legacy?.xp).toBe(560);});
});

import type { ExpandedLife } from '../types';
import { ORDINARY_ROLES } from './career-access';
import { isSwordStyle, SWORD_STYLES, type SwordState } from './sword-state';
import { getExpandedDecision } from './events';
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const num=(v:unknown,min=0,max=1_000_000):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const rank=(v:unknown)=>num(v,0,6)&&Number.isInteger(v);
const track=(v:unknown)=>obj(v)&&Object.keys(v).length===2&&num(v.xp)&&rank(v.cap);
export function validateSwordState(value: unknown,l:ExpandedLife):boolean {
  if(value===undefined) return true;
  if(!obj(value)||value.version!==1||!(value.selected===null||isSwordStyle(value.selected))||!obj(value.tracks)||Object.keys(value.tracks).length!==3||!SWORD_STYLES.every(k=>track((value.tracks as Record<string,unknown>)[k]))||!(value.legacy===null||track(value.legacy))||!obj(value.courseCredit)||Object.keys(value.courseCredit).length!==ORDINARY_ROLES.length||!ORDINARY_ROLES.every(k=>num((value.courseCredit as Record<string,unknown>)[k],0,100))||!obj(value.completed)||Object.keys(value.completed).length!==3) return false;
  const s=value as unknown as SwordState;
  if(s.legacy&&(s.selected!==null||SWORD_STYLES.some(k=>s.tracks[k].xp!==0||s.tracks[k].cap!==2))) return false;
  if(s.selected===null&&!s.legacy&&SWORD_STYLES.some(k=>s.tracks[k].xp!==0||s.tracks[k].cap!==2)) return false;
  for(const k of SWORD_STYLES){const c=s.completed[k]; if(!obj(c)||Object.keys(c).length>4||Object.entries(c).some(([r,y])=>!['3','4','5','6'].includes(r)||!num(y,l.expansion.birthYear,l.expansion.birthYear+l.age)||!Number.isInteger(y)||Number(r)>s.tracks[k].cap)) return false;}
  if(s.mentorship!==null){ const m=s.mentorship;
    if(!obj(m)||!isSwordStyle(m.style)||!num(m.target,3,6)||!Number.isInteger(m.target)||m.fee!==16*2**(m.target-3)||!num(m.progress,0,1)||typeof m.deferred!=='boolean'||(m.deferred&&m.progress!==1)||s.legacy||s.tracks[m.style].cap!==m.target-1||l.expansion.genetics.auraImpaired) return false;
  }
  if(s.compatibilityDecision!==null){
    if(!obj(s.compatibilityDecision)||s.compatibilityDecision.id!==l.pending) return false;
    const old={...l,expansion:{...l.expansion}}; delete old.expansion.swords;
    const canonical=getExpandedDecision(old);
    if(!canonical||JSON.stringify(canonical)!==JSON.stringify(s.compatibilityDecision)) return false;
  }
  return true;
}

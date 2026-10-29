import type { ExpandedLife, RegionId } from '../types';
import { requirement, type Requirement } from './education';
import { swordRank, SWORD_XP, syncSwordCompatibility, type SwordStyle, type AdvancedSwordRank } from './sword-state';
import { worldYear } from './facts';
export const SWORD_MENTORS: Record<SwordStyle,{region:RegionId;en:string;th:string}>= {
  'sword-god':{region:'asura',en:'Instructor Veyra',th:'อาจารย์เวย์รา'},
  'water-god':{region:'millis',en:'Instructor Senel',th:'อาจารย์เซเนล'},
  'north-god':{region:'demon',en:'Instructor Orven',th:'อาจารย์ออร์เวน'},
};
export interface SwordMentorQuote {style:SwordStyle;target:AdvancedSwordRank;region:RegionId;fee:number;requirements:Requirement[]}
export function quoteSwordMentor(l:ExpandedLife):SwordMentorQuote|null {
  const s=l.expansion.swords; if(!s?.selected||s.legacy) return null;
  const style=s.selected,t=s.tracks[style]; if(t.cap>=6) return null;
  const target=Math.max(3,t.cap+1) as AdvancedSwordRank, fee=16*2**(target-3),region=SWORD_MENTORS[style].region;
  return {style,target,region,fee,requirements:[requirement('age',l.age,8),requirement('instruction',swordRank(t),target-1),requirement('sword',t.xp,SWORD_XP[target]),requirement('location',l.region===region?1:0,1),requirement('capital',l.coins,fee),requirement('aura',l.expansion.genetics.auraImpaired?0:1,1),requirement('mentorship',s.mentorship?0:1,1)]};
}
export function enrollSwordMentor(l:ExpandedLife,q:SwordMentorQuote):boolean {
  const fresh=quoteSwordMentor(l);
  if(l.phase!=='alive'||!fresh||JSON.stringify(fresh)!==JSON.stringify(q)||fresh.requirements.some(r=>!r.met)) return false;
  l.coins-=fresh.fee; l.expansion.swords!.mentorship={style:fresh.style,target:fresh.target,fee:fresh.fee,progress:0,deferred:false}; return true;
}
export function swordMentorPauseReason(l:ExpandedLife):string|null {
  const s=l.expansion.swords,m=s?.mentorship; if(!m) return null;
  if(l.phase!=='alive') return 'ended';
  if(l.pending) return 'decision';
  if(l.focus!=='sword') return 'focus';
  if(s!.selected!==m.style) return 'style';
  if(l.region!==SWORD_MENTORS[m.style].region) return 'location';
  if(l.expansion.education.stage==='university'||(l.expansion.training?.active&&!l.expansion.training.paused)) return 'education';
  return null;
}
export function creditSwordMentorship(l:ExpandedLife,elapsed:number):void {
  const m=l.expansion.swords?.mentorship;
  if(!m||!Number.isFinite(elapsed)||elapsed<=0||swordMentorPauseReason(l)) return;
  const progress=Math.min(1,m.progress+elapsed); m.progress=progress>=1-1e-9?1:progress;
}
export function abandonSwordMentorship(l:ExpandedLife):boolean {
  if(l.phase!=='alive'||!l.expansion.swords?.mentorship) return false;
  l.expansion.swords.mentorship=null;
  l.expansion.queue=l.expansion.queue.filter(k=>k!=='expanded.sword-trial');return true;
}
export function completeSwordTrial(l:ExpandedLife):boolean {
  const s=l.expansion.swords,m=s?.mentorship; if(l.phase!=='alive'||!s||!m||m.progress!==1||s.selected!==m.style||l.region!==SWORD_MENTORS[m.style].region||l.expansion.genetics.auraImpaired) return false;
  const t=s.tracks[m.style]; if(t.cap!==m.target-1||swordRank(t)!==m.target-1||t.xp<SWORD_XP[m.target]) return false;
  t.cap=m.target;s.completed[m.style][m.target]=worldYear(l);s.mentorship=null;syncSwordCompatibility(l);return true;
}

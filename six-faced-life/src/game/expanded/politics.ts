import type { ExpandedLife } from '../types';
import type { Faction } from './types';
import { fact, worldYear } from './facts';
import { draw, clamp } from './random';
export function factionEligible(l:ExpandedLife,faction:Faction){
  const x=l.expansion,y=worldYear(l);
  return l.age>=18&&y>=(faction==='orsted'?425:417)&&y<=430&&x.politics.faction===null&&x.politics.contact&&Math.max(l.training.magicXp,l.training.swordXp,x.standing.reputation*5)>=100&&y-(x.politics.refused[faction]??-100)>=5&&y>x.politics.pursuitUntil;
}
function politicalRecord(l:ExpandedLife,code:string){const x=l.expansion;x.politics.records.push({year:worldYear(l),code});if(x.politics.records.length>128)x.politics.records.shift();fact(l,'politics',code);}
export function acceptFaction(l:ExpandedLife,faction:Faction):boolean {
  if(!factionEligible(l,faction))return false;
  l.expansion.politics.faction=faction;l.expansion.politics.trust=20;l.expansion.politics.obligations=1;politicalRecord(l,`joined-${faction}`);return true;
}
export function refuseFaction(l:ExpandedLife,faction:Faction){l.expansion.politics.refused[faction]=worldYear(l);politicalRecord(l,`refused-${faction}`);}
export function defect(l:ExpandedLife){const p=l.expansion.politics;if(!p.faction)return;p.faction=null;p.trust=0;p.pursuitUntil=worldYear(l)+3;p.obligations=0;politicalRecord(l,'defected');}
export function titleEligible(l:ExpandedLife,position:number):boolean {const x=l.expansion;return [5,6,7].includes(position)&&worldYear(l)>430&&l.age>=18&&Math.max(l.training.magicXp,l.training.swordXp)>=2000&&Math.max(l.training.magicCap,l.training.swordCap)>=5&&x.standing.reputation>=90&&new Set(x.standing.feats).size>=3;}
export function contestTitle(l:ExpandedLife,position:5|6|7):boolean {
  if(!titleEligible(l,position))return false;
  const won=draw(l)<clamp(.15+(Math.max(l.training.magicXp,l.training.swordXp)-2000)/10000,.15,.6);
  const x=l.expansion;x.standing.titles.push({year:worldYear(l),position,won});if(x.standing.titles.length>64)x.standing.titles.shift();
  if(won)x.standing.title=position;else{l.stats.health=clamp(l.stats.health-35);if(draw(l)<.12)l.stats.health=0;}
  fact(l,'achievement',won?'title-won':'title-lost',String(position));return won;
}
export function applyPoliticalYear(l:ExpandedLife){
  const p=l.expansion.politics;
  if(p.faction){p.obligations=Math.min(1000,p.obligations+1);if(p.obligations>3){p.trust=clamp(p.trust-5);if(p.trust===0){p.pursuitUntil=worldYear(l)+3;politicalRecord(l,'unfulfilled-obligations');}}}
}

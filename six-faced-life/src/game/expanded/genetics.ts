import type { Genetics } from './types';
import type { ExpandedLife } from '../types';
import { draw, weighted } from './random';
import { fact } from './facts';
export function generateGenetics(stream:{rng:number},parents:readonly Genetics[]=[]):Genetics {
  const carriers=parents.filter(p=>p.carrier).length;
  const carrier=draw(stream)<(carriers>=2?.4:carriers===1?.2:.001);
  const manifestation=carrier?weighted(stream,[['mana',60],['appearance',25],['physical',15]] as const):'none';
  return {carrier,manifestation,auraImpaired:manifestation==='mana'&&draw(stream)<.5,discovered:false,signs:false,magicTalent:draw(stream)<.01,academicTalent:draw(stream)<.01};
}
export function discoverGenetics(l:ExpandedLife):boolean {
  const g=l.expansion.genetics;
  if(!g.carrier||l.age<8||(!g.signs&&l.training.magicXp<80&&l.training.swordXp<80))return false;
  g.discovered=true;fact(l,'discovery','factor',g.manifestation);return true;
}
export function trainingMultiplier(l:ExpandedLife,kind:'magic'|'sword'){
  const g=l.expansion.genetics;
  if(kind==='magic'&&g.manifestation==='mana'&&l.training.magicCap>=1&&l.expansion.economy.unmetFood===0)return 1.25;
  return kind==='sword'&&g.manifestation==='physical'?1.15:1;
}

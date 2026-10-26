import type { ExpandedLife, RegionId } from '../types';
import { draw, clamp } from './random';
import { fact, worldYear } from './facts';
export interface Conflict { start:number;end:number;severity:1|2|3;authored:true }
export function regionalConflict(seed:number,region:RegionId,year:number):Conflict|null {
  let hash=seed;for(const char of region)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
  const stream={rng:hash};let next=397;
  for(let y=397;y<=Math.min(1427,year);y++){
    if(y<next)continue;
    if(draw(stream)>=.03)continue;
    const end=y+Math.floor(draw(stream)*3),severity=(1+Math.floor(draw(stream)*3)) as 1|2|3;
    if(year<=end)return {start:y,end,severity,authored:true};
    next=end+6;
  }return null;
}
export function applyHistoryYear(life:ExpandedLife):string[]{
  const x=life.expansion,year=worldYear(life),due:string[]=[];
  const record=(code:string,exposure:'civilian'|'participant'|'support'|'news')=>{
    if(x.history.some(h=>h.code===code&&h.year===year))return false;
    x.history.push({year,code,exposure});if(x.history.length>128)x.history.shift();fact(life,'history',code,exposure);return true;
  };
  if(year===417 && record('calamity',life.region==='asura'&&x.origin.locality==='fittoa'?'civilian':'news')){
    if(life.region==='asura'&&x.origin.locality==='fittoa'){
      life.stats.health=clamp(life.stats.health-15);life.coins=Math.floor(life.coins*.5);
      life.region='demon';x.origin.locality='displaced';x.economy.travelUntil=year+1;
      for(const p of x.family.people)if(p.home==='asura'&&p.died===null){p.home='demon';if(draw({get rng(){return x.familyRng;},set rng(v){x.familyRng=v;}})<.1){p.died=year;fact(life,'family','disaster-loss',p.name);}}
    }
    due.push('expanded.calamity');
  }
  if((year===424||year===425)&&record(year===425?'ariel-accession':'asura-succession',life.region==='asura'?'civilian':'news'))due.push('expanded.succession');
  const conflict=regionalConflict(x.worldSeed,life.region,year);
  if(conflict&&conflict.start===year&&record('authored-conflict','civilian'))due.push('expanded.conflict');
  return due;
}

import type { ExpandedLife } from '../types';
import { HAZARDS, PAY } from './balance';
import { worldYear, fact } from './facts';
import { clamp, draw } from './random';
import { careerIncomeExpanded } from './careers';
import { regionalConflict } from './history';
export interface Risk { cause: string; chance: number }
export function applyEconomyYear(life:ExpandedLife) {
  const x=life.expansion,e=x.economy,year=worldYear(life);
  const role=x.career.role;
  const income=life.age<15?0:careerIncomeExpanded(life)+(life.focus==='work'&&PAY[role]>0?6:0);
  const children=x.family.people.filter(p=>p.role==='child'&&p.died===null&&year-p.born<18).length;
  const spouses=x.family.marriages.filter(m=>m.end===null).length;
  const tuition=x.education.stage==='university'&&!x.education.scholarship?40:0;
  const extras=children*4+spouses*6+(life.focus==='explore'?4:0)+tuition;
  let resources=life.age<15?e.support+(year<=e.aidUntil?12:0):life.coins+income;
  // Scholarships pay actual necessities, never deposit an allowance in the purse.
  if(x.education.stage==='university'&&x.education.scholarship)resources+=18;
  if(x.education.stage==='university'&&!x.education.scholarship){const grant=Math.min(58,x.education.budget);resources+=grant;x.education.budget-=grant;}
  const use=(cost:number)=>{const paid=Math.min(resources,cost);resources-=paid;return cost-paid;};
  e.unmetFood=use(8);e.unmetShelter=use(6);e.unmetCare=use(4);const unmetExtra=use(extras);
  e.lastIncome=income;e.lastExpenses=18+extras-e.unmetFood-e.unmetShelter-e.unmetCare-unmetExtra;
  if(life.age>=15)life.coins=clamp(Math.floor(resources),0,1_000_000);
  e.peak=Math.max(e.peak,life.coins);
  if(e.unmetFood+e.unmetShelter+e.unmetCare>0){e.deprivedYears++;fact(life,'need','deprivation','',e.unmetFood+e.unmetShelter+e.unmetCare);}
}
export function survivalRisks(life:ExpandedLife):Risk[] {
  const e=life.expansion.economy,year=worldYear(life);
  const persecution=life.race==='superd'&&life.age<15?HAZARDS.persecution:0;
  const conflict=regionalConflict(life.expansion.worldSeed,life.region,year);
  const violence=persecution+(year<=life.expansion.politics.pursuitUntil?.02:0)+(conflict?[0,.005,.02,.06][conflict.severity]:0);
  return [
    {cause:'malnutrition',chance:HAZARDS.malnutrition*e.unmetFood/8},
    {cause:'illness',chance:(HAZARDS.illness+HAZARDS.unmetCare*e.unmetCare/4+HAZARDS.unmetShelter*e.unmetShelter/6)*(life.stats.health<35?2:1)*(life.focus==='rest'?.7:1)},
    {cause:'unsafe-work',chance:e.unsafeWork?HAZARDS.unsafe:0},
    {cause:'violence',chance:violence*(year<=e.protectionUntil?.5:1)},
    {cause:'travel',chance:year<=e.travelUntil?HAZARDS.travel:0},
  ];
}
export function checkSurvival(life:ExpandedLife):string|null {
  for(const risk of survivalRisks(life))if(draw(life)<clamp(risk.chance,0,.9))return risk.cause;
  return life.age>=life.deathAge?'aging':life.stats.health<=0?'illness':null;
}
export function materialNeeds(life:ExpandedLife):string[] {
  const e=life.expansion.economy;
  return [...(e.unmetFood>0?['food']:[]),...(e.unmetShelter>0?['shelter']:[]),...(e.unmetCare>0?['care']:[])];
}

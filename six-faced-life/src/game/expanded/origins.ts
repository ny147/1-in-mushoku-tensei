import { createLife as legacyBirth } from '../legacy/engine';
import { REGIONS, RACES } from '../world';
import type { ExpandedLife, LifeOptions, RegionId, RaceId } from '../types';
import type { Genetics, WorkRecord, Occupation, Relative } from './types';
import { WEALTH, SUPPORT, PURSE, FAMILY_FUNDS, OCCUPATIONS } from './balance';
import { draw, weighted } from './random';

export function initialGenetics(stream:{rng:number}, parents:readonly Genetics[]=[]): Genetics {
  const carriers = parents.filter(p=>p.carrier).length;
  const carrier = draw(stream) < (carriers===2?0.4:carriers===1?0.2:0.001);
  const manifestation = carrier ? weighted(stream,[['mana',60],['appearance',25],['physical',15]] as const) : 'none';
  return {carrier, manifestation, auraImpaired: manifestation==='mana' && draw(stream)<0.5, discovered:false, signs:false, magicTalent:draw(stream)<0.01, academicTalent:draw(stream)<0.01};
}
export function createExpandedLife(options:LifeOptions={}): ExpandedLife {
  const base = legacyBirth(options);
  const stream = {rng:(base.seed ^ 0xa71c09ef)>>>0};
  const birthYear = 397 + Math.floor(draw(stream)*31);
  const region = base.birthRegion;
  const pool = region==='demon' ? [['migurd',65],['dwarf',30],['superd',5]] as const : REGIONS[region].races.filter(r=>r!=='migurd').map(r=>[r,1] as const);
  const race: RaceId = weighted(stream,pool);
  const nobleChance: Partial<Record<RegionId,Partial<Record<RaceId,number>>>> = {asura:{human:.06,elf:.02},ranoa:{human:.03,elf:.02,dwarf:.01},millis:{human:.04,dwarf:.01}};
  const noble = draw(stream)<(nobleChance[region]?.[race]??0);
  const wealth = noble?weighted(stream,[['comfortable',80],['extreme',20]] as const):weighted(stream,WEALTH[race]);
  const locality = region==='asura'?weighted(stream,[['fittoa',20],['capital',15],['countryside',65]]):'settlement';
  const worldSeed = Math.floor(draw(stream)*4294967296); const familyRng = Math.floor(draw(stream)*4294967296);
  const people:Relative[] = base.family.map((p,i)=>({id:p.id,name:p.name,role:'parent',parents:[],race,ancestry:[race],born:birthYear+p.bornAt,died:null,lifespan:RACES[race].lifespan,strength:70,genetics:initialGenetics(stream),partner:i===0?'father':'mother',children:1,generation:-1,home:region,educated:noble,occupation:'worker'}));
  const genetics = initialGenetics(stream,people.map(p=>p.genetics));
  const records = Object.fromEntries(OCCUPATIONS.map(id=>[id,{xp:0,years:0,level:0,reputation:0}])) as Record<Occupation,WorkRecord>;
  const life:ExpandedLife = {...base,ruleset:'expanded-1',race,rng:stream.rng,coins:PURSE[wealth],deathAge:Math.min(RACES[race].maxAge,Math.floor(RACES[race].lifespan*(.88+draw(stream)*.3))),
    expansion:{version:1,birthYear,worldSeed,familyRng,nextId:1,origin:{wealth,status:noble?'noble':'commoner',locality,birthplace:locality,patron:noble,ancestry:[race]},
      economy:{support:SUPPORT[wealth],familyFunds:FAMILY_FUNDS[wealth],assets:0,unmetFood:0,unmetShelter:0,unmetCare:0,peak:PURSE[wealth],protectionUntil:birthYear-1,aidUntil:birthYear-1,travelUntil:birthYear-1,unsafeWork:false,lastIncome:0,lastExpenses:0,deprivedYears:0},
      education:{stage:noble?'basic':'none',assessment:0,assessed:false,scholarship:false,probation:false,successfulYears:0,research:0,previousKnowledge:18,previousXp:0},
      career:{role:'child',records,timeline:[]},standing:{status:noble?'noble':'commoner',reputation:0,trust:0,service:0,feats:[],title:null,titles:[]},
      politics:{faction:null,trust:0,refused:{},pursuitUntil:birthYear-1,obligations:0,contact:noble,records:[]},genetics,
      family:{people,marriages:[],cohorts:[],directBorn:0,distantBorn:0,distantDead:0,friends:[]},facts:[],queue:[],lastRandom:-3,processedYear:birthYear-1,history:[],summary:null,study:'water'}};
  life.rng = stream.rng;
  life.family = people.map(p=>({id:p.id,name:p.name,role:p.id==='mother'?'Mother':'Father',bornAt:p.born-birthYear,lifespan:p.lifespan}));
  // Birth text is presented from structured origin facts in both languages.
  life.history = [{id:1,age:0,title:'A life in history',text:'A new life begins with memories of another world.',kind:'birth',message:{key:'expanded.birth'}}];
  return life;
}

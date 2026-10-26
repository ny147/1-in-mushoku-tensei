import type { ExpandedLife, Focus } from '../types';
import { FOCUSES } from '../world';
import { getProgression } from '../progression';
import { draw, clamp } from './random';
import { getExpandedDecision, applyExpandedChoice } from './events';
import { entry, worldYear } from './facts';
import { applyEconomyYear, checkSurvival } from './economy';
import { applyEducationYear } from './education';
import { MAGIC_SCHOOLS } from '../progression';
import { applyCareerYear } from './careers';
import { applyHistoryYear } from './history';
import { applyFamilyYear } from './family';
import { trainingMultiplier } from './genetics';
import { applyPoliticalYear, factionEligible } from './politics';
import { buildSummary } from './summary';

function drain(life:ExpandedLife) {
  life.pending=null;
  while(life.expansion.queue.length) {
    life.pending=life.expansion.queue.shift()!;
    if(getExpandedDecision(life))break;
    life.pending=null;
  }
  if(life.pending)life.seen[life.pending]=life.age;
}
export function beginExpanded(life:ExpandedLife):ExpandedLife {
  if(life.phase!=='birth')return life;
  return {...structuredClone(life),phase:'alive',pending:'expanded.memory',seen:{'expanded.memory':0}};
}
export function finishExpanded(life:ExpandedLife,cause:string) {
  if(life.phase==='ended')return;
  life.phase='ended';life.pending=null;life.expansion.queue=[];life.progress=0;
  life.ending={cause,legacy:'A life shaped by circumstances, choices and the people who shared it.'};
  life.expansion.summary=buildSummary(life);
  entry(life,'ending','The last page of this life',cause,'ending');
}
export function chooseExpanded(life:ExpandedLife,id:string):ExpandedLife {
  const decision=getExpandedDecision(life);const c=decision?.choices.find(c=>c.id===id);
  if(!c||c.disabled||(c.cost??0)>life.coins)return life;
  const next=structuredClone(life);next.pending=null;
  if(!id.startsWith('expanded.career.job-'))next.coins-=c.cost??0;
  next.coins=clamp(next.coins+(c.coins??0),0,1_000_000);
  for(const [k,v] of Object.entries(c.effects??{}))next.stats[k as keyof typeof next.stats]=clamp(next.stats[k as keyof typeof next.stats]+v);
  next.training.magicXp+=c.magicXp??0;next.training.swordXp+=c.swordXp??0;
  const cause=applyExpandedChoice(next,id);
  next.expansion.economy.peak=Math.max(next.expansion.economy.peak,next.coins);
  entry(next,id.slice(9),c.label,c.outcome,'choice');
  if(cause||next.stats.health<=0){finishExpanded(next,cause??'illness');return next;}
  if(id.startsWith('expanded.memory.'))next.expansion.queue.unshift(...applyHistoryYear(next));
  drain(next);return next;
}
export function setFocusExpanded(life:ExpandedLife,focus:Focus):ExpandedLife {
  if(life.phase!=='alive'||!Object.hasOwn(FOCUSES,focus)||life.age<FOCUSES[focus].minAge)return life;
  return {...life,focus};
}
function year(life:ExpandedLife) {
  life.age++;life.progress=0;
  const focus=FOCUSES[life.focus];
  for(const [k,v] of Object.entries(focus.effects))life.stats[k as keyof typeof life.stats]=clamp(life.stats[k as keyof typeof life.stats]+v);
  life.training.magicXp+=(focus.magic??0)*trainingMultiplier(life,'magic');life.training.swordXp+=(focus.sword??0)*trainingMultiplier(life,'sword');
  life.progression=getProgression(life);
  const study=life.progression.magic[life.progression.specialization];
  study.xp+=focus.magic??0;
  for(const spell of MAGIC_SCHOOLS[life.progression.specialization].spells)if(study.xp>=spell.xp&&life.training.magicCap>=spell.rank&&!study.spells.includes(spell.id))study.spells.push(spell.id);
  applyEconomyYear(life);
  life.stats.health=clamp(life.stats.health-.8-(life.age>life.deathAge*.7?1.2:0));
  life.expansion.processedYear=worldYear(life);
  const cause=checkSurvival(life);if(cause){finishExpanded(life,cause);return;}
  applyEducationYear(life);
  applyCareerYear(life);
  applyFamilyYear(life);applyPoliticalYear(life);
  if(life.expansion.genetics.carrier&&life.age>=8&&(life.training.magicXp>=60||life.training.swordXp>=60))life.expansion.genetics.signs=true;
  const due:string[]=applyHistoryYear(life);
  if(life.age===3)due.push('expanded.reading');
  if(life.age===5)due.push('expanded.practice');
  if(life.age===8)due.push('expanded.assessment');
  if(life.age===15)due.push('expanded.work','expanded.university');
  if(life.expansion.education.stage==='university')due.push('expanded.school-year');
  if(!due.length&&life.age-life.expansion.lastRandom>=3){
    const orsted=factionEligible(life,'orsted')&&draw(life)<.02;
    const hitogami=factionEligible(life,'hitogami')&&draw(life)<.02;
    if(draw(life)<.25){
      const x=life.expansion;
      let pool=life.age<8?['practice','protection']:life.age<15?['practice','opportunity','protection']:['opportunity','practice','career','family','protection'];
      if(life.age>=18){pool.push('courtship');if(x.family.marriages.some(m=>m.end===null))pool.push('child');if(x.standing.title)pool.push('defense');if(x.politics.faction)pool.push('assignment','defect');if(x.education.stage==='graduated')pool.push('research');if(x.standing.reputation>=70)pool.push('grant');if(x.genetics.signs&&!x.genetics.discovered)pool.push('discovery');if(life.age+x.birthYear>430)pool.push('challenge');}
      const event=orsted?'orsted':hitogami?'hitogami':pool[Math.floor(draw(life)*pool.length)];
      due.push(`expanded.${event}`);x.lastRandom=life.age;
    }
  }
  life.expansion.queue=due;drain(life);
  if(!life.pending)entry(life,'year','A year of small changes','Another year brings practice, work and time with others.');
}
export function advanceExpanded(life:ExpandedLife,mode:'year'|'decision'|'tick',delta=1/12):ExpandedLife {
  if(life.phase!=='alive'||life.pending)return life;
  if(mode==='tick'&&(!Number.isFinite(delta)||delta<=0))return life;
  const next=structuredClone(life);
  if(mode==='tick'){next.progress+=Math.min(.25,delta);if(next.progress>=1-1e-9)year(next);}
  else for(let i=0;i<(mode==='year'?1:12);i++){year(next);if(next.pending||next.phase!=='alive')break;}
  return next;
}
